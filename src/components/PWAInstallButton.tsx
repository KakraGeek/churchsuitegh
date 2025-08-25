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

  useEffect(() => {
    // Check if already installed
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isInApp = (navigator as any).standalone === true
      
      if (isStandalone || isInApp) {
        console.log('PWA: App is already installed')
        setIsInstalled(true)
        setShowButton(false)
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
        setShowButton(true)
        return true
      }
      return false
    }

    // Handle beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('PWA: beforeinstallprompt event fired')
      e.preventDefault()
      
      const promptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)
      setShowButton(true)
      
      console.log('PWA: Install prompt captured and stored')
    }

    // Handle appinstalled event
    const handleAppInstalled = () => {
      console.log('PWA: App was installed')
      setIsInstalled(true)
      setShowButton(false)
      setDeferredPrompt(null)
    }

    // Initial checks
    if (!checkIfInstalled()) {
      checkPWACriteria()
    }

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log('PWA: No install prompt available, showing manual instructions')
      showManualInstallInstructions()
      return
    }

    try {
      console.log('PWA: Triggering install prompt')
      deferredPrompt.prompt()
      
      const { outcome } = await deferredPrompt.userChoice
      console.log('PWA: User choice:', outcome)
      
      if (outcome === 'accepted') {
        console.log('PWA: User accepted install')
        setDeferredPrompt(null)
        setShowButton(false)
      } else {
        console.log('PWA: User dismissed install')
        // Keep the button visible so they can try again
      }
    } catch (error) {
      console.error('PWA: Install error:', error)
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
    <Button
      onClick={handleInstallClick}
      size="sm"
      className="bg-blue-600 hover:bg-blue-700 text-white"
    >
      Install App
    </Button>
  )
}
