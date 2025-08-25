import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { RotateCcw, X } from '@/lib/icons'

export function PWAUpdateNotification() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg)
        
        // Listen for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setShowUpdatePrompt(true)
              }
            })
          }
        })
      })
    }
  }, [])

  const handleUpdate = () => {
    if (registration && registration.waiting) {
      // Send message to service worker to skip waiting
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      
      // Reload the page to activate the new service worker
      window.location.reload()
    }
  }

  const handleDismiss = () => {
    setShowUpdatePrompt(false)
  }

  if (!showUpdatePrompt) {
    return null
  }

  return (
    <div className="fixed top-4 left-4 right-4 lg:left-auto lg:right-4 lg:w-80 z-50">
      <div className="bg-white border border-blue-200 rounded-lg shadow-lg p-4 animate-in slide-in-from-top-4 duration-300">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-600 rounded-lg flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Update Available</h3>
              <p className="text-xs text-gray-500">A new version is ready</p>
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

        {/* Update Button */}
        <div className="flex gap-2">
          <Button
            onClick={handleUpdate}
            className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white text-sm font-medium py-2"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Update Now
          </Button>
          <Button
            variant="outline"
            onClick={handleDismiss}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Later
          </Button>
        </div>
      </div>
    </div>
  )
}
