import { useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { updateMemberStatus } from '@/lib/api/members'
import { getUserRole } from '@/lib/clerk'
import type { Member } from '@/lib/db/schema'
import { CheckCircle, XCircle, ArrowRight, X, AlertTriangle, UserPlus, AlertCircle } from '@/lib/icons'
import { cn } from '@/lib/utils'

interface MemberStatusManagerProps {
  member: Member
  onStatusChange?: (updatedMember: Member) => void
  className?: string
}

export function MemberStatusManager({ member, onStatusChange, className }: MemberStatusManagerProps) {
  const { user } = useUser()
  const userRole = getUserRole(user?.publicMetadata || {})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  
  const [newStatus, setNewStatus] = useState(member.status || 'active')
  const [statusReason, setStatusReason] = useState('')

  const canManageStatus = ['admin', 'pastor'].includes(userRole)

  const statusOptions = [
    { value: 'active', label: 'Active', icon: CheckCircle, color: 'bg-green-100 text-green-800 border-green-200' },
    { value: 'inactive', label: 'Inactive', icon: XCircle, color: 'bg-gray-100 text-gray-800 border-gray-200' },
    { value: 'transferred', label: 'Transferred', icon: ArrowRight, color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { value: 'suspended', label: 'Suspended', icon: AlertTriangle, color: 'bg-red-100 text-red-800 border-red-200' },
    { value: 'deceased', label: 'Deceased', icon: X, color: 'bg-purple-100 text-purple-800 border-purple-200' },
    { value: 'visitor', label: 'Visitor', icon: UserPlus, color: 'bg-orange-100 text-orange-800 border-orange-200' },
  ]

  const currentStatusInfo = statusOptions.find(s => s.value === member.status) || statusOptions[0]
  const Icon = currentStatusInfo.icon

  const handleStatusUpdate = async () => {
    if (newStatus === member.status) {
      setShowForm(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await updateMemberStatus(
        member.id,
        newStatus as 'active' | 'inactive' | 'transferred' | 'suspended' | 'deceased' | 'visitor',
        statusReason || undefined,
        user?.id
      )

      if (result.ok && result.data) {
        onStatusChange?.(result.data)
        setShowForm(false)
        setStatusReason('')
      } else {
        setError(result.error || 'Failed to update member status')
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Status update error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!canManageStatus) {
    // Display read-only status for non-admin users
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Icon className="h-4 w-4" />
        <Badge variant="outline" className={currentStatusInfo.color}>
          {currentStatusInfo.label}
        </Badge>
        {member.statusReason && (
          <span className="text-xs text-muted-foreground truncate">
            • {member.statusReason}
          </span>
        )}
      </div>
    )
  }

  if (showForm) {
    return (
      <Card className={cn("w-full max-w-md", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Update Member Status</CardTitle>
          <CardDescription>
            Change status for {member.firstName} {member.lastName}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">New Status</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <option.icon className="h-4 w-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Textarea
              id="reason"
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              placeholder="Reason for status change..."
              rows={2}
            />
          </div>

          {error && (
            <div className="rounded-md bg-destructive/15 border border-destructive/20 p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button 
              onClick={handleStatusUpdate}
              disabled={loading}
              className="bg-church-sky-500 hover:bg-church-sky-600"
            >
              {loading && <LoadingSpinner size="sm" className="mr-2" />}
              Update Status
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => {
                setShowForm(false)
                setNewStatus(member.status || 'active')
                setStatusReason('')
                setError(null)
              }}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowForm(true)}
        className="h-auto p-1 hover:bg-church-sky-50"
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <Badge variant="outline" className={currentStatusInfo.color}>
            {currentStatusInfo.label}
          </Badge>
        </div>
      </Button>
      
      {member.statusReason && (
        <span className="text-xs text-muted-foreground truncate max-w-32">
          • {member.statusReason}
        </span>
      )}
      
      {member.statusChangedAt && (
        <span className="text-xs text-muted-foreground">
          • {new Date(member.statusChangedAt).toLocaleDateString()}
        </span>
      )}
    </div>
  )
}
