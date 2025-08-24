import { useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { createMember, updateMember } from '@/lib/api/members'
import type { Member, NewMember } from '@/lib/db/schema'
import { cn } from '@/lib/utils'

interface MemberFormProps {
  member?: Member
  onSuccess?: (member: Member) => void
  onCancel?: () => void
  className?: string
}

export function MemberForm({ member, onSuccess, onCancel, className }: MemberFormProps) {
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    firstName: member?.firstName || '',
    lastName: member?.lastName || '',
    email: member?.email || user?.emailAddresses[0]?.emailAddress || '',
    phone: member?.phone || '',
    dateOfBirth: member?.dateOfBirth ? new Date(member.dateOfBirth).toISOString().split('T')[0] : '',
    address: member?.address || '',
    emergencyContact: member?.emergencyContact || '',
    role: member?.role || 'member',
    status: member?.status || 'active',
    department: member?.department || '',
    notes: member?.notes || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const memberData: NewMember = {
        ...formData,
        clerkUserId: member?.clerkUserId || user?.id || '',
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : null,
        membershipDate: member?.membershipDate || new Date(),
        status: formData.status as 'active' | 'inactive' | 'transferred' | 'suspended' | 'deceased' | 'visitor',
        role: formData.role as 'admin' | 'pastor' | 'leader' | 'member' | 'visitor',
      }

      const result = member 
        ? await updateMember(member.id, memberData)
        : await createMember(memberData)

      if (result.ok && result.data) {
        onSuccess?.(result.data)
      } else {
        setError(result.error || 'Failed to save member information')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Member form error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleSelectChange = (field: keyof typeof formData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Card className={cn("w-full max-w-2xl", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {member ? 'Edit Member Profile' : 'Add New Member'}
        </CardTitle>
        <CardDescription>
          {member 
            ? 'Update member information and church details.'
            : 'Register a new member to your church community.'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <div className="border-b border-church-sky-100 pb-2">
              <h3 className="text-lg font-semibold text-church-sky-700">Personal Information</h3>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange('firstName')}
                  placeholder="Enter first name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange('lastName')}
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  placeholder="member@example.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange('phone')}
                  placeholder="+233 XX XXX XXXX"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange('dateOfBirth')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleInputChange('emergencyContact')}
                  placeholder="Emergency contact person"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={handleInputChange('address')}
                placeholder="Home address"
                rows={2}
              />
            </div>
          </div>

          {/* Church Information */}
          <div className="space-y-4">
            <div className="border-b border-church-gold-100 pb-2">
              <h3 className="text-lg font-semibold text-church-gold-700">Church Information</h3>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="role">Church Role</Label>
                <Select value={formData.role} onValueChange={handleSelectChange('role')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visitor">Visitor</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="leader">Leader</SelectItem>
                    <SelectItem value="pastor">Pastor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="department">Department/Ministry</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={handleInputChange('department')}
                  placeholder="e.g., Youth, Music, Ushering"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={handleInputChange('notes')}
                placeholder="Any additional information about this member"
                rows={3}
              />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="rounded-md bg-destructive/15 border border-destructive/20 p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-church-sky-500 hover:bg-church-sky-600"
            >
              {loading && <LoadingSpinner size="sm" className="mr-2" />}
              {member ? 'Update Member' : 'Add Member'}
            </Button>
            
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
