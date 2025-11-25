/**
 * OpenAI Tool Definitions and Playwright Handlers for Agent Worker
 */

import { Page } from 'playwright'
import { postTraceSteps } from './railwayClient'

let currentOrderIndex = 0

/**
 * Reset order index for a new session
 */
export function resetOrderIndex() {
  currentOrderIndex = 0
}

/**
 * Get next order index
 */
function getNextOrderIndex(): number {
  return currentOrderIndex++
}

/**
 * OpenAI tool definitions for function calling
 */
export const tools = [
  {
    type: 'function',
    function: {
      name: 'open_page',
      description: 'Navigate to a URL. Use this as the first action to open the target website.',
      parameters: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            description: 'The full URL to navigate to (e.g., https://example.com)',
          },
        },
        required: ['url'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'click',
      description: 'Click on an element identified by a CSS selector.',
      parameters: {
        type: 'object',
        properties: {
          selector: {
            type: 'string',
            description: 'CSS selector for the element to click (e.g., "button#submit", ".login-btn")',
          },
        },
        required: ['selector'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'type',
      description: 'Type text into an input field identified by a CSS selector.',
      parameters: {
        type: 'object',
        properties: {
          selector: {
            type: 'string',
            description: 'CSS selector for the input field (e.g., "input[name=\'email\']", "#username")',
          },
          value: {
            type: 'string',
            description: 'The text to type into the field',
          },
        },
        required: ['selector', 'value'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_dom',
      description: 'Get a simplified representation of the current page DOM to understand what elements are available. Use this to find selectors for clicking or typing.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'screenshot',
      description: 'Take a screenshot of the current page state. Useful for documenting progress.',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Optional name for the screenshot (e.g., "login-page", "after-submit")',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'assert',
      description: 'Assert that an element exists or has specific content. Use this to verify expected outcomes.',
      parameters: {
        type: 'object',
        properties: {
          selector: {
            type: 'string',
            description: 'CSS selector for the element to assert',
          },
          type: {
            type: 'string',
            enum: ['exists', 'notExists', 'contains', 'equals'],
            description: 'Type of assertion: exists (element present), notExists (element absent), contains (text contains), equals (text equals)',
          },
          expected: {
            type: 'string',
            description: 'Expected value for contains/equals assertions',
          },
        },
        required: ['selector', 'type'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'scroll',
      description: 'Scroll the page in a specific direction.',
      parameters: {
        type: 'object',
        properties: {
          direction: {
            type: 'string',
            enum: ['down', 'up'],
            description: 'Direction to scroll',
          },
        },
        required: ['direction'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'complete_scenario',
      description: 'Signal that the scenario exploration is complete. Call this when all required actions have been performed.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
]

/**
 * Tool handlers that execute Playwright actions and log traces
 */
export class ToolHandlers {
  constructor(
    private page: Page,
    private sessionId: string
  ) {}

  async handleOpenPage(args: any): Promise<string> {
    const { url } = args
    try {
      await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
      
      // Log trace step
      await postTraceSteps(this.sessionId, [{
        orderIndex: getNextOrderIndex(),
        actionType: 'navigate',
        value: url,
        meta: { url },
      }])

      return `Successfully navigated to ${url}`
    } catch (error: any) {
      return `Failed to navigate: ${error.message}`
    }
  }

  async handleClick(args: any): Promise<string> {
    const { selector } = args
    try {
      await this.page.click(selector, { timeout: 10000 })
      
      // Log trace step
      await postTraceSteps(this.sessionId, [{
        orderIndex: getNextOrderIndex(),
        actionType: 'click',
        selector,
      }])

      return `Successfully clicked element: ${selector}`
    } catch (error: any) {
      return `Failed to click: ${error.message}`
    }
  }

  async handleType(args: any): Promise<string> {
    const { selector, value } = args
    try {
      await this.page.fill(selector, value, { timeout: 10000 })
      
      // Log trace step
      await postTraceSteps(this.sessionId, [{
        orderIndex: getNextOrderIndex(),
        actionType: 'input',
        selector,
        value,
      }])

      return `Successfully typed into ${selector}`
    } catch (error: any) {
      return `Failed to type: ${error.message}`
    }
  }

  async handleGetDom(): Promise<string> {
    try {
      // Get simplified DOM structure
      const dom = await this.page.evaluate(() => {
        const elements: string[] = []
        
        // Get interactive elements
        const buttons = document.querySelectorAll('button, [role="button"]')
        buttons.forEach((el, idx) => {
          const text = el.textContent?.trim().substring(0, 50)
          const id = el.id ? `#${el.id}` : ''
          const classes = el.className ? `.${el.className.split(' ')[0]}` : ''
          elements.push(`button[${idx}]: ${id}${classes} "${text}"`)
        })

        const inputs = document.querySelectorAll('input, textarea')
        inputs.forEach((el: any, idx) => {
          const name = el.name ? `[name="${el.name}"]` : ''
          const id = el.id ? `#${el.id}` : ''
          const type = el.type ? `[type="${el.type}"]` : ''
          const placeholder = el.placeholder ? ` placeholder="${el.placeholder}"` : ''
          elements.push(`input[${idx}]: ${id}${name}${type}${placeholder}`)
        })

        const links = document.querySelectorAll('a')
        links.forEach((el, idx) => {
          const text = el.textContent?.trim().substring(0, 50)
          const href = el.href ? ` href="${el.href}"` : ''
          elements.push(`link[${idx}]: "${text}"${href}`)
        })

        return elements.slice(0, 30).join('\n')
      })

      // Don't log get_dom as a trace step (internal only)
      return `Page DOM:\n${dom}`
    } catch (error: any) {
      return `Failed to get DOM: ${error.message}`
    }
  }

  async handleScreenshot(args: any): Promise<string> {
    const { name } = args
    try {
      // We don't actually save the screenshot here, just log the intent
      await postTraceSteps(this.sessionId, [{
        orderIndex: getNextOrderIndex(),
        actionType: 'screenshot',
        meta: { name: name || 'screenshot' },
      }])

      return `Screenshot taken${name ? `: ${name}` : ''}`
    } catch (error: any) {
      return `Failed to take screenshot: ${error.message}`
    }
  }

  async handleAssert(args: any): Promise<string> {
    const { selector, type, expected } = args
    try {
      let result = false
      let actualValue = ''

      if (type === 'exists') {
        result = await this.page.locator(selector).count() > 0
      } else if (type === 'notExists') {
        result = await this.page.locator(selector).count() === 0
      } else if (type === 'contains' || type === 'equals') {
        const element = this.page.locator(selector).first()
        actualValue = await element.textContent() || ''
        
        if (type === 'contains') {
          result = actualValue.includes(expected || '')
        } else {
          result = actualValue.trim() === (expected || '').trim()
        }
      }

      // Log trace step
      await postTraceSteps(this.sessionId, [{
        orderIndex: getNextOrderIndex(),
        actionType: 'assert',
        selector,
        assertionType: type,
        assertionExpected: expected,
        meta: { result, actualValue },
      }])

      return result 
        ? `Assertion passed: ${type} on ${selector}`
        : `Assertion failed: ${type} on ${selector}. Expected: ${expected}, Got: ${actualValue}`
    } catch (error: any) {
      return `Failed to assert: ${error.message}`
    }
  }

  async handleScroll(args: any): Promise<string> {
    const { direction } = args
    try {
      await this.page.evaluate((dir) => {
        window.scrollBy({ top: dir === 'down' ? 500 : -500, behavior: 'smooth' })
      }, direction)

      // Log trace step
      await postTraceSteps(this.sessionId, [{
        orderIndex: getNextOrderIndex(),
        actionType: 'scroll',
        value: direction,
      }])

      return `Scrolled ${direction}`
    } catch (error: any) {
      return `Failed to scroll: ${error.message}`
    }
  }

  handleCompleteScenario(): string {
    // Don't log this as a trace step
    return 'Scenario marked as complete'
  }

  /**
   * Execute a tool call
   */
  async executeTool(toolName: string, args: any): Promise<string> {
    switch (toolName) {
      case 'open_page':
        return await this.handleOpenPage(args)
      case 'click':
        return await this.handleClick(args)
      case 'type':
        return await this.handleType(args)
      case 'get_dom':
        return await this.handleGetDom()
      case 'screenshot':
        return await this.handleScreenshot(args)
      case 'assert':
        return await this.handleAssert(args)
      case 'scroll':
        return await this.handleScroll(args)
      case 'complete_scenario':
        return this.handleCompleteScenario()
      default:
        return `Unknown tool: ${toolName}`
    }
  }
}

