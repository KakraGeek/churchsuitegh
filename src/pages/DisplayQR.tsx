import { useState, useEffect } from 'react'
import QRCode from 'react-qr-code'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { churchIcons } from '@/lib/icons'
import { getDisplayQRCodes } from '@/lib/api/attendance'
import type { AttendanceQRCode, ChurchEvent } from '@/lib/db/schema'

export default function DisplayQR() {
  const [qrCodes, setQRCodes] = useState<(AttendanceQRCode & { event?: ChurchEvent })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Load active QR codes for display
  const loadDisplayQRCodes = async () => {
    try {
      const result = await getDisplayQRCodes()
      if (result.ok && result.data) {
        setQRCodes(result.data)
        setError(null)
      } else {
        setError('Failed to load QR codes')
      }
    } catch (err) {
      console.error('Error loading display QR codes:', err)
      setError('Unable to connect to server')
    } finally {
      setLoading(false)
    }
  }

  // Auto-refresh QR codes every 30 seconds
  useEffect(() => {
    loadDisplayQRCodes()
    const interval = setInterval(loadDisplayQRCodes, 30000)
    return () => clearInterval(interval)
  }, [])

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatServiceType = (serviceType: string) => {
    return serviceType.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-church-burgundy-50 to-church-bronze-50 flex items-center justify-center p-8">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-12 text-center">
            <churchIcons.loader className="mx-auto h-12 w-12 animate-spin text-church-burgundy-600 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Loading Check-In</h2>
            <p className="text-muted-foreground">Preparing QR codes for service...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-8">
        <Card className="w-full max-w-2xl border-red-200">
          <CardContent className="p-12 text-center">
            <churchIcons.alertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-2xl font-semibold text-red-700 mb-2">Connection Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={loadDisplayQRCodes}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (qrCodes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-church-burgundy-50 to-church-bronze-50 flex items-center justify-center p-8">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-12 text-center">
            <churchIcons.qrcode className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
            <h2 className="text-3xl font-bold text-church-burgundy-800 mb-4">
              Welcome to ChurchSuite Ghana
            </h2>
            <p className="text-xl text-muted-foreground mb-2">
              No active check-in available
            </p>
            <p className="text-lg text-muted-foreground">
              Please see an usher for assistance
            </p>
            <div className="mt-8 text-center text-muted-foreground">
              <p className="text-lg font-medium">{formatDate(currentTime)}</p>
              <p className="text-2xl font-bold">{formatTime(currentTime)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show the first active QR code (in a real scenario, you might cycle through multiple)
  const activeQR = qrCodes[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-church-burgundy-50 to-church-bronze-50 flex items-center justify-center p-8">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/brand/logo.png" 
              alt="ChurchSuite Ghana Logo" 
              className="h-20 w-20 object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-church-burgundy-800 mb-2">
            Welcome to ChurchSuite Ghana
          </h1>
          <p className="text-xl text-muted-foreground">
            Scan the QR code below to check in
          </p>
        </div>

        {/* Main QR Code Display */}
        <Card className="border-2 border-church-burgundy-200 shadow-2xl">
          <CardHeader className="text-center bg-church-burgundy-600 text-white">
            <CardTitle className="text-2xl flex items-center justify-center gap-3">
              <churchIcons.qrcode className="h-8 w-8" />
              {formatServiceType(activeQR.serviceType)}
            </CardTitle>
            <div className="flex items-center justify-center gap-4 text-church-burgundy-100">
              <span className="flex items-center gap-1">
                <churchIcons.calendar className="h-4 w-4" />
                {new Date(activeQR.serviceDate).toLocaleDateString()}
              </span>
              {activeQR.location && (
                <span className="flex items-center gap-1">
                  <churchIcons.qrcode className="h-4 w-4" />
                  {activeQR.location}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-12">
            <div className="flex flex-col items-center space-y-8">
              {/* QR Code */}
              <div className="bg-white p-8 rounded-2xl shadow-lg border-4 border-church-bronze-200">
                <QRCode
                  value={activeQR.qrCodeId}
                  size={300}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  viewBox="0 0 256 256"
                />
              </div>

              {/* Instructions */}
              <div className="text-center space-y-4 max-w-2xl">
                <h3 className="text-2xl font-semibold text-church-burgundy-800">
                  How to Check In
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-church-burgundy-100 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-xl font-bold text-church-burgundy-600">1</span>
                    </div>
                    <p className="font-medium">Open your camera</p>
                    <p className="text-sm text-muted-foreground">Point your phone camera at the QR code</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-church-burgundy-100 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-xl font-bold text-church-burgundy-600">2</span>
                    </div>
                    <p className="font-medium">Scan the code</p>
                    <p className="text-sm text-muted-foreground">Tap the link that appears on your screen</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-church-burgundy-100 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-xl font-bold text-church-burgundy-600">3</span>
                    </div>
                    <p className="font-medium">Select your name</p>
                    <p className="text-sm text-muted-foreground">Choose your name and confirm check-in</p>
                  </div>
                </div>
              </div>

              {/* QR Code Details */}
              <div className="flex items-center gap-6 text-center">
                <Badge variant="outline" className="text-lg px-4 py-2">
                  QR Code: {activeQR.qrCodeId}
                </Badge>
                {activeQR.event && (
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    Event: {activeQR.event.title}
                  </Badge>
                )}
                <Badge variant="outline" className="text-lg px-4 py-2">
                  Check-ins: {activeQR.currentUses || 0}
                  {activeQR.maxUses ? `/${activeQR.maxUses}` : ''}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer with Time */}
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium">{formatDate(currentTime)}</p>
          <p className="text-3xl font-bold text-church-burgundy-700">{formatTime(currentTime)}</p>
          <p className="text-sm mt-2">Auto-refreshes every 30 seconds</p>
        </div>
      </div>
    </div>
  )
}
