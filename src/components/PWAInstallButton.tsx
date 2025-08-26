import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<{ outcome: 'accepted' | 'dismissed' }>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Check if running on iOS
    const iOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    setIsIOS(iOS)

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallPrompt(true)
      console.log('PWA: beforeinstallprompt event captured')
    }

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      console.log('PWA: App was installed')
      setIsInstalled(true)
      setShowInstallPrompt(false)
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
    if (!deferredPrompt) return

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
      setShowInstallPrompt(false)
    } catch (error) {
      console.error('PWA: Install error:', error)
    }
  }

  // Don't show anything if already installed
  if (isInstalled) {
    return null
  }

  // Show iOS instructions banner
  if (isIOS && !showInstallPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Install this app</p>
            <p className="text-sm opacity-90">Tap Share → Add to Home Screen</p>
          </div>
          <button 
            onClick={() => setShowInstallPrompt(false)}
            className="text-white opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      </div>
    )
  }

  // Show install button for other browsers
  if (!showInstallPrompt) {
    return null
  }

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
            onClick={() => setShowInstallPrompt(false)}
            className="text-white opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}
