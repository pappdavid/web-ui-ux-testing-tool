#!/usr/bin/env tsx

import { runTest } from '../src/tests/engine/TestEngine'

const testRunId = process.argv[2]

if (!testRunId) {
  console.error('Usage: tsx scripts/run-test-runner.ts <testRunId>')
  process.exit(1)
}

runTest(testRunId)
  .then(() => {
    console.log('Test run completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Test run failed:', error)
    process.exit(1)
  })

