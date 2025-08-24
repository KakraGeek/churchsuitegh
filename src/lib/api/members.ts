import { db } from '@/lib/db'
import { members, insertMemberSchema } from '@/lib/db/schema'
import { eq, ilike, or, desc } from 'drizzle-orm'
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/lib/utils'
import type { NewMember, Member } from '@/lib/db/schema'



// Check if we're in development mode without a real database
const isDevelopmentMode = !import.meta.env.VITE_DATABASE_URL

// Mock data for development
const mockMembers: Member[] = [
  {
    id: '1',
    clerkUserId: 'user_1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+233 24 123 4567',
    dateOfBirth: new Date('1985-06-15'),
    address: 'Accra, Ghana',
    emergencyContact: 'Jane Doe - +233 24 765 4321',
    role: 'member',
    department: 'Youth Ministry',
    notes: 'Active member, helps with youth programs',
    membershipDate: new Date('2023-01-15'),
    isActive: true,
    status: 'active',
    statusReason: null,
    statusChangedBy: null,
    statusChangedAt: null,
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    clerkUserId: 'user_2',
    firstName: 'Grace',
    lastName: 'Mensah',
    email: 'grace@example.com',
    phone: '+233 20 987 6543',
    dateOfBirth: new Date('1978-03-22'),
    address: 'Kumasi, Ghana',
    emergencyContact: 'Kwame Mensah - +233 20 111 2222',
    role: 'leader',
    department: 'Worship Team',
    notes: 'Lead vocalist, very dedicated',
    membershipDate: new Date('2022-08-10'),
    isActive: true,
    status: 'active',
    statusReason: null,
    statusChangedBy: null,
    statusChangedAt: null,
    createdAt: new Date('2022-08-10'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '3',
    clerkUserId: 'user_3',
    firstName: 'Pastor',
    lastName: 'Samuel',
    email: 'pastor@churchsuite.com',
    phone: '+233 24 555 0000',
    dateOfBirth: new Date('1970-12-01'),
    address: 'Tema, Ghana',
    emergencyContact: 'Mrs. Samuel - +233 24 555 0001',
    role: 'pastor',
    department: 'Leadership',
    notes: 'Senior Pastor, founded the church in 2020',
    membershipDate: new Date('2020-01-01'),
    isActive: true,
    status: 'active',
    statusReason: null,
    statusChangedBy: null,
    statusChangedAt: null,
    createdAt: new Date('2020-01-01'),
    updatedAt: new Date('2024-01-01'),
  }
]

let nextId = 4

/**
 * Members API Layer
 * 
 * Provides CRUD operations for church member management
 * with proper error handling and validation.
 */

export async function createMember(memberData: NewMember): Promise<ApiResponse<Member>> {
  try {
    // Validate the member data
    const validatedData = insertMemberSchema.parse(memberData)
    
    if (isDevelopmentMode) {
      // Mock implementation for development
      const newMember: Member = {
        id: nextId.toString(),
        clerkUserId: validatedData.clerkUserId,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone || null,
        dateOfBirth: validatedData.dateOfBirth || null,
        address: validatedData.address || null,
        emergencyContact: validatedData.emergencyContact || null,
        membershipDate: validatedData.membershipDate || new Date(),
        isActive: true,
        role: validatedData.role || 'member',
        status: validatedData.status || 'active',
        statusReason: null,
        statusChangedBy: null,
        statusChangedAt: null,
        department: validatedData.department || null,
        notes: validatedData.notes || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      mockMembers.push(newMember)
      nextId++
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500))
      return createSuccessResponse(newMember)
    }
    
    // Insert into database
    const result = await db
      .insert(members)
      .values(validatedData)
      .returning()
    
    const newMember = (result as Member[])[0]
    
    return createSuccessResponse(newMember)
  } catch (error) {
    console.error('Error creating member:', error)
    return createErrorResponse('Failed to create member. Please check your information and try again.')
  }
}

export async function getMemberById(id: string): Promise<ApiResponse<Member>> {
  try {
    const result = await db
      .select()
      .from(members)
      .where(eq(members.id, id))
      .limit(1)
    
    const member = (result as Member[])[0]
    
    if (!member) {
      return createErrorResponse('Member not found.')
    }
    
    return createSuccessResponse(member)
  } catch (error) {
    console.error('Error fetching member:', error)
    return createErrorResponse('Failed to fetch member information.')
  }
}

export async function getMemberByClerkId(clerkUserId: string): Promise<ApiResponse<Member>> {
  try {
    if (isDevelopmentMode) {
      // Mock implementation for development
      const member = mockMembers.find(m => m.clerkUserId === clerkUserId)
      
      if (!member) {
        return createErrorResponse('Member profile not found.')
      }
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 200))
      return createSuccessResponse(member)
    }

    // Try to find existing member
    const [existingMember] = await db
      .select()
      .from(members)
      .where(eq(members.clerkUserId, clerkUserId))
      .limit(1)
    
    if (existingMember) {
      return createSuccessResponse(existingMember)
    }
    
    // If no member found, auto-create one for the logged-in user
    console.log('Auto-creating member record for Clerk user:', clerkUserId)
    
    const newMemberData = {
      clerkUserId: clerkUserId,
      firstName: 'Current',
      lastName: 'User',
      email: `user-${clerkUserId.slice(-8)}@churchsuite.com`,
      phone: '+233 24 000 0000',
      dateOfBirth: new Date('1990-01-01'),
      address: 'Accra, Ghana',
      emergencyContact: 'Emergency Contact - +233 24 000 0001',
      role: 'admin' as const, // Default to admin for system access
      department: 'Administration',
      notes: 'Auto-generated admin member record',
      membershipDate: new Date(),
      isActive: true,
      status: 'active' as const,
    }
    
    const [newMember] = await db
      .insert(members)
      .values(newMemberData)
      .returning()
    
    console.log('Successfully created member record:', newMember.firstName, newMember.lastName)
    return createSuccessResponse(newMember)
    
  } catch (error) {
    console.error('Error fetching/creating member by Clerk ID:', error)
    return createErrorResponse('Failed to fetch member profile.')
  }
}

export async function updateMember(id: string, memberData: Partial<NewMember>): Promise<ApiResponse<Member>> {
  try {
    // Remove fields that shouldn't be updated
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { clerkUserId: _, ...updateData } = memberData
    
    // Add updated timestamp
    const dataWithTimestamp = {
      ...updateData,
      updatedAt: new Date()
    }
    
    const updateResult = await db
      .update(members)
      .set(dataWithTimestamp)
      .where(eq(members.id, id))
      .returning()
    
    const updatedMember = (updateResult as Member[])[0]
    
    if (!updatedMember) {
      return createErrorResponse('Member not found.')
    }
    
    return createSuccessResponse(updatedMember)
  } catch (error) {
    console.error('Error updating member:', error)
    return createErrorResponse('Failed to update member information.')
  }
}

export async function searchMembers(query: string): Promise<ApiResponse<Member[]>> {
  try {
    if (isDevelopmentMode) {
      // Mock implementation for development
      const lowerQuery = query.toLowerCase()
      const filteredMembers = mockMembers
        .filter(member => 
          member.firstName.toLowerCase().includes(lowerQuery) ||
          member.lastName.toLowerCase().includes(lowerQuery) ||
          member.email.toLowerCase().includes(lowerQuery) ||
          (member.phone && member.phone.includes(query))
        )
        .sort((a, b) => {
          const dateA = a.membershipDate ? new Date(a.membershipDate).getTime() : 0
          const dateB = b.membershipDate ? new Date(b.membershipDate).getTime() : 0
          return dateB - dateA
        })
        .slice(0, 50)
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 200))
      return createSuccessResponse(filteredMembers)
    }
    
    const searchQuery = `%${query}%`
    
    const memberList = await db
      .select()
      .from(members)
      .where(
        or(
          ilike(members.firstName, searchQuery),
          ilike(members.lastName, searchQuery),
          ilike(members.email, searchQuery),
          ilike(members.phone, searchQuery)
        )
      )
      .orderBy(desc(members.membershipDate))
      .limit(50)
    
    return createSuccessResponse(memberList)
  } catch (error) {
    console.error('Error searching members:', error)
    return createErrorResponse('Failed to search members.')
  }
}

export async function getAllMembers(statusFilter?: string): Promise<ApiResponse<Member[]>> {
  try {
    if (isDevelopmentMode) {
      // Mock implementation for development
      let filteredMembers = mockMembers
      
      if (statusFilter && statusFilter !== 'all') {
        filteredMembers = mockMembers.filter(member => member.status === statusFilter)
      } else {
        // Default to active members if no filter specified
        filteredMembers = mockMembers.filter(member => member.status === 'active')
      }
      
      const sortedMembers = filteredMembers
        .sort((a, b) => {
          const dateA = a.membershipDate ? new Date(a.membershipDate).getTime() : 0
          const dateB = b.membershipDate ? new Date(b.membershipDate).getTime() : 0
          return dateB - dateA
        })
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300))
      return createSuccessResponse(sortedMembers)
    }
    
    let memberListResult: Member[]
    
    if (statusFilter && statusFilter !== 'all') {
      memberListResult = await db
        .select()
        .from(members)
        .where(eq(members.status, statusFilter))
        .orderBy(desc(members.membershipDate)) as Member[]
    } else {
      // Default to active members  
      memberListResult = await db
        .select()
        .from(members)
        .where(eq(members.status, 'active'))
        .orderBy(desc(members.membershipDate)) as Member[]
    }
    
    return createSuccessResponse(memberListResult)
  } catch (error) {
    console.error('Error fetching members:', error)
    return createErrorResponse('Failed to fetch members list.')
  }
}

export async function updateMemberStatus(
  id: string, 
  status: 'active' | 'inactive' | 'transferred' | 'deceased' | 'suspended' | 'visitor',
  reason?: string,
  changedBy?: string
): Promise<ApiResponse<Member>> {
  try {
    if (isDevelopmentMode) {
      // Mock implementation for development
      const memberIndex = mockMembers.findIndex(m => m.id === id)
      if (memberIndex === -1) {
        return createErrorResponse('Member not found.')
      }
      
      const updatedMember = {
        ...mockMembers[memberIndex],
        status,
        statusReason: reason || null,
        statusChangedBy: changedBy || null,
        statusChangedAt: new Date(),
        isActive: status === 'active',
        updatedAt: new Date(),
      }
      
      mockMembers[memberIndex] = updatedMember
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500))
      return createSuccessResponse(updatedMember)
    }
    
    const statusUpdateResult = await db
      .update(members)
      .set({ 
        status,
        statusReason: reason,
        statusChangedBy: changedBy,
        statusChangedAt: new Date(),
        isActive: status === 'active',
        updatedAt: new Date() 
      })
      .where(eq(members.id, id))
      .returning()
    
    const updatedMember = (statusUpdateResult as Member[])[0]
    
    if (!updatedMember) {
      return createErrorResponse('Member not found.')
    }
    
    return createSuccessResponse(updatedMember)
  } catch (error) {
    console.error('Error updating member status:', error)
    return createErrorResponse('Failed to update member status.')
  }
}

export async function deactivateMember(id: string): Promise<ApiResponse<Member>> {
  return updateMemberStatus(id, 'inactive', 'Deactivated by admin')
}

/**
 * Get member statistics for dashboard
 */
export async function getMemberStats(): Promise<ApiResponse<{
  totalMembers: number
  newThisMonth: number
  activeMembers: number
  membersByRole: Record<string, number>
}>> {
  try {
    if (isDevelopmentMode) {
      // Mock implementation for development (fallback)
      const allMembers = mockMembers.filter(member => member.isActive)
      
      const now = new Date()
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      const stats = {
        totalMembers: allMembers.length,
        newThisMonth: allMembers.filter(m => 
          m.membershipDate && new Date(m.membershipDate) >= thisMonth
        ).length,
        activeMembers: allMembers.length,
        membersByRole: allMembers.reduce((acc, member) => {
          const role = member.role || 'member'
          acc[role] = (acc[role] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      }
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300))
      return createSuccessResponse(stats)
    }

    // Get all members (both active and inactive for total count)
    const allMembersResult = await db
      .select()
      .from(members)
    
    const allMembers = allMembersResult as Member[]
    
    const activeMembers = allMembers.filter((m: Member) => m.status === 'active')
    
    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const stats = {
      totalMembers: allMembers.length,
      newThisMonth: allMembers.filter((m: Member) => 
        m.membershipDate && new Date(m.membershipDate) >= thisMonth
      ).length,
      activeMembers: activeMembers.length,
      membersByRole: allMembers.reduce((acc: Record<string, number>, member: Member) => {
        const role = member.role || 'member'
        acc[role] = (acc[role] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }
    
    // Brief delay to show skeleton loading (remove in production)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return createSuccessResponse(stats)
  } catch (error) {
    console.error('Error fetching member stats:', error)
    return createErrorResponse('Failed to fetch member statistics.')
  }
}
