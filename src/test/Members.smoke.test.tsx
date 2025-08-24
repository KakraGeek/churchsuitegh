import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Members } from '@/pages/Members'

// Mock the API functions
vi.mock('@/lib/api/members', () => ({
  getAllMembers: vi.fn().mockResolvedValue({
    ok: true,
    data: [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'member',
        membershipDate: new Date('2024-01-01'),
        isActive: true
      },
      {
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        role: 'leader',
        membershipDate: new Date('2023-06-01'),
        isActive: true
      }
    ]
  }),
  searchMembers: vi.fn().mockResolvedValue({ ok: true, data: [] }),
}))

/**
 * Per-Feature Smoke Test: Members Management
 * 
 * Tests the core membership functionality that must work for
 * church administrators to manage their congregation.
 */
describe('Members Smoke Test', () => {
  it('renders members page with header', () => {
    render(<Members />)
    
    expect(screen.getByRole('heading', { name: 'Members' })).toBeInTheDocument()
    expect(screen.getByText('Manage your church community and member information.')).toBeInTheDocument()
  })

  it('displays member statistics cards', () => {
    render(<Members />)
    
    // Should show role-based statistics
    expect(screen.getByText('Pastors')).toBeInTheDocument()
    expect(screen.getByText('Leaders')).toBeInTheDocument()
    expect(screen.getAllByText('Members')).toHaveLength(2) // Header + Stats card
    expect(screen.getByText('Visitors')).toBeInTheDocument()
  })

  it('shows search functionality', () => {
    render(<Members />)
    
    expect(screen.getByPlaceholderText(/Search members by name, email, or phone/)).toBeInTheDocument()
  })

  it('displays add member button for authorized users', () => {
    render(<Members />)
    
    // Should show add member button (mock user has admin/pastor role)
    expect(screen.getByText('Add Member')).toBeInTheDocument()
  })

  it('shows loading state initially', () => {
    render(<Members />)
    
    // Should show loading spinner while fetching members
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })
})
