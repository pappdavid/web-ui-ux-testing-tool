'use client'

import { useState } from 'react'

interface Screenshot {
  id: string
  pathOrUrl: string
}

interface ScreenshotGalleryProps {
  screenshots: Screenshot[]
}

export default function ScreenshotGallery({ screenshots }: ScreenshotGalleryProps) {
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null)

  // Convert local path to URL for display
  function getScreenshotUrl(pathOrUrl: string) {
    if (pathOrUrl.startsWith('http')) {
      return pathOrUrl
    }
    // For local files, we'd need to serve them via an API route
    // For now, return the path (this would need to be implemented)
    return `/api/attachments/${pathOrUrl}`
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {screenshots.map((screenshot) => (
          <div
            key={screenshot.id}
            className="cursor-pointer border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            onClick={() => setSelectedScreenshot(screenshot.pathOrUrl)}
          >
            <img
              src={getScreenshotUrl(screenshot.pathOrUrl)}
              alt={`Screenshot ${screenshot.id}`}
              className="w-full h-32 object-cover"
              onError={(e) => {
                // Fallback if image fails to load
                ;(e.target as HTMLImageElement).src = '/placeholder-screenshot.png'
              }}
            />
          </div>
        ))}
      </div>

      {selectedScreenshot && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setSelectedScreenshot(null)}
        >
          <div className="max-w-4xl max-h-full p-4">
            <img
              src={getScreenshotUrl(selectedScreenshot)}
              alt="Full screenshot"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}
    </>
  )
}

