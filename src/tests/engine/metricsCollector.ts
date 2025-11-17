import { Page } from 'playwright'

export interface UXMetrics {
  viewport: string
  ttfb?: number
  domContentLoaded?: number
  loadEvent?: number
  lcp?: number
  accessibilityIssueCount?: number
  notes?: string[]
}

export async function collectNavigationMetrics(page: Page): Promise<Partial<UXMetrics>> {
  const metrics: Partial<UXMetrics> = {}

  try {
    // Get navigation timing
    const timing = await page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (!perfData) return null

      const startTime = (perfData.fetchStart ?? perfData.startTime ?? 0) as number

      return {
        ttfb: perfData.responseStart - perfData.requestStart,
        domContentLoaded: perfData.domContentLoadedEventEnd - startTime,
        loadEvent: perfData.loadEventEnd - startTime,
      }
    })

    if (timing) {
      metrics.ttfb = Math.round(timing.ttfb)
      metrics.domContentLoaded = Math.round(timing.domContentLoaded)
      metrics.loadEvent = Math.round(timing.loadEvent)
    }

    // Approximate LCP (Large Contentful Paint)
    // Note: This is a simplified version. Real LCP requires more complex measurement
    try {
      const lcp = await page.evaluate(() => {
        return new Promise<number>((resolve) => {
          if (document.readyState === 'complete') {
            // If page is already loaded, use a simple heuristic
            const images = Array.from(document.querySelectorAll('img'))
            if (images.length > 0) {
              Promise.all(
                images.map(
                  (img) =>
                    new Promise<number>((imgResolve) => {
                      if (img.complete) {
                        imgResolve(performance.now())
                      } else {
                        img.onload = () => imgResolve(performance.now())
                        img.onerror = () => imgResolve(performance.now())
                      }
                    })
                )
              ).then((times) => resolve(Math.max(...times)))
            } else {
              resolve(performance.now())
            }
          } else {
            window.addEventListener('load', () => {
              resolve(performance.now())
            })
          }
        })
      })

      metrics.lcp = Math.round(lcp)
    } catch (error) {
      // LCP measurement failed, continue without it
      console.warn('LCP measurement failed:', error)
    }
  } catch (error) {
    console.warn('Navigation metrics collection failed:', error)
  }

  return metrics
}

export async function collectPerformanceMetrics(page: Page): Promise<Record<string, number>> {
  try {
    const metrics = await page.metrics()
    return {
      jsHeapUsedSize: (metrics.JSHeapUsedSize ?? 0) as number,
      jsHeapTotalSize: (metrics.JSHeapTotalSize ?? 0) as number,
      nodes: (metrics.Nodes ?? 0) as number,
      documents: (metrics.Documents ?? 0) as number,
      layoutCount: (metrics.LayoutCount ?? 0) as number,
      recalcStyleCount: (metrics.RecalcStyleCount ?? 0) as number,
    }
  } catch (error) {
    console.warn('Performance metrics collection failed:', error)
    return {}
  }
}

