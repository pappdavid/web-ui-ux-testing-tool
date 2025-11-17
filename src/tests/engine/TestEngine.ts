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

async function logToDatabase(
  testRunId: string,
  level: 'info' | 'warn' | 'error',
  message: string,
  data?: any
) {
  await db.testLog.create({
    data: {
      testRunId,
      level,
      message,
      data: data || {},
    },
  })
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
    browser = await chromium.launch({
      headless: true,
    })

    const context = await browser.newContext({
      viewport: deviceProfile.viewport,
      userAgent: deviceProfile.userAgent,
      deviceScaleFactor: deviceProfile.deviceScaleFactor,
      isMobile: deviceProfile.isMobile,
      hasTouch: deviceProfile.hasTouch,
    })

    // Start video recording if possible
    // Note: Playwright video recording requires specific setup
    // For now, we'll skip it but leave a TODO

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
        const result: StepExecutionResult = await handler(step, testContext, testRunId)

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

          // Update test run status
          await db.testRun.update({
            where: { id: testRunId },
            data: {
              status: 'failed',
              finishedAt: new Date(),
            },
          })

          await db.test.update({
            where: { id: test.id },
            data: {
              status: 'failed',
            },
          })

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
        }

        // Update test run status
        await db.testRun.update({
          where: { id: testRunId },
          data: {
            status: 'failed',
            finishedAt: new Date(),
          },
        })

        await db.test.update({
          where: { id: test.id },
          data: {
            status: 'failed',
          },
        })

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
  } catch (error: any) {
    await logToDatabase(testRunId, 'error', `Test execution failed: ${error.message}`, {
      error: error.message,
      stack: error.stack,
    })

    // Update test run status if not already updated
    try {
      const testRun = await db.testRun.findUnique({
        where: { id: testRunId },
        include: { test: true },
      })

      if (testRun && testRun.status === 'running') {
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
      }
    } catch (updateError) {
      console.error('Error updating test run status:', updateError)
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

