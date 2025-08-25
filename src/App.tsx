import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn, SignIn, SignUp } from '@clerk/clerk-react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { clerkConfig } from '@/lib/clerk'
import { Dashboard } from '@/pages/Dashboard'
import { LandingPage } from '@/pages/LandingPage'
import Members from '@/pages/Members'
import Events from '@/pages/Events'
import Attendance from '@/pages/Attendance'
import CheckIn from '@/pages/CheckIn'
import DisplayQR from '@/pages/DisplayQR'
import Analytics from '@/pages/Analytics'
import Communications from '@/pages/Communications'
import Notifications from '@/pages/Notifications'
import Giving from '@/pages/Giving'
import Children from '@/pages/Children'
import Volunteers from '@/pages/Volunteers'
import Inventory from '@/pages/Inventory'
import SundayService from './pages/SundayService'
import { Layout } from '@/components/Layout'

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
        <Routes>
          {/* Clerk authentication routes */}
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          
          {/* Protected routes - require authentication */}
          <Route path="/*" element={
            <SignedIn>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/members" element={<Members />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/attendance" element={<Attendance />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/communications" element={<Communications />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/giving" element={<Giving />} />
                  <Route path="/checkin" element={<CheckIn />} />
                  <Route path="/children" element={<Children />} />
                  <Route path="/volunteers" element={<Volunteers />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/sunday-service" element={<SundayService />} />
                  {/* Add more routes as we build features */}
                </Routes>
              </Layout>
            </SignedIn>
          } />
          
          {/* Public routes - only for unauthenticated users */}
          <Route path="/*" element={
            <SignedOut>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/display/qr" element={<DisplayQR />} />
                <Route path="*" element={<RedirectToSignIn />} />
              </Routes>
            </SignedOut>
          } />
        </Routes>
      </Router>
    </ClerkProvider>
  )
}

export default App
