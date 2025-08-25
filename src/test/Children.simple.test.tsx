import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import Children from '@/pages/Children'

// Mock Clerk
const mockClerkConfig = {
  publishableKey: 'test_key'
}

// Mock all the icons to avoid undefined issues
vi.mock('@/lib/icons', () => ({
  churchIcons: {
    QrCode: () => <div data-testid="qr-icon">QR</div>,
    UserPlus: () => <div data-testid="user-plus-icon">User+</div>,
    Users: () => <div data-testid="users-icon">Users</div>,
    Shield: () => <div data-testid="shield-icon">Shield</div>,
    AlertCircle: () => <div data-testid="alert-circle-icon">Alert</div>,
    Heart: () => <div data-testid="heart-icon">Heart</div>,
    Phone: () => <div data-testid="phone-icon">Phone</div>,
    Check: () => <div data-testid="check-icon">Check</div>,
    Info: () => <div data-testid="info-icon">Info</div>,
    children: () => <div data-testid="children-icon">Children</div>,
    chart: () => <div data-testid="chart-icon">Chart</div>,
    bell: () => <div data-testid="bell-icon">Bell</div>,
    attendance: () => <div data-testid="attendance-icon">Attendance</div>,
    spinner: () => <div data-testid="spinner-icon">Spinner</div>,
    userCheck: () => <div data-testid="user-check-icon">UserCheck</div>,
    userX: () => <div data-testid="user-x-icon">UserX</div>,
    user: () => <div data-testid="user-icon">User</div>,
    alertTriangle: () => <div data-testid="alert-triangle-icon">AlertTriangle</div>,
    alertCircle: () => <div data-testid="alert-circle-icon">AlertCircle</div>
  }
}))

// Mock the API functions
vi.mock('@/lib/api/children', () => ({
  createChild: vi.fn(),
  checkInChild: vi.fn(),
  checkOutChild: vi.fn(),
  getChild: vi.fn(),
  getAllChildren: vi.fn(),
  getChildCheckInHistory: vi.fn()
}))

// Mock the logo image
vi.mock('/brand/logo.png', () => ({
  default: 'mocked-logo.png'
}))

function renderWithProviders(component: React.ReactElement) {
  return render(
    <ClerkProvider publishableKey={mockClerkConfig.publishableKey}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </ClerkProvider>
  )
}

describe('Children Page - Simple Test', () => {
  it('renders without crashing', () => {
    expect(() => renderWithProviders(<Children />)).not.toThrow()
  })

  it('renders the main page title', () => {
    const { getByText } = renderWithProviders(<Children />)
    expect(getByText("Children's Ministry")).toBeInTheDocument()
  })
})
