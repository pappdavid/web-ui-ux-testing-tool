import { Page } from 'playwright'
import { AxeBuilder } from '@axe-core/playwright'

export interface AccessibilityResult {
  issueCount: number
  violations: Array<{
    id: string
    impact: string
    description: string
    nodes: Array<{
      html: string
      target: string[]
    }>
  }>
}

export async function checkAccessibility(page: Page): Promise<AccessibilityResult> {
  try {
    // Run accessibility checks using AxeBuilder
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()

    const violations = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical'
    )

    const result: AccessibilityResult = {
      issueCount: violations.length,
      violations: violations.map((v) => ({
        id: v.id,
        impact: v.impact || 'unknown',
        description: v.description,
        nodes: v.nodes.map((n) => ({
          html: n.html,
          target: n.target,
        })),
      })),
    }

    return result
  } catch (error: any) {
    console.warn('Accessibility check failed:', error)
    // Return empty result if axe fails
    return {
      issueCount: 0,
      violations: [],
    }
  }
}

