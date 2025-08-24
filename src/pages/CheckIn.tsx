import { useState } from 'react'
import { QRCheckIn } from '@/components/attendance/QRCheckIn'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { churchIcons } from '@/lib/icons'

export default function CheckIn() {
  const [recentCheckIns, setRecentCheckIns] = useState<string[]>([])

  const handleCheckInSuccess = (message: string) => {
    setRecentCheckIns(prev => [message, ...prev.slice(0, 4)]) // Keep last 5 check-ins
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <img 
              src="/brand/logo.png" 
              alt="ChurchSuite Ghana Logo" 
              className="h-16 w-16 object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold">Welcome to ChurchSuite Ghana</h1>
          <p className="text-muted-foreground">
            Check in to today's service or event
          </p>
        </div>

        {/* QR Check-In Component */}
        <QRCheckIn onCheckInSuccess={handleCheckInSuccess} />

        {/* Recent Check-Ins */}
        {recentCheckIns.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <churchIcons.check className="h-5 w-5 text-green-600" />
                Recent Check-Ins
              </CardTitle>
              <CardDescription>
                Successful check-ins from this session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentCheckIns.map((message, index) => (
                  <Alert key={index} className="border-green-200 bg-green-50">
                    <churchIcons.check className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      {message}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <churchIcons.help className="h-5 w-5" />
              Need Help?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm space-y-2">
              <div className="flex items-start gap-3">
                <churchIcons.qrcode className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="font-medium">QR Code Location</p>
                  <p className="text-muted-foreground">Look for QR codes at the entrance, sanctuary, or ask an usher.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <churchIcons.user className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="font-medium">First Time Visitor?</p>
                  <p className="text-muted-foreground">Please see one of our greeters at the welcome desk for assistance.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <churchIcons.phone className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="font-medium">Technical Issues?</p>
                  <p className="text-muted-foreground">Contact our tech team or find an usher for manual check-in.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>ChurchSuite Ghana &copy; 2025</p>
          <p>Powered by faith and technology</p>
        </div>
      </div>
    </div>
  )
}
