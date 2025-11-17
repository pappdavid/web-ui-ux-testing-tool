import { Page, Browser } from 'playwright'

export interface TestContext {
  extractedValues: Record<string, any>
  page: Page
  browser: Browser
}

export interface StepExecutionResult {
  success: boolean
  error?: string
  data?: any
  screenshotPath?: string
}

export interface DeviceProfile {
  viewport: { width: number; height: number }
  userAgent?: string
  deviceScaleFactor?: number
  isMobile?: boolean
  hasTouch?: boolean
}

export const DEVICE_PROFILES: Record<string, DeviceProfile> = {
  desktop: {
    viewport: { width: 1920, height: 1080 },
    isMobile: false,
    hasTouch: false,
  },
  mobile: {
    viewport: { width: 375, height: 667 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  },
  tablet: {
    viewport: { width: 768, height: 1024 },
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  },
}

