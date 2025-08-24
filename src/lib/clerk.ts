import { z } from 'zod'

// Clerk configuration
export const clerkConfig = {
  publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_bW9kZWwtdHJvbGwtNzQuY2xlcmsuYWNjb3VudHMuZGV2JA',
}

// User role schema for church management
export const UserRoleSchema = z.enum(['admin', 'pastor', 'leader', 'member', 'visitor'])
export type UserRole = z.infer<typeof UserRoleSchema>

// Extended user metadata for church context
export const ChurchUserMetadataSchema = z.object({
  role: UserRoleSchema.default('member'),
  churchId: z.string().optional(),
  joinDate: z.string().optional(),
  department: z.string().optional(),
  phone: z.string().optional(),
  emergencyContact: z.string().optional(),
})

export type ChurchUserMetadata = z.infer<typeof ChurchUserMetadataSchema>

// Helper to check if user has required role
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    visitor: 0,
    member: 1,
    leader: 2,
    pastor: 3,
    admin: 4,
  }
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

// Helper to get user role from Clerk metadata
export function getUserRole(publicMetadata: Record<string, unknown>): UserRole {
  const parsed = ChurchUserMetadataSchema.safeParse(publicMetadata)
  return parsed.success ? parsed.data.role : 'member'
}
