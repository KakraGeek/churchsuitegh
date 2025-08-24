import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Dashboard } from '@/pages/Dashboard'

/**
 * Per-Feature Smoke Test: Dashboard
 * 
 * Tests the core dashboard functionality that must work for users
 * to access the church management system.
 */
describe('Dashboard Smoke Test', () => {
  it('renders welcome message', () => {
    render(<Dashboard />)
    
    expect(screen.getByText(/Welcome back/)).toBeInTheDocument()
  })

  it('displays key statistics cards', () => {
    render(<Dashboard />)
    
    // Check for essential stats
    expect(screen.getByText('Total Members')).toBeInTheDocument()
    expect(screen.getByText('This Week Attendance')).toBeInTheDocument()
    expect(screen.getAllByText('Upcoming Events')).toHaveLength(2) // Stats card + section
    expect(screen.getByText('Monthly Giving')).toBeInTheDocument()
  })

  it('shows quick action buttons', () => {
    render(<Dashboard />)
    
    expect(screen.getByText('Manage Members')).toBeInTheDocument()
    expect(screen.getByText('Schedule Event')).toBeInTheDocument()
    expect(screen.getByText('Record Attendance')).toBeInTheDocument()
  })

  it('displays recent activity section', () => {
    render(<Dashboard />)
    
    expect(screen.getByText('Recent Activity')).toBeInTheDocument()
  })

  it('shows upcoming events', () => {
    render(<Dashboard />)
    
    expect(screen.getAllByText('Upcoming Events')).toHaveLength(2) // Stats card + section
    expect(screen.getByText('Sunday Service')).toBeInTheDocument()
  })
})
