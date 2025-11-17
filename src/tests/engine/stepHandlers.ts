import { Page } from 'playwright'
import { TestStep, AssertionType } from '../models/TestStep'
import { TestContext, StepExecutionResult } from './types'
import path from 'path'
import fs from 'fs/promises'

const STORAGE_PATH = process.env.STORAGE_PATH || './storage'

async function ensureStorageDir(): Promise<string> {
  const storageDir = path.resolve(STORAGE_PATH)
  await fs.mkdir(storageDir, { recursive: true })
  return storageDir
}

export async function handleClick(
  step: TestStep,
  context: TestContext
): Promise<StepExecutionResult> {
  try {
    if (!step.selector) {
      return { success: false, error: 'Selector is required for click step' }
    }

    await context.page.click(step.selector)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Click failed' }
  }
}

export async function handleInput(
  step: TestStep,
  context: TestContext
): Promise<StepExecutionResult> {
  try {
    if (!step.selector) {
      return { success: false, error: 'Selector is required for input step' }
    }

    if (step.value === undefined || step.value === null) {
      return { success: false, error: 'Value is required for input step' }
    }

    // Replace extracted values in the value string
    let inputValue = step.value
    for (const [key, value] of Object.entries(context.extractedValues)) {
      inputValue = inputValue.replace(`{{${key}}}`, String(value))
    }

    await context.page.fill(step.selector, inputValue)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Input failed' }
  }
}

export async function handleSelect(
  step: TestStep,
  context: TestContext
): Promise<StepExecutionResult> {
  try {
    if (!step.selector) {
      return { success: false, error: 'Selector is required for select step' }
    }

    if (!step.value) {
      return { success: false, error: 'Value is required for select step' }
    }

    await context.page.selectOption(step.selector, step.value)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Select failed' }
  }
}

export async function handleScroll(
  step: TestStep,
  context: TestContext
): Promise<StepExecutionResult> {
  try {
    if (step.selector) {
      // Scroll to element
      await context.page.locator(step.selector).scrollIntoViewIfNeeded()
    } else if (step.value) {
      // Parse coordinates from value (e.g., "100,200")
      const [x, y] = step.value.split(',').map(Number)
      if (isNaN(x) || isNaN(y)) {
        return { success: false, error: 'Invalid scroll coordinates' }
      }
      await context.page.mouse.wheel(x, y)
    } else {
      // Scroll to bottom
      await context.page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight)
      })
    }
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Scroll failed' }
  }
}

export async function handleWaitForSelector(
  step: TestStep,
  context: TestContext
): Promise<StepExecutionResult> {
  try {
    if (!step.selector) {
      return { success: false, error: 'Selector is required for waitForSelector step' }
    }

    const timeout = (step.meta as any)?.timeout || 5000
    await context.page.waitForSelector(step.selector, { timeout })
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Wait for selector failed' }
  }
}

export async function handleScreenshot(
  step: TestStep,
  context: TestContext,
  testRunId: string
): Promise<StepExecutionResult> {
  try {
    const storageDir = await ensureStorageDir()
    const screenshotName = (step.meta as any)?.name || `screenshot-${Date.now()}.png`
    const screenshotPath = path.join(storageDir, testRunId, screenshotName)
    
    await fs.mkdir(path.dirname(screenshotPath), { recursive: true })

    if (step.selector) {
      await context.page.locator(step.selector).screenshot({ path: screenshotPath })
    } else {
      await context.page.screenshot({ path: screenshotPath, fullPage: true })
    }

    return { success: true, screenshotPath }
  } catch (error: any) {
    return { success: false, error: error.message || 'Screenshot failed' }
  }
}

export async function handleExtract(
  step: TestStep,
  context: TestContext
): Promise<StepExecutionResult> {
  try {
    if (!step.selector) {
      return { success: false, error: 'Selector is required for extract step' }
    }

    const extractKey = step.value || 'extracted'
    let extractedValue: any

    if ((step.meta as any)?.attribute) {
      // Extract attribute
      extractedValue = await context.page.getAttribute(step.selector, (step.meta as any).attribute)
    } else if ((step.meta as any)?.property) {
      // Extract property
      extractedValue = await context.page.evaluate(
        (selector, prop) => {
          const el = document.querySelector(selector)
          return el ? (el as any)[prop] : null
        },
        step.selector!,
        (step.meta as any).property
      )
    } else {
      // Extract text content
      extractedValue = await context.page.textContent(step.selector)
    }

    context.extractedValues[extractKey] = extractedValue
    return { success: true, data: { key: extractKey, value: extractedValue } }
  } catch (error: any) {
    return { success: false, error: error.message || 'Extract failed' }
  }
}

export async function handleAssert(
  step: TestStep,
  context: TestContext
): Promise<StepExecutionResult> {
  try {
    if (!step.selector) {
      return { success: false, error: 'Selector is required for assert step' }
    }

    if (!step.assertionType) {
      return { success: false, error: 'Assertion type is required' }
    }

    const assertionType = step.assertionType as AssertionType
    let actual: string | null = null
    let passed = false

    switch (assertionType) {
      case 'exists':
        const element = await context.page.locator(step.selector).first()
        passed = (await element.count()) > 0
        break

      case 'notExists':
        const element2 = await context.page.locator(step.selector).first()
        passed = (await element2.count()) === 0
        break

      case 'equals':
      case 'contains':
        actual = await context.page.textContent(step.selector)
        if (actual === null) {
          return { success: false, error: 'Element not found or has no text content' }
        }
        if (assertionType === 'equals') {
          passed = actual.trim() === (step.assertionExpected || '').trim()
        } else {
          passed = actual.includes(step.assertionExpected || '')
        }
        break

      default:
        return { success: false, error: `Unknown assertion type: ${assertionType}` }
    }

    if (!passed) {
      return {
        success: false,
        error: `Assertion failed: ${assertionType}. Expected: ${step.assertionExpected || 'N/A'}, Actual: ${actual || 'N/A'}`,
      }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Assert failed' }
  }
}

export async function handleDragAndDrop(
  step: TestStep,
  context: TestContext
): Promise<StepExecutionResult> {
  try {
    if (!step.selector) {
      return { success: false, error: 'Selector is required for dragAndDrop step' }
    }

    // Value should contain target selector (e.g., "#target")
    if (!step.value) {
      return { success: false, error: 'Target selector is required for dragAndDrop step' }
    }

    await context.page.dragAndDrop(step.selector, step.value)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Drag and drop failed' }
  }
}

export async function handleFileUpload(
  step: TestStep,
  context: TestContext
): Promise<StepExecutionResult> {
  try {
    if (!step.selector) {
      return { success: false, error: 'Selector is required for fileUpload step' }
    }

    if (!step.value) {
      return { success: false, error: 'File path is required for fileUpload step' }
    }

    await context.page.setInputFiles(step.selector, step.value)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'File upload failed' }
  }
}

export const stepHandlers: Record<string, (step: TestStep, context: TestContext, testRunId?: string) => Promise<StepExecutionResult>> = {
  click: handleClick,
  input: handleInput,
  select: handleSelect,
  scroll: handleScroll,
  waitForSelector: handleWaitForSelector,
  screenshot: (step, context, testRunId) => handleScreenshot(step, context, testRunId!),
  extract: handleExtract,
  assert: handleAssert,
  dragAndDrop: handleDragAndDrop,
  fileUpload: handleFileUpload,
}

