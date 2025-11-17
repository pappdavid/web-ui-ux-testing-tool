import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const createTestSchema = z.object({
  name: z.string().min(1, 'Test name is required'),
  targetUrl: z.string().url('Invalid target URL'),
  adminPanelUrl: z.string().url('Invalid admin panel URL').optional(),
  deviceProfile: z.enum(['desktop', 'mobile', 'tablet']).default('desktop'),
  adminConfig: z.object({
    mode: z.enum(['api', 'ui', 'none']).default('none'),
    baseUrl: z.string().url().optional(),
    credentials: z.record(z.any()).optional(),
  }).optional(),
})

export const updateTestStepsSchema = z.object({
  steps: z.array(z.object({
    orderIndex: z.number().int().min(0),
    type: z.enum(['click', 'input', 'select', 'scroll', 'waitForSelector', 'screenshot', 'extract', 'assert', 'dragAndDrop', 'fileUpload']),
    selector: z.string().optional(),
    value: z.string().optional(),
    assertionType: z.enum(['equals', 'contains', 'exists', 'notExists']).optional(),
    assertionExpected: z.string().optional(),
    meta: z.record(z.any()).optional(),
  })),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type CreateTestInput = z.infer<typeof createTestSchema>
export type UpdateTestStepsInput = z.infer<typeof updateTestStepsSchema>

