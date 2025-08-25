import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Download, Monitor } from '@/lib/icons'
import { churchIcons } from '@/lib/icons'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
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
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Show install prompt after a short delay to not overwhelm users
      setTimeout(() => {
        if (!checkIfInstalled()) {
          setShowInstallPrompt(true)
        }
      }, 3000)
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
    }

    // Check if already installed
    checkIfInstalled()

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Show install prompt after 5 seconds if not already installed
    const timer = setTimeout(() => {
      if (!checkIfInstalled() && !deferredPrompt) {
        setShowInstallPrompt(true)
      }
    }, 5000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      clearTimeout(timer)
    }
  }, [deferredPrompt])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      // Show the install prompt
      await deferredPrompt.prompt()
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt')
        setIsInstalled(true)
        setShowInstallPrompt(false)
      } else {
        console.log('User dismissed the install prompt')
      }
    } catch (error) {
      console.error('Error showing install prompt:', error)
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    // Don't show again for this session
    sessionStorage.setItem('pwa-prompt-dismissed', 'true')
  }

  // Don't show if already installed or dismissed
  if (isInstalled || !showInstallPrompt || sessionStorage.getItem('pwa-prompt-dismissed')) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 lg:left-auto lg:right-4 lg:w-80 z-50">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Install ChurchSuite</h3>
              <p className="text-xs text-gray-500">Get the full app experience</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Benefits */}
        <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
              <churchIcons.smartphone className="w-4 h-4 text-blue-500" />
              <span>Access from home screen</span>
            </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Monitor className="w-4 h-4 text-green-500" />
            <span>Works offline</span>
          </div>
        </div>

        {/* Install Button */}
        <div className="flex gap-2">
          <Button
            onClick={handleInstallClick}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-medium py-2"
          >
            <Download className="w-4 h-4 mr-2" />
            Install App
          </Button>
          <Button
            variant="outline"
            onClick={handleDismiss}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Maybe Later
          </Button>
        </div>

        {/* Platform-specific instructions */}
        <div className="mt-3 text-xs text-gray-500 text-center">
          {navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad') ? (
            <p>Tap the share button <span className="font-semibold">↗</span> then "Add to Home Screen"</p>
          ) : navigator.userAgent.includes('Android') ? (
            <p>Tap "Install" when prompted, or use the menu to "Add to Home Screen"</p>
          ) : (
            <p>Click "Install" to add to your desktop</p>
          )}
        </div>
      </div>
    </div>
  )
}
