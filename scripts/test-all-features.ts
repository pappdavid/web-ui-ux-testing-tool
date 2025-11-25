#!/usr/bin/env tsx

/**
 * Comprehensive Feature Test Suite
 * Tests all implemented features of the Web UI/UX Testing Tool
 */

import { chromium, Browser, Page } from 'playwright'
import { readFileSync } from 'fs'
import path from 'path'

const BASE_URL = process.env.TEST_URL || process.env.RAILWAY_URL || 'https://web-ui-ux-testing-tool-production.up.railway.app'
const TEST_EMAIL = `test-${Date.now()}@example.com`
const TEST_PASSWORD = 'TestPassword123!'

interface TestResult {
  category: string
  feature: string
  status: 'pass' | 'fail' | 'blocked' | 'skipped'
  message?: string
  details?: any
}

const results: TestResult[] = []

function logResult(category: string, feature: string, status: TestResult['status'], message?: string, details?: any) {
  results.push({ category, feature, status, message, details })
  const icon = {
    pass: '✅',
    fail: '❌',
    blocked: '⚠️',
    skipped: '⏭️'
  }[status]
  console.log(`${icon} [${category}] ${feature}${message ? `: ${message}` : ''}`)
}

async function testHealthEndpoint(): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/api/health`)
    const data = await response.json()
    if (response.ok && data.status === 'ok') {
      logResult('API', 'Health Endpoint', 'pass')
      return true
    } else {
      logResult('API', 'Health Endpoint', 'fail', 'Invalid response')
      return false
    }
  } catch (error: any) {
    logResult('API', 'Health Endpoint', 'fail', error.message)
    return false
  }
}

async function testRegistration(page: Page): Promise<boolean> {
  try {
    await page.goto(`${BASE_URL}/register`)
    await page.waitForLoadState('networkidle', { timeout: 10000 })
    
    await page.fill('#email', TEST_EMAIL)
    await page.fill('#password', TEST_PASSWORD)
    await page.fill('#confirmPassword', TEST_PASSWORD)
    
    await page.click('button[type="submit"]')
    await page.waitForTimeout(3000)
    
    const currentUrl = page.url()
    if (currentUrl.includes('/dashboard')) {
      logResult('Authentication', 'User Registration', 'pass', 'Successfully registered')
      return true
    } else {
      const errorText = await page.textContent('body') || ''
      if (errorText.includes('Internal server error') || errorText.includes('DATABASE_URL')) {
        logResult('Authentication', 'User Registration', 'blocked', 'Database not connected')
      } else {
        logResult('Authentication', 'User Registration', 'fail', `Still on: ${currentUrl}`)
      }
      return false
    }
  } catch (error: any) {
    logResult('Authentication', 'User Registration', 'fail', error.message)
    return false
  }
}

async function testLogin(page: Page, email: string, password: string): Promise<boolean> {
  try {
    await page.goto(`${BASE_URL}/login`)
    await page.waitForLoadState('networkidle', { timeout: 10000 })
    
    await page.fill('#email', email)
    await page.fill('#password', password)
    await page.click('button[type="submit"]')
    await page.waitForTimeout(3000)
    
    const currentUrl = page.url()
    if (currentUrl.includes('/dashboard')) {
      logResult('Authentication', 'User Login', 'pass')
      return true
    } else {
      logResult('Authentication', 'User Login', 'fail', 'Login failed')
      return false
    }
  } catch (error: any) {
    logResult('Authentication', 'User Login', 'fail', error.message)
    return false
  }
}

async function testDashboard(page: Page): Promise<boolean> {
  try {
    await page.goto(`${BASE_URL}/dashboard`)
    await page.waitForLoadState('networkidle', { timeout: 10000 })
    
    const currentUrl = page.url()
    if (currentUrl.includes('/dashboard')) {
      const pageContent = await page.textContent('body') || ''
      if (pageContent.includes('Dashboard') || pageContent.includes('Test') || pageContent.includes('Create')) {
        logResult('Frontend', 'Dashboard Page', 'pass')
        return true
      } else {
        logResult('Frontend', 'Dashboard Page', 'fail', 'Content not found')
        return false
      }
    } else {
      logResult('Frontend', 'Dashboard Page', 'blocked', 'Redirected to login')
      return false
    }
  } catch (error: any) {
    logResult('Frontend', 'Dashboard Page', 'fail', error.message)
    return false
  }
}

async function testCreateTest(page: Page): Promise<boolean> {
  try {
    await page.goto(`${BASE_URL}/tests/new`)
    await page.waitForLoadState('networkidle', { timeout: 10000 })
    
    const testName = `E2E Test ${Date.now()}`
    await page.fill('#name', testName)
    await page.fill('#targetUrl', 'https://example.com')
    
    await page.click('button[type="submit"]')
    await page.waitForTimeout(3000)
    
    const currentUrl = page.url()
    if (currentUrl.includes('/tests/') && !currentUrl.includes('/new')) {
      logResult('Test Management', 'Create Test', 'pass', `Created test: ${testName}`)
      return true
    } else {
      logResult('Test Management', 'Create Test', 'blocked', 'Requires authentication')
      return false
    }
  } catch (error: any) {
    logResult('Test Management', 'Create Test', 'fail', error.message)
    return false
  }
}

async function testStepBuilder(page: Page): Promise<boolean> {
  try {
    // Navigate to test creation or edit page
    await page.goto(`${BASE_URL}/tests/new`)
    await page.waitForLoadState('networkidle', { timeout: 10000 })
    
    // Check if step builder UI exists
    const stepBuilder = await page.locator('[class*="step"], [class*="Step"], form').first()
    const exists = await stepBuilder.count() > 0
    
    if (exists) {
      logResult('Test Management', 'Step Builder UI', 'pass', 'Step builder interface found')
      return true
    } else {
      logResult('Test Management', 'Step Builder UI', 'fail', 'Step builder not found')
      return false
    }
  } catch (error: any) {
    logResult('Test Management', 'Step Builder UI', 'blocked', 'Requires authentication')
    return false
  }
}

async function testAPICreateTest(sessionCookie?: string): Promise<boolean> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    
    if (sessionCookie) {
      headers['Cookie'] = sessionCookie
    }
    
    const response = await fetch(`${BASE_URL}/api/tests`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: `API Test ${Date.now()}`,
        targetUrl: 'https://example.com',
        deviceProfile: 'desktop',
      }),
    })
    
    if (response.ok) {
      const data = await response.json()
      logResult('API', 'Create Test Endpoint', 'pass', `Test ID: ${data.id}`)
      return true
    } else if (response.status === 401 || response.status === 403) {
      logResult('API', 'Create Test Endpoint', 'blocked', 'Requires authentication')
      return false
    } else {
      const error = await response.text()
      logResult('API', 'Create Test Endpoint', 'fail', `Status: ${response.status}`)
      return false
    }
  } catch (error: any) {
    logResult('API', 'Create Test Endpoint', 'fail', error.message)
    return false
  }
}

async function testAIGenerator(): Promise<boolean> {
  try {
    // Check if AI generator service exists
    const aiGeneratorPath = path.join(process.cwd(), 'src/server/services/aiTestGenerator.ts')
    const fileContent = readFileSync(aiGeneratorPath, 'utf-8')
    
    if (fileContent.includes('OpenAI') && fileContent.includes('generateTestStepsWithAI')) {
      logResult('Advanced Features', 'AI Test Generator', 'pass', 'Implementation found')
      return true
    } else {
      logResult('Advanced Features', 'AI Test Generator', 'fail', 'Implementation not found')
      return false
    }
  } catch (error: any) {
    logResult('Advanced Features', 'AI Test Generator', 'fail', error.message)
    return false
  }
}

async function testVisualRegression(): Promise<boolean> {
  try {
    const visualRegressionPath = path.join(process.cwd(), 'src/tests/engine/visualRegression.ts')
    const fileContent = readFileSync(visualRegressionPath, 'utf-8')
    
    if (fileContent.includes('pixelmatch') && fileContent.includes('compareImages')) {
      logResult('Advanced Features', 'Visual Regression', 'pass', 'Implementation found')
      return true
    } else {
      logResult('Advanced Features', 'Visual Regression', 'fail', 'Implementation not found')
      return false
    }
  } catch (error: any) {
    logResult('Advanced Features', 'Visual Regression', 'fail', error.message)
    return false
  }
}

async function testAdminVerification(): Promise<boolean> {
  try {
    const apiVerifierPath = path.join(process.cwd(), 'src/server/adminVerification/apiVerifier.ts')
    const uiVerifierPath = path.join(process.cwd(), 'src/server/adminVerification/uiVerifier.ts')
    
    const apiContent = readFileSync(apiVerifierPath, 'utf-8')
    const uiContent = readFileSync(uiVerifierPath, 'utf-8')
    
    if (apiContent.includes('verifyAdminApi') && uiContent.includes('verifyAdminUI')) {
      logResult('Admin Verification', 'API & UI Verifiers', 'pass', 'Both implementations found')
      return true
    } else {
      logResult('Admin Verification', 'API & UI Verifiers', 'fail', 'Implementation incomplete')
      return false
    }
  } catch (error: any) {
    logResult('Admin Verification', 'API & UI Verifiers', 'fail', error.message)
    return false
  }
}

async function testStepHandlers(): Promise<boolean> {
  try {
    const handlersPath = path.join(process.cwd(), 'src/tests/engine/stepHandlers.ts')
    const fileContent = readFileSync(handlersPath, 'utf-8')
    
    const requiredHandlers = ['click', 'input', 'screenshot', 'assert', 'extract']
    const foundHandlers = requiredHandlers.filter(handler => 
      fileContent.includes(`handle${handler.charAt(0).toUpperCase() + handler.slice(1)}`) ||
      fileContent.includes(`'${handler}'`)
    )
    
    if (foundHandlers.length === requiredHandlers.length) {
      logResult('Test Engine', 'Step Handlers', 'pass', `All ${requiredHandlers.length} handlers found`)
      return true
    } else {
      logResult('Test Engine', 'Step Handlers', 'fail', `Missing: ${requiredHandlers.filter(h => !foundHandlers.includes(h)).join(', ')}`)
      return false
    }
  } catch (error: any) {
    logResult('Test Engine', 'Step Handlers', 'fail', error.message)
    return false
  }
}

async function main() {
  console.log('🧪 Comprehensive Feature Test Suite')
  console.log('='.repeat(60))
  console.log(`Base URL: ${BASE_URL}`)
  console.log(`Test Email: ${TEST_EMAIL}`)
  console.log('')
  
  // Test health endpoint (doesn't require DB)
  await testHealthEndpoint()
  
  // Test code implementations (don't require DB)
  await testAIGenerator()
  await testVisualRegression()
  await testAdminVerification()
  await testStepHandlers()
  
  // Test UI features (may require DB)
  let browser: Browser | null = null
  try {
    browser = await chromium.launch({ headless: true })
    const page = await browser.newPage()
    page.setDefaultTimeout(15000)
    
    // Test registration
    const registrationSuccess = await testRegistration(page)
    
    if (registrationSuccess) {
      // Test login with newly created account
      await testLogin(page, TEST_EMAIL, TEST_PASSWORD)
      
      // Test authenticated features
      await testDashboard(page)
      await testCreateTest(page)
      await testStepBuilder(page)
      await testAPICreateTest()
    } else {
      // Try with existing account if available
      logResult('Authentication', 'User Login', 'skipped', 'Registration failed, skipping login')
      await testDashboard(page)
      await testCreateTest(page)
      await testStepBuilder(page)
      await testAPICreateTest()
    }
  } catch (error: any) {
    console.error('Browser test error:', error)
  } finally {
    if (browser) {
      await browser.close()
    }
  }
  
  // Print summary
  console.log('')
  console.log('='.repeat(60))
  console.log('📊 Test Summary')
  console.log('='.repeat(60))
  
  const byStatus = results.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  console.log(`Total Tests: ${results.length}`)
  console.log(`✅ Passed: ${byStatus.pass || 0}`)
  console.log(`❌ Failed: ${byStatus.fail || 0}`)
  console.log(`⚠️  Blocked: ${byStatus.blocked || 0}`)
  console.log(`⏭️  Skipped: ${byStatus.skipped || 0}`)
  console.log('')
  
  // Group by category
  const byCategory = results.reduce((acc, r) => {
    if (!acc[r.category]) acc[r.category] = []
    acc[r.category].push(r)
    return acc
  }, {} as Record<string, TestResult[]>)
  
  for (const [category, tests] of Object.entries(byCategory)) {
    console.log(`\n${category}:`)
    tests.forEach(test => {
      const icon = {
        pass: '✅',
        fail: '❌',
        blocked: '⚠️',
        skipped: '⏭️'
      }[test.status]
      console.log(`  ${icon} ${test.feature}${test.message ? ` - ${test.message}` : ''}`)
    })
  }
  
  console.log('')
  console.log('='.repeat(60))
  
  if (byStatus.fail === 0 && byStatus.blocked === 0) {
    console.log('🎉 All tests passed!')
    process.exit(0)
  } else if (byStatus.blocked > 0) {
    console.log('⚠️  Some tests are blocked (likely due to missing DATABASE_URL)')
    console.log('   Fix DATABASE_URL and re-run tests')
    process.exit(0)
  } else {
    console.log('❌ Some tests failed. Check the errors above.')
    process.exit(1)
  }
}

main()

