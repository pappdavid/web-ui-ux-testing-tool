/**
 * Main Agent Session Runner
 * Uses OpenAI tool calling + Playwright to explore web apps
 */

import { chromium, Browser, Page } from 'playwright'
import { fetchSession, updateSessionStatus } from './railwayClient'
import { tools, ToolHandlers, resetOrderIndex } from './tools'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'
const MAX_ITERATIONS = 30

interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
  tool_calls?: any[]
  tool_call_id?: string
  name?: string
}

/**
 * Call OpenAI Chat Completions with tool calling
 */
async function callOpenAI(messages: ChatMessage[]): Promise<any> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages,
      tools,
      tool_choice: 'auto',
      temperature: 0.7,
      max_tokens: 2000,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenAI API error: ${response.statusText} - ${errorText}`)
  }

  return await response.json()
}

/**
 * Run an agent session
 */
export async function runAgentSession(sessionId: string): Promise<void> {
  let browser: Browser | null = null
  let page: Page | null = null

  try {
    console.log(`[AgentWorker] Starting session ${sessionId}`)

    // Fetch session details
    const session = await fetchSession(sessionId)
    if (!session) {
      console.error(`[AgentWorker] Session ${sessionId} not found`)
      return
    }

    // Update status to running
    await updateSessionStatus(sessionId, 'running')

    // Launch browser
    console.log('[AgentWorker] Launching browser...')
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    page = await browser.newPage()

    // Reset order index for new session
    resetOrderIndex()

    // Initialize tool handlers
    const toolHandlers = new ToolHandlers(page, sessionId)

    // Build system prompt
    const systemPrompt = `You are a web testing automation agent. Your goal is to explore a web application and record actions that can be replayed as automated tests.

You have access to the following tools:
- open_page(url): Navigate to a URL
- get_dom(): Get current page structure to understand available elements
- click(selector): Click an element by CSS selector
- type(selector, value): Type into an input field
- screenshot(name?): Take a screenshot
- assert(selector, type, expected?): Assert element state (exists, notExists, contains, equals)
- scroll(direction): Scroll the page up or down
- complete_scenario(): Mark the scenario as complete

Important guidelines:
1. Start by calling open_page with the target URL
2. Use get_dom frequently to understand what elements are available
3. Use specific CSS selectors (IDs, names, or unique classes)
4. After important actions, use screenshot to document the state
5. Add assertions to verify expected outcomes
6. When the scenario is complete, call complete_scenario

Be methodical and thorough. Record every significant action.`

    const userPrompt = `Target URL: ${session.test.targetUrl}
Scenario to explore: ${session.description || 'Explore the application and record key user flows'}

Please complete this scenario by exploring the application and recording test steps.`

    // Initialize messages
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]

    // Tool calling loop
    let iteration = 0
    let completed = false

    while (iteration < MAX_ITERATIONS && !completed) {
      iteration++
      console.log(`[AgentWorker] Iteration ${iteration}/${MAX_ITERATIONS}`)

      // Call OpenAI
      const response = await callOpenAI(messages)
      const assistantMessage = response.choices[0]?.message

      if (!assistantMessage) {
        throw new Error('No response from OpenAI')
      }

      // Add assistant message to history
      messages.push(assistantMessage)

      // Check for tool calls
      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        console.log(`[AgentWorker] Executing ${assistantMessage.tool_calls.length} tool calls`)

        // Execute each tool call
        for (const toolCall of assistantMessage.tool_calls) {
          const toolName = toolCall.function.name
          const toolArgs = JSON.parse(toolCall.function.arguments)

          console.log(`[AgentWorker] Tool: ${toolName}`, toolArgs)

          // Check for completion
          if (toolName === 'complete_scenario') {
            completed = true
            messages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              name: toolName,
              content: 'Scenario completed successfully',
            })
            continue
          }

          // Execute tool
          const result = await toolHandlers.executeTool(toolName, toolArgs)
          console.log(`[AgentWorker] Result: ${result}`)

          // Add tool result to messages
          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            name: toolName,
            content: result,
          })

          // Small delay between actions
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      } else {
        // No tool calls - agent might be done or stuck
        console.log('[AgentWorker] No tool calls in response')
        if (assistantMessage.content?.toLowerCase().includes('complete')) {
          completed = true
        }
        break
      }
    }

    if (iteration >= MAX_ITERATIONS) {
      console.log('[AgentWorker] Reached max iterations')
    }

    // Update status to completed
    await updateSessionStatus(sessionId, 'completed')
    console.log(`[AgentWorker] Session ${sessionId} completed successfully`)

  } catch (error: any) {
    console.error(`[AgentWorker] Error in session ${sessionId}:`, error)
    await updateSessionStatus(sessionId, 'failed', error.message)
  } finally {
    // Clean up
    if (page) {
      try {
        await page.close()
      } catch (e) {
        console.error('[AgentWorker] Error closing page:', e)
      }
    }
    if (browser) {
      try {
        await browser.close()
      } catch (e) {
        console.error('[AgentWorker] Error closing browser:', e)
      }
    }
  }
}

