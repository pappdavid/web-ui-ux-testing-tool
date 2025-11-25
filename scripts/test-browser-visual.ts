#!/usr/bin/env tsx

/**
 * Visual Browser Test - Tests the liquid glass UI in a real browser
 */

import { chromium, Browser, Page } from 'playwright'
import path from 'path'
import fs from 'fs/promises'

const BASE_URL = process.env.TEST_URL || 'https://web-ui-ux-testing-tool-production.up.railway.app'
const SCREENSHOT_DIR = path.join(process.cwd(), 'test-screenshots')

async function ensureScreenshotDir() {
  await fs.mkdir(SCREENSHOT_DIR, { recursive: true })
}

async function takeScreenshot(page: Page, name: string) {
  const screenshotPath = path.join(SCREENSHOT_DIR, `${name}.png`)
  await page.screenshot({ path: screenshotPath, fullPage: true })
  console.log(`📸 Screenshot saved: ${screenshotPath}`)
  return screenshotPath
}

async function testHomepage(page: Page) {
  console.log('\n🏠 Testing Homepage...')
  await page.goto(BASE_URL)
  await page.waitForLoadState('networkidle', { timeout: 15000 })
  
  // Check for glass UI elements
  const glassCards = await page.locator('.glass-card').count()
  const hasGradientBg = await page.evaluate(() => {
    const body = document.body
    const styles = window.getComputedStyle(body)
    return styles.backgroundImage.includes('gradient')
  })
  
  console.log(`  ✅ Glass cards found: ${glassCards}`)
  console.log(`  ✅ Gradient background: ${hasGradientBg}`)
  
  await takeScreenshot(page, '01-homepage')
  return { glassCards, hasGradientBg }
}

async function testLoginPage(page: Page) {
  console.log('\n🔐 Testing Login Page...')
  await page.goto(`${BASE_URL}/login`)
  await page.waitForLoadState('networkidle', { timeout: 15000 })
  
  // Check for glass UI elements
  const glassCards = await page.locator('.glass-card').count()
  const glassInputs = await page.locator('.glass-input').count()
  const glassButtons = await page.locator('.glass-button-primary').count()
  
  console.log(`  ✅ Glass cards: ${glassCards}`)
  console.log(`  ✅ Glass inputs: ${glassInputs}`)
  console.log(`  ✅ Glass buttons: ${glassButtons}`)
  
  await takeScreenshot(page, '02-login-page')
  return { glassCards, glassInputs, glassButtons }
}

async function testRegisterPage(page: Page) {
  console.log('\n📝 Testing Register Page...')
  await page.goto(`${BASE_URL}/register`)
  await page.waitForLoadState('networkidle', { timeout: 15000 })
  
  const glassCards = await page.locator('.glass-card').count()
  const glassInputs = await page.locator('.glass-input').count()
  
  console.log(`  ✅ Glass cards: ${glassCards}`)
  console.log(`  ✅ Glass inputs: ${glassInputs}`)
  
  await takeScreenshot(page, '03-register-page')
  return { glassCards, glassInputs }
}

async function testDashboardPage(page: Page) {
  console.log('\n📊 Testing Dashboard Page...')
  await page.goto(`${BASE_URL}/dashboard`)
  await page.waitForLoadState('networkidle', { timeout: 15000 })
  
  const currentUrl = page.url()
  if (currentUrl.includes('/login')) {
    console.log('  ⚠️  Redirected to login (expected - requires auth)')
    await takeScreenshot(page, '04-dashboard-redirect-to-login')
    return { redirected: true }
  }
  
  const glassCards = await page.locator('.glass-card').count()
  console.log(`  ✅ Glass cards: ${glassCards}`)
  
  await takeScreenshot(page, '04-dashboard')
  return { glassCards }
}

async function testNavbar(page: Page) {
  console.log('\n🧭 Testing Navbar...')
  await page.goto(BASE_URL)
  await page.waitForLoadState('networkidle', { timeout: 15000 })
  
  const navbar = await page.locator('nav').first()
  const hasGlassNav = await navbar.evaluate((el) => {
    const styles = window.getComputedStyle(el)
    return styles.backdropFilter.includes('blur') || el.classList.contains('glass-nav')
  })
  
  const navLinks = await page.locator('nav a').count()
  
  console.log(`  ✅ Glass navbar: ${hasGlassNav}`)
  console.log(`  ✅ Navigation links: ${navLinks}`)
  
  await takeScreenshot(page, '05-navbar')
  return { hasGlassNav, navLinks }
}

async function testGlassEffects(page: Page) {
  console.log('\n✨ Testing Glass Effects...')
  await page.goto(BASE_URL)
  await page.waitForLoadState('networkidle', { timeout: 15000 })
  
  // Check for CSS classes
  const glassElements = await page.evaluate(() => {
    const elements = document.querySelectorAll('.glass, .glass-card, .glass-button, .glass-input')
    return elements.length
  })
  
  // Check for backdrop blur
  const hasBackdropBlur = await page.evaluate(() => {
    const cards = document.querySelectorAll('.glass-card')
    if (cards.length === 0) return false
    const styles = window.getComputedStyle(cards[0])
    return styles.backdropFilter.includes('blur') || styles.webkitBackdropFilter?.includes('blur')
  })
  
  // Check for gradient background
  const hasGradient = await page.evaluate(() => {
    const body = document.body
    const styles = window.getComputedStyle(body)
    return styles.backgroundImage.includes('gradient')
  })
  
  console.log(`  ✅ Glass elements found: ${glassElements}`)
  console.log(`  ✅ Backdrop blur: ${hasBackdropBlur}`)
  console.log(`  ✅ Gradient background: ${hasGradient}`)
  
  return { glassElements, hasBackdropBlur, hasGradient }
}

async function testResponsiveDesign(page: Page) {
  console.log('\n📱 Testing Responsive Design...')
  
  // Test mobile view
  await page.setViewportSize({ width: 375, height: 667 })
  await page.goto(BASE_URL)
  await page.waitForLoadState('networkidle', { timeout: 15000 })
  await takeScreenshot(page, '06-mobile-view')
  
  // Test tablet view
  await page.setViewportSize({ width: 768, height: 1024 })
  await page.goto(BASE_URL)
  await page.waitForLoadState('networkidle', { timeout: 15000 })
  await takeScreenshot(page, '07-tablet-view')
  
  // Test desktop view
  await page.setViewportSize({ width: 1920, height: 1080 })
  await page.goto(BASE_URL)
  await page.waitForLoadState('networkidle', { timeout: 15000 })
  await takeScreenshot(page, '08-desktop-view')
  
  console.log('  ✅ Screenshots taken for mobile, tablet, and desktop views')
}

async function main() {
  console.log('🎨 Visual Browser Test - Liquid Glass UI')
  console.log('='.repeat(60))
  console.log(`Base URL: ${BASE_URL}`)
  console.log(`Screenshots will be saved to: ${SCREENSHOT_DIR}`)
  console.log('')
  
  await ensureScreenshotDir()
  
  let browser: Browser | null = null
  
  try {
    browser = await chromium.launch({ 
      headless: false, // Show browser
      slowMo: 500, // Slow down for visibility
    })
    
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    })
    
    const page = await context.newPage()
    page.setDefaultTimeout(20000)
    
    // Run all visual tests
    const homepageResults = await testHomepage(page)
    const loginResults = await testLoginPage(page)
    const registerResults = await testRegisterPage(page)
    const dashboardResults = await testDashboardPage(page)
    const navbarResults = await testNavbar(page)
    const glassEffectsResults = await testGlassEffects(page)
    await testResponsiveDesign(page)
    
    // Print summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 Visual Test Summary')
    console.log('='.repeat(60))
    
    console.log('\n✅ Homepage:')
    console.log(`   Glass cards: ${homepageResults.glassCards}`)
    console.log(`   Gradient background: ${homepageResults.hasGradientBg}`)
    
    console.log('\n✅ Login Page:')
    console.log(`   Glass cards: ${loginResults.glassCards}`)
    console.log(`   Glass inputs: ${loginResults.glassInputs}`)
    console.log(`   Glass buttons: ${loginResults.glassButtons}`)
    
    console.log('\n✅ Register Page:')
    console.log(`   Glass cards: ${registerResults.glassCards}`)
    console.log(`   Glass inputs: ${registerResults.glassInputs}`)
    
    console.log('\n✅ Dashboard:')
    if (dashboardResults.redirected) {
      console.log('   Redirected to login (expected)')
    } else {
      console.log(`   Glass cards: ${dashboardResults.glassCards}`)
    }
    
    console.log('\n✅ Navbar:')
    console.log(`   Glass navbar: ${navbarResults.hasGlassNav}`)
    console.log(`   Navigation links: ${navbarResults.navLinks}`)
    
    console.log('\n✅ Glass Effects:')
    console.log(`   Glass elements: ${glassEffectsResults.glassElements}`)
    console.log(`   Backdrop blur: ${glassEffectsResults.hasBackdropBlur}`)
    console.log(`   Gradient background: ${glassEffectsResults.hasGradient}`)
    
    console.log('\n✅ Responsive Design:')
    console.log('   Screenshots taken for all viewport sizes')
    
    console.log('\n' + '='.repeat(60))
    console.log('🎉 Visual tests completed!')
    console.log(`📸 Screenshots saved to: ${SCREENSHOT_DIR}`)
    console.log('='.repeat(60))
    
    // Keep browser open for a few seconds to see the result
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

