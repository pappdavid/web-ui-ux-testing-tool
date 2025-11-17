#!/usr/bin/env tsx

/**
 * CI/CD Script for running tests headlessly
 * 
 * Usage:
 *   tsx scripts/ci-run-test.ts <testId>
 *   tsx scripts/ci-run-test.ts <testRunId> --run-id
 * 
 * Environment variables:
 *   DATABASE_URL - PostgreSQL connection string
 *   NODE_ENV - Set to 'production' for production mode
 */

import { runTest } from '../src/tests/engine/TestEngine'
import { db } from '../src/server/db'

async function main() {
  const args = process.argv.slice(2)
  const isRunId = args.includes('--run-id')
  const testIdOrRunId = args.find((arg) => !arg.startsWith('--'))

  if (!testIdOrRunId) {
    console.error('Usage: tsx scripts/ci-run-test.ts <testId|testRunId> [--run-id]')
    console.error('  --run-id: Treat argument as testRunId instead of testId')
    process.exit(1)
  }

  try {
    let testRunId: string

    if (isRunId) {
      // Direct test run ID
      testRunId = testIdOrRunId
    } else {
      // Test ID - create a new test run
      const test = await db.test.findUnique({
        where: { id: testIdOrRunId },
        include: {
          steps: {
            orderBy: {
              orderIndex: 'asc',
            },
          },
        },
      })

      if (!test) {
        console.error(`Test not found: ${testIdOrRunId}`)
        process.exit(1)
      }

      if (test.steps.length === 0) {
        console.error(`Test has no steps: ${testIdOrRunId}`)
        process.exit(1)
      }

      // Create test run
      const testRun = await db.testRun.create({
        data: {
          testId: testIdOrRunId,
          status: 'running',
          deviceProfile: test.deviceProfile,
          browserType: 'chromium',
        },
      })

      testRunId = testRun.id
      console.log(`Created test run: ${testRunId}`)
    }

    // Run the test
    console.log(`Starting test run: ${testRunId}`)
    await runTest(testRunId)

    // Check final status
    const testRun = await db.testRun.findUnique({
      where: { id: testRunId },
    })

    if (!testRun) {
      console.error('Test run not found after execution')
      process.exit(1)
    }

    console.log(`Test run completed with status: ${testRun.status}`)

    if (testRun.status === 'passed') {
      console.log('✅ Test passed')
      process.exit(0)
    } else {
      console.error('❌ Test failed')
      process.exit(1)
    }
  } catch (error: any) {
    console.error('Error running test:', error)
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

main()

