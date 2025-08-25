import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showButton, setShowButton] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string>('')

  useEffect(() => {
    console.log('PWA: Component mounted, starting PWA detection...')
    
    // Check if already installed
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isInApp = (navigator as any).standalone === true
      
      console.log('PWA: Install check:', { isStandalone, isInApp })
      
      if (isStandalone || isInApp) {
        console.log('PWA: App is already installed')
        setIsInstalled(true)
        setShowButton(false)
        setDebugInfo('Already installed')
        return true
      }
      return false
    }

    // Check PWA criteria
    const checkPWACriteria = () => {
      const hasManifest = !!document.querySelector('link[rel="manifest"]')
      const isHTTPS = window.location.protocol === 'https:'
      const manifestLink = document.querySelector('link[rel="manifest"]')
      
      console.log('PWA: Criteria check:', { 
        hasManifest, 
        isHTTPS, 
        manifestLink: manifestLink?.getAttribute('href'),
        protocol: window.location.protocol,
        url: window.location.href
      })
      
      if (hasManifest && isHTTPS) {
        console.log('PWA: Basic criteria met, showing install button')
        setShowButton(true)
        setDebugInfo('Criteria met, waiting for install prompt')
        return true
      } else {
        console.log('PWA: Basic criteria not met')
        setShowButton(false)
        setDebugInfo(`Criteria not met: manifest=${hasManifest}, https=${isHTTPS}`)
        return false
      }
    }

    // Handle beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('PWA: beforeinstallprompt event fired! 🎉')
      console.log('PWA: Event details:', e)
      
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      
      // Stash the event so it can be triggered later
      const promptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)
      setShowButton(true)
      setDebugInfo('Install prompt captured! Click to install.')
      
      console.log('PWA: Install prompt captured and stored')
    }

    // Handle appinstalled event
    const handleAppInstalled = () => {
      console.log('PWA: App was installed')
      setIsInstalled(true)
      setShowButton(false)
      setDeferredPrompt(null)
      setDebugInfo('App installed successfully!')
    }

    // Initial checks
    if (!checkIfInstalled()) {
      checkPWACriteria()
    }

    // Add event listeners
    console.log('PWA: Adding event listeners...')
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Debug: Check if events are being captured
    setTimeout(() => {
      console.log('PWA: 3 seconds later - checking state:', {
        showButton,
        deferredPrompt: !!deferredPrompt,
        debugInfo
      })
    }, 3000)

    // Cleanup
    return () => {
      console.log('PWA: Cleaning up event listeners')
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    console.log('PWA: Install button clicked')
    console.log('PWA: Current state:', {
      deferredPrompt: !!deferredPrompt,
      showButton,
      debugInfo
    })
    
    if (!deferredPrompt) {
      console.log('PWA: No install prompt available, showing manual instructions')
      setDebugInfo('No install prompt - showing manual instructions')
      showManualInstallInstructions()
      return
    }

    try {
      console.log('PWA: Triggering install prompt')
      setDebugInfo('Triggering install prompt...')
      
      // Show the install prompt
      deferredPrompt.prompt()
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice
      console.log('PWA: User choice:', outcome)
      
      if (outcome === 'accepted') {
        console.log('PWA: User accepted install')
        setDeferredPrompt(null)
        setShowButton(false)
        setDebugInfo('Install accepted!')
      } else {
        console.log('PWA: User dismissed install')
        setDebugInfo('Install dismissed - try again')
        // Keep the button visible so they can try again
      }
    } catch (error) {
      console.error('PWA: Install error:', error)
      setDebugInfo('Install error - showing manual instructions')
      showManualInstallInstructions()
    }
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

  // Don't show if already installed
  if (isInstalled) {
    return null
  }

  // Don't show if criteria not met
  if (!showButton) {
    return null
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        onClick={handleInstallClick}
        size="sm"
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        Install App
      </Button>
      {debugInfo && (
        <div className="text-xs text-gray-500 text-center max-w-32">
          {debugInfo}
        </div>
      )}
    </div>
  )
}
