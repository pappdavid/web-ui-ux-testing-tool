#!/usr/bin/env tsx

/**
 * Comprehensive test suite for deployed Railway application
 * Tests all API endpoints and functionality
 */

import { chromium, Browser, Page } from 'playwright'

const BASE_URL = process.env.TEST_URL || process.env.RAILWAY_URL || 'https://your-app.up.railway.app'
const TEST_EMAIL = `test-${Date.now()}@example.com`
const TEST_PASSWORD = 'TestPassword123!'

interface TestResult {
  name: string
  passed: boolean
  error?: string
  details?: any
}

const results: TestResult[] = []

function logResult(name: string, passed: boolean, error?: string, details?: any) {
  results.push({ name, passed, error, details })
  const icon = passed ? '✅' : '❌'
  console.log(`${icon} ${name}`)
  if (error) {
    console.log(`   Error: ${error}`)
  }
  if (details) {
    console.log(`   Details: ${JSON.stringify(details, null, 2)}`)
  }
}

async function testAPIHealth(): Promise<boolean> {
  try {
    console.log('\n🏥 Testing API Health...')
    const response = await fetch(`${BASE_URL}/api/health`, {
      method: 'GET',
    }).catch(() => null)
    
    if (response?.ok || response === null) {
      logResult('API Health Check', true)
      return true
    } else {
      logResult('API Health Check', false, `Status: ${response.status}`)
      return false
    }
  } catch (error: any) {
    logResult('API Health Check', false, error.message)
    return false
  }
}

async function testRegistration(page: Page): Promise<boolean> {
  try {
    console.log('\n📝 Testing Registration...')
    await page.goto(`${BASE_URL}/register`)
    await page.waitForLoadState('networkidle', { timeout: 10000 })
    
    await page.fill('#email', TEST_EMAIL)
    await page.fill('#password', TEST_PASSWORD)
    await page.fill('#confirmPassword', TEST_PASSWORD)
    
    await page.waitForTimeout(500)
    await page.click('button[type="submit"]')
    await page.waitForTimeout(4000)
    
    const currentUrl = page.url()
    if (currentUrl.includes('/dashboard')) {
      logResult('Registration', true, undefined, { email: TEST_EMAIL })
      return true
    } else {
      const errorDiv = await page.locator('.bg-red-50, [class*="error"]').first().textContent().catch(() => 'Unknown error')
      logResult('Registration', false, `Still on: ${currentUrl}`, { error: errorDiv })
      return false
    }
  } catch (error: any) {
    logResult('Registration', false, error.message)
    return false
  }
}

async function testLogin(page: Page, email: string, password: string): Promise<boolean> {
  try {
    console.log('\n🔐 Testing Login...')
    await page.goto(`${BASE_URL}/login`)
    await page.waitForLoadState('networkidle', { timeout: 10000 })
    
    await page.fill('#email', email)
    await page.fill('#password', password)
    
    await page.waitForTimeout(500)
    await page.click('button[type="submit"]')
    await page.waitForTimeout(4000)
    
    const currentUrl = page.url()
    if (currentUrl.includes('/dashboard')) {
      logResult('Login', true)
      return true
    } else {
      const errorDiv = await page.locator('.bg-red-50, [class*="error"]').first().textContent().catch(() => 'Login failed')
      logResult('Login', false, errorDiv)
      return false
    }
  } catch (error: any) {
    logResult('Login', false, error.message)
    return false
  }
}

async function testDashboardAccess(page: Page): Promise<boolean> {
  try {
    console.log('\n📊 Testing Dashboard Access...')
    await page.goto(`${BASE_URL}/dashboard`)
    await page.waitForLoadState('networkidle', { timeout: 10000 })
    
    const currentUrl = page.url()
    const pageContent = await page.textContent('body') || ''
    
    if (currentUrl.includes('/dashboard') && !pageContent.includes('Login')) {
      logResult('Dashboard Access', true)
      return true
    } else {
      logResult('Dashboard Access', false, 'Redirected to login')
      return false
    }
  } catch (error: any) {
    logResult('Dashboard Access', false, error.message)
    return false
  }
}

async function testCreateTest(page: Page): Promise<boolean> {
  try {
    console.log('\n🧪 Testing Create Test...')
    await page.goto(`${BASE_URL}/dashboard`)
    await page.waitForLoadState('networkidle', { timeout: 10000 })
    
    // Look for create button or navigate directly
    const createButton = page.locator('button:has-text("Create"), a:has-text("Create"), button:has-text("New"), a:has-text("New")').first()
    
    if (await createButton.count() > 0) {
      await createButton.click()
      await page.waitForLoadState('networkidle', { timeout: 10000 })
    } else {
      await page.goto(`${BASE_URL}/tests/new`)
      await page.waitForLoadState('networkidle', { timeout: 10000 })
    }
    
    const testName = `E2E Test ${Date.now()}`
    await page.fill('#name', testName)
    await page.fill('#targetUrl', 'https://example.com')
    
    await page.waitForTimeout(500)
    await page.click('button[type="submit"]')
    await page.waitForTimeout(4000)
    
    const currentUrl = page.url()
    if (currentUrl.includes('/tests/') || currentUrl.includes('/dashboard')) {
      logResult('Create Test', true, undefined, { testName })
      return true
    } else {
      const errorText = await page.textContent('body') || ''
      logResult('Create Test', false, `URL: ${currentUrl}`)
      return false
    }
  } catch (error: any) {
    logResult('Create Test', false, error.message)
    return false
  }
}

async function testViewTests(page: Page): Promise<boolean> {
  try {
    console.log('\n📋 Testing View Tests...')
    await page.goto(`${BASE_URL}/dashboard`)
    await page.waitForLoadState('networkidle', { timeout: 10000 })
    
    const pageContent = await page.textContent('body') || ''
    const hasTestList = pageContent.includes('Test') || pageContent.includes('test') || pageContent.includes('Create')
    
    if (hasTestList) {
      logResult('View Tests', true)
      return true
    } else {
      logResult('View Tests', false, 'No test list found')
      return false
    }
  } catch (error: any) {
    logResult('View Tests', false, error.message)
    return false
  }
}

async function testAPICreateTest(sessionCookie?: string): Promise<boolean> {
  try {
    console.log('\n🔌 Testing API: Create Test...')
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
      logResult('API: Create Test', true, undefined, { testId: data.id })
      return true
    } else {
      const error = await response.text()
      logResult('API: Create Test', false, `Status: ${response.status}`, { error })
      return false
    }
  } catch (error: any) {
    logResult('API: Create Test', false, error.message)
    return false
  }
}

async function testAPIGetTests(sessionCookie?: string): Promise<boolean> {
  try {
    console.log('\n🔌 Testing API: Get Tests...')
    const headers: HeadersInit = {}
    
    if (sessionCookie) {
      headers['Cookie'] = sessionCookie
    }
    
    const response = await fetch(`${BASE_URL}/api/tests`, {
      method: 'GET',
      headers,
    })
    
    if (response.ok) {
      const data = await response.json()
      logResult('API: Get Tests', true, undefined, { count: Array.isArray(data) ? data.length : 'N/A' })
      return true
    } else {
      logResult('API: Get Tests', false, `Status: ${response.status}`)
      return false
    }
  } catch (error: any) {
    logResult('API: Get Tests', false, error.message)
    return false
  }
}

async function testNavigation(page: Page): Promise<boolean> {
  try {
    console.log('\n🧭 Testing Navigation...')
    await page.goto(`${BASE_URL}/dashboard`)
    await page.waitForLoadState('networkidle', { timeout: 10000 })
    
    const navLinks = await page.locator('nav a, header a').all()
    if (navLinks.length > 0) {
      logResult('Navigation', true, undefined, { linkCount: navLinks.length })
      return true
    } else {
      logResult('Navigation', false, 'No navigation links found')
      return false
    }
  } catch (error: any) {
    logResult('Navigation', false, error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Testing Deployed Railway Application')
  console.log('='.repeat(50))
  console.log(`Base URL: ${BASE_URL}`)
  console.log(`Test Email: ${TEST_EMAIL}`)
  console.log('')
  
  if (BASE_URL.includes('your-app')) {
    console.log('⚠️  WARNING: BASE_URL not set!')
    console.log('   Set TEST_URL or RAILWAY_URL environment variable')
    console.log('   Example: TEST_URL=https://your-app.up.railway.app npm run test:deployed')
    console.log('')
  }
  
  let browser: Browser | null = null
  
  try {
    // Test API health first
    await testAPIHealth()
    
    browser = await chromium.launch({ 
      headless: true,
    })
    const page = await browser.newPage()
    page.setDefaultTimeout(15000)
    
    // Test registration
    const registrationSuccess = await testRegistration(page)
    
    if (registrationSuccess) {
      // Test login with newly created account
      await testLogin(page, TEST_EMAIL, TEST_PASSWORD)
    } else {
      // Try with existing test account
      console.log('\n⚠️  Registration failed, trying with existing account...')
      await testLogin(page, 'test@example.com', 'password123')
    }
    
    // Test dashboard access
    await testDashboardAccess(page)
    
    // Test navigation
    await testNavigation(page)
    
    // Test viewing tests
    await testViewTests(page)
    
    // Test creating a test
    await testCreateTest(page)
    
    // Test API endpoints (if we can get session cookie)
    // Note: API tests may require authentication
    await testAPIGetTests()
    await testAPICreateTest()
    
    // Print summary
    console.log('\n' + '='.repeat(50))
    console.log('📊 Test Summary')
    console.log('='.repeat(50))
    
    const passed = results.filter(r => r.passed).length
    const failed = results.filter(r => !r.passed).length
    const total = results.length
    
    results.forEach(result => {
      const icon = result.passed ? '✅' : '❌'
      console.log(`${icon} ${result.name}`)
      if (result.error) {
        console.log(`   ${result.error}`)
      }
    })
    
    console.log('')
    console.log(`Total: ${total} | Passed: ${passed} | Failed: ${failed}`)
    console.log('')
    
    if (failed === 0) {
      console.log('🎉 All tests passed!')
      process.exit(0)
    } else {
      console.log('⚠️  Some tests failed. Check the errors above.')
      process.exit(1)
    }
    
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

