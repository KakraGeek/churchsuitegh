import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Download, CheckCircle, Monitor, Info } from '@/lib/icons'
import { churchIcons } from '@/lib/icons'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export function PWAStatus() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showManualInstall, setShowManualInstall] = useState(false)
  const [serviceWorkerStatus, setServiceWorkerStatus] = useState<string>('checking')

  useEffect(() => {
    // Check service worker status
    const checkServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration()
          if (registration) {
            if (registration.active) {
              setServiceWorkerStatus('active')
              console.log('PWA: Service Worker is active')
            } else if (registration.installing) {
              setServiceWorkerStatus('installing')
              console.log('PWA: Service Worker is installing')
            } else if (registration.waiting) {
              setServiceWorkerStatus('waiting')
              console.log('PWA: Service Worker is waiting')
            }
          } else {
            setServiceWorkerStatus('not-registered')
            console.log('PWA: No Service Worker registered')
          }
        } catch (error) {
          setServiceWorkerStatus('error')
          console.error('PWA: Error checking Service Worker:', error)
        }
      } else {
        setServiceWorkerStatus('not-supported')
        console.log('PWA: Service Worker not supported')
      }
    }

    // Check if app is already installed
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || 
          (window.navigator as Navigator & { standalone?: boolean }).standalone === true) {
        setIsInstalled(true)
        return true
      }
      return false
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('PWA: beforeinstallprompt event fired')
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA: appinstalled event fired')
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    // Listen for online/offline status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    // Check if already installed
    checkIfInstalled()
    
    // Check service worker status
    checkServiceWorker()

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check PWA criteria after a delay
    const checkPWACriteria = setTimeout(() => {
      if (!deferredPrompt && !isInstalled) {
        console.log('PWA: No beforeinstallprompt event, checking criteria...')
        console.log('PWA: Service Worker status:', serviceWorkerStatus)
        console.log('PWA: HTTPS:', window.location.protocol === 'https:')
        console.log('PWA: Manifest:', !!document.querySelector('link[rel="manifest"]'))
        
        // Check if PWA criteria are met
        if (window.matchMedia('(display-mode: standalone)').matches) {
          console.log('PWA: Already in standalone mode')
        } else {
          console.log('PWA: Showing manual install option')
          setShowManualInstall(true)
        }
      }
    }, 2000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearTimeout(checkPWACriteria)
    }
  }, [deferredPrompt, isInstalled, serviceWorkerStatus])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log('PWA: No deferredPrompt available')
      return
    }

    try {
      console.log('PWA: Showing install prompt...')
      // Show the install prompt
      await deferredPrompt.prompt()
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('PWA: User accepted the install prompt')
        setIsInstalled(true)
      } else {
        console.log('PWA: User dismissed the install prompt')
      }
    } catch (error) {
      console.error('PWA: Error showing install prompt:', error)
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null)
  }

  const handleManualInstall = () => {
    // Show instructions for manual installation
    setShowManualInstall(!showManualInstall)
  }

  if (isInstalled) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
        <CheckCircle className="w-4 h-4" />
        <span>App Installed</span>
      </div>
    )
  }

  if (deferredPrompt) {
    return (
      <div className="flex items-center gap-2">
        <Button
          onClick={handleInstallClick}
          size="sm"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
        >
          <Download className="w-4 h-4 mr-1" />
          Install App
        </Button>
        
        {!isOnline && (
          <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
            <Monitor className="w-3 h-3" />
            <span>Offline</span>
          </div>
        )}
      </div>
    )
  }

  if (showManualInstall) {
    return (
      <div className="relative">
        <Button
          onClick={handleManualInstall}
          size="sm"
          variant="outline"
          className="text-blue-600 border-blue-600 hover:bg-blue-50"
        >
          <Info className="w-4 h-4 mr-1" />
          How to Install
        </Button>
        
        {showManualInstall && (
          <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50">
            <div className="text-xs text-gray-600 space-y-2">
              <h4 className="font-semibold text-gray-800 mb-2">Manual Installation:</h4>
              <p><strong>Chrome/Edge:</strong> Click ⋮ → "Install ChurchSuite"</p>
              <p><strong>Safari:</strong> Click Share → "Add to Home Screen"</p>
              <p><strong>Mobile:</strong> Use browser menu → "Add to Home Screen"</p>
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  <strong>Status:</strong> SW: {serviceWorkerStatus} | HTTPS: {window.location.protocol === 'https:' ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
      <churchIcons.smartphone className="w-4 h-4" />
      <span>Install via browser menu</span>
    </div>
  )
}
