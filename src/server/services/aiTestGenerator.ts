/**
 * AI Test Generator Service
 * 
 * Integrates with OpenAI/Anthropic APIs to generate intelligent test steps
 */

interface SuggestedStep {
  orderIndex: number
  type: string
  selector?: string
  value?: string
  assertionType?: string
  assertionExpected?: string
  meta?: Record<string, any>
  description: string
}

/**
 * Generate test steps using OpenAI API
 */
export async function generateTestStepsWithOpenAI(
  targetUrl: string,
  description: string,
  apiKey?: string
): Promise<SuggestedStep[]> {
  const openaiKey = apiKey || process.env.OPENAI_API_KEY

  if (!openaiKey) {
    console.warn('OpenAI API key not found, falling back to mock implementation')
    return generateTestSteps(targetUrl, description)
  }

  try {
    const prompt = `You are a test automation expert. Given a target URL and description, generate Playwright test steps in JSON format.

Target URL: ${targetUrl}
Description: ${description}

Generate an array of test steps. Each step should have:
- orderIndex: number (starting from 0)
- type: string (click, input, select, scroll, waitForSelector, screenshot, extract, assert, dragAndDrop, fileUpload)
- selector: string (CSS selector, optional)
- value: string (value to input/select, optional)
- assertionType: string (equals, contains, exists, notExists, optional)
- assertionExpected: string (expected value for assertions, optional)
- description: string (human-readable description)

Return ONLY valid JSON array, no markdown, no code blocks.

Example:
[
  {
    "orderIndex": 0,
    "type": "waitForSelector",
    "selector": "body",
    "description": "Wait for page to load"
  },
  {
    "orderIndex": 1,
    "type": "screenshot",
    "description": "Take initial screenshot"
  }
]`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a test automation expert. Always return valid JSON arrays.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('OpenAI API error:', error)
      return generateTestSteps(targetUrl, description)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      return generateTestSteps(targetUrl, description)
    }

    // Extract JSON from response (handle markdown code blocks)
    let jsonContent = content.trim()
    if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/^```(?:json)?\n/, '').replace(/\n```$/, '')
    }

    const steps = JSON.parse(jsonContent) as SuggestedStep[]
    return steps.map((step, index) => ({
      ...step,
      orderIndex: step.orderIndex ?? index,
    }))
  } catch (error) {
    console.error('Error generating test steps with OpenAI:', error)
    return generateTestSteps(targetUrl, description)
  }
}

/**
 * Generate test steps using Anthropic Claude API
 */
export async function generateTestStepsWithAnthropic(
  targetUrl: string,
  description: string,
  apiKey?: string
): Promise<SuggestedStep[]> {
  const anthropicKey = apiKey || process.env.ANTHROPIC_API_KEY

  if (!anthropicKey) {
    console.warn('Anthropic API key not found, falling back to mock implementation')
    return generateTestSteps(targetUrl, description)
  }

  try {
    const prompt = `You are a test automation expert. Given a target URL and description, generate Playwright test steps in JSON format.

Target URL: ${targetUrl}
Description: ${description}

Generate an array of test steps. Each step should have:
- orderIndex: number (starting from 0)
- type: string (click, input, select, scroll, waitForSelector, screenshot, extract, assert, dragAndDrop, fileUpload)
- selector: string (CSS selector, optional)
- value: string (value to input/select, optional)
- assertionType: string (equals, contains, exists, notExists, optional)
- assertionExpected: string (expected value for assertions, optional)
- description: string (human-readable description)

Return ONLY valid JSON array, no markdown, no code blocks.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Anthropic API error:', error)
      return generateTestSteps(targetUrl, description)
    }

    const data = await response.json()
    const content = data.content[0]?.text

    if (!content) {
      return generateTestSteps(targetUrl, description)
    }

    // Extract JSON from response
    let jsonContent = content.trim()
    if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/^```(?:json)?\n/, '').replace(/\n```$/, '')
    }

    const steps = JSON.parse(jsonContent) as SuggestedStep[]
    return steps.map((step, index) => ({
      ...step,
      orderIndex: step.orderIndex ?? index,
    }))
  } catch (error) {
    console.error('Error generating test steps with Anthropic:', error)
    return generateTestSteps(targetUrl, description)
  }
}

/**
 * Generate test steps based on URL and description (fallback/mock)
 */
export async function generateTestSteps(
  targetUrl: string,
  description: string
): Promise<SuggestedStep[]> {
  const steps: SuggestedStep[] = [
    {
      orderIndex: 0,
      type: 'waitForSelector',
      selector: 'body',
      description: 'Wait for page to load',
      meta: { timeout: 5000 },
    },
    {
      orderIndex: 1,
      type: 'screenshot',
      description: 'Take initial screenshot',
      meta: { name: 'initial-page' },
    },
  ]

  // Add steps based on description keywords
  const lowerDescription = description.toLowerCase()

  if (lowerDescription.includes('login') || lowerDescription.includes('sign in')) {
    steps.push(
      {
        orderIndex: steps.length,
        type: 'input',
        selector: 'input[type="email"], input[name="email"]',
        value: 'test@example.com',
        description: 'Enter email address',
      },
      {
        orderIndex: steps.length + 1,
        type: 'input',
        selector: 'input[type="password"], input[name="password"]',
        value: 'password123',
        description: 'Enter password',
      },
      {
        orderIndex: steps.length + 2,
        type: 'click',
        selector: 'button[type="submit"], button:has-text("Login"), button:has-text("Sign In")',
        description: 'Click login button',
      }
    )
  }

  if (lowerDescription.includes('form') || lowerDescription.includes('submit')) {
    steps.push({
      orderIndex: steps.length,
      type: 'click',
      selector: 'button[type="submit"], form button',
      description: 'Submit form',
    })
  }

  if (lowerDescription.includes('button') || lowerDescription.includes('click')) {
    steps.push({
      orderIndex: steps.length,
      type: 'click',
      selector: 'button',
      description: 'Click button',
    })
  }

  if (lowerDescription.includes('assert') || lowerDescription.includes('check')) {
    steps.push({
      orderIndex: steps.length,
      type: 'assert',
      selector: 'h1, h2',
      assertionType: 'exists',
      description: 'Verify heading exists',
    })
  }

  // Always add a final screenshot
  steps.push({
    orderIndex: steps.length,
    type: 'screenshot',
    description: 'Take final screenshot',
    meta: { name: 'final-page' },
  })

  return steps
}

/**
 * Main function to generate test steps (tries AI first, falls back to mock)
 */
export async function generateTestStepsWithAI(
  targetUrl: string,
  description: string,
  provider: 'openai' | 'anthropic' | 'auto' = 'auto',
  apiKey?: string
): Promise<SuggestedStep[]> {
  if (provider === 'openai' || (provider === 'auto' && process.env.OPENAI_API_KEY)) {
    return generateTestStepsWithOpenAI(targetUrl, description, apiKey)
  }

  if (provider === 'anthropic' || (provider === 'auto' && process.env.ANTHROPIC_API_KEY)) {
    return generateTestStepsWithAnthropic(targetUrl, description, apiKey)
  }

  // Fallback to mock
  return generateTestSteps(targetUrl, description)
}
