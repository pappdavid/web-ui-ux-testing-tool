import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper functions for JSON field compatibility
// PostgreSQL uses Json type natively, but we keep these for type safety
export function parseJsonField<T>(value: string | object | null | undefined): T | null {
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

export function stringifyJsonField(value: any): any {
  // PostgreSQL handles Json type natively, so we can return as-is
  // This is mainly for type consistency
  if (value === null || value === undefined) return null
  return value
}
