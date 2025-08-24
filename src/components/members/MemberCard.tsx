import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MemberStatusManager } from './MemberStatusManager'
import { Phone, Mail, MapPin, Calendar, Edit, MoreVertical } from '@/lib/icons'
import type { Member } from '@/lib/db/schema'
import { cn } from '@/lib/utils'

interface MemberCardProps {
  member: Member
  onEdit?: (member: Member) => void
  onView?: (member: Member) => void
  onStatusChange?: (member: Member) => void
  className?: string
}

export function MemberCard({ member, onEdit, onView, onStatusChange, className }: MemberCardProps) {
  const roleColors = {
    admin: 'bg-church-sky-100 text-church-sky-800 border-church-sky-200',
    pastor: 'bg-church-gold-100 text-church-gold-800 border-church-gold-200',
    leader: 'bg-purple-100 text-purple-800 border-purple-200',
    member: 'bg-green-100 text-green-800 border-green-200',
    visitor: 'bg-gray-100 text-gray-800 border-gray-200',
  }

  const formatDate = (date: Date | string | null) => {
    if (!date) return null
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const membershipDuration = () => {
    if (!member.membershipDate) return null
    const start = new Date(member.membershipDate)
    const now = new Date()
    const years = now.getFullYear() - start.getFullYear()
    const months = now.getMonth() - start.getMonth()
    
    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''}`
    } else if (months > 0) {
      return `${months} month${months > 1 ? 's' : ''}`
    } else {
      return 'New member'
    }
  }

  return (
    <Card className={cn(
      "group hover:shadow-lg transition-all duration-200 border-l-4 border-l-church-sky-500",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Member Avatar */}
            <div className="h-12 w-12 rounded-full bg-church-sky-100 flex items-center justify-center">
              <span className="text-sm font-semibold text-church-sky-700">
                {getInitials(member.firstName, member.lastName)}
              </span>
            </div>
            
            {/* Member Info */}
            <div>
              <h3 className="font-semibold text-lg leading-none">
                {member.firstName} {member.lastName}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant="outline" 
                  className={cn("text-xs", roleColors[member.role as keyof typeof roleColors] || roleColors.member)}
                >
                  {member.role ? member.role.charAt(0).toUpperCase() + member.role.slice(1) : 'Member'}
                </Badge>
                {member.department && (
                  <span className="text-xs text-muted-foreground">
                    • {member.department}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit(member)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Contact Information */}
        <div className="space-y-2">
          {member.email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span className="truncate">{member.email}</span>
            </div>
          )}
          
          {member.phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{member.phone}</span>
            </div>
          )}
          
          {member.address && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{member.address}</span>
            </div>
          )}
        </div>

        {/* Status Management */}
        <div className="pt-2 border-t border-border space-y-2">
          <MemberStatusManager 
            member={member} 
            onStatusChange={onStatusChange}
          />
          
          {/* Membership Info */}
          {member.membershipDate && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Joined {formatDate(member.membershipDate)}</span>
              </div>
              <span className="text-xs font-medium text-church-sky-600">
                {membershipDuration()}
              </span>
            </div>
          )}
        </div>

        {/* View Profile Button */}
        {onView && (
          <Button 
            variant="outline" 
            className="w-full mt-3 text-xs"
            onClick={() => onView(member)}
          >
            View Profile
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
