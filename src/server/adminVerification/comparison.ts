export interface ComparisonResult {
  passed: boolean
  differences: Array<{
    path: string
    expected: any
    actual: any
  }>
  message: string
}

/**
 * Deep comparison of two objects, returning differences
 */
export function compareObjects(expected: any, actual: any, path = ''): ComparisonResult {
  const differences: Array<{ path: string; expected: any; actual: any }> = []

  // Handle null/undefined cases
  if (expected === null || expected === undefined) {
    if (actual !== expected) {
      differences.push({ path: path || 'root', expected, actual })
    }
    return {
      passed: differences.length === 0,
      differences,
      message: differences.length === 0 ? 'Objects match' : 'Objects do not match',
    }
  }

  if (actual === null || actual === undefined) {
    differences.push({ path: path || 'root', expected, actual })
    return {
      passed: false,
      differences,
      message: 'Actual value is null/undefined',
    }
  }

  // Handle primitive types
  if (typeof expected !== 'object' || expected instanceof Date) {
    if (expected !== actual) {
      differences.push({ path: path || 'root', expected, actual })
    }
    return {
      passed: differences.length === 0,
      differences,
      message: differences.length === 0 ? 'Values match' : 'Values do not match',
    }
  }

  // Handle arrays
  if (Array.isArray(expected)) {
    if (!Array.isArray(actual)) {
      differences.push({ path: path || 'root', expected, actual })
      return {
        passed: false,
        differences,
        message: 'Expected array but got non-array',
      }
    }

    if (expected.length !== actual.length) {
      differences.push({
        path: `${path}.length`,
        expected: expected.length,
        actual: actual.length,
      })
    }

    const maxLength = Math.max(expected.length, actual.length)
    for (let i = 0; i < maxLength; i++) {
      const itemResult = compareObjects(
        expected[i],
        actual[i],
        `${path}[${i}]`
      )
      differences.push(...itemResult.differences)
    }

    return {
      passed: differences.length === 0,
      differences,
      message: differences.length === 0 ? 'Arrays match' : 'Arrays do not match',
    }
  }

  // Handle objects
  const expectedKeys = new Set(Object.keys(expected))
  const actualKeys = new Set(Object.keys(actual))

  // Check for missing keys in actual
  for (const key of expectedKeys) {
    if (!actualKeys.has(key)) {
      differences.push({
        path: path ? `${path}.${key}` : key,
        expected: expected[key],
        actual: undefined,
      })
    }
  }

  // Check for extra keys in actual (optional - might want to ignore these)
  // for (const key of actualKeys) {
  //   if (!expectedKeys.has(key)) {
  //     differences.push({
  //       path: path ? `${path}.${key}` : key,
  //       expected: undefined,
  //       actual: actual[key],
  //     })
  //   }
  // }

  // Compare common keys
  for (const key of expectedKeys) {
    if (actualKeys.has(key)) {
      const keyResult = compareObjects(
        expected[key],
        actual[key],
        path ? `${path}.${key}` : key
      )
      differences.push(...keyResult.differences)
    }
  }

  return {
    passed: differences.length === 0,
    differences,
    message: differences.length === 0 ? 'Objects match' : 'Objects do not match',
  }
}

/**
 * Format comparison result as a human-readable string
 */
export function formatComparisonResult(result: ComparisonResult): string {
  if (result.passed) {
    return 'Verification passed: All values match'
  }

  const diffMessages = result.differences.map(
    (diff) => `  - ${diff.path}: expected "${diff.expected}", got "${diff.actual}"`
  )

  return `Verification failed:\n${diffMessages.join('\n')}`
}

