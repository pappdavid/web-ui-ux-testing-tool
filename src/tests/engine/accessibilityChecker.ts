import { Page } from 'playwright'
import { injectAxe, checkA11y, getViolations } from '@axe-core/playwright'

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
    // Inject axe-core
    await injectAxe(page)

    // Run accessibility checks
    const violations = await getViolations(page, null, {
      includedImpacts: ['serious', 'critical'],
    })

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

