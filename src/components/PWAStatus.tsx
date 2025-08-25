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
  const [pwaCriteria, setPwaCriteria] = useState<{[key: string]: boolean}>({})

  useEffect(() => {
    // Check all PWA criteria
    const checkPWACriteria = () => {
      const criteria = {
        https: window.location.protocol === 'https:',
        serviceWorker: 'serviceWorker' in navigator,
        manifest: !!document.querySelector('link[rel="manifest"]'),
        standalone: window.matchMedia('(display-mode: standalone)').matches,
        userEngagement: false, // This is a key missing piece
        hasIcons: false,
        validManifest: false
      }

      // Check if user has engaged with the site (required for PWA install)
      if (sessionStorage.getItem('user-engaged')) {
        criteria.userEngagement = true
      }

      // Check if PWA icons exist
      try {
        const manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement
        if (manifestLink) {
          console.log('PWA: Found manifest link:', manifestLink.href)
          fetch(manifestLink.href)
            .then(response => {
              console.log('PWA: Manifest fetch response:', response.status, response.ok)
              return response.json()
            })
            .then(manifest => {
              console.log('PWA: Manifest content:', manifest)
              criteria.validManifest = !!manifest.name && !!manifest.icons && manifest.icons.length > 0
              criteria.hasIcons = manifest.icons && manifest.icons.length > 0
              console.log('PWA: Manifest validation:', {
                hasName: !!manifest.name,
                hasIcons: !!manifest.icons,
                iconCount: manifest.icons?.length || 0,
                iconPaths: manifest.icons?.map((icon: any) => icon.src) || []
              })
              setPwaCriteria(criteria)
            })
            .catch((error) => {
              console.error('PWA: Error fetching manifest:', error)
              criteria.validManifest = false
              setPwaCriteria(criteria)
            })
        } else {
          console.log('PWA: No manifest link found in document')
        }
      } catch (error) {
        console.error('PWA: Error checking manifest:', error)
      }

      // Also check if PWA icons exist directly
      const checkIconExists = async (iconPath: string) => {
        try {
          const response = await fetch(iconPath)
          return response.ok
        } catch {
          return false
        }
      }

      // Check both PWA icons
      Promise.all([
        checkIconExists('/pwa-192x192.png'),
        checkIconExists('/pwa-512x512.png')
      ]).then(([icon192, icon512]) => {
        console.log('PWA: Icon availability check:', {
          'pwa-192x192.png': icon192,
          'pwa-512x512.png': icon512
        })
      })

      setPwaCriteria(criteria)
      return criteria
    }

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

    // Mark user engagement after 5 seconds
    const markUserEngagement = setTimeout(() => {
      sessionStorage.setItem('user-engaged', 'true')
      console.log('PWA: User engagement marked')
    }, 5000)

    // Check if already installed
    checkIfInstalled()
    
    // Check service worker status
    checkServiceWorker()
    
    // Check PWA criteria
    checkPWACriteria()

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check PWA criteria after a delay
    const checkPWACriteriaDelayed = setTimeout(() => {
      if (!deferredPrompt && !isInstalled) {
        console.log('PWA: No beforeinstallprompt event, checking criteria...')
        const criteria = checkPWACriteria()
        console.log('PWA: PWA Criteria:', criteria)
        console.log('PWA: Service Worker status:', serviceWorkerStatus)
        
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
      clearTimeout(checkPWACriteriaDelayed)
      clearTimeout(markUserEngagement)
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
          Install App
        </Button>
        
        {showManualInstall && (
          <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50">
            <div className="text-xs text-gray-600 space-y-2">
              <h4 className="font-semibold text-gray-800 mb-2">Install ChurchSuite App</h4>
              
              <div className="space-y-2">
                <p><strong>Chrome/Edge Desktop:</strong></p>
                <p>1. Click ⋮ (three dots) in address bar</p>
                <p>2. Select "Install ChurchSuite"</p>
                
                <p><strong>Safari (iOS/Mac):</strong></p>
                <p>1. Click Share button</p>
                <p>2. Select "Add to Home Screen"</p>
                
                <p><strong>Mobile Browsers:</strong></p>
                <p>1. Open browser menu (⋮ or ⋯)</p>
                <p>2. Select "Add to Home Screen"</p>
              </div>
              
              <div className="mt-3 pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  <strong>PWA Status:</strong>
                </p>
                <p className="text-xs text-gray-500">• Service Worker: {serviceWorkerStatus}</p>
                <p className="text-xs text-gray-500">• HTTPS: {pwaCriteria.https ? '✅' : '❌'}</p>
                <p className="text-xs text-gray-500">• Manifest: {pwaCriteria.manifest ? '✅' : '❌'}</p>
                <p className="text-xs text-gray-500">• Icons: {pwaCriteria.hasIcons ? '✅' : '❌'}</p>
                <p className="text-xs text-gray-500">• User Engagement: {pwaCriteria.userEngagement ? '✅' : '❌'}</p>
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
