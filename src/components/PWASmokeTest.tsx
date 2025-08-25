import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, AlertCircle, Download, Info } from '@/lib/icons'

interface PWATestResult {
  name: string
  status: 'pass' | 'fail' | 'warning'
  message: string
  details?: string
}

export function PWASmokeTest() {
  const [testResults, setTestResults] = useState<PWATestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  const runPWATests = async () => {
    setIsRunning(true)
    const results: PWATestResult[] = []

    // Test 1: HTTPS
    const isHTTPS = window.location.protocol === 'https:'
    results.push({
      name: 'HTTPS Protocol',
      status: isHTTPS ? 'pass' : 'fail',
      message: isHTTPS ? 'HTTPS is enabled' : 'HTTPS is required for PWA',
      details: `Protocol: ${window.location.protocol}`
    })

    // Test 2: Manifest Link
    const manifestLink = document.querySelector('link[rel="manifest"]')
    results.push({
      name: 'Manifest Link',
      status: manifestLink ? 'pass' : 'fail',
      message: manifestLink ? 'Manifest link found' : 'Manifest link missing',
      details: manifestLink ? `href: ${(manifestLink as HTMLLinkElement).href}` : 'No <link rel="manifest"> found'
    })

    // Test 3: Manifest Content
    if (manifestLink) {
      try {
        const response = await fetch((manifestLink as HTMLLinkElement).href)
        if (response.ok) {
          const manifest = await response.json()
          const hasName = !!manifest.name
          const hasIcons = !!manifest.icons && manifest.icons.length > 0
          const hasDisplay = !!manifest.display
          
          results.push({
            name: 'Manifest Content',
            status: hasName && hasIcons && hasDisplay ? 'pass' : 'warning',
            message: hasName && hasIcons && hasDisplay ? 'Manifest is valid' : 'Manifest has issues',
            details: `Name: ${hasName ? '✅' : '❌'}, Icons: ${hasIcons ? '✅' : '❌'}, Display: ${hasDisplay ? '✅' : '❌'}`
          })
        } else {
          results.push({
            name: 'Manifest Content',
            status: 'fail',
            message: 'Manifest fetch failed',
            details: `Status: ${response.status} ${response.statusText}`
          })
        }
      } catch (error) {
        results.push({
          name: 'Manifest Content',
          status: 'fail',
          message: 'Manifest fetch error',
          details: `Error: ${error}`
        })
      }
    }

    // Test 4: PWA Icons
    try {
      const [icon192Response, icon512Response] = await Promise.all([
        fetch('/pwa-192x192.png'),
        fetch('/pwa-512x512.png')
      ])
      
      const icon192Ok = icon192Response.ok
      const icon512Ok = icon512Response.ok
      
      results.push({
        name: 'PWA Icons',
        status: icon192Ok && icon512Ok ? 'pass' : 'fail',
        message: icon192Ok && icon512Ok ? 'PWA icons accessible' : 'PWA icons not accessible',
        details: `192x192: ${icon192Ok ? '✅' : '❌'}, 512x512: ${icon512Ok ? '✅' : '❌'}`
      })
    } catch (error) {
      results.push({
        name: 'PWA Icons',
        status: 'fail',
        message: 'PWA icons check failed',
        details: `Error: ${error}`
      })
    }

    // Test 5: Install Prompt
    const hasInstallPrompt = !!deferredPrompt
    results.push({
      name: 'Install Prompt Available',
      status: hasInstallPrompt ? 'pass' : 'warning',
      message: hasInstallPrompt ? 'Install prompt available' : 'Install prompt not available',
      details: hasInstallPrompt ? 'beforeinstallprompt event fired' : 'Waiting for beforeinstallprompt event'
    })

    setTestResults(results)
    setIsRunning(false)
  }

  useEffect(() => {
    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      console.log('PWA: beforeinstallprompt event fired')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      console.log('PWA: Install outcome:', outcome)
      setDeferredPrompt(null)
    } catch (error) {
      console.error('PWA: Install error:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'fail': return <XCircle className="w-4 h-4 text-red-600" />
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-600" />
      default: return <Info className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'bg-green-50 border-green-200'
      case 'fail': return 'bg-red-50 border-red-200'
      case 'warning': return 'bg-yellow-50 border-yellow-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 lg:left-auto lg:right-4 lg:w-96 z-50">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">PWA Smoke Test</h3>
          <div className="flex gap-2">
            <Button
              onClick={runPWATests}
              disabled={isRunning}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isRunning ? 'Running...' : 'Run Tests'}
            </Button>
            {deferredPrompt && (
              <Button
                onClick={handleInstall}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Download className="w-4 h-4 mr-1" />
                Install
              </Button>
            )}
          </div>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${getStatusColor(result.status)}`}
              >
                <div className="flex items-start gap-2">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">{result.name}</div>
                    <div className="text-xs text-gray-600">{result.message}</div>
                    {result.details && (
                      <div className="text-xs text-gray-500 mt-1 font-mono">{result.details}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-3 text-xs text-gray-500">
          Core PWA tests: HTTPS, Manifest, Icons, Install Prompt
        </div>
      </div>
    </div>
  )
}
