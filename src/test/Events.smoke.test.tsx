import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import Events from '@/pages/Events'

// Mock Clerk
vi.mock('@clerk/clerk-react', () => ({
  useUser: () => ({
    user: {
      id: 'test-user-id',
      firstName: 'Test',
      lastName: 'User',
      publicMetadata: { role: 'admin' }
    }
  })
}))

// Mock API functions
vi.mock('@/lib/api/events', () => ({
  getAllEvents: vi.fn().mockResolvedValue({
    ok: true,
    data: []
  }),
  getEventStats: vi.fn().mockResolvedValue({
    ok: true,
    data: {
      totalEvents: 0,
      upcomingEvents: 0,
      thisWeekEvents: 0,
      eventsByType: {}
    }
  }),
  searchEvents: vi.fn().mockResolvedValue({
    ok: true,
    data: []
  }),
  deleteEvent: vi.fn().mockResolvedValue({
    ok: true,
    data: { success: true }
  })
}))

// Mock database
vi.mock('@/lib/db', () => ({ db: {} }))

function renderEvents() {
  return render(
    <BrowserRouter>
      <Events />
    </BrowserRouter>
  )
}

describe('Events Page Smoke Tests', () => {
  test('renders events page without crashing', () => {
    renderEvents()
    expect(screen.getByRole('heading', { name: /Events & Calendar/i })).toBeInTheDocument()
  })

  test('shows add event button for admin users', () => {
    renderEvents()
    expect(screen.getByRole('button', { name: /Add Event/i })).toBeInTheDocument()
  })

  test('displays stats cards', () => {
    renderEvents()
    expect(screen.getByText('Total Events')).toBeInTheDocument()
    expect(screen.getByText('Upcoming Events')).toBeInTheDocument()
    expect(screen.getByText('This Week')).toBeInTheDocument()
    expect(screen.getByText('Most Common')).toBeInTheDocument()
  })

  test('shows search and filter controls', () => {
    renderEvents()
    expect(screen.getByPlaceholderText('Search events...')).toBeInTheDocument()
    expect(screen.getByDisplayValue('All Types')).toBeInTheDocument()
    expect(screen.getByDisplayValue('All Events')).toBeInTheDocument()
  })

  test('displays view toggle tabs', () => {
    renderEvents()
    expect(screen.getByRole('tab', { name: /List View/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Calendar View/i })).toBeInTheDocument()
  })

  test('shows empty state when no events exist', () => {
    renderEvents()
    expect(screen.getByText('No events found')).toBeInTheDocument()
    expect(screen.getByText('Create Your First Event')).toBeInTheDocument()
  })
})
