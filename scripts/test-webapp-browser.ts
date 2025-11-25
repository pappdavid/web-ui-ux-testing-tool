#!/usr/bin/env tsx

/**
 * Comprehensive browser test for the webapp
 * Tests login and all test features through browser automation
 */

import { chromium, Browser, Page } from 'playwright'

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000'
const TEST_EMAIL = `test-${Date.now()}@example.com`
const TEST_PASSWORD = 'TestPassword123!'

interface TestResult {
  name: string
  passed: boolean
  error?: string
}

const results: TestResult[] = []

function logResult(name: string, passed: boolean, error?: string) {
  results.push({ name, passed, error })
  const icon = passed ? '✅' : '❌'
  console.log(`${icon} ${name}`)
  if (error) {
    console.log(`   Error: ${error}`)
  }
}

async function waitForNavigation(page: Page, timeout = 5000) {
  try {
    await page.waitForLoadState('networkidle', { timeout })
  } catch (e) {
    // Ignore timeout, page might already be loaded
  }
}

async function testRegistration(page: Page): Promise<boolean> {
  try {
    console.log('\n📝 Testing Registration...')
    await page.goto(`${BASE_URL}/register`)
    await waitForNavigation(page)
    
    // Use ID selectors which are more reliable
    await page.fill('#email', TEST_EMAIL)
    await page.fill('#password', TEST_PASSWORD)
    await page.fill('#confirmPassword', TEST_PASSWORD)
    
    // Wait a bit for form to be ready
    await page.waitForTimeout(500)
    
    await page.click('button[type="submit"]')
    
    // Wait for navigation or error message
    await page.waitForTimeout(4000)
    
    const currentUrl = page.url()
    const pageContent = await page.textContent('body') || ''
    
    if (currentUrl.includes('/dashboard')) {
      logResult('Registration', true)
      return true
    } else if (pageContent.includes('error') || pageContent.includes('Error') || pageContent.includes('failed')) {
      const errorDiv = await page.locator('.bg-red-50, [class*="error"], [class*="Error"]').first()
      const errorText = await errorDiv.textContent().catch(() => 'Unknown error')
      logResult('Registration', false, errorText)
      return false
    } else {
      logResult('Registration', false, `Still on: ${currentUrl}`)
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
    await waitForNavigation(page)
    
    // Use ID selectors
    await page.fill('#email', email)
    await page.fill('#password', password)
    
    await page.waitForTimeout(500)
    await page.click('button[type="submit"]')
    await page.waitForTimeout(4000)
    
    const currentUrl = page.url()
    const pageContent = await page.textContent('body') || ''
    
    if (currentUrl.includes('/dashboard')) {
      logResult('Login', true)
      return true
    } else if (pageContent.includes('Invalid') || pageContent.includes('error')) {
      const errorDiv = await page.locator('.bg-red-50, [class*="error"]').first()
      const errorText = await errorDiv.textContent().catch(() => 'Login failed')
      logResult('Login', false, errorText)
      return false
    } else {
      logResult('Login', false, `Still on: ${currentUrl}`)
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
    await waitForNavigation(page)
    
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
    await waitForNavigation(page)
    
    // Look for "Create Test" or "New Test" button
    const createButton = page.locator('button:has-text("Create"), button:has-text("New"), a:has-text("Create"), a:has-text("New")').first()
    
    if (await createButton.count() > 0) {
      await createButton.click()
      await waitForNavigation(page)
    } else {
      // Try navigating directly to test creation
      await page.goto(`${BASE_URL}/tests/new`)
      await waitForNavigation(page)
    }
    
    // Fill test form using ID selectors
    const testName = `Test ${Date.now()}`
    await page.fill('#name', testName)
    
    // Fill URL field
    await page.fill('#targetUrl', 'https://example.com')
    
    await page.waitForTimeout(500)
    
    // Submit form
    const submitButton = page.locator('button[type="submit"]').first()
    await submitButton.click()
    await page.waitForTimeout(4000)
    
    const currentUrl = page.url()
    if (currentUrl.includes('/tests/') || currentUrl.includes('/dashboard')) {
      logResult('Create Test', true)
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
    await waitForNavigation(page)
    
    const pageContent = await page.textContent('body') || ''
    const hasTestList = pageContent.includes('Test') || pageContent.includes('test')
    
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

async function testNavigation(page: Page): Promise<boolean> {
  try {
    console.log('\n🧭 Testing Navigation...')
    
    // Test dashboard link
    await page.goto(`${BASE_URL}/dashboard`)
    await waitForNavigation(page)
    
    // Test if we can navigate
    const navLinks = await page.locator('nav a, header a').all()
    if (navLinks.length > 0) {
      logResult('Navigation', true)
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

async function testLogout(page: Page): Promise<boolean> {
  try {
    console.log('\n🚪 Testing Logout...')
    
    // Look for logout button
    const logoutButton = await page.locator('button:has-text("Logout"), a:has-text("Logout"), button:has-text("Sign out")').first()
    
    if (await logoutButton.count() > 0) {
      await logoutButton.click()
      await page.waitForTimeout(2000)
      
      const currentUrl = page.url()
      if (currentUrl.includes('/login') || currentUrl === BASE_URL + '/') {
        logResult('Logout', true)
        return true
      }
    }
    
    logResult('Logout', false, 'Logout button not found or did not redirect')
    return false
  } catch (error: any) {
    logResult('Logout', false, error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Starting Comprehensive Webapp Browser Tests')
  console.log('='.repeat(50))
  console.log(`Base URL: ${BASE_URL}`)
  console.log(`Test Email: ${TEST_EMAIL}`)
  console.log('')
  
  let browser: Browser | null = null
  
  try {
    browser = await chromium.launch({ 
      headless: false,
      slowMo: 500 // Slow down for visibility
    })
    const page = await browser.newPage()
    
    // Set longer timeout
    page.setDefaultTimeout(10000)
    
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
    
    // Test logout
    await testLogout(page)
    
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
    } else {
      console.log('⚠️  Some tests failed. Check the errors above.')
    }
    
    // Keep browser open for a moment
    console.log('\nKeeping browser open for 5 seconds to review...')
    await page.waitForTimeout(5000)
    
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

