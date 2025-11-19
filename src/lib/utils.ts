import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper functions for SQLite JSON compatibility
// SQLite stores JSON as strings, so we need to parse/stringify
export function parseJsonField<T>(value: string | null | undefined): T | null {
  if (!value) return null
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T
    } catch {
      return null
    }
  }
  return value as T
}

export function stringifyJsonField(value: any): string | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'string') return value // Already a string
  return JSON.stringify(value)
}

