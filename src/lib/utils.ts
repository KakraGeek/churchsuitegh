import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Error envelope type for consistent error handling
export type ApiResponse<T = unknown> = {
  ok: boolean
  data?: T
  error?: string
}

// Create success response
export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return { ok: true, data }
}

// Create error response
export function createErrorResponse(error: string): ApiResponse<never> {
  return { ok: false, error }
}

// Generate a simple unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}
