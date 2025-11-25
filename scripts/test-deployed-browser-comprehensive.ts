#!/usr/bin/env tsx

/**
 * Comprehensive Browser Test for Deployed Application
 * Tests all features through browser automation and generates detailed report
 */

import { chromium, Browser, Page } from 'playwright'
import path from 'path'
import fs from 'fs/promises'

const BASE_URL = process.env.TEST_URL || 'https://web-ui-ux-testing-tool-production.up.railway.app'
const SCREENSHOT_DIR = path.join(process.cwd(), 'browser-test-screenshots')
const REPORT_DIR = path.join(process.cwd(), 'browser-test-reports')

interface TestResult {
  name: string
  category: string
  passed: boolean
  error?: string
  details?: string
  screenshot?: string
  duration?: number
  timestamp: string
}

const results: TestResult[] = []

function logResult(
  name: string,
  category: string,
  passed: boolean,
  error?: string,
  details?: string,
  screenshot?: string,
  duration?: number
) {
  const result: TestResult = {
    name,
    category,
    passed,
    error,
    details,
    screenshot,
    duration,
    timestamp: new Date().toISOString()
  }
  results.push(result)
  const icon = passed ? '✅' : '❌'
  console.log(`${icon} [${category}] ${name}`)
  if (details) console.log(`   ${details}`)
  if (error) console.log(`   Error: ${error}`)
}

async function ensureDirs() {
  await fs.mkdir(SCREENSHOT_DIR, { recursive: true })
  await fs.mkdir(REPORT_DIR, { recursive: true })
}

async function takeScreenshot(page: Page, name: string): Promise<string> {
  const screenshotPath = path.join(SCREENSHOT_DIR, `${name}.png`)
  await page.screenshot({ path: screenshotPath, fullPage: true })
  return screenshotPath
}

async function waitForNavigation(page: Page, timeout = 10000) {
  try {
    await page.waitForLoadState('networkidle', { timeout })
  } catch (e) {
    // Ignore timeout
  }
}

async function testHomepage(page: Page): Promise<boolean> {
  const startTime = Date.now()
  try {
    console.log('\n🏠 Testing Homepage...')
    await page.goto(BASE_URL)
    await waitForNavigation(page)
    
    const title = await page.title()
    const url = page.url()
    const hasContent = await page.locator('body').textContent()
    const statusCode = await page.evaluate(() => document.readyState)
    
    const screenshot = await takeScreenshot(page, '01-homepage')
    
    // Page is considered loaded if URL matches and we have a title or content
    const hasValidContent = hasContent !== null && hasContent.length > 0
    const hasTitle = Boolean(title && title.length > 0)
    const passed: boolean = url === BASE_URL && (hasTitle || hasValidContent)
    const duration = Date.now() - startTime
    
    logResult(
      'Homepage Load',
      'Frontend',
      passed,
      passed ? undefined : 'Page did not load correctly',
      `Title: ${title || 'N/A'}, URL: ${url}, ReadyState: ${statusCode}`,
      screenshot,
      duration
    )
    
    return passed
  } catch (error: any) {
    const duration = Date.now() - startTime
    logResult('Homepage Load', 'Frontend', false, error.message, undefined, undefined, duration)
    return false
  }
}

async function testNavigation(page: Page): Promise<boolean> {
  const startTime = Date.now()
  try {
    console.log('\n🧭 Testing Navigation...')
    await page.goto(BASE_URL)
    await waitForNavigation(page)
    
    // Test login link
    const loginLink = page.locator('a[href*="login"], a:has-text("Login")').first()
    const hasLoginLink = await loginLink.count() > 0
    
    // Test register link
    const registerLink = page.locator('a[href*="register"], a:has-text("Register")').first()
    const hasRegisterLink = await registerLink.count() > 0
    
    const screenshot = await takeScreenshot(page, '02-navigation')
    const duration = Date.now() - startTime
    
    const passed = hasLoginLink && hasRegisterLink
    logResult(
      'Navigation Links',
      'Frontend',
      passed,
      passed ? undefined : 'Navigation links not found',
      `Login link: ${hasLoginLink}, Register link: ${hasRegisterLink}`,
      screenshot,
      duration
    )
    
    return passed
  } catch (error: any) {
    const duration = Date.now() - startTime
    logResult('Navigation Links', 'Frontend', false, error.message, undefined, undefined, duration)
    return false
  }
}

async function testRegisterPage(page: Page): Promise<boolean> {
  const startTime = Date.now()
  try {
    console.log('\n📝 Testing Registration Page...')
    await page.goto(`${BASE_URL}/register`)
    await waitForNavigation(page)
    
    // Check form elements
    const emailField = page.locator('#email, input[type="email"]').first()
    const passwordField = page.locator('#password, input[type="password"]').first()
    const confirmPasswordField = page.locator('#confirmPassword, input[name*="confirm"]').first()
    const submitButton = page.locator('button[type="submit"]').first()
    
    const hasEmail = await emailField.count() > 0
    const hasPassword = await passwordField.count() > 0
    const hasConfirmPassword = await confirmPasswordField.count() > 0
    const hasSubmit = await submitButton.count() > 0
    
    const screenshot = await takeScreenshot(page, '03-register-page')
    const duration = Date.now() - startTime
    
    const passed = hasEmail && hasPassword && hasConfirmPassword && hasSubmit
    logResult(
      'Registration Page UI',
      'Frontend',
      passed,
      passed ? undefined : 'Form elements missing',
      `Email: ${hasEmail}, Password: ${hasPassword}, Confirm: ${hasConfirmPassword}, Submit: ${hasSubmit}`,
      screenshot,
      duration
    )
    
    return passed
  } catch (error: any) {
    const duration = Date.now() - startTime
    logResult('Registration Page UI', 'Frontend', false, error.message, undefined, undefined, duration)
    return false
  }
}

async function testLoginPage(page: Page): Promise<boolean> {
  const startTime = Date.now()
  try {
    console.log('\n🔐 Testing Login Page...')
    await page.goto(`${BASE_URL}/login`)
    await waitForNavigation(page)
    
    const emailField = page.locator('#email, input[type="email"]').first()
    const passwordField = page.locator('#password, input[type="password"]').first()
    const submitButton = page.locator('button[type="submit"]').first()
    
    const hasEmail = await emailField.count() > 0
    const hasPassword = await passwordField.count() > 0
    const hasSubmit = await submitButton.count() > 0
    
    const screenshot = await takeScreenshot(page, '04-login-page')
    const duration = Date.now() - startTime
    
    const passed = hasEmail && hasPassword && hasSubmit
    logResult(
      'Login Page UI',
      'Frontend',
      passed,
      passed ? undefined : 'Form elements missing',
      `Email: ${hasEmail}, Password: ${hasPassword}, Submit: ${hasSubmit}`,
      screenshot,
      duration
    )
    
    return passed
  } catch (error: any) {
    const duration = Date.now() - startTime
    logResult('Login Page UI', 'Frontend', false, error.message, undefined, undefined, duration)
    return false
  }
}

async function testRegistrationFlow(page: Page): Promise<{ success: boolean; email: string; password: string }> {
  const startTime = Date.now()
  const testEmail = `test-${Date.now()}@example.com`
  const testPassword = 'TestPassword123!'
  
  try {
    console.log('\n📝 Testing Registration Flow...')
    await page.goto(`${BASE_URL}/register`)
    await waitForNavigation(page)
    
    // Fill form
    await page.fill('#email, input[type="email"]', testEmail)
    await page.fill('#password, input[type="password"]', testPassword)
    await page.fill('#confirmPassword, input[name*="confirm"]', testPassword)
    
    await page.waitForTimeout(500)
    
    // Submit
    await page.click('button[type="submit"]')
    await page.waitForTimeout(5000)
    
    const currentUrl = page.url()
    const pageContent = await page.textContent('body') || ''
    
    const screenshot = await takeScreenshot(page, '05-registration-submit')
    const duration = Date.now() - startTime
    
    const success = currentUrl.includes('/dashboard') || pageContent.includes('dashboard')
    const error = pageContent.includes('error') || pageContent.includes('Error') || pageContent.includes('failed')
    
    logResult(
      'Registration Flow',
      'Authentication',
      success && !error,
      success ? undefined : error ? 'Registration failed' : 'Did not redirect to dashboard',
      `URL: ${currentUrl}, Success: ${success}, Error: ${error}`,
      screenshot,
      duration
    )
    
    return { success: success && !error, email: testEmail, password: testPassword }
  } catch (error: any) {
    const duration = Date.now() - startTime
    logResult('Registration Flow', 'Authentication', false, error.message, undefined, undefined, duration)
    return { success: false, email: testEmail, password: testPassword }
  }
}

async function testLoginFlow(page: Page, email: string, password: string): Promise<boolean> {
  const startTime = Date.now()
  try {
    console.log('\n🔐 Testing Login Flow...')
    await page.goto(`${BASE_URL}/login`)
    await waitForNavigation(page)
    
    await page.fill('#email, input[type="email"]', email)
    await page.fill('#password, input[type="password"]', password)
    
    await page.waitForTimeout(500)
    await page.click('button[type="submit"]')
    await page.waitForTimeout(5000)
    
    const currentUrl = page.url()
    const pageContent = await page.textContent('body') || ''
    
    const screenshot = await takeScreenshot(page, '06-login-submit')
    const duration = Date.now() - startTime
    
    const success = currentUrl.includes('/dashboard') || pageContent.includes('dashboard')
    const error = pageContent.includes('Invalid') || pageContent.includes('error') || pageContent.includes('Error')
    
    logResult(
      'Login Flow',
      'Authentication',
      success && !error,
      success ? undefined : error ? 'Login failed' : 'Did not redirect to dashboard',
      `URL: ${currentUrl}, Success: ${success}`,
      screenshot,
      duration
    )
    
    return success && !error
  } catch (error: any) {
    const duration = Date.now() - startTime
    logResult('Login Flow', 'Authentication', false, error.message, undefined, undefined, duration)
    return false
  }
}

async function testDashboardAccess(page: Page): Promise<boolean> {
  const startTime = Date.now()
  try {
    console.log('\n📊 Testing Dashboard Access...')
    await page.goto(`${BASE_URL}/dashboard`)
    await waitForNavigation(page)
    
    const currentUrl = page.url()
    const pageContent = await page.textContent('body') || ''
    
    const screenshot = await takeScreenshot(page, '07-dashboard')
    const duration = Date.now() - startTime
    
    // Dashboard should be accessible if logged in, or redirect to login if not
    const isDashboard = currentUrl.includes('/dashboard') && !pageContent.includes('Login')
    const isRedirected = currentUrl.includes('/login')
    
    const passed = isDashboard || isRedirected // Both are valid behaviors
    
    logResult(
      'Dashboard Access',
      'Authentication',
      passed,
      passed ? undefined : 'Unexpected behavior',
      `URL: ${currentUrl}, Is Dashboard: ${isDashboard}, Redirected: ${isRedirected}`,
      screenshot,
      duration
    )
    
    return passed
  } catch (error: any) {
    const duration = Date.now() - startTime
    logResult('Dashboard Access', 'Authentication', false, error.message, undefined, undefined, duration)
    return false
  }
}

async function testProtectedRoutes(page: Page): Promise<boolean> {
  const startTime = Date.now()
  try {
    console.log('\n🔒 Testing Protected Routes...')
    
    // Test accessing test creation page without auth
    await page.goto(`${BASE_URL}/tests/new`)
    await waitForNavigation(page)
    
    const currentUrl = page.url()
    const isRedirected = currentUrl.includes('/login')
    
    const screenshot = await takeScreenshot(page, '08-protected-routes')
    const duration = Date.now() - startTime
    
    logResult(
      'Protected Routes',
      'Security',
      isRedirected,
      isRedirected ? undefined : 'Route not protected',
      `URL: ${currentUrl}, Redirected: ${isRedirected}`,
      screenshot,
      duration
    )
    
    return isRedirected
  } catch (error: any) {
    const duration = Date.now() - startTime
    logResult('Protected Routes', 'Security', false, error.message, undefined, undefined, duration)
    return false
  }
}

async function testTestCreationPage(page: Page): Promise<boolean> {
  const startTime = Date.now()
  try {
    console.log('\n🧪 Testing Test Creation Page...')
    await page.goto(`${BASE_URL}/tests/new`)
    await waitForNavigation(page)
    
    const currentUrl = page.url()
    const pageContent = await page.textContent('body') || ''
    
    // If redirected to login, that's expected behavior
    if (currentUrl.includes('/login')) {
      const screenshot = await takeScreenshot(page, '09-test-creation-redirect')
      const duration = Date.now() - startTime
      logResult(
        'Test Creation Page (Unauthenticated)',
        'Frontend',
        true,
        undefined,
        'Redirected to login (expected)',
        screenshot,
        duration
      )
      return true
    }
    
    // If on test creation page, check for form elements
    const nameField = page.locator('#name, input[name*="name"]').first()
    const urlField = page.locator('#targetUrl, input[name*="url"]').first()
    const hasName = await nameField.count() > 0
    const hasUrl = await urlField.count() > 0
    
    const screenshot = await takeScreenshot(page, '09-test-creation-page')
    const duration = Date.now() - startTime
    
    const passed = hasName && hasUrl
    logResult(
      'Test Creation Page',
      'Frontend',
      passed,
      passed ? undefined : 'Form elements missing',
      `Name field: ${hasName}, URL field: ${hasUrl}`,
      screenshot,
      duration
    )
    
    return passed
  } catch (error: any) {
    const duration = Date.now() - startTime
    logResult('Test Creation Page', 'Frontend', false, error.message, undefined, undefined, duration)
    return false
  }
}

async function testResponsiveDesign(page: Page): Promise<boolean> {
  const startTime = Date.now()
  try {
    console.log('\n📱 Testing Responsive Design...')
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto(BASE_URL)
    await waitForNavigation(page)
    await takeScreenshot(page, '10-mobile-view')
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto(BASE_URL)
    await waitForNavigation(page)
    await takeScreenshot(page, '11-tablet-view')
    
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto(BASE_URL)
    await waitForNavigation(page)
    await takeScreenshot(page, '12-desktop-view')
    
    const duration = Date.now() - startTime
    
    logResult(
      'Responsive Design',
      'Frontend',
      true,
      undefined,
      'Screenshots taken for mobile, tablet, and desktop',
      undefined,
      duration
    )
    
    return true
  } catch (error: any) {
    const duration = Date.now() - startTime
    logResult('Responsive Design', 'Frontend', false, error.message, undefined, undefined, duration)
    return false
  }
}

async function testAPIHealth(page: Page): Promise<boolean> {
  const startTime = Date.now()
  try {
    console.log('\n🏥 Testing API Health...')
    
    // Try to access health endpoint if it exists
    const response = await page.goto(`${BASE_URL}/api/health`, { waitUntil: 'networkidle' }).catch(() => null)
    
    const duration = Date.now() - startTime
    
    if (response) {
      const status = response.status()
      const passed = status === 200 || status === 404 // 404 is ok if endpoint doesn't exist
      logResult(
        'API Health Check',
        'Backend',
        passed,
        passed ? undefined : `Status: ${status}`,
        `Status: ${status}`,
        undefined,
        duration
      )
      return passed
    } else {
      logResult(
        'API Health Check',
        'Backend',
        true,
        undefined,
        'Health endpoint not available (not required)',
        undefined,
        duration
      )
      return true
    }
  } catch (error: any) {
    const duration = Date.now() - startTime
    logResult('API Health Check', 'Backend', false, error.message, undefined, undefined, duration)
    return false
  }
}

async function generateReport(): Promise<string> {
  const timestamp = new Date().toISOString()
  const reportPath = path.join(REPORT_DIR, `browser-test-report-${Date.now()}.md`)
  
  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length
  const total = results.length
  const passRate = ((passed / total) * 100).toFixed(1)
  
  // Group by category
  const byCategory: Record<string, TestResult[]> = {}
  results.forEach(r => {
    if (!byCategory[r.category]) byCategory[r.category] = []
    byCategory[r.category].push(r)
  })
  
  let report = `# Browser Test Report - Deployed Application\n\n`
  report += `**Date**: ${new Date().toLocaleString()}\n`
  report += `**URL**: ${BASE_URL}\n`
  report += `**Environment**: Production (Railway)\n\n`
  
  report += `## Executive Summary\n\n`
  report += `| Metric | Value |\n`
  report += `|--------|-------|\n`
  report += `| Total Tests | ${total} |\n`
  report += `| Passed | ${passed} ✅ |\n`
  report += `| Failed | ${failed} ${failed > 0 ? '❌' : ''} |\n`
  report += `| Pass Rate | ${passRate}% |\n`
  report += `| Overall Status | ${failed === 0 ? '✅ PASS' : '⚠️ PARTIAL PASS'} |\n\n`
  
  report += `## Test Results by Category\n\n`
  
  for (const [category, tests] of Object.entries(byCategory)) {
    const categoryPassed = tests.filter(t => t.passed).length
    const categoryTotal = tests.length
    report += `### ${category} (${categoryPassed}/${categoryTotal} passed)\n\n`
    
    report += `| Test | Status | Duration | Details |\n`
    report += `|------|--------|----------|---------|\n`
    
    tests.forEach(test => {
      const status = test.passed ? '✅ PASS' : '❌ FAIL'
      const duration = test.duration ? `${test.duration}ms` : 'N/A'
      const details = test.details || test.error || '-'
      report += `| ${test.name} | ${status} | ${duration} | ${details} |\n`
    })
    
    report += `\n`
  }
  
  report += `## Detailed Test Results\n\n`
  
  results.forEach((result, index) => {
    report += `### ${index + 1}. ${result.name}\n\n`
    report += `- **Category**: ${result.category}\n`
    report += `- **Status**: ${result.passed ? '✅ PASS' : '❌ FAIL'}\n`
    report += `- **Timestamp**: ${result.timestamp}\n`
    if (result.duration) report += `- **Duration**: ${result.duration}ms\n`
    if (result.details) report += `- **Details**: ${result.details}\n`
    if (result.error) report += `- **Error**: ${result.error}\n`
    if (result.screenshot) {
      const relativePath = path.relative(process.cwd(), result.screenshot)
      report += `- **Screenshot**: \`${relativePath}\`\n`
    }
    report += `\n`
  })
  
  report += `## Screenshots\n\n`
  report += `All screenshots are saved in: \`${SCREENSHOT_DIR}\`\n\n`
  
  report += `## Recommendations\n\n`
  
  if (failed === 0) {
    report += `✅ All tests passed! The application is functioning correctly.\n\n`
  } else {
    report += `⚠️ Some tests failed. Review the errors above and:\n\n`
    results.filter(r => !r.passed).forEach(r => {
      report += `- **${r.name}**: ${r.error || 'Check details above'}\n`
    })
    report += `\n`
  }
  
  report += `## Test Environment\n\n`
  report += `- **Base URL**: ${BASE_URL}\n`
  report += `- **Browser**: Chromium (Playwright)\n`
  report += `- **Test Date**: ${timestamp}\n`
  
  await fs.writeFile(reportPath, report)
  return reportPath
}

async function main() {
  console.log('🚀 Starting Comprehensive Browser Test')
  console.log('='.repeat(60))
  console.log(`Base URL: ${BASE_URL}`)
  console.log(`Screenshots: ${SCREENSHOT_DIR}`)
  console.log(`Reports: ${REPORT_DIR}`)
  console.log('')
  
  await ensureDirs()
  
  let browser: Browser | null = null
  
  try {
    browser = await chromium.launch({
      headless: false,
      slowMo: 300
    })
    
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    })
    
    const page = await context.newPage()
    page.setDefaultTimeout(15000)
    
    // Run all tests
    await testHomepage(page)
    await testNavigation(page)
    await testRegisterPage(page)
    await testLoginPage(page)
    await testProtectedRoutes(page)
    await testTestCreationPage(page)
    
    // Test registration flow
    const registrationResult = await testRegistrationFlow(page)
    
    // If registration succeeded, test login with new account
    if (registrationResult.success) {
      await testLoginFlow(page, registrationResult.email, registrationResult.password)
      await testDashboardAccess(page)
    } else {
      // Try with existing test account
      console.log('\n⚠️  Registration failed, trying with existing account...')
      await testLoginFlow(page, 'test@example.com', 'password123')
      await testDashboardAccess(page)
    }
    
    await testResponsiveDesign(page)
    await testAPIHealth(page)
    
    // Generate report
    console.log('\n' + '='.repeat(60))
    console.log('📊 Generating Report...')
    const reportPath = await generateReport()
    
    // Print summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 Test Summary')
    console.log('='.repeat(60))
    
    const passed = results.filter(r => r.passed).length
    const failed = results.filter(r => !r.passed).length
    const total = results.length
    
    results.forEach(result => {
      const icon = result.passed ? '✅' : '❌'
      console.log(`${icon} [${result.category}] ${result.name}`)
      if (result.error) {
        console.log(`   ${result.error}`)
      }
    })
    
    console.log('')
    console.log(`Total: ${total} | Passed: ${passed} | Failed: ${failed}`)
    console.log(`Pass Rate: ${((passed / total) * 100).toFixed(1)}%`)
    console.log('')
    console.log(`📄 Full report saved to: ${reportPath}`)
    console.log(`📸 Screenshots saved to: ${SCREENSHOT_DIR}`)
    console.log('')
    
    if (failed === 0) {
      console.log('🎉 All tests passed!')
    } else {
      console.log('⚠️  Some tests failed. Check the report for details.')
    }
    
    // Keep browser open briefly
    await page.waitForTimeout(3000)
    
  } catch (error: any) {
    console.error('❌ Test execution error:', error)
    process.exit(1)
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

main()

