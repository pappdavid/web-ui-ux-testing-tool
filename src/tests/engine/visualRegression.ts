import { Page } from 'playwright'
import { db } from '@/server/db'
import path from 'path'
import fs from 'fs/promises'
import { createHash } from 'crypto'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'

const STORAGE_PATH = process.env.STORAGE_PATH || './storage'

interface VisualDiffResult {
  passed: boolean
  diffPath?: string
  similarity: number
  message: string
  diffCount?: number
  totalPixels?: number
}

/**
 * Load PNG image from file
 */
async function loadPNG(filePath: string): Promise<PNG> {
  const data = await fs.readFile(filePath)
  return new Promise((resolve, reject) => {
    const png = new PNG()
    png.parse(data, (error, data) => {
      if (error) reject(error)
      else resolve(data)
    })
  })
}

/**
 * Compare two images using pixel-perfect comparison
 * Returns similarity percentage (0-100)
 */
async function compareImages(
  baselinePath: string,
  currentPath: string,
  threshold: number = 0.95
): Promise<{ similarity: number; passed: boolean; diffCount: number; totalPixels: number }> {
  try {
    const baselineExists = await fs.access(baselinePath).then(() => true).catch(() => false)
    const currentExists = await fs.access(currentPath).then(() => true).catch(() => false)
    
    if (!baselineExists || !currentExists) {
      return { similarity: 0, passed: false, diffCount: 0, totalPixels: 0 }
    }

    // Load both images
    const baselineImg = await loadPNG(baselinePath)
    const currentImg = await loadPNG(currentPath)

    // Ensure images have same dimensions
    if (baselineImg.width !== currentImg.width || baselineImg.height !== currentImg.height) {
      return {
        similarity: 0,
        passed: false,
        diffCount: Math.max(baselineImg.width * baselineImg.height, currentImg.width * currentImg.height),
        totalPixels: baselineImg.width * baselineImg.height,
      }
    }

    const totalPixels = baselineImg.width * baselineImg.height
    const diff = new PNG({ width: baselineImg.width, height: baselineImg.height })

    // Compare pixels
    const diffCount = pixelmatch(
      baselineImg.data,
      currentImg.data,
      diff.data,
      baselineImg.width,
      baselineImg.height,
      {
        threshold: 0.1, // Pixel difference threshold
      }
    )

    const similarity = 1 - diffCount / totalPixels

    return {
      similarity,
      passed: similarity >= threshold,
      diffCount,
      totalPixels,
    }
  } catch (error) {
    console.error('Image comparison error:', error)
    return { similarity: 0, passed: false, diffCount: 0, totalPixels: 0 }
  }
}

/**
 * Save a screenshot as a baseline for visual regression testing
 */
export async function saveBaseline(
  testId: string,
  stepId: string,
  screenshotPath: string
): Promise<string> {
  const baselineDir = path.join(STORAGE_PATH, 'baselines', testId)
  await fs.mkdir(baselineDir, { recursive: true })
  
  const baselinePath = path.join(baselineDir, `step-${stepId}.png`)
  await fs.copyFile(screenshotPath, baselinePath)
  
  return baselinePath
}

/**
 * Compare current screenshot with baseline using pixel-perfect comparison
 */
export async function compareWithBaseline(
  testId: string,
  stepId: string,
  currentScreenshotPath: string,
  threshold: number = 0.95
): Promise<VisualDiffResult> {
  const baselinePath = path.join(
    STORAGE_PATH,
    'baselines',
    testId,
    `step-${stepId}.png`
  )

  try {
    const baselineExists = await fs.access(baselinePath).then(() => true).catch(() => false)
    
    if (!baselineExists) {
      // No baseline exists, save current as baseline
      await saveBaseline(testId, stepId, currentScreenshotPath)
      return {
        passed: true,
        similarity: 100,
        message: 'No baseline found, saved current screenshot as baseline',
      }
    }

    const comparison = await compareImages(baselinePath, currentScreenshotPath, threshold)
    
    if (!comparison.passed) {
      // Generate diff image
      const diffDir = path.join(STORAGE_PATH, 'diffs', testId)
      await fs.mkdir(diffDir, { recursive: true })
      const diffPath = path.join(diffDir, `step-${stepId}-diff.png`)
      
      // Load images and create diff
      const baselineImg = await loadPNG(baselinePath)
      const currentImg = await loadPNG(currentScreenshotPath)
      
      if (baselineImg.width === currentImg.width && baselineImg.height === currentImg.height) {
        const diff = new PNG({ width: baselineImg.width, height: baselineImg.height })
        pixelmatch(
          baselineImg.data,
          currentImg.data,
          diff.data,
          baselineImg.width,
          baselineImg.height,
          { threshold: 0.1 }
        )
        
        // Save diff image
        await new Promise<void>((resolve, reject) => {
          const buffer = PNG.sync.write(diff)
          fs.writeFile(diffPath, buffer).then(() => resolve()).catch(reject)
        })
      }
      
      return {
        passed: false,
        diffPath,
        similarity: comparison.similarity * 100,
        diffCount: comparison.diffCount,
        totalPixels: comparison.totalPixels,
        message: `Visual regression failed: ${(comparison.similarity * 100).toFixed(2)}% similarity (${comparison.diffCount} pixels differ, threshold: ${threshold * 100}%)`,
      }
    }

    return {
      passed: true,
      similarity: comparison.similarity * 100,
      diffCount: comparison.diffCount,
      totalPixels: comparison.totalPixels,
      message: `Visual regression passed: ${(comparison.similarity * 100).toFixed(2)}% similarity`,
    }
  } catch (error: any) {
    return {
      passed: false,
      similarity: 0,
      message: `Visual regression error: ${error.message}`,
    }
  }
}

/**
 * Store visual regression result in database
 */
export async function storeVisualRegressionResult(
  testRunId: string,
  stepId: string,
  result: VisualDiffResult
) {
  // Store in test log
  await db.testLog.create({
    data: {
      testRunId,
      level: result.passed ? 'info' : 'warn',
      message: result.message,
      data: {
        type: 'visualRegression',
        stepId,
        similarity: result.similarity,
        diffPath: result.diffPath,
        diffCount: result.diffCount,
        totalPixels: result.totalPixels,
      } as any, // JSON field
    },
  })
}
