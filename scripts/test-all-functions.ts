#!/usr/bin/env tsx

/**
 * Comprehensive test suite for all application functions
 * Tests registration, login, test creation, execution, and reporting
 */

const BASE_URL = process.env.TEST_URL || 'https://web-ui-ux-testing-tool.vercel.app'

interface TestResult {
  name: string
  passed: boolean
  error?: string
  response?: any
}

const results: TestResult[] = []

async function test(name: string, fn: () => Promise<any>): Promise<void> {
  try {
    console.log(`🧪 Testing: ${name}...`)
    const result = await fn()
    results.push({ name, passed: true, response: result })
    console.log(`✅ ${name}: PASSED`)
    if (result && typeof result === 'object') {
      console.log(`   Response: ${JSON.stringify(result).substring(0, 100)}...`)
    }
  } catch (error: any) {
    results.push({ name, passed: false, error: error.message })
    console.log(`❌ ${name}: FAILED`)
    console.log(`   Error: ${error.message}`)
  }
  console.log('')
}

// Test 1: Registration
async function testRegistration() {
  const email = `test-${Date.now()}@example.com`
  const password = 'TestPassword123!'
  
  const response = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      confirmPassword: password,
    }),
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Registration failed: ${error}`)
  }
  
  const data = await response.json()
  return { email, ...data }
}

// Test 2: Login
async function testLogin(email: string, password: string) {
  // NextAuth uses GET with query params or form submission
  // For API testing, we'll use the signin endpoint
  const response = await fetch(`${BASE_URL}/api/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      redirect: false,
    }),
  })
  
  // NextAuth might redirect or return different responses
  const contentType = response.headers.get('content-type')
  if (contentType?.includes('application/json')) {
    return await response.json()
  }
  
  // If redirect, check status
  if (response.redirected || response.status === 200) {
    return { success: true, redirected: response.redirected }
  }
  
  throw new Error(`Login failed: ${response.status}`)
}

// Test 3: Get Tests (requires auth)
async function testGetTests(sessionCookie?: string) {
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (sessionCookie) {
    headers['Cookie'] = sessionCookie
  }
  
  const response = await fetch(`${BASE_URL}/api/tests`, {
    method: 'GET',
    headers,
  })
  
  if (!response.ok) {
    throw new Error(`Get tests failed: ${response.status}`)
  }
  
  return await response.json()
}

// Test 4: Create Test
async function testCreateTest(sessionCookie?: string) {
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (sessionCookie) {
    headers['Cookie'] = sessionCookie
  }
  
  const response = await fetch(`${BASE_URL}/api/tests`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: `Test ${Date.now()}`,
      targetUrl: 'https://example.com',
      deviceProfile: 'desktop',
    }),
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Create test failed: ${error}`)
  }
  
  return await response.json()
}

// Test 5: Add Test Steps
async function testAddSteps(testId: string, sessionCookie?: string) {
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (sessionCookie) {
    headers['Cookie'] = sessionCookie
  }
  
  const response = await fetch(`${BASE_URL}/api/tests/${testId}/steps`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      steps: [
        {
          orderIndex: 0,
          type: 'waitForSelector',
          selector: 'body',
        },
        {
          orderIndex: 1,
          type: 'click',
          selector: 'button',
        },
      ],
    }),
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Add steps failed: ${error}`)
  }
  
  return await response.json()
}

// Test 6: Run Test
async function testRunTest(testId: string, sessionCookie?: string) {
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (sessionCookie) {
    headers['Cookie'] = sessionCookie
  }
  
  const response = await fetch(`${BASE_URL}/api/tests/${testId}/run`, {
    method: 'POST',
    headers,
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Run test failed: ${error}`)
  }
  
  return await response.json()
}

// Test 7: Get Test Run
async function testGetTestRun(runId: string, sessionCookie?: string) {
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (sessionCookie) {
    headers['Cookie'] = sessionCookie
  }
  
  const response = await fetch(`${BASE_URL}/api/test-runs/${runId}`, {
    method: 'GET',
    headers,
  })
  
  if (!response.ok) {
    throw new Error(`Get test run failed: ${response.status}`)
  }
  
  return await response.json()
}

// Test 8: Get Test Report
async function testGetReport(runId: string, sessionCookie?: string) {
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (sessionCookie) {
    headers['Cookie'] = sessionCookie
  }
  
  const response = await fetch(`${BASE_URL}/api/test-runs/${runId}/report`, {
    method: 'GET',
    headers,
  })
  
  if (!response.ok) {
    throw new Error(`Get report failed: ${response.status}`)
  }
  
  return await response.json()
}

// Test 9: Health Check
async function testHealthCheck() {
  const response = await fetch(`${BASE_URL}/`, {
    method: 'GET',
  })
  
  if (!response.ok) {
    throw new Error(`Health check failed: ${response.status}`)
  }
  
  return { status: response.status, ok: response.ok }
}

async function main() {
  console.log('🚀 Comprehensive Function Test Suite')
  console.log('====================================')
  console.log(`Base URL: ${BASE_URL}`)
  console.log('')
  
  let testUser: { email: string; id?: string } | null = null
  let testTestId: string | null = null
  let testRunId: string | null = null
  
  // Test 1: Health Check (no auth required)
  await test('Health Check', testHealthCheck)
  
  // Test 2: Registration
  await test('Registration', async () => {
    const result = await testRegistration()
    testUser = result
    return result
  })
  
  if (!testUser) {
    console.log('⚠️  Registration failed - cannot continue with authenticated tests')
    console.log('   This is likely because DATABASE_URL is not set in Vercel')
    console.log('')
    console.log('To fix:')
    console.log('  1. Get a PostgreSQL connection string (Neon/Supabase/Vercel Postgres)')
    console.log('  2. Run: vercel env add DATABASE_URL production')
    console.log('  3. Run: vercel env pull .env.local && npx prisma migrate deploy')
    console.log('  4. Run this test again')
    printSummary()
    return
  }
  
  // Test 3: Login
  await test('Login', async () => {
    return await testLogin(testUser.email, 'TestPassword123!')
  })
  
  // Test 4: Get Tests
  await test('Get Tests', async () => {
    return await testGetTests()
  })
  
  // Test 5: Create Test
  await test('Create Test', async () => {
    const result = await testCreateTest()
    testTestId = result.test?.id || result.id
    return result
  })
  
  if (testTestId) {
    // Test 6: Add Test Steps
    await test('Add Test Steps', async () => {
      return await testAddSteps(testTestId!)
    })
    
    // Test 7: Run Test (may take time)
    await test('Run Test', async () => {
      const result = await testRunTest(testTestId!)
      testRunId = result.runId || result.testRun?.id
      return result
    })
    
    if (testRunId) {
      // Test 8: Get Test Run
      await test('Get Test Run', async () => {
        return await testGetTestRun(testRunId!)
      })
      
      // Test 9: Get Test Report
      await test('Get Test Report', async () => {
        return await testGetReport(testRunId!)
      })
    }
  }
  
  printSummary()
}

function printSummary() {
  console.log('')
  console.log('📊 Test Summary')
  console.log('===============')
  console.log('')
  
  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length
  
  results.forEach(result => {
    const icon = result.passed ? '✅' : '❌'
    console.log(`${icon} ${result.name}`)
    if (!result.passed && result.error) {
      console.log(`   Error: ${result.error}`)
    }
  })
  
  console.log('')
  console.log(`Total: ${results.length} tests`)
  console.log(`Passed: ${passed}`)
  console.log(`Failed: ${failed}`)
  console.log('')
  
  if (failed > 0) {
    console.log('⚠️  Some tests failed. Check errors above.')
    console.log('   Common issues:')
    console.log('   - DATABASE_URL not set in Vercel')
    console.log('   - Database migrations not run')
    console.log('   - Authentication issues')
  } else {
    console.log('🎉 All tests passed!')
  }
}

main().catch(console.error)

