import { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { churchIcons } from '@/lib/icons'
import { validateQRCode, checkInWithQR } from '@/lib/api/attendance'
import { getAllMembers } from '@/lib/api/members'
import type { Member } from '@/lib/db/schema'

interface QRCheckInProps {
  onCheckInSuccess?: (message: string) => void
}

export function QRCheckIn({ onCheckInSuccess }: QRCheckInProps) {
  const { user } = useUser()
  const [members, setMembers] = useState<Member[]>([])
  const [qrCodeInput, setQrCodeInput] = useState('')
  const [selectedMemberId, setSelectedMemberId] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  // Load members for selection
  useEffect(() => {
    const loadMembers = async () => {
      try {
        const result = await getAllMembers()
        if (result.ok && result.data) {
          setMembers(result.data)
        }
      } catch (err) {
        console.error('Error loading members:', err)
      }
    }

    loadMembers()
  }, [])

  // Auto-select current user if they're a member
  useEffect(() => {
    if (user && members.length > 0) {
      const currentMember = members.find(m => m.clerkUserId === user.id)
      if (currentMember) {
        setSelectedMemberId(currentMember.id)
      }
    }
  }, [user, members])

  const validateQRInput = async (qrInput: string) => {
    if (!qrInput.trim()) return

    setIsValidating(true)
    try {
      const result = await validateQRCode(qrInput.trim())
      if (result.ok && result.data) {
        setMessage({
          type: 'success',
          text: `Valid QR code for ${result.data.serviceType.replace('-', ' ')} on ${new Date(result.data.serviceDate).toLocaleDateString()}`
        })
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Invalid QR code'
        })
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: 'Failed to validate QR code'
      })
    } finally {
      setIsValidating(false)
    }
  }

  // Validate QR code when input changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (qrCodeInput.trim()) {
        validateQRInput(qrCodeInput)
      } else {
        setMessage(null)
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

    if (!selectedMemberId) {
      setMessage({ type: 'error', text: 'Please select a member' })
      return
    }

    setLoading(true)
    try {
      const result = await checkInWithQR(qrCodeInput.trim(), selectedMemberId)
      
      if (result.ok) {
        const member = members.find(m => m.id === selectedMemberId)
        const successMessage = `${member?.firstName} ${member?.lastName} checked in successfully!`
        
        setMessage({ type: 'success', text: successMessage })
        setQrCodeInput('')
        
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



  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <churchIcons.qrcode className="h-5 w-5" />
          QR Code Check-In
        </CardTitle>
        <CardDescription>
          Scan or enter a QR code to check in to a service
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCheckIn} className="space-y-4">
          {/* QR Code Input */}
          <div>
            <label className="text-sm font-medium">QR Code *</label>
            <div className="relative">
              <Input
                type="text"
                placeholder="Scan QR code or enter manually"
                value={qrCodeInput}
                onChange={(e) => setQrCodeInput(e.target.value)}
                disabled={loading}
                className="pr-10"
              />
              {isValidating && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <churchIcons.loader className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          {/* Member Selection */}
          <div>
            <label className="text-sm font-medium">Member *</label>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              disabled={loading}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value="">Select a member</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.firstName} {member.lastName}
                  {member.clerkUserId === user?.id && ' (You)'}
                </option>
              ))}
            </select>
          </div>

          {/* Status Message */}
          {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full"
            disabled={loading || isValidating || !qrCodeInput.trim() || !selectedMemberId}
          >
            {loading ? (
              <>
                <churchIcons.loader className="mr-2 h-4 w-4 animate-spin" />
                Checking In...
              </>
            ) : (
              <>
                <churchIcons.check className="mr-2 h-4 w-4" />
                Check In
              </>
            )}
          </Button>
        </form>

        {/* Quick Info */}
        <div className="mt-6 p-3 bg-muted rounded-lg">
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-1">Quick Check-In Tips:</p>
            <ul className="text-xs space-y-1">
              <li>• Point your camera at the QR code to scan</li>
              <li>• Or type the QR code manually</li>
              <li>• Select the member checking in</li>
              <li>• QR codes are unique to each service</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default QRCheckIn
