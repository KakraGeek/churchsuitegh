import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { churchIcons } from '@/lib/icons'
import { createChild } from '@/lib/api/children'
import type { NewChild } from '@/lib/db/schema'

interface ChildRegistrationFormProps {
  onSuccess?: (childId: string) => void
  onCancel?: () => void
}

interface FormData {
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: 'male' | 'female' | 'other'
  medicalNotes: string
  emergencyNotes: string
}

export function ChildRegistrationForm({ onSuccess, onCancel }: ChildRegistrationFormProps) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'male',
    medicalNotes: '',
    emergencyNotes: ''
  })

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = (): string | null => {
    if (!formData.firstName?.trim()) return 'First name is required'
    if (!formData.lastName?.trim()) return 'Last name is required'
    if (!formData.dateOfBirth) return 'Date of birth is required'
    if (!formData.gender) return 'Gender is required'
    
    // Validate date of birth (child must be under 18)
    const birthDate = new Date(formData.dateOfBirth)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (age > 18 || (age === 18 && monthDiff > 0)) {
      return 'Child must be under 18 years old'
    }
    
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validateForm()
    if (validationError) {
      setMessage({ type: 'error', text: validationError })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      // Convert date string to Date object
      const childData: NewChild = {
        ...formData,
        dateOfBirth: new Date(formData.dateOfBirth!),
      } as NewChild

      const result = await createChild(childData)
      
      if (result.ok && result.data) {
        setMessage({ 
          type: 'success', 
          text: `Child ${result.data.firstName} ${result.data.lastName} registered successfully!` 
        })
        
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          gender: 'male',
          medicalNotes: '',
          emergencyNotes: ''
        })
        
        if (onSuccess) {
          onSuccess(result.data.id)
        }
      } else {
        setMessage({ 
          type: 'error', 
          text: result.error || 'Failed to register child' 
        })
      }
    } catch (err) {
      console.error('Error registering child:', err)
      setMessage({ 
        type: 'error', 
        text: 'An unexpected error occurred' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <churchIcons.children className="h-5 w-5" />
          Register New Child
        </CardTitle>
        <CardDescription>
          Register a child for secure check-in and check-out services
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Enter first name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Enter last name"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth || ''}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select 
                value={formData.gender} 
                onValueChange={(value) => handleInputChange('gender', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Medical & Emergency Information */}
          <div className="space-y-2">
            <Label htmlFor="medicalNotes">Medical Notes</Label>
            <Textarea
              id="medicalNotes"
              value={formData.medicalNotes || ''}
              onChange={(e) => handleInputChange('medicalNotes', e.target.value)}
              placeholder="Allergies, medical conditions, special needs, medications..."
              rows={3}
            />
            <p className="text-sm text-muted-foreground">
              Important medical information for emergency situations
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyNotes">Emergency Instructions</Label>
            <Textarea
              id="emergencyNotes"
              value={formData.emergencyNotes || ''}
              onChange={(e) => handleInputChange('emergencyNotes', e.target.value)}
              placeholder="Special instructions for emergencies, contact preferences..."
              rows={3}
            />
            <p className="text-sm text-muted-foreground">
              Additional instructions for emergency situations
            </p>
          </div>

          {/* Message Display */}
          {message && (
            <Alert className={message.type === 'error' ? 'border-destructive' : 'border-green-500'}>
              <AlertDescription className={message.type === 'error' ? 'text-destructive' : 'text-green-700'}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
            
            <Button 
              type="submit" 
              disabled={loading}
              className="min-w-[120px]"
            >
              {loading ? (
                <>
                  <churchIcons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <churchIcons.userPlus className="mr-2 h-4 w-4" />
                  Register Child
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
