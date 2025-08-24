import { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { churchIcons } from '@/lib/icons'
import { getUserRole } from '@/lib/clerk'
import { getMemberByClerkId } from '@/lib/api/members'
import { 
  registerForEvent, 
  unregisterFromEvent, 
  getEventRegistrationStatus,
  getEventRegistrationStats 
} from '@/lib/api/events'
import type { ChurchEvent, EventRegistration } from '@/lib/db/schema'
import { cn } from '@/lib/utils'

interface EventCardProps {
  event: ChurchEvent
  onEdit?: (event: ChurchEvent) => void
  onDelete?: (eventId: string) => void
  onViewDetails?: (eventId: string) => void
  showActions?: boolean
}

const eventTypeColors = {
  service: 'bg-blue-100 text-blue-800 border-blue-200',
  'bible-study': 'bg-green-100 text-green-800 border-green-200',
  'prayer-meeting': 'bg-purple-100 text-purple-800 border-purple-200',
  outreach: 'bg-orange-100 text-orange-800 border-orange-200',
  fellowship: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  conference: 'bg-red-100 text-red-800 border-red-200',
  special: 'bg-pink-100 text-pink-800 border-pink-200',
}

const statusColors = {
  scheduled: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  completed: 'bg-gray-100 text-gray-800 border-gray-200',
  postponed: 'bg-yellow-100 text-yellow-800 border-yellow-200',
}

const eventTypeIcons = {
  service: churchIcons.home,
  'bible-study': churchIcons.alertCircle,
  'prayer-meeting': churchIcons.alertCircle,
  outreach: churchIcons.trending,
  fellowship: churchIcons.members,
  conference: churchIcons.events,
  special: churchIcons.alertCircle,
}

export function EventCard({ event, onEdit, onDelete, onViewDetails, showActions = true }: EventCardProps) {
  const { user } = useUser()
  const userRole = getUserRole(user?.publicMetadata || {})
  const isAdmin = userRole === 'admin' || userRole === 'pastor' || userRole === 'leader'
  
  const [registrationStatus, setRegistrationStatus] = useState<EventRegistration | null>(null)
  const [registrationStats, setRegistrationStats] = useState<{
    totalRegistered: number
    totalWaitlisted: number
    availableSpots: number | null
    maxAttendees: number | null
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [memberId, setMemberId] = useState<string | null>(null)

  const startDate = new Date(event.startDate)
  const endDate = event.endDate ? new Date(event.endDate) : null
  const now = new Date()
  const isUpcoming = startDate > now
  const isPast = startDate < now
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }
  
  const IconComponent = eventTypeIcons[event.eventType as keyof typeof eventTypeIcons] || churchIcons.events

  // Load member ID and registration data
  useEffect(() => {
    const loadMemberData = async () => {
      if (!user?.id) return

      try {
        const memberResult = await getMemberByClerkId(user.id)
        if (memberResult.ok && memberResult.data) {
          setMemberId(memberResult.data.id)
          
          // Load registration status if event requires registration
          if (event.requiresRegistration) {
            const statusResult = await getEventRegistrationStatus(event.id, memberResult.data.id)
            if (statusResult.ok) {
                             setRegistrationStatus(statusResult.data || null)
            }
          }
        }
      } catch (error) {
        console.error('Error loading member data:', error)
      }
    }

    loadMemberData()
  }, [user?.id, event.id, event.requiresRegistration])

  // Load registration stats for events that require registration
  useEffect(() => {
    const loadRegistrationStats = async () => {
      if (event.requiresRegistration) {
        try {
          const statsResult = await getEventRegistrationStats(event.id)
          if (statsResult.ok) {
            setRegistrationStats(statsResult.data || null)
          }
        } catch (error) {
          console.error('Error loading registration stats:', error)
        }
      }
    }

    loadRegistrationStats()
  }, [event.id, event.requiresRegistration, registrationStatus])

  const handleRegister = async () => {
    if (!memberId || loading) return

    setLoading(true)
    try {
              const result = await registerForEvent(event.id, memberId)
        if (result.ok) {
          setRegistrationStatus(result.data || null)
          // Refresh stats
          const statsResult = await getEventRegistrationStats(event.id)
          if (statsResult.ok) {
            setRegistrationStats(statsResult.data || null)
          }
        } else {
        alert(result.error || 'Failed to register for event')
      }
    } catch (error) {
      console.error('Error registering for event:', error)
      alert('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleUnregister = async () => {
    if (!memberId || loading) return

    const confirmed = confirm('Are you sure you want to unregister from this event?')
    if (!confirmed) return

    setLoading(true)
    try {
      const result = await unregisterFromEvent(event.id, memberId)
      if (result.ok) {
        setRegistrationStatus(null)
        // Refresh stats
        const statsResult = await getEventRegistrationStats(event.id)
        if (statsResult.ok) {
          setRegistrationStats(statsResult.data || null)
        }
      } else {
        alert(result.error || 'Failed to unregister from event')
      }
    } catch (error) {
      console.error('Error unregistering from event:', error)
      alert('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Card className={cn(
      "w-full transition-all hover:shadow-md",
      isPast && "opacity-75",
      event.status === 'cancelled' && "border-red-200 bg-red-50"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 rounded-lg bg-church-burgundy-50 text-church-burgundy-600">
              <IconComponent className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg leading-tight text-gray-900 truncate">
                {event.title}
              </h3>
              {event.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {event.description}
                </p>
              )}
            </div>
          </div>
          
          {showActions && (
            <div className="flex items-center gap-1 ml-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onViewDetails?.(event.id)}
                className="h-8 w-8 p-0 hover:bg-blue-100"
                title="View event details"
              >
                <churchIcons.view className="h-4 w-4 text-blue-600 hover:text-blue-700" />
              </Button>
              {onEdit && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(event)}
                  className="h-8 w-8 p-0"
                >
                  <churchIcons.edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(event.id)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <churchIcons.delete className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Date and Time */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <churchIcons.events className="h-4 w-4 text-gray-500" />
              <span className="font-medium">{formatDate(startDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <churchIcons.alertCircle className="h-4 w-4 text-gray-500" />
              <span>
                {formatTime(startDate)}
                {endDate && ` - ${formatTime(endDate)}`}
              </span>
            </div>
          </div>
          
          {/* Location */}
          {event.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <churchIcons.alertTriangle className="h-4 w-4 text-gray-500" />
              <span>{event.location}</span>
            </div>
          )}
          
          {/* Attendees */}
          {event.maxAttendees && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <churchIcons.members className="h-4 w-4 text-gray-500" />
              <span>
                {event.currentAttendees}/{event.maxAttendees} attendees
              </span>
              <div className="flex-1 bg-gray-200 rounded-full h-2 ml-2">
                <div 
                  className="bg-church-burgundy-500 h-2 rounded-full transition-all"
                  style={{ 
                    width: `${Math.min(((event.currentAttendees || 0) / event.maxAttendees) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>
          )}
          
          {/* Cost */}
          {(event.cost || 0) > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <churchIcons.giving className="h-4 w-4 text-gray-500" />
              <span>₵{((event.cost || 0) / 100).toFixed(2)}</span>
            </div>
          )}
          
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge 
              variant="outline"
              className={cn("text-xs", eventTypeColors[event.eventType as keyof typeof eventTypeColors])}
            >
              {event.eventType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
            
            <Badge 
              variant="outline"
              className={cn("text-xs", statusColors[event.status as keyof typeof statusColors])}
            >
              {(event.status || 'scheduled').charAt(0).toUpperCase() + (event.status || 'scheduled').slice(1)}
            </Badge>
            
            {event.isRecurring && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                {event.recurringPattern ? `Recurring ${event.recurringPattern}` : 'Recurring'}
              </Badge>
            )}
            
            {event.requiresRegistration && (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 font-medium">
                🎫 Registration Required
              </Badge>
            )}
            
            {isUpcoming && (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                Upcoming
              </Badge>
            )}
          </div>

          {/* Registration Section */}
          {event.requiresRegistration && isUpcoming && (
            <div className="pt-3 border-t space-y-3">
              <div className="flex items-center gap-2">
                <churchIcons.attendance className="h-4 w-4 text-green-600" />
                <h4 className="font-medium text-green-700">Event Registration</h4>
              </div>
              {/* Registration Stats */}
              {registrationStats && (
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>
                    {registrationStats.totalRegistered} registered
                    {registrationStats.maxAttendees && ` of ${registrationStats.maxAttendees}`}
                  </span>
                  {registrationStats.availableSpots !== null && (
                    <span className={cn(
                      "font-medium",
                      registrationStats.availableSpots === 0 ? "text-red-600" : "text-green-600"
                    )}>
                      {registrationStats.availableSpots === 0 
                        ? "Event Full" 
                        : `${registrationStats.availableSpots} spots left`
                      }
                    </span>
                  )}
                  {registrationStats.totalWaitlisted > 0 && (
                    <span className="text-orange-600">
                      {registrationStats.totalWaitlisted} waitlisted
                    </span>
                  )}
                </div>
              )}

              {/* Registration Action */}
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <div className="w-full text-center p-2 bg-blue-50 rounded text-sm text-blue-700">
                    <churchIcons.user className="h-4 w-4 mx-auto mb-1" />
                    <div>Admin View - Registration Available to Members</div>
                    <div className="text-xs text-blue-600 mt-1">
                      Switch to member role to test registration
                    </div>
                  </div>
                ) : registrationStatus ? (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <churchIcons.check className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">
                        {registrationStatus.status === 'waitlisted' 
                          ? `Waitlisted (#${registrationStatus.waitlistPosition})`
                          : 'Registered'
                        }
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleUnregister}
                      disabled={loading}
                      className="h-7 text-xs"
                    >
                      {loading ? (
                        <churchIcons.spinner className="h-3 w-3 animate-spin" />
                      ) : (
                        'Unregister'
                      )}
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleRegister}
                    disabled={loading || !memberId}
                    className="w-full h-8 bg-green-600 hover:bg-green-700"
                  >
                    {loading ? (
                      <churchIcons.spinner className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <churchIcons.add className="h-4 w-4 mr-2" />
                    )}
                    {registrationStats?.availableSpots === 0 ? '🎫 Join Waitlist' : '🎫 Register Now'}
                  </Button>
                )}
              </div>

              {registrationStatus?.notes && (
                <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  <strong>Note:</strong> {registrationStatus.notes}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
