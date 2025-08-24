import { beforeAll, vi } from 'vitest'
import '@testing-library/jest-dom'

// Mock environment variables
beforeAll(() => {
  vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', 'pk_test_mock')
  vi.stubEnv('VITE_DATABASE_URL', 'postgresql://test:test@localhost:5432/test')
})

// Mock database
vi.mock('@/lib/db', () => ({
  db: {}
}))

// Mock Clerk
vi.mock('@clerk/clerk-react', () => ({
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
  SignedIn: ({ children }: { children: React.ReactNode }) => children,
  SignedOut: () => null,
  RedirectToSignIn: () => null,
  UserButton: () => 'div',
  useUser: () => ({
    user: {
      id: 'test-user',
      firstName: 'Test',
      lastName: 'User',
      publicMetadata: { role: 'admin' }
    }
  }),
}))

// Mock router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/' }),
    BrowserRouter: ({ children }: { children: React.ReactNode }) => children,
    Routes: ({ children }: { children: React.ReactNode }) => children,
    Route: () => null,
  }
})
