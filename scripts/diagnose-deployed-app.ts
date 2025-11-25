#!/usr/bin/env tsx

/**
 * Diagnostic script to check what's actually on the deployed app
 */

import { chromium, Browser, Page } from 'playwright'

const BASE_URL = process.env.TEST_URL || 'https://abundant-laughter-production.up.railway.app'

async function diagnose() {
  console.log('🔍 Diagnosing Deployed Application')
  console.log('='.repeat(50))
  console.log(`URL: ${BASE_URL}`)
  console.log('')
  
  let browser: Browser | null = null
  
  try {
    browser = await chromium.launch({ headless: false })
    const page = await browser.newPage()
    page.setDefaultTimeout(20000)
    
    // Test root page
    console.log('📄 Testing root page...')
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 20000 })
    await page.waitForTimeout(2000)
    
    const title = await page.title()
    const url = page.url()
    const bodyText = await page.textContent('body') || ''
    
    console.log(`✅ Page loaded`)
    console.log(`   Title: ${title}`)
    console.log(`   URL: ${url}`)
    console.log(`   Body length: ${bodyText.length} chars`)
    console.log(`   Body preview: ${bodyText.substring(0, 200)}...`)
    console.log('')
    
    // Check for specific elements
    console.log('🔍 Checking for elements...')
    const emailInput = await page.locator('#email, input[type="email"]').count()
    const passwordInput = await page.locator('#password, input[type="password"]').count()
    const loginLink = await page.locator('a:has-text("Login"), a[href*="login"]').count()
    const registerLink = await page.locator('a:has-text("Register"), a[href*="register"]').count()
    
    console.log(`   Email inputs: ${emailInput}`)
    console.log(`   Password inputs: ${passwordInput}`)
    console.log(`   Login links: ${loginLink}`)
    console.log(`   Register links: ${registerLink}`)
    console.log('')
    
    // Try login page
    console.log('📄 Testing /login page...')
    try {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 20000 })
      await page.waitForTimeout(2000)
      
      const loginTitle = await page.title()
      const loginUrl = page.url()
      const loginEmailInput = await page.locator('#email, input[type="email"]').count()
      
      console.log(`✅ Login page loaded`)
      console.log(`   Title: ${loginTitle}`)
      console.log(`   URL: ${loginUrl}`)
      console.log(`   Email inputs: ${loginEmailInput}`)
      console.log('')
      
      if (loginEmailInput > 0) {
        console.log('✅ Login form found!')
        const emailSelector = await page.locator('input[type="email"]').first()
        const emailId = await emailSelector.getAttribute('id').catch(() => 'no-id')
        console.log(`   Email input ID: ${emailId}`)
      }
    } catch (error: any) {
      console.log(`❌ Login page error: ${error.message}`)
    }
    
    // Try register page
    console.log('📄 Testing /register page...')
    try {
      await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle', timeout: 20000 })
      await page.waitForTimeout(2000)
      
      const registerTitle = await page.title()
      const registerUrl = page.url()
      const registerEmailInput = await page.locator('#email, input[type="email"]').count()
      
      console.log(`✅ Register page loaded`)
      console.log(`   Title: ${registerTitle}`)
      console.log(`   URL: ${registerUrl}`)
      console.log(`   Email inputs: ${registerEmailInput}`)
    } catch (error: any) {
      console.log(`❌ Register page error: ${error.message}`)
    }
    
    // Try dashboard
    console.log('')
    console.log('📄 Testing /dashboard page...')
    try {
      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle', timeout: 20000 })
      await page.waitForTimeout(2000)
      
      const dashboardTitle = await page.title()
      const dashboardUrl = page.url()
      
      console.log(`✅ Dashboard page loaded`)
      console.log(`   Title: ${dashboardTitle}`)
      console.log(`   URL: ${dashboardUrl}`)
      
      if (dashboardUrl.includes('/login')) {
        console.log('⚠️  Redirected to login (not authenticated)')
      }
    } catch (error: any) {
      console.log(`❌ Dashboard page error: ${error.message}`)
    }
    
    // Take screenshot
    console.log('')
    console.log('📸 Taking screenshot...')
    await page.screenshot({ path: 'diagnostic-screenshot.png', fullPage: true })
    console.log('✅ Screenshot saved: diagnostic-screenshot.png')
    
    console.log('')
    console.log('✅ Diagnosis complete!')
    console.log('   Browser will stay open for 10 seconds for inspection...')
    await page.waitForTimeout(10000)
    
  } catch (error: any) {
    console.error('❌ Diagnostic error:', error)
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

diagnose()

