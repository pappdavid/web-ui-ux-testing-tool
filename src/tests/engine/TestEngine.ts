import { chromium, Browser, Page } from 'playwright'
import { db } from '@/server/db'
import { TestStep } from '../models/TestStep'
import { TestContext, StepExecutionResult, DEVICE_PROFILES } from './types'
import { stepHandlers } from './stepHandlers'
import { collectNavigationMetrics, UXMetrics } from './metricsCollector'
import { checkAccessibility } from './accessibilityChecker'
import path from 'path'
import fs from 'fs/promises'

const STORAGE_PATH = process.env.STORAGE_PATH || './storage'
const TEST_TIMEOUT_MS = 10 * 60 * 1000 // 10 minutes timeout

// Non-blocking log function - never throws errors
async function logToDatabase(
  testRunId: string,
  level: 'info' | 'warn' | 'error',
  message: string,
  data?: any
) {
  try {
    await db.testLog.create({
      data: {
        testRunId,
        level,
        message,
        data: data || {},
      },
    })
  } catch (error) {
    // Log to console if database logging fails, but don't throw
    console.error(`[TestEngine] Failed to log to database for testRun ${testRunId}:`, error)
    console.log(`[TestEngine] ${level.toUpperCase()}: ${message}`, data || '')
  }
}

// Robust status update function - ensures status is always updated
async function updateTestStatus(
  testRunId: string,
  testId: string,
  status: 'passed' | 'failed',
  finishedAt: Date = new Date()
) {
  try {
    // Update test run status
    await db.testRun.update({
      where: { id: testRunId },
      data: {
        status,
        finishedAt,
      },
    })

    // Update test status
    await db.test.update({
      where: { id: testId },
      data: {
        status,
      },
    })
  } catch (error) {
    // If update fails, log but don't throw - we'll try again in catch block
    console.error(`[TestEngine] Failed to update test status for testRun ${testRunId}:`, error)
    throw error // Re-throw so catch block can handle it
  }
}

async function createAttachment(
  testRunId: string,
  type: string,
  pathOrUrl: string
) {
  await db.attachment.create({
    data: {
      testRunId,
      type,
      pathOrUrl,
    },
  })
}

async function captureDOMSnapshot(page: Page, testRunId: string): Promise<string> {
  const storageDir = path.resolve(STORAGE_PATH)
  await fs.mkdir(path.join(storageDir, testRunId), { recursive: true })
  
  const snapshotPath = path.join(storageDir, testRunId, `dom-snapshot-${Date.now()}.html`)
  const html = await page.content()
  await fs.writeFile(snapshotPath, html)
  
  return snapshotPath
}

export async function runTest(testRunId: string): Promise<void> {
  let browser: Browser | null = null
  let page: Page | null = null
  let testId: string | null = null

  // Set up timeout to prevent infinite RUNNING state
  const timeoutId = setTimeout(async () => {
    console.error(`[TestEngine] Test ${testRunId} timed out after ${TEST_TIMEOUT_MS}ms`)
    try {
      if (testId) {
        await updateTestStatus(testRunId, testId, 'failed', new Date())
        await logToDatabase(testRunId, 'error', 'Test execution timed out', {
          timeoutMs: TEST_TIMEOUT_MS,
        })
      }
    } catch (error) {
      console.error(`[TestEngine] Failed to update status after timeout:`, error)
    }
  }, TEST_TIMEOUT_MS)

  try {
    // Load test run and test data
    const testRun = await db.testRun.findUnique({
      where: { id: testRunId },
      include: {
        test: {
          include: {
            steps: {
              orderBy: {
                orderIndex: 'asc',
              },
            },
          },
        },
      },
    })

    if (!testRun) {
      throw new Error(`Test run ${testRunId} not found`)
    }

    const test = testRun.test
    testId = test.id // Store for timeout handler
    const steps = test.steps

    if (steps.length === 0) {
      throw new Error('Test has no steps')
    }

    await logToDatabase(testRunId, 'info', 'Starting test execution', {
      testId: test.id,
      testName: test.name,
      stepCount: steps.length,
    })

    // Get device profile
    const deviceProfile = DEVICE_PROFILES[test.deviceProfile] || DEVICE_PROFILES.desktop

    // Launch browser
    // Try to use headless shell first (smaller, better for serverless)
    try {
      browser = await chromium.launch({
        headless: true,
        channel: 'chromium', // Try to use installed chromium
      })
    } catch (error: any) {
      // Fallback: try without channel specification
      try {
        browser = await chromium.launch({
          headless: true,
        })
      } catch (fallbackError: any) {
        // Log error (non-blocking)
        await logToDatabase(testRunId, 'error', 'Failed to launch browser', {
          error: fallbackError.message,
          originalError: error.message,
          hint: 'Playwright browsers may not be available in serverless environment. Consider using Docker or external browser service.',
        })
        
        // Update status before throwing
        if (testId) {
          try {
            await updateTestStatus(testRunId, testId, 'failed')
          } catch (statusError) {
            console.error('[TestEngine] Failed to update status after browser launch failure:', statusError)
          }
        }
        
        throw new Error(`Browser launch failed: ${fallbackError.message}. This may be due to Playwright browsers not being available in the serverless environment.`)
      }
    }

    const storageDir = path.resolve(STORAGE_PATH)
    const testRunDir = path.join(storageDir, testRunId)
    await fs.mkdir(testRunDir, { recursive: true })

    const context = await browser.newContext({
      viewport: deviceProfile.viewport,
      userAgent: deviceProfile.userAgent,
      deviceScaleFactor: deviceProfile.deviceScaleFactor,
      isMobile: deviceProfile.isMobile,
      hasTouch: deviceProfile.hasTouch,
      // Enable video recording
      recordVideo: {
        dir: testRunDir,
        size: deviceProfile.viewport,
      },
    })

    page = await context.newPage()

    // Navigate to target URL
    await logToDatabase(testRunId, 'info', `Navigating to ${test.targetUrl}`)
    await page.goto(test.targetUrl, { waitUntil: 'networkidle' })

    // Collect initial metrics
    await logToDatabase(testRunId, 'info', 'Collecting navigation metrics')
    const navMetrics = await collectNavigationMetrics(page)
    
    // Run accessibility check
    await logToDatabase(testRunId, 'info', 'Running accessibility check')
    const a11yResult = await checkAccessibility(page)
    
    // Log accessibility violations
    if (a11yResult.issueCount > 0) {
      await logToDatabase(testRunId, 'warn', `Found ${a11yResult.issueCount} accessibility issues`, {
        violations: a11yResult.violations,
      })
    }

    // Combine metrics
    const uxMetrics: UXMetrics = {
      viewport: `${deviceProfile.viewport.width}x${deviceProfile.viewport.height}`,
      ...navMetrics,
      accessibilityIssueCount: a11yResult.issueCount,
      notes: a11yResult.issueCount > 0 
        ? [`Found ${a11yResult.issueCount} accessibility violations`]
        : [],
    }

    // Update test run with initial metrics
    await db.testRun.update({
      where: { id: testRunId },
      data: {
        uxMetrics: uxMetrics as any,
      },
    })

    // Initialize test context
    const testContext: TestContext = {
      extractedValues: {},
      page,
      browser,
    }

    // Execute each step
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i] as TestStep
      
      await logToDatabase(testRunId, 'info', `Executing step ${i + 1}/${steps.length}: ${step.type}`, {
        stepId: step.id,
        orderIndex: step.orderIndex,
        type: step.type,
        selector: step.selector,
      })

      const handler = stepHandlers[step.type]
      if (!handler) {
        await logToDatabase(testRunId, 'error', `Unknown step type: ${step.type}`)
        throw new Error(`Unknown step type: ${step.type}`)
      }

      try {
        // Ensure step has testId for visual regression
        const stepWithTestId = { ...step, testId: test.id }
        const result: StepExecutionResult = await handler(stepWithTestId, testContext, testRunId)

        if (!result.success) {
          await logToDatabase(testRunId, 'error', `Step ${i + 1} failed: ${result.error}`, {
            stepId: step.id,
            stepType: step.type,
            error: result.error,
          })

          // Capture DOM snapshot on error
          if (page) {
            const snapshotPath = await captureDOMSnapshot(page, testRunId)
            await createAttachment(testRunId, 'domSnapshot', snapshotPath)
            await logToDatabase(testRunId, 'info', 'DOM snapshot captured', { path: snapshotPath })
          }

        // Save video recording on failure
        if (page) {
          try {
            const video = await page.video()
            if (video) {
              const videoFileName = `test-run-${testRunId}-failed-${Date.now()}.webm`
              const videoPath = path.join(testRunDir, videoFileName)
              await video.saveAs(videoPath)
              await createAttachment(testRunId, 'video', videoPath)
            }
          } catch (error: any) {
            console.error('Failed to save video on error:', error)
          }
        }

        // Update test run status
        await updateTestStatus(testRunId, test.id, 'failed')

        throw new Error(`Step ${i + 1} failed: ${result.error}`)
        }

        // Save screenshot if one was taken
        if (result.screenshotPath) {
          await createAttachment(testRunId, 'screenshot', result.screenshotPath)
        }

        await logToDatabase(testRunId, 'info', `Step ${i + 1} completed successfully`, {
          stepId: step.id,
          data: result.data,
        })
      } catch (error: any) {
        await logToDatabase(testRunId, 'error', `Step ${i + 1} threw an error: ${error.message}`, {
          stepId: step.id,
          error: error.message,
          stack: error.stack,
        })

        // Capture DOM snapshot on error
        if (page) {
          const snapshotPath = await captureDOMSnapshot(page, testRunId)
          await createAttachment(testRunId, 'domSnapshot', snapshotPath)
          
          // Save video recording on error
          try {
            const video = await page.video()
            if (video) {
              const videoFileName = `test-run-${testRunId}-error-${Date.now()}.webm`
              const videoPath = path.join(testRunDir, videoFileName)
              await video.saveAs(videoPath)
              await createAttachment(testRunId, 'video', videoPath)
            }
          } catch (videoError: any) {
            console.error('Failed to save video on error:', videoError)
          }
        }

        // Update test run status
        await updateTestStatus(testRunId, test.id, 'failed')

        throw error
      }
    }

    // All steps passed
    await logToDatabase(testRunId, 'info', 'All steps completed successfully')

    // Collect final metrics
    const finalMetrics = await collectNavigationMetrics(page)
    const finalA11yResult = await checkAccessibility(page)
    
    const finalUxMetrics: UXMetrics = {
      ...uxMetrics,
      ...finalMetrics,
      accessibilityIssueCount: finalA11yResult.issueCount,
      notes: [
        ...(uxMetrics.notes || []),
        ...(finalA11yResult.issueCount > 0 
          ? [`Final check: Found ${finalA11yResult.issueCount} accessibility violations`]
          : []),
      ],
    }

    // Save video recording before closing context
    let videoPath: string | null = null
    if (page) {
      try {
        const video = await page.video()
        if (video) {
          const videoFileName = `test-run-${testRunId}-${Date.now()}.webm`
          videoPath = path.join(testRunDir, videoFileName)
          await video.saveAs(videoPath)
          await createAttachment(testRunId, 'video', videoPath)
          await logToDatabase(testRunId, 'info', 'Video recording saved', { path: videoPath })
        }
      } catch (error: any) {
        await logToDatabase(testRunId, 'warn', 'Failed to save video recording', { error: error.message })
      }
    }

    // Update test run status with final metrics
    await db.testRun.update({
      where: { id: testRunId },
      data: {
        status: 'passed',
        finishedAt: new Date(),
        uxMetrics: finalUxMetrics as any,
      },
    })

    await db.test.update({
      where: { id: test.id },
      data: {
        status: 'passed',
      },
    })

    await logToDatabase(testRunId, 'info', 'Test execution completed successfully')
    
    // Clear timeout since test completed successfully
    clearTimeout(timeoutId)
  } catch (error: any) {
    // Clear timeout
    clearTimeout(timeoutId)
    
    // Log error (non-blocking)
    await logToDatabase(testRunId, 'error', `Test execution failed: ${error.message}`, {
      error: error.message,
      stack: error.stack,
    })

    // Update test run status if not already updated - this MUST succeed
    try {
      const testRun = await db.testRun.findUnique({
        where: { id: testRunId },
        include: { test: true },
      })

      if (testRun && testRun.status === 'running') {
        // Use direct update with retry logic
        let retries = 3
        while (retries > 0) {
          try {
            await db.testRun.update({
              where: { id: testRunId },
              data: {
                status: 'failed',
                finishedAt: new Date(),
              },
            })

            await db.test.update({
              where: { id: testRun.test.id },
              data: {
                status: 'failed',
              },
            })
            break // Success, exit retry loop
          } catch (updateError: any) {
            retries--
            if (retries === 0) {
              // Last attempt failed - log to console as fallback
              console.error(`[TestEngine] CRITICAL: Failed to update test status after ${3} retries:`, updateError)
              console.error(`[TestEngine] TestRun ${testRunId} should be manually updated to 'failed'`)
            } else {
              // Wait a bit before retry
              await new Promise(resolve => setTimeout(resolve, 1000))
            }
          }
        }
      }
    } catch (updateError) {
      console.error('[TestEngine] CRITICAL: Error updating test run status:', updateError)
      console.error(`[TestEngine] TestRun ${testRunId} should be manually updated to 'failed'`)
    }

    throw error
  } finally {
    // Cleanup
    if (page) {
      await page.close().catch(console.error)
    }
    if (browser) {
      await browser.close().catch(console.error)
    }
  }
}

