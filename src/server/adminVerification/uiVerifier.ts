import { chromium, Browser, Page } from 'playwright'
import { db } from '@/server/db'
import { compareObjects, ComparisonResult } from './comparison'

interface UiVerifierConfig {
  adminPanelUrl: string
  loginSelector?: {
    emailSelector: string
    passwordSelector: string
    submitSelector: string
  }
  credentials: {
    email?: string
    password?: string
  }
  navigationPath?: string
  extractionSelectors: Record<string, string> // { fieldName: selector }
  expectedData?: Record<string, any>
}

export async function verifyAdminUI(
  testRunId: string,
  config: UiVerifierConfig,
  relatedStepId?: string
): Promise<void> {
  let browser: Browser | null = null
  let page: Page | null = null

  try {
    await db.testLog.create({
      data: {
        testRunId,
        level: 'info',
        message: `Starting UI verification: ${config.adminPanelUrl}`,
        data: { adminPanelUrl: config.adminPanelUrl },
      },
    })

    // Launch browser
    browser = await chromium.launch({ headless: true })
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    })
    page = await context.newPage()

    // Navigate to admin panel
    await page.goto(config.adminPanelUrl, { waitUntil: 'networkidle' })

    // Login if credentials provided
    if (config.loginSelector && config.credentials.email && config.credentials.password) {
      await db.testLog.create({
        data: {
          testRunId,
          level: 'info',
          message: 'Logging into admin panel',
        },
      })

      await page.fill(config.loginSelector.emailSelector, config.credentials.email)
      await page.fill(config.loginSelector.passwordSelector, config.credentials.password)
      await page.click(config.loginSelector.submitSelector)
      
      // Wait for navigation after login
      await page.waitForLoadState('networkidle')
    }

    // Navigate to specific path if provided
    if (config.navigationPath) {
      await db.testLog.create({
        data: {
          testRunId,
          level: 'info',
          message: `Navigating to: ${config.navigationPath}`,
        },
      })

      const fullUrl = config.navigationPath.startsWith('http')
        ? config.navigationPath
        : new URL(config.navigationPath, config.adminPanelUrl).toString()
      
      await page.goto(fullUrl, { waitUntil: 'networkidle' })
    }

    // Extract data using selectors
    const actualData: Record<string, any> = {}

    for (const [fieldName, selector] of Object.entries(config.extractionSelectors)) {
      try {
        const element = page.locator(selector).first()
        const count = await element.count()

        if (count > 0) {
          // Try to get text content first
          const text = await element.textContent()
          if (text !== null) {
            actualData[fieldName] = text.trim()
          } else {
            // Try to get value attribute
            const value = await element.getAttribute('value')
            actualData[fieldName] = value || ''
          }
        } else {
          actualData[fieldName] = null
        }
      } catch (error: any) {
        await db.testLog.create({
          data: {
            testRunId,
            level: 'warn',
            message: `Failed to extract field ${fieldName}: ${error.message}`,
          },
        })
        actualData[fieldName] = null
      }
    }

    // Compare with expected data if provided
    let comparisonResult: ComparisonResult | null = null
    let status = 'passed'
    let details = 'UI verification successful'

    if (config.expectedData) {
      comparisonResult = compareObjects(config.expectedData, actualData)
      status = comparisonResult.passed ? 'passed' : 'failed'
      details = comparisonResult.message

      if (!comparisonResult.passed) {
        await db.testLog.create({
          data: {
            testRunId,
            level: 'warn',
            message: 'UI verification found differences',
            data: {
              differences: comparisonResult.differences,
            },
          },
        })
      }
    }

    // Store admin check result
    await db.adminCheck.create({
      data: {
        testRunId,
        relatedStepId,
        mode: 'ui',
        endpointOrPath: config.navigationPath || config.adminPanelUrl,
        expected: config.expectedData || null,
        actual: actualData,
        status,
        details,
      },
    })

    await db.testLog.create({
      data: {
        testRunId,
        level: status === 'passed' ? 'info' : 'warn',
        message: `UI verification ${status}`,
        data: {
          status,
          details,
          differences: comparisonResult?.differences || [],
        },
      },
    })
  } catch (error: any) {
    // Store failed check
    await db.adminCheck.create({
      data: {
        testRunId,
        relatedStepId,
        mode: 'ui',
        endpointOrPath: config.navigationPath || config.adminPanelUrl,
        expected: config.expectedData || null,
        actual: null,
        status: 'error',
        details: error.message || 'Unknown error',
      },
    })

    await db.testLog.create({
      data: {
        testRunId,
        level: 'error',
        message: `UI verification failed: ${error.message}`,
        data: {
          error: error.message,
          stack: error.stack,
        },
      },
    })

    throw error
  } finally {
    if (page) {
      await page.close().catch(console.error)
    }
    if (browser) {
      await browser.close().catch(console.error)
    }
  }
}

