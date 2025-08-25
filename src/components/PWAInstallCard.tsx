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
  const [isLoading, setIsLoading] = useState(false)

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
      const hasServiceWorker = 'serviceWorker' in navigator
      
      console.log('PWA: Criteria check:', { hasManifest, isHTTPS, hasServiceWorker })
      
      if (hasManifest && isHTTPS && hasServiceWorker) {
        console.log('PWA: Criteria met, showing install card')
        setShowCard(true)
        return true
      } else {
        console.log('PWA: Criteria not met')
        setShowCard(false)
        return false
      }
    }

    // Handle beforeinstallprompt event (Next.js PWA approach)
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
    console.log('PWA: Install button clicked, attempting Next.js PWA approach...')
    setIsLoading(true)
    
    try {
      if (deferredPrompt) {
        // Use the captured install prompt (Next.js PWA approach)
        console.log('PWA: Using captured install prompt for direct install')
        
        // Show the install prompt
        deferredPrompt.prompt()
        
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice
        console.log('PWA: User choice:', outcome)
        
        if (outcome === 'accepted') {
          console.log('PWA: User accepted install - PWA installing now!')
          setDeferredPrompt(null)
          setShowCard(false)
          setIsLoading(false)
          return
        } else {
          console.log('PWA: User dismissed install')
          setIsLoading(false)
          // Keep the card visible so they can try again
        }
      } else {
        // Next.js PWA fallback: Try to trigger install through service worker
        console.log('PWA: No install prompt, trying service worker approach...')
        
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          // Send message to service worker to trigger install
          const messageChannel = new MessageChannel()
          
          messageChannel.port1.onmessage = (event) => {
            if (event.data.type === 'PWA_INSTALL_RESPONSE') {
              console.log('PWA: Service worker responded to install request')
              // Try to trigger the install prompt again
              window.dispatchEvent(new Event('beforeinstallprompt'))
            }
          }
          
          navigator.serviceWorker.controller.postMessage(
            { type: 'PWA_INSTALL' },
            [messageChannel.port2]
          )
          
          // Wait a bit for the service worker to respond
          setTimeout(() => {
            setIsLoading(false)
            // Show the most direct manual install option
            showDirectInstallInstructions()
          }, 1000)
        } else {
          setIsLoading(false)
          showDirectInstallInstructions()
        }
      }
    } catch (error) {
      console.error('PWA: Install error:', error)
      setIsLoading(false)
      showDirectInstallInstructions()
    }
  }

  const showDirectInstallInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase()
    
    if (userAgent.includes('chrome') || userAgent.includes('edge')) {
      alert('Install ChurchSuite:\n\n1. Look for the install icon (📱) in your address bar\n2. Click it to install\n\nIf no icon appears, use:\n⋮ (three dots) → "Install ChurchSuite"')
    } else if (userAgent.includes('safari')) {
      alert('Install ChurchSuite:\n\n1. Click Share button (📤)\n2. Select "Add to Home Screen"\n3. Tap "Add"')
    } else {
      alert('Install ChurchSuite:\n\n1. Open browser menu (⋮ or ⋯)\n2. Look for "Add to Home Screen" or "Install"\n3. Follow the prompts')
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
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                {isLoading ? 'Installing...' : 'Install Now'}
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
