#!/usr/bin/env tsx

/**
 * Test script for registration and login functionality
 * Uses Playwright to test the auth flow in a browser
 */

import { chromium, Browser, Page } from 'playwright'

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000'
const TEST_EMAIL = `test-${Date.now()}@example.com`
const TEST_PASSWORD = 'TestPassword123!'

async function testRegistration(page: Page): Promise<boolean> {
  try {
    console.log('📝 Testing Registration...')
    console.log(`   Email: ${TEST_EMAIL}`)
    
    // Navigate to register page
    await page.goto(`${BASE_URL}/register`)
    await page.waitForLoadState('networkidle')
    
    // Fill registration form
    await page.fill('input[type="email"]', TEST_EMAIL)
    await page.fill('input[type="password"]', TEST_PASSWORD)
    await page.fill('input[id="confirmPassword"]', TEST_PASSWORD)
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Wait for redirect or error
    await page.waitForTimeout(2000)
    
    const currentUrl = page.url()
    const pageContent = await page.textContent('body')
    
    if (currentUrl.includes('/dashboard') || pageContent?.includes('Dashboard')) {
      console.log('✅ Registration successful!')
      return true
    } else if (pageContent?.includes('error') || pageContent?.includes('Error')) {
      console.log('❌ Registration failed:', pageContent.substring(0, 200))
      return false
    } else {
      console.log('⚠️  Registration status unclear. URL:', currentUrl)
      return false
    }
  } catch (error: any) {
    console.error('❌ Registration test error:', error.message)
    return false
  }
}

async function testLogin(page: Page, email: string, password: string): Promise<boolean> {
  try {
    console.log('🔐 Testing Login...')
    console.log(`   Email: ${email}`)
    
    // Navigate to login page
    await page.goto(`${BASE_URL}/login`)
    await page.waitForLoadState('networkidle')
    
    // Fill login form
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', password)
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Wait for redirect or error
    await page.waitForTimeout(2000)
    
    const currentUrl = page.url()
    const pageContent = await page.textContent('body')
    
    if (currentUrl.includes('/dashboard') || pageContent?.includes('Dashboard')) {
      console.log('✅ Login successful!')
      return true
    } else if (pageContent?.includes('Invalid') || pageContent?.includes('error')) {
      console.log('❌ Login failed:', pageContent.substring(0, 200))
      return false
    } else {
      console.log('⚠️  Login status unclear. URL:', currentUrl)
      return false
    }
  } catch (error: any) {
    console.error('❌ Login test error:', error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Starting Authentication Tests')
  console.log('================================')
  console.log(`Base URL: ${BASE_URL}`)
  console.log('')
  
  let browser: Browser | null = null
  
  try {
    browser = await chromium.launch({ headless: false })
    const page = await browser.newPage()
    
    // Test registration
    const registrationSuccess = await testRegistration(page)
    console.log('')
    
    if (registrationSuccess) {
      // Test login with newly created account
      await testLogin(page, TEST_EMAIL, TEST_PASSWORD)
      console.log('')
    }
    
    // Test login with default test credentials
    console.log('🔐 Testing Login with default credentials...')
    await testLogin(page, 'test@example.com', 'password123')
    console.log('')
    
    console.log('✅ Tests completed!')
    
    // Keep browser open for a moment to see results
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

