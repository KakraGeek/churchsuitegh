import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { churchIcons } from '@/lib/icons'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

export function LandingPage() {
  const navigate = useNavigate()
  const [showInstallButton, setShowInstallButton] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  // Proper PWA install detection and handling
  useEffect(() => {
    console.log('LandingPage: Component mounted')
    console.log('LandingPage: Viewport width:', window.innerWidth)
    console.log('LandingPage: User agent:', navigator.userAgent)

    // Check if PWA can be installed
    const checkPWACriteria = () => {
      const hasManifest = !!document.querySelector('link[rel="manifest"]')
      const isHTTPS = window.location.protocol === 'https:'
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      
      console.log('PWA: Checking criteria:', { hasManifest, isHTTPS, isStandalone })
      
      if (hasManifest && isHTTPS && !isStandalone) {
        console.log('PWA: Criteria met, showing install button')
        setShowInstallButton(true)
      } else {
        console.log('PWA: Criteria not met or already installed')
        setShowInstallButton(false)
      }
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('PWA: beforeinstallprompt event fired')
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later
      setDeferredPrompt(e)
      // Show the install button (in case it wasn't already shown)
      setShowInstallButton(true)
    }

    // Listen for the appinstalled event
    const handleAppInstalled = () => {
      console.log('PWA: App was installed')
      setShowInstallButton(false)
      setDeferredPrompt(null)
    }

    // Check PWA criteria immediately
    checkPWACriteria()

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log('PWA: No install prompt available, showing manual instructions')
      // Fallback to manual instructions if no prompt
      alert('To install ChurchSuite:\n\nChrome/Edge: Click ⋮ → "Install ChurchSuite"\nSafari: Click Share → "Add to Home Screen"\nMobile: Use browser menu → "Add to Home Screen"')
      return
    }

    try {
      console.log('PWA: Triggering install prompt')
      // Show the install prompt
      deferredPrompt.prompt()
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice
      console.log('PWA: User choice:', outcome)
      
      if (outcome === 'accepted') {
        console.log('PWA: User accepted the install prompt')
      } else {
        console.log('PWA: User dismissed the install prompt')
      }
      
      // Clear the deferredPrompt
      setDeferredPrompt(null)
      setShowInstallButton(false)
    } catch (error) {
      console.error('PWA: Error during install:', error)
      // Fallback to manual instructions
      alert('Install failed. Please use manual installation:\n\nChrome/Edge: Click ⋮ → "Install ChurchSuite"\nSafari: Click Share → "Add to Home Screen"\nMobile: Use browser menu → "Add to Home Screen"')
    }
  }

  const features = [
    {
      icon: churchIcons.users,
      title: 'Member Management',
      description: 'Comprehensive member database with role-based access control, attendance tracking, and member profiles.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: churchIcons.gift,
      title: 'MoMo Giving',
      description: 'Integrated mobile money giving with MTN, Telecel, and AirtelTigo. Real-time tracking and reporting.',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: churchIcons.chart,
      title: 'Analytics & Reporting',
      description: 'Detailed insights into member growth, giving patterns, attendance trends, and church performance metrics.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: churchIcons.service,
      title: 'Sunday Services',
      description: 'Plan and manage weekly service programs, song lyrics, scripture readings, and service schedules. Offer digital service programs to your members and cut printing costs.',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      icon: churchIcons.qrcode,
      title: 'QR Code Check-in',
      description: 'Streamlined attendance tracking with QR codes for services, events, and child check-in systems.',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      icon: churchIcons.volunteers,
      title: 'Volunteer Management',
      description: 'Organize volunteer teams, track service assignments, and manage ministry schedules efficiently.',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-3">
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <img src="/brand/logo.png" alt="ChurchSuite Ghana Logo" className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
              <div className="text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">ChurchSuite Ghana</h1>
                <p className="text-sm sm:text-base text-gray-600">Smart Church Management Platform</p>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3 justify-center sm:justify-end">
              {showInstallButton && (
                <Button
                  onClick={handleInstallClick}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Install App
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={() => navigate('/sign-in')}
                className="flex items-center gap-2 text-sm sm:text-base px-3 sm:px-4 py-2"
              >
                <churchIcons.checkIn className="w-4 h-4" />
                Sign In
              </Button>
              <Button 
                onClick={() => navigate('/sign-up')}
                className="flex items-center gap-2 text-sm sm:text-base px-3 sm:px-4 py-2"
              >
                <churchIcons.userPlus className="w-4 h-4" />
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-3 sm:px-4 py-12 sm:py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            Transform Your Church Management
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed px-2">
            ChurchSuite Ghana is the complete church management solution designed specifically for Ghanaian churches. 
            Streamline operations, improve member engagement, and focus more on ministry with our mobile-first platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/sign-in')}
              className="flex items-center gap-2 text-base sm:text-lg px-6 sm:px-8 py-3"
            >
              <churchIcons.checkIn className="w-4 h-4 sm:w-5 sm:h-5" />
              Access Your Account
            </Button>
            <Button 
              size="lg"
              onClick={() => navigate('/sign-up')}
              className="flex items-center gap-2 text-base sm:text-lg px-6 sm:px-8 py-3"
            >
              <churchIcons.userPlus className="w-4 h-4 sm:w-5 sm:h-5" />
              Create Account
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 sm:py-16">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              Everything Your Church Needs
            </h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-2">
              From member management to financial tracking, ChurchSuite provides all the tools 
              modern churches need to thrive in the digital age.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="text-center pb-4">
                  <div className={`flex justify-center mb-3 sm:mb-4 p-2 sm:p-3 rounded-lg ${feature.bgColor}`}>
                    <feature.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-lg sm:text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary py-12 sm:py-16">
        <div className="container mx-auto px-3 sm:px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-sm sm:text-base text-primary-foreground/90 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            Join churches across Ghana who are already using ChurchSuite to streamline their operations, 
            improve member engagement, and focus more on ministry.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/sign-in')}
              className="flex items-center gap-2 text-base sm:text-lg px-6 sm:px-8 py-3 border-white text-white bg-transparent hover:bg-white hover:text-primary transition-colors duration-200"
            >
              <churchIcons.checkIn className="w-4 h-4 sm:w-5 sm:h-5" />
              Sign In Now
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="container mx-auto px-3 sm:px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4 sm:mb-6">
            <img src="/brand/logo.png" alt="ChurchSuite Ghana Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
            <span className="text-lg sm:text-xl font-bold">ChurchSuite Ghana</span>
          </div>
          <p className="text-sm sm:text-base text-gray-300 mb-3 sm:mb-4">
            © 2025 ChurchSuite Ghana. All rights reserved.
          </p>
          <p className="text-xs sm:text-sm text-gray-400">
            Powered by The Geek Toolbox | Call 024.429.9095
          </p>
        </div>
      </div>
    </div>
  )
}
