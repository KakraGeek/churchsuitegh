import { useState, useEffect } from 'react'

export function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallButton, setShowInstallButton] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isInStandalone, setIsInStandalone] = useState(false)

  useEffect(() => {
    // Check if running on iOS
    const iOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    setIsIOS(iOS)

    // Check if already in standalone mode (installed)
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                     (window.navigator as any).standalone
    setIsInStandalone(standalone)

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallButton(true)
      console.log('PWA: beforeinstallprompt event captured')
    }

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      console.log('PWA: App was installed')
      setShowInstallButton(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Show iOS instructions if no prompt available
      if (isIOS && !isInStandalone) {
        alert('To install this app: Tap Share → Add to Home Screen')
      }
      return
    }

    try {
      // Show the install prompt
      deferredPrompt.prompt()
      
      // Wait for user choice
      const { outcome } = await deferredPrompt.userChoice
      console.log('PWA: User choice:', outcome)
      
      if (outcome === 'accepted') {
        console.log('PWA: User accepted install')
      } else {
        console.log('PWA: User dismissed install')
      }
      
      // Clear the deferred prompt
      setDeferredPrompt(null)
      setShowInstallButton(false)
    } catch (error) {
      console.error('PWA: Install error:', error)
    }
  }

  // Don't show button if already installed or if it's iOS and we're showing instructions
  if (isInStandalone) {
    return null
  }

  // Show iOS instructions banner
  if (isIOS && !isInStandalone) {
    return (
      <div className="fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Install this app</p>
            <p className="text-sm opacity-90">Tap Share → Add to Home Screen</p>
          </div>
          <button 
            onClick={() => setShowInstallButton(false)}
            className="text-white opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      </div>
    )
  }

  // Show install button for other browsers
  if (!showInstallButton) {
    return null
  }

  // For testing: always show install button
  return (
    <div className="fixed bottom-4 left-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Install ChurchSuite</p>
          <p className="text-sm opacity-90">Get the full app experience</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleInstallClick}
            className="bg-white text-green-600 px-4 py-2 rounded font-medium hover:bg-gray-100 transition-colors"
          >
            Install
          </button>
          <button 
            onClick={() => setShowInstallButton(false)}
            className="text-white opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}
