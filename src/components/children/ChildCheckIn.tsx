import { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { churchIcons } from '@/lib/icons'
import { checkInChild, checkOutChild, getChild } from '@/lib/api/children'
import type { Child, ChildCheckIn } from '@/lib/db/schema'

interface ChildCheckInProps {
  onCheckInSuccess?: (message: string) => void
  onCheckOutSuccess?: (message: string) => void
}

export function ChildCheckIn({ onCheckInSuccess, onCheckOutSuccess }: ChildCheckInProps) {
  const { user } = useUser()
  const [qrCodeInput, setQrCodeInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [currentChild, setCurrentChild] = useState<Child | null>(null)
  const [checkInRecord, setCheckInRecord] = useState<ChildCheckIn | null>(null)


  const validateQRInput = async (qrInput: string) => {
    if (!qrInput.trim()) return


    try {
      // For now, we'll simulate QR validation
      // In a real implementation, you'd validate the QR code format
      if (qrInput.startsWith('CHILD_')) {
        setMessage({
          type: 'success',
          text: 'Valid child QR code detected'
        })
      } else {
        setMessage({
          type: 'error',
          text: 'Invalid QR code format'
        })
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: 'Failed to validate QR code'
      })
    } finally {
      
    }
  }

  // Validate QR code when input changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (qrCodeInput.trim()) {
        validateQRInput(qrCodeInput)
      } else {
        setMessage(null)
        setCurrentChild(null)
        setCheckInRecord(null)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [qrCodeInput])

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!qrCodeInput.trim()) {
      setMessage({ type: 'error', text: 'Please enter a QR code' })
      return
    }

    if (!user?.id) {
      setMessage({ type: 'error', text: 'User not authenticated' })
      return
    }

    setLoading(true)
    try {
      const result = await checkInChild(qrCodeInput.trim(), user.id)
      
      if (result.ok && result.data) {
        const successMessage = `Child checked in successfully at ${new Date(result.data.checkInTime).toLocaleTimeString()}`
        
        setMessage({ type: 'success', text: successMessage })
        setCheckInRecord(result.data)
        
        // Fetch child details
        const childResult = await getChild(result.data.childId)
        if (childResult.ok && childResult.data) {
          setCurrentChild(childResult.data)
        }
        
        if (onCheckInSuccess) {
          onCheckInSuccess(successMessage)
        }
      } else {
        setMessage({ type: 'error', text: result.error || 'Check-in failed' })
      }
    } catch (err) {
      console.error('Error during check-in:', err)
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setLoading(false)
    }
  }

  const handleCheckOut = async () => {
    if (!checkInRecord || !user?.id) return

    setLoading(true)
    try {
      const result = await checkOutChild(checkInRecord.id, user.id)
      
      if (result.ok && result.data) {
        const successMessage = `Child checked out successfully at ${new Date(result.data.checkOutTime!).toLocaleTimeString()}`
        
        setMessage({ type: 'success', text: successMessage })
        setCheckInRecord(null)
        setCurrentChild(null)
        setQrCodeInput('')
        
        if (onCheckOutSuccess) {
          onCheckOutSuccess(successMessage)
        }
      } else {
        setMessage({ type: 'error', text: result.error || 'Check-out failed' })
      }
    } catch (err) {
      console.error('Error during check-out:', err)
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* QR Code Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <churchIcons.qrcode className="h-5 w-5" />
            Child Check-In/Out
          </CardTitle>
          <CardDescription>
            Scan or enter the child's QR code to check them in or out
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleCheckIn} className="space-y-4">
            <div className="space-y-2">
              <Input
                value={qrCodeInput}
                onChange={(e) => setQrCodeInput(e.target.value)}
                placeholder="Enter or scan QR code"
                className="text-center text-lg font-mono"
                disabled={loading}
              />
              <p className="text-sm text-muted-foreground text-center">
                QR codes start with "CHILD_"
              </p>
            </div>

            {message && (
              <Alert className={message.type === 'error' ? 'border-destructive' : 'border-green-500'}>
                <AlertDescription className={message.type === 'error' ? 'text-destructive' : 'text-green-700'}>
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3">
              <Button 
                type="submit" 
                disabled={loading || !qrCodeInput.trim()}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <churchIcons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <churchIcons.userCheck className="mr-2 h-4 w-4" />
                    Check In
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Current Status */}
      {currentChild && checkInRecord && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-800">
            <churchIcons.userCheck className="h-5 w-5" />
            Currently Checked In
          </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Child Information */}
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                                 <churchIcons.user className="h-8 w-8 text-green-600" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold">
                  {currentChild.firstName} {currentChild.lastName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Age: {Math.floor((Date.now() - new Date(currentChild.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))} years old
                </p>
                <div className="flex gap-2 mt-1">
                  <Badge variant="secondary" className="capitalize">
                    {currentChild.gender}
                  </Badge>
                  <Badge variant="outline" className="text-green-700 border-green-300">
                    {checkInRecord.serviceType.replace('-', ' ')}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Check-in Details */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-lg border">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Check-in Time</p>
                <p className="font-semibold">{formatTime(checkInRecord.checkInTime)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Location</p>
                <p className="font-semibold">{checkInRecord.location}</p>
              </div>
            </div>

            {/* Medical Alerts */}
            {currentChild.medicalNotes && (
              <Alert className="border-amber-200 bg-amber-50">
                                 <churchIcons.alertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <strong>Medical Note:</strong> {currentChild.medicalNotes}
                </AlertDescription>
              </Alert>
            )}

            {/* Emergency Instructions */}
            {currentChild.emergencyNotes && (
              <Alert className="border-red-200 bg-red-50">
                                 <churchIcons.alertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Emergency Instructions:</strong> {currentChild.emergencyNotes}
                </AlertDescription>
              </Alert>
            )}

            {/* Check-out Button */}
            <Button 
              onClick={handleCheckOut}
              disabled={loading}
              variant="destructive"
              className="w-full"
            >
              {loading ? (
                <>
                  <churchIcons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Processing Check-out...
                </>
              ) : (
                <>
                  <churchIcons.userX className="mr-2 h-4 w-4" />
                  Check Out Child
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
                     <CardTitle className="flex items-center gap-2 text-blue-800">
             <churchIcons.info className="h-5 w-5" />
             How It Works
           </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-3 text-blue-800">
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold">1</span>
            </div>
            <p>Parent/guardian receives a unique QR code for their child</p>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold">2</span>
            </div>
            <p>Scan or enter the QR code to check the child in</p>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold">3</span>
            </div>
            <p>Use the same QR code to check the child out when leaving</p>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold">4</span>
            </div>
            <p>All actions are logged for security and safety</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
