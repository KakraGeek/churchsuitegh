import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { clerkConfig } from '@/lib/clerk'
import { Dashboard } from '@/pages/Dashboard'
import { Members } from '@/pages/Members'
import Events from '@/pages/Events'
import Attendance from '@/pages/Attendance'
import CheckIn from '@/pages/CheckIn'
import DisplayQR from '@/pages/DisplayQR'
import Analytics from '@/pages/Analytics'
import Communications from '@/pages/Communications'
import Notifications from '@/pages/Notifications'
import Giving from '@/pages/Giving'
import { Layout } from '@/components/Layout'

if (!clerkConfig.publishableKey) {
  throw new Error('Missing Clerk Publishable Key. Please add VITE_CLERK_PUBLISHABLE_KEY to your .env.local file.')
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
          {/* Public display route - no authentication required */}
          <Route path="/display/qr" element={<DisplayQR />} />
          
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
                  {/* Add more routes as we build features */}
                </Routes>
              </Layout>
            </SignedIn>
          } />
        </Routes>
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </Router>
    </ClerkProvider>
  )
}

export default App
