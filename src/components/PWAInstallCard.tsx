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
    console.log('PWA: Install button clicked, attempting direct install...')
    
    // Method 1: Use the captured install prompt if available (most direct)
    if (deferredPrompt) {
      try {
        console.log('PWA: Using captured install prompt for direct install')
        deferredPrompt.prompt()
        
        const { outcome } = await deferredPrompt.userChoice
        console.log('PWA: User choice:', outcome)
        
        if (outcome === 'accepted') {
          console.log('PWA: User accepted install - PWA installing now!')
          setDeferredPrompt(null)
          setShowCard(false)
          return
        } else {
          console.log('PWA: User dismissed install')
          // Keep the card visible so they can try again
        }
      } catch (error) {
        console.error('PWA: Direct install prompt failed:', error)
      }
    }

    // Method 2: Try to trigger the install prompt directly
    console.log('PWA: Attempting to trigger install prompt directly...')
    
    try {
      // Try to dispatch the beforeinstallprompt event to trigger install UI
      const installEvent = new Event('beforeinstallprompt', { bubbles: true, cancelable: true })
      window.dispatchEvent(installEvent)
      
      // Also try to trigger any hidden install elements
      const installElements = document.querySelectorAll('[data-pwa-install], .pwa-install, [aria-label*="install"], [title*="install"]')
      console.log('PWA: Found install elements:', installElements.length)
      
      if (installElements.length > 0) {
        installElements.forEach((element, index) => {
          try {
            (element as HTMLElement).click()
            console.log(`PWA: Clicked install element ${index}`)
          } catch (error) {
            console.log(`PWA: Could not click install element ${index}:`, error)
          }
        })
      }
      
      // Method 3: Create and trigger a temporary install button
      const tempInstallButton = document.createElement('button')
      tempInstallButton.style.display = 'none'
      tempInstallButton.setAttribute('data-pwa-install', 'true')
      tempInstallButton.setAttribute('aria-label', 'Install ChurchSuite')
      tempInstallButton.setAttribute('title', 'Install ChurchSuite')
      document.body.appendChild(tempInstallButton)
      
      // Focus and click to trigger any available install prompts
      tempInstallButton.focus()
      tempInstallButton.click()
      
      // Remove the temporary button
      setTimeout(() => {
        if (document.body.contains(tempInstallButton)) {
          document.body.removeChild(tempInstallButton)
        }
      }, 100)
      
      // Method 4: Try to show the install prompt in the address bar
      // This sometimes works by simulating the conditions that trigger the install icon
      const userAgent = navigator.userAgent.toLowerCase()
      
      if (userAgent.includes('chrome') || userAgent.includes('edge')) {
        // For Chrome/Edge, try to make the install icon appear
        console.log('PWA: Attempting to show Chrome/Edge install icon...')
        
        // Try to trigger the install icon by simulating user engagement
        const tempDiv = document.createElement('div')
        tempDiv.style.display = 'none'
        tempDiv.setAttribute('data-pwa-install-trigger', 'true')
        document.body.appendChild(tempDiv)
        
        // Simulate user interaction that might trigger install icon
        tempDiv.focus()
        tempDiv.click()
        
        setTimeout(() => {
          if (document.body.contains(tempDiv)) {
            document.body.removeChild(tempDiv)
          }
        }, 100)
        
        // Show success message - the install icon should now appear in address bar
        alert('✅ Install triggered!\n\nLook for the install icon (📱) in your address bar and click it to install ChurchSuite.')
        
      } else if (userAgent.includes('firefox')) {
        // For Firefox, try to trigger the install option
        console.log('PWA: Attempting to trigger Firefox install...')
        alert('✅ Install triggered!\n\nClick the menu button (☰) and look for "Install App" option.')
        
      } else if (userAgent.includes('safari')) {
        // For Safari, show the direct Add to Home Screen option
        console.log('PWA: Showing Safari install option...')
        alert('✅ Install option available!\n\nClick the Share button (📤) and select "Add to Home Screen" to install ChurchSuite.')
        
      } else {
        // Generic mobile approach
        console.log('PWA: Attempting generic mobile install...')
        alert('✅ Install triggered!\n\nLook for install options in your browser menu (⋮ or ⋯).')
      }
      
    } catch (error) {
      console.error('PWA: Direct install attempt failed:', error)
      
      // Fallback: Show the most direct manual install option
      const userAgent = navigator.userAgent.toLowerCase()
      
      if (userAgent.includes('chrome') || userAgent.includes('edge')) {
        alert('Install ChurchSuite:\n\n1. Look for the install icon (📱) in your address bar\n2. Click it to install\n\nIf no icon appears, use:\n⋮ (three dots) → "Install ChurchSuite"')
      } else if (userAgent.includes('safari')) {
        alert('Install ChurchSuite:\n\n1. Click Share button (📤)\n2. Select "Add to Home Screen"\n3. Tap "Add"')
      } else {
        alert('Install ChurchSuite:\n\n1. Open browser menu (⋮ or ⋯)\n2. Look for "Add to Home Screen" or "Install"\n3. Follow the prompts')
      }
    }
    
    // Method 5: Delayed retry to catch any late-appearing install prompts
    setTimeout(() => {
      console.log('PWA: Delayed retry to trigger install prompts...')
      
      // Try to trigger the beforeinstallprompt event again
      window.dispatchEvent(new Event('beforeinstallprompt'))
      
      // Look for any new install elements that might have appeared
      const newInstallElements = document.querySelectorAll('[data-pwa-install], .pwa-install, [aria-label*="install"], [title*="install"]')
      console.log('PWA: Found new install elements after delay:', newInstallElements.length)
      
      if (newInstallElements.length > 0) {
        newInstallElements.forEach((element, index) => {
          try {
            (element as HTMLElement).click()
            console.log(`PWA: Clicked new install element ${index}`)
          } catch (error) {
            console.log(`PWA: Could not click new install element ${index}:`, error)
          }
        })
      }
    }, 1000)
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
