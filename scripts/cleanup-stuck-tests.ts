#!/usr/bin/env tsx

/**
 * Script to clean up tests stuck in RUNNING status
 * Run this periodically or manually when needed
 */

import { db } from '../src/server/db'

async function cleanupStuckTests() {
  console.log('🔍 Checking for stuck tests...')

  // Find tests that have been running for more than 15 minutes
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000)

  const stuckTestRuns = await db.testRun.findMany({
    where: {
      status: 'running',
      startedAt: {
        lt: fifteenMinutesAgo,
      },
    },
    include: {
      test: true,
    },
  })

  if (stuckTestRuns.length === 0) {
    console.log('✅ No stuck tests found')
    await db.$disconnect()
    return
  }

  console.log(`⚠️  Found ${stuckTestRuns.length} stuck test(s)`)

  for (const testRun of stuckTestRuns) {
    try {
      console.log(`  Cleaning up test run ${testRun.id} (started: ${testRun.startedAt})`)

      await db.testRun.update({
        where: { id: testRun.id },
        data: {
          status: 'failed',
          finishedAt: new Date(),
        },
      })

      await db.test.update({
        where: { id: testRun.testId },
        data: {
          status: 'failed',
        },
      })

      // Log the cleanup
      await db.testLog.create({
        data: {
          testRunId: testRun.id,
          level: 'warn',
          message: 'Test was stuck in RUNNING status and was automatically marked as failed',
          data: {
            startedAt: testRun.startedAt,
            cleanedAt: new Date(),
            reason: 'stuck_in_running_status',
          },
        },
      })

      console.log(`  ✅ Cleaned up test run ${testRun.id}`)
    } catch (error: any) {
      console.error(`  ❌ Failed to clean up test run ${testRun.id}:`, error.message)
    }
  }

  console.log(`✅ Cleanup complete. Processed ${stuckTestRuns.length} test(s)`)
  await db.$disconnect()
}

cleanupStuckTests().catch((error) => {
  console.error('Error running cleanup:', error)
  process.exit(1)
})

