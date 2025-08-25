import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

export function PWAInstallButton() {
  const [showButton, setShowButton] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    console.log('PWA: Component mounted, checking install status...')
    
    // Check if already installed
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isInApp = (navigator as any).standalone === true
      
      console.log('PWA: Install check:', { isStandalone, isInApp })
      
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
        console.log('PWA: Criteria met, showing install button')
        setShowButton(true)
        return true
      } else {
        console.log('PWA: Criteria not met')
        setShowButton(false)
        return false
      }
    }

    // Initial checks
    if (!checkIfInstalled()) {
      checkPWACriteria()
    }
  }, [])

  const handleInstallClick = () => {
    console.log('PWA: Install button clicked, attempting universal install...')
    
    const userAgent = navigator.userAgent.toLowerCase()
    
    // Try to trigger install for different browsers
    if (userAgent.includes('chrome') || userAgent.includes('edge')) {
      // Chrome/Edge: Try to show install prompt in address bar
      console.log('PWA: Attempting Chrome/Edge install')
      
      // Method 1: Try to trigger the install prompt by simulating user interaction
      try {
        // Create a temporary button to trigger the install prompt
        const tempButton = document.createElement('button')
        tempButton.style.display = 'none'
        document.body.appendChild(tempButton)
        
        // Try to focus and click to trigger any available install prompts
        tempButton.focus()
        tempButton.click()
        
        // Remove the temporary button
        document.body.removeChild(tempButton)
        
        // Show helpful message
        alert('Chrome/Edge Install:\n\n1. Look for the install icon (📱) in your address bar\n2. Click it and select "Install ChurchSuite"\n\nIf no icon appears, the browser will show it after you interact with the page more.')
        
      } catch (error) {
        console.error('PWA: Chrome/Edge install attempt failed:', error)
        alert('Chrome/Edge Install:\n\n1. Look for the install icon (📱) in your address bar\n2. Click it and select "Install ChurchSuite"\n\nIf no icon appears, try refreshing the page or navigating around.')
      }
      
    } else if (userAgent.includes('safari')) {
      // Safari: Show Add to Home Screen instructions
      console.log('PWA: Showing Safari install instructions')
      alert('Safari Install:\n\n1. Click the Share button (📤)\n2. Select "Add to Home Screen"\n3. Tap "Add"\n\nThis will install ChurchSuite on your home screen.')
      
    } else if (userAgent.includes('firefox')) {
      // Firefox: Try to trigger install
      console.log('PWA: Attempting Firefox install')
      alert('Firefox Install:\n\n1. Click the menu button (☰)\n2. Select "Install App"\n3. Follow the prompts\n\nIf "Install App" is not available, try refreshing the page.')
      
    } else {
      // Generic mobile instructions
      console.log('PWA: Showing generic mobile install instructions')
      alert('Mobile Install:\n\n1. Open browser menu (⋮ or ⋯)\n2. Look for "Add to Home Screen" or "Install"\n3. Follow the prompts\n\nIf no install option appears, try refreshing the page.')
    }
    
    // Additional: Try to trigger any available install prompts
    setTimeout(() => {
      console.log('PWA: Attempting to trigger any available install prompts...')
      
      // Try to trigger the beforeinstallprompt event by simulating page interaction
      // This sometimes helps browsers show the install prompt
      window.dispatchEvent(new Event('beforeinstallprompt'))
      
      // Also try to show any hidden install UI
      const installPrompts = document.querySelectorAll('[data-pwa-install], .pwa-install, [aria-label*="install"]')
      console.log('PWA: Found potential install elements:', installPrompts.length)
      
      if (installPrompts.length > 0) {
        console.log('PWA: Attempting to trigger found install elements')
        installPrompts.forEach((element, index) => {
          try {
            (element as HTMLElement).click()
            console.log(`PWA: Clicked install element ${index}`)
          } catch (error) {
            console.log(`PWA: Could not click install element ${index}:`, error)
          }
        })
      }
    }, 100)
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
