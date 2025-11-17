export type TestStepType =
  | 'click'
  | 'input'
  | 'select'
  | 'scroll'
  | 'waitForSelector'
  | 'screenshot'
  | 'extract'
  | 'assert'
  | 'dragAndDrop'
  | 'fileUpload'

export type AssertionType = 'equals' | 'contains' | 'exists' | 'notExists'

export interface TestStepMeta {
  timeout?: number
  name?: string
  [key: string]: any
}

export interface TestStep {
  id: string
  testId: string
  orderIndex: number
  type: TestStepType
  selector?: string | null
  value?: string | null
  assertionType?: AssertionType | null
  assertionExpected?: string | null
  meta?: TestStepMeta | null
}

