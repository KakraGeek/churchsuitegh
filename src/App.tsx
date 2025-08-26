import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn, SignIn, SignUp } from '@clerk/clerk-react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { clerkConfig } from '@/lib/clerk'
import { Layout } from '@/components/Layout'

// Dynamic imports for code splitting
const Dashboard = lazy(() => import('@/pages/Dashboard').then(module => ({ default: module.Dashboard })))
const LandingPage = lazy(() => import('@/pages/LandingPage').then(module => ({ default: module.LandingPage })))
const Members = lazy(() => import('@/pages/Members'))
const Events = lazy(() => import('@/pages/Events'))
const Attendance = lazy(() => import('@/pages/Attendance'))
const CheckIn = lazy(() => import('@/pages/CheckIn'))
const DisplayQR = lazy(() => import('@/pages/DisplayQR'))
const Analytics = lazy(() => import('@/pages/Analytics'))
const Communications = lazy(() => import('@/pages/Communications'))
const Notifications = lazy(() => import('@/pages/Notifications'))
const Giving = lazy(() => import('@/pages/Giving'))
const Children = lazy(() => import('@/pages/Children'))
const Volunteers = lazy(() => import('@/pages/Volunteers'))
const Inventory = lazy(() => import('@/pages/Inventory'))
const SundayService = lazy(() => import('@/pages/SundayService'))

// Loading component for Suspense fallback
function PageLoader() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}

if (!clerkConfig.publishableKey) {
  throw new Error('Missing Clerk Publishable Key. Please add VITE_CLERK_PUBLISHABLE_KEY to your .env.local file.')
}

// Custom Sign In page with proper centering
function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="/brand/logo.png"
            alt="ChurchSuite Ghana"
            className="h-16 w-auto mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your ChurchSuite account</p>
        </div>
        <SignIn />
      </div>
    </div>
  )
}

// Custom Sign Up page with proper centering
function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="/brand/logo.png"
            alt="ChurchSuite Ghana"
            className="h-16 w-auto mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600">Join ChurchSuite Ghana today</p>
        </div>
        <SignUp />
      </div>
    </div>
  )
}

function App() {
  return (
    <ClerkProvider 
      publishableKey={clerkConfig.publishableKey}
      appearance={{
        baseTheme: undefined,
        variables: { 
          colorPrimary: 'hsl(350 75% 25%)', // Church burgundy
          colorSuccess: 'hsl(82 39% 30%)', // Olive green
          colorWarning: 'hsl(32 60% 50%)', // Bronze
          colorDanger: 'hsl(0 84% 60%)', // Error red
          borderRadius: '0.5rem',
        },
        elements: {
          formButtonPrimary: 'bg-primary hover:bg-primary/90',
          card: 'bg-card border-border',
        }
      }}
    >
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Clerk authentication routes */}
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/sign-up" element={<SignUpPage />} />
            
            {/* Root path - show landing page for unauthenticated, dashboard for authenticated */}
            <Route path="/" element={
              <>
                <SignedOut>
                  <LandingPage />
                </SignedOut>
                <SignedIn>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </SignedIn>
              </>
            } />
            
            {/* Public routes - only for unauthenticated users */}
            <Route path="/display/qr" element={
              <SignedOut>
                <DisplayQR />
              </SignedOut>
            } />
            
            {/* Protected routes - require authentication */}
            <Route path="/dashboard" element={
              <SignedIn>
                <Layout>
                  <Dashboard />
                </Layout>
              </SignedIn>
            } />
            <Route path="/members" element={
              <SignedIn>
                <Layout>
                  <Members />
                </Layout>
              </SignedIn>
            } />
            <Route path="/events" element={
              <SignedIn>
                <Layout>
                  <Events />
                </Layout>
              </SignedIn>
            } />
            <Route path="/attendance" element={
              <SignedIn>
                <Layout>
                  <Attendance />
                </Layout>
              </SignedIn>
            } />
            <Route path="/analytics" element={
              <SignedIn>
                <Layout>
                  <Analytics />
                </Layout>
              </SignedIn>
            } />
            <Route path="/communications" element={
              <SignedIn>
                <Layout>
                  <Communications />
                </Layout>
              </SignedIn>
            } />
            <Route path="/notifications" element={
              <SignedIn>
                <Layout>
                  <Notifications />
                </Layout>
              </SignedIn>
            } />
            <Route path="/giving" element={
              <SignedIn>
                <Layout>
                  <Giving />
                </Layout>
              </SignedIn>
            } />
            <Route path="/checkin" element={
              <SignedIn>
                <Layout>
                  <CheckIn />
                </Layout>
              </SignedIn>
            } />
            <Route path="/children" element={
              <SignedIn>
                <Layout>
                  <Children />
                </Layout>
              </SignedIn>
            } />
            <Route path="/volunteers" element={
              <SignedIn>
                <Layout>
                  <Volunteers />
                </Layout>
              </SignedIn>
            } />
            <Route path="/inventory" element={
              <SignedIn>
                <Layout>
                  <Inventory />
                </Layout>
              </SignedIn>
            } />
            <Route path="/sunday-service" element={
              <SignedIn>
                <Layout>
                  <SundayService />
                </Layout>
              </SignedIn>
            } />
            
            {/* Catch all other routes */}
            <Route path="*" element={<RedirectToSignIn />} />
          </Routes>
        </Suspense>
      </Router>
    </ClerkProvider>
  )
}

export default App
