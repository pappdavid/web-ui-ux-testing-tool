import { db } from '@/server/db'
import { compareObjects, ComparisonResult } from './comparison'

interface ApiVerifierConfig {
  baseUrl: string
  authMethod: 'bearer' | 'basic' | 'header'
  credentials: {
    token?: string
    username?: string
    password?: string
    headerName?: string
    headerValue?: string
  }
  endpoint: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  expectedData?: any
}

export async function verifyAdminApi(
  testRunId: string,
  config: ApiVerifierConfig,
  relatedStepId?: string
): Promise<void> {
  try {
    // Log verification start
    await db.testLog.create({
      data: {
        testRunId,
        level: 'info',
        message: `Starting API verification: ${config.endpoint}`,
        data: { endpoint: config.endpoint, method: config.method || 'GET' } as any, // JSON field
      },
    })

    // Build request URL
    const url = config.endpoint.startsWith('http')
      ? config.endpoint
      : `${config.baseUrl}${config.endpoint}`

    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Add authentication
    if (config.authMethod === 'bearer' && config.credentials.token) {
      headers['Authorization'] = `Bearer ${config.credentials.token}`
    } else if (config.authMethod === 'basic' && config.credentials.username && config.credentials.password) {
      const credentials = Buffer.from(
        `${config.credentials.username}:${config.credentials.password}`
      ).toString('base64')
      headers['Authorization'] = `Basic ${credentials}`
    } else if (config.authMethod === 'header' && config.credentials.headerName && config.credentials.headerValue) {
      headers[config.credentials.headerName] = config.credentials.headerValue
    }

    // Make API request
    const method = config.method || 'GET'
    const fetchOptions: RequestInit = {
      method,
      headers,
    }

    const response = await fetch(url, fetchOptions)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const actualData = await response.json()

    // Compare with expected data if provided
    let comparisonResult: ComparisonResult | null = null
    let status = 'passed'
    let details = 'API request successful'

    if (config.expectedData) {
      comparisonResult = compareObjects(config.expectedData, actualData)
      status = comparisonResult.passed ? 'passed' : 'failed'
      details = comparisonResult.message

      if (!comparisonResult.passed) {
        await db.testLog.create({
          data: {
            testRunId,
            level: 'warn',
            message: 'API verification found differences',
            data: {
              differences: comparisonResult.differences,
            } as any, // JSON field
          },
        })
      }
    }

    // Store admin check result
    await db.adminCheck.create({
      data: {
        testRunId,
        relatedStepId,
        mode: 'api',
        endpointOrPath: config.endpoint,
        expected: (config.expectedData || undefined) as any, // JSON field
        actual: actualData as any, // JSON field
        status,
        details,
      },
    })

    await db.testLog.create({
      data: {
        testRunId,
        level: status === 'passed' ? 'info' : 'warn',
        message: `API verification ${status}: ${config.endpoint}`,
        data: {
          status,
          details,
          differences: comparisonResult?.differences || [],
        } as any, // JSON field
      },
    })
  } catch (error: any) {
    // Store failed check
    await db.adminCheck.create({
      data: {
        testRunId,
        relatedStepId,
        mode: 'api',
        endpointOrPath: config.endpoint,
        expected: (config.expectedData || undefined) as any, // JSON field
        actual: undefined,
        status: 'error',
        details: error.message || 'Unknown error',
      },
    })

    await db.testLog.create({
      data: {
        testRunId,
        level: 'error',
        message: `API verification failed: ${error.message}`,
        data: {
          error: error.message,
          stack: error.stack,
        } as any, // JSON field
      },
    })

    throw error
  }
}

