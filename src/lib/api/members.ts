import { db } from '@/lib/db'
import { members } from '@/lib/db/schema'
import { 
  insertMemberSchema,
  type NewMember
} from '@/lib/db/schema'
import { eq, asc, count } from 'drizzle-orm'

// Local ApiResponse utility functions
const createSuccessResponse = <T>(data: T): { ok: true; data: T } => ({ ok: true, data })
const createErrorResponse = (error: string): { ok: false; error: string } => ({ ok: false, error })

// Enhanced Member Management Functions

// Get all members with basic filtering
export const getAllMembers = async () => {
  try {
    const result = await db.select().from(members).orderBy(asc(members.firstName), asc(members.lastName))
    return createSuccessResponse(result)
  } catch (error) {
    console.error('Error fetching members:', error)
    return createErrorResponse('Failed to fetch members')
  }
}

// Get member by ID (basic data only)
export const getMemberById = async (memberId: string) => {
  try {
    const [member] = await db.select().from(members).where(eq(members.id, memberId))
    
    if (!member) {
      return createErrorResponse('Member not found')
    }
    
    return createSuccessResponse(member)
  } catch (error) {
    console.error('Error fetching member:', error)
    return createErrorResponse('Failed to fetch member')
  }
}

// Create new member
export const createMember = async (data: NewMember) => {
  try {
    const validatedData = insertMemberSchema.parse(data)
    const [member] = await db.insert(members).values(validatedData).returning()
    return createSuccessResponse(member)
  } catch (error) {
    console.error('Error creating member:', error)
    return createErrorResponse('Failed to create member')
  }
}

// Update member status (simplified)
export const updateMemberStatus = async (
  memberId: string, 
  newStatus: string, 
  changedBy: string,
  reason?: string
) => {
  try {
    // Update member status
    const [updatedMember] = await db
      .update(members)
      .set({ 
        status: newStatus, 
        statusReason: reason,
        statusChangedBy: changedBy,
        statusChangedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(members.id, memberId))
      .returning()
    
    if (!updatedMember) {
      return createErrorResponse('Member not found')
    }
    
    return createSuccessResponse(updatedMember)
  } catch (error) {
    console.error('Error updating member status:', error)
    return createErrorResponse('Failed to update member status')
  }
}

// Member Statistics
export const getMemberStatistics = async () => {
  try {
    const [totalMembers] = await db.select({ count: count() }).from(members)
    const [activeMembers] = await db.select({ count: count() }).from(members).where(eq(members.isActive, true))
    const [visitors] = await db.select({ count: count() }).from(members).where(eq(members.role, 'visitor'))
    
    // Get members by status
    const statusCounts = await db
      .select({ status: members.status, count: count() })
      .from(members)
      .groupBy(members.status)
    
    // Get members by role
    const roleCounts = await db
      .select({ role: members.role, count: count() })
      .from(members)
      .groupBy(members.role)
    
    const stats = {
      totalMembers: totalMembers.count,
      activeMembers: activeMembers.count,
      visitors: visitors.count,
      statusBreakdown: statusCounts,
      roleBreakdown: roleCounts
    }
    
    return createSuccessResponse(stats)
  } catch (error) {
    console.error('Error fetching member statistics:', error)
    return createErrorResponse('Failed to fetch member statistics')
  }
}

// Legacy function for backward compatibility
export const getMemberByClerkId = async (clerkUserId: string) => {
  try {
    const [member] = await db.select().from(members).where(eq(members.clerkUserId, clerkUserId))
    
    if (!member) {
      return createErrorResponse('Member not found')
    }
    
    return createSuccessResponse(member)
  } catch (error) {
    console.error('Error fetching member by Clerk ID:', error)
    return createErrorResponse('Failed to fetch member')
  }
}
