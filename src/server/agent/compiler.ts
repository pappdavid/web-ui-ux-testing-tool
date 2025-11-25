import { db } from '@/server/db'

/**
 * Map agent action types to TestStep types
 */
function mapActionTypeToStepType(actionType: string): string | null {
  const mapping: Record<string, string> = {
    navigate: 'waitForSelector', // Convert navigate to a wait for body
    click: 'click',
    input: 'input',
    type: 'input',
    screenshot: 'screenshot',
    assert: 'assert',
    scroll: 'scroll',
    select: 'select',
    waitForSelector: 'waitForSelector',
    dragAndDrop: 'dragAndDrop',
    fileUpload: 'fileUpload',
    extract: 'extract',
  }

  // Skip internal-only actions
  if (actionType === 'get_dom' || actionType === 'complete_scenario') {
    return null
  }

  return mapping[actionType] || null
}

export interface CompileResult {
  testId: string
  stepsInserted: number
  stepsSkipped: number
  skippedTypes: string[]
}

/**
 * Compile agent trace steps into deterministic TestSteps
 */
export async function compileAgentSessionToTestSteps(
  agentSessionId: string
): Promise<CompileResult> {
  // Load agent session with test and trace steps
  const agentSession = await db.agentSession.findUnique({
    where: { id: agentSessionId },
    include: {
      test: true,
      traceSteps: {
        orderBy: {
          orderIndex: 'asc',
        },
      },
    },
  })

  if (!agentSession) {
    throw new Error('Agent session not found')
  }

  if (agentSession.status !== 'completed') {
    throw new Error(
      `Cannot compile session with status '${agentSession.status}'. Session must be completed.`
    )
  }

  const testId = agentSession.testId
  const traceSteps = agentSession.traceSteps

  if (traceSteps.length === 0) {
    throw new Error('Agent session has no trace steps to compile')
  }

  // Map trace steps to TestStep format
  const testSteps: Array<{
    testId: string
    orderIndex: number
    type: string
    selector?: string | null
    value?: string | null
    assertionType?: string | null
    assertionExpected?: string | null
    source: string
    meta: any
  }> = []

  let orderIndex = 0
  const skippedTypes: string[] = []

  for (const traceStep of traceSteps) {
    const stepType = mapActionTypeToStepType(traceStep.actionType)

    if (!stepType) {
      // Skip this action type
      skippedTypes.push(traceStep.actionType)
      continue
    }

    // Handle navigate specially - add wait for body selector
    let selector = traceStep.selector
    let value = traceStep.value
    let meta: any = traceStep.meta || {}

    if (traceStep.actionType === 'navigate') {
      selector = 'body'
      const metaObj = typeof meta === 'object' && meta !== null ? meta : {}
      meta = {
        ...metaObj,
        navigatedTo: traceStep.value || (metaObj as any)?.url,
        originalAction: 'navigate',
      }
      value = null
    }

    testSteps.push({
      testId,
      orderIndex: orderIndex++,
      type: stepType,
      selector: selector || null,
      value: value || null,
      assertionType: traceStep.assertionType || null,
      assertionExpected: traceStep.assertionExpected || null,
      source: 'agent',
      meta: meta || {},
    })
  }

  // Delete existing agent-generated steps for this test
  await db.testStep.deleteMany({
    where: {
      testId,
      source: 'agent',
    },
  })

  // Insert new steps
  if (testSteps.length > 0) {
    await db.testStep.createMany({
      data: testSteps,
    })
  }

  return {
    testId,
    stepsInserted: testSteps.length,
    stepsSkipped: skippedTypes.length,
    skippedTypes: Array.from(new Set(skippedTypes)),
  }
}

