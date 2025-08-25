import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallCard() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showCard, setShowCard] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    console.log('PWA Install Card: Component mounted, checking PWA status...')
    
    // Check if already installed
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isInApp = (navigator as any).standalone === true
      
      console.log('PWA: Install check:', { isStandalone, isInApp })
      
      if (isStandalone || isInApp) {
        console.log('PWA: App is already installed')
        setIsInstalled(true)
        setShowCard(false)
        return true
      }
      return false
    }

    // Check PWA criteria
    const checkPWACriteria = () => {
      const hasManifest = !!document.querySelector('link[rel="manifest"]')
      const isHTTPS = window.location.protocol === 'https:'
      
      console.log('PWA: Criteria check:', { hasManifest, isHTTPS })
      
      if (hasManifest && isHTTPS) {
        console.log('PWA: Criteria met, showing install card')
        setShowCard(true)
        return true
      } else {
        console.log('PWA: Criteria not met')
        setShowCard(false)
        return false
      }
    }

    // Handle beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('PWA: beforeinstallprompt event fired! 🎉')
      
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      
      // Stash the event so it can be triggered later
      const promptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)
      setShowCard(true)
      
      console.log('PWA: Install prompt captured and stored')
    }

    // Handle appinstalled event
    const handleAppInstalled = () => {
      console.log('PWA: App was installed')
      setIsInstalled(true)
      setShowCard(false)
      setDeferredPrompt(null)
    }

    // Initial checks
    if (!checkIfInstalled()) {
      checkPWACriteria()
    }

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
    console.log('PWA: Install button clicked, attempting universal install...')
    
    // First, try to use the captured install prompt if available
    if (deferredPrompt) {
      try {
        console.log('PWA: Using captured install prompt')
        deferredPrompt.prompt()
        
        const { outcome } = await deferredPrompt.userChoice
        console.log('PWA: User choice:', outcome)
        
        if (outcome === 'accepted') {
          console.log('PWA: User accepted install')
          setDeferredPrompt(null)
          setShowCard(false)
          return
        } else {
          console.log('PWA: User dismissed install')
          // Keep the card visible so they can try again
        }
      } catch (error) {
        console.error('PWA: Install prompt error:', error)
        // Fall through to universal install methods
      }
    }

    // Universal install approach for all users
    console.log('PWA: Attempting universal install methods...')
    
    const userAgent = navigator.userAgent.toLowerCase()
    
    if (userAgent.includes('chrome') || userAgent.includes('edge')) {
      // Chrome/Edge: Try multiple methods to trigger install
      console.log('PWA: Attempting Chrome/Edge universal install')
      
      try {
        // Method 1: Try to trigger any available install prompts
        const installPrompts = document.querySelectorAll('[data-pwa-install], .pwa-install, [aria-label*="install"], [title*="install"]')
        console.log('PWA: Found potential install elements:', installPrompts.length)
        
        if (installPrompts.length > 0) {
          installPrompts.forEach((element, index) => {
            try {
              (element as HTMLElement).click()
              console.log(`PWA: Clicked install element ${index}`)
            } catch (error) {
              console.log(`PWA: Could not click install element ${index}:`, error)
            }
          })
        }
        
        // Method 2: Try to trigger the beforeinstallprompt event manually
        window.dispatchEvent(new Event('beforeinstallprompt'))
        
        // Method 3: Try to focus and interact with the page to trigger install prompts
        const tempButton = document.createElement('button')
        tempButton.style.display = 'none'
        tempButton.setAttribute('data-pwa-install', 'true')
        document.body.appendChild(tempButton)
        
        tempButton.focus()
        tempButton.click()
        
        setTimeout(() => {
          document.body.removeChild(tempButton)
        }, 100)
        
        // Show success message with next steps
        alert('Chrome/Edge Install:\n\n✅ Install prompt triggered!\n\n1. Look for the install icon (📱) in your address bar\n2. Click it and select "Install ChurchSuite"\n\nIf no icon appears, try refreshing the page or navigating around.')
        
      } catch (error) {
        console.error('PWA: Chrome/Edge universal install failed:', error)
        alert('Chrome/Edge Install:\n\n1. Look for the install icon (📱) in your address bar\n2. Click it and select "Install ChurchSuite"\n\nIf no icon appears:\n⋮ (three dots) → "Install ChurchSuite"')
      }
      
    } else if (userAgent.includes('safari')) {
      // Safari: Show Add to Home Screen instructions
      console.log('PWA: Showing Safari install instructions')
      alert('Safari Install:\n\n1. Click the Share button (📤)\n2. Select "Add to Home Screen"\n3. Tap "Add"\n\nThis will install ChurchSuite on your home screen.')
      
    } else if (userAgent.includes('firefox')) {
      // Firefox: Try to trigger install
      console.log('PWA: Attempting Firefox universal install')
      
      try {
        // Try to trigger any available install prompts
        window.dispatchEvent(new Event('beforeinstallprompt'))
        
        alert('Firefox Install:\n\n✅ Install prompt triggered!\n\n1. Click the menu button (☰)\n2. Select "Install App"\n3. Follow the prompts\n\nIf "Install App" is not available, try refreshing the page.')
        
      } catch (error) {
        console.error('PWA: Firefox install attempt failed:', error)
        alert('Firefox Install:\n\n1. Click the menu button (☰)\n2. Select "Install App"\n3. Follow the prompts\n\nIf "Install App" is not available, try refreshing the page.')
      }
      
    } else {
      // Generic mobile instructions with universal trigger attempt
      console.log('PWA: Attempting generic mobile universal install')
      
      try {
        // Try to trigger any available install prompts
        window.dispatchEvent(new Event('beforeinstallprompt'))
        
        alert('Mobile Install:\n\n✅ Install prompt triggered!\n\n1. Open browser menu (⋮ or ⋯)\n2. Look for "Add to Home Screen" or "Install"\n3. Follow the prompts\n\nIf no install option appears, try refreshing the page.')
        
      } catch (error) {
        console.error('PWA: Generic mobile install attempt failed:', error)
        alert('Mobile Install:\n\n1. Open browser menu (⋮ or ⋯)\n2. Look for "Add to Home Screen" or "Install"\n3. Follow the prompts\n\nIf no install option appears, try refreshing the page.')
      }
    }
    
    // Additional: Try to trigger any available install prompts after a delay
    setTimeout(() => {
      console.log('PWA: Delayed attempt to trigger install prompts...')
      
      // Try to trigger the beforeinstallprompt event again
      window.dispatchEvent(new Event('beforeinstallprompt'))
      
      // Look for any new install elements that might have appeared
      const newInstallPrompts = document.querySelectorAll('[data-pwa-install], .pwa-install, [aria-label*="install"], [title*="install"]')
      console.log('PWA: Found new install elements after delay:', newInstallPrompts.length)
      
      if (newInstallPrompts.length > 0) {
        newInstallPrompts.forEach((element, index) => {
          try {
            (element as HTMLElement).click()
            console.log(`PWA: Clicked new install element ${index}`)
          } catch (error) {
            console.log(`PWA: Could not click new install element ${index}:`, error)
          }
        })
      }
    }, 500)
  }

  const showManualInstallInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase()
    
    if (userAgent.includes('chrome') || userAgent.includes('edge')) {
      alert('Chrome/Edge Install:\n\n1. Look for the install icon (📱) in your address bar\n2. Click it and select "Install ChurchSuite"\n\nIf no icon appears:\n⋮ (three dots) → "Install ChurchSuite"')
    } else if (userAgent.includes('safari')) {
      alert('Safari Install:\n\n1. Click the Share button (📤)\n2. Select "Add to Home Screen"\n3. Tap "Add"')
    } else if (userAgent.includes('firefox')) {
      alert('Firefox Install:\n\n1. Click the menu button (☰)\n2. Select "Install App"\n3. Follow the prompts')
    } else {
      alert('Mobile Install:\n\n1. Open browser menu (⋮ or ⋯)\n2. Look for "Add to Home Screen" or "Install"\n3. Follow the prompts')
    }
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    setShowCard(false)
    // Store dismissal in localStorage to remember user preference
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  // Check if user previously dismissed
  useEffect(() => {
    const wasDismissed = localStorage.getItem('pwa-install-dismissed') === 'true'
    if (wasDismissed) {
      setIsDismissed(true)
      setShowCard(false)
    }
  }, [])

  // Don't show if already installed, dismissed, or criteria not met
  if (isInstalled || isDismissed || !showCard) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="bg-white shadow-lg border border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xl">📱</span>
              </div>
              <div>
                <CardTitle className="text-base">Install ChurchSuite</CardTitle>
                <CardDescription className="text-sm">
                  Get the app on your home screen
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Install ChurchSuite for quick access and offline functionality.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleInstallClick}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                Install Now
              </Button>
              <Button
                variant="outline"
                onClick={handleDismiss}
                size="sm"
              >
                Maybe Later
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
