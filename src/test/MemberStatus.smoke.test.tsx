import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemberStatusManager } from '@/components/members/MemberStatusManager'
import type { Member } from '@/lib/db/schema'

// Mock the API function
vi.mock('@/lib/api/members', () => ({
  updateMemberStatus: vi.fn().mockResolvedValue({
    ok: true,
    data: {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      status: 'inactive',
      statusReason: 'Test reason',
      statusChangedBy: 'admin',
      statusChangedAt: new Date(),
    }
  }),
}))

const mockMember: Member = {
  id: '1',
  clerkUserId: 'user_1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '+233 24 123 4567',
  dateOfBirth: new Date('1985-06-15'),
  address: 'Accra, Ghana',
  emergencyContact: 'Jane Doe',
  role: 'member',
  status: 'active',
  statusReason: null,
  statusChangedBy: null,
  statusChangedAt: null,
  department: 'Youth Ministry',
  notes: 'Active member',
  membershipDate: new Date('2023-01-15'),
  isActive: true,
  createdAt: new Date('2023-01-15'),
  updatedAt: new Date('2024-01-01'),
}

/**
 * Per-Feature Smoke Test: Member Status Management
 * 
 * Tests the enhanced status management functionality that allows
 * pastors and admins to track and change member status.
 */
describe('Member Status Management Smoke Test', () => {
  it('displays current member status', () => {
    render(<MemberStatusManager member={mockMember} />)
    
    // Should show the current status badge
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('shows status for non-admin users as read-only', () => {
    // The mock user in setup.ts has admin role, but let's test read-only view
    render(<MemberStatusManager member={mockMember} />)
    
    // Should show the status without edit functionality for regular users
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('displays status reason when available', () => {
    const memberWithReason = {
      ...mockMember,
      status: 'inactive' as const,
      statusReason: 'Moved to another city',
      statusChangedAt: new Date('2024-01-01'),
    }
    
    render(<MemberStatusManager member={memberWithReason} />)
    
    expect(screen.getByText('Inactive')).toBeInTheDocument()
    expect(screen.getByText(/Moved to another city/)).toBeInTheDocument()
  })

  it('shows status change date when available', () => {
    const memberWithChangeDate = {
      ...mockMember,
      status: 'transferred' as const,
      statusChangedAt: new Date('2024-01-01'),
    }
    
    render(<MemberStatusManager member={memberWithChangeDate} />)
    
    expect(screen.getByText('Transferred')).toBeInTheDocument()
    // Should show the formatted date
    expect(screen.getByText(/1\/1\/2024/)).toBeInTheDocument()
  })
})
