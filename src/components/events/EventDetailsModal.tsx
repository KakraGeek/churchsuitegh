import { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { churchIcons } from '@/lib/icons'
import { getUserRole } from '@/lib/clerk'
import { getEventRegistrationStats, getEventRegistrations } from '@/lib/api/events'
import type { ChurchEvent, EventRegistration, Member } from '@/lib/db/schema'
import { cn } from '@/lib/utils'

interface EventDetailsModalProps {
  event: ChurchEvent | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EventDetailsModal({ event, open, onOpenChange }: EventDetailsModalProps) {
  const { user } = useUser()
  const userRole = getUserRole(user?.publicMetadata || {})
  const isAdmin = userRole === 'admin' || userRole === 'pastor' || userRole === 'leader'

  const [registrationStats, setRegistrationStats] = useState<{
    totalRegistered: number
    totalWaitlisted: number
    availableSpots: number | null
    maxAttendees: number | null
  } | null>(null)
  
  const [registrations, setRegistrations] = useState<(EventRegistration & { member: Member })[]>([])


  useEffect(() => {
    if (event?.requiresRegistration && open) {
      loadRegistrationData()
    }
  }, [event?.id, event?.requiresRegistration, open])

  const loadRegistrationData = async () => {
    if (!event) return
    

    try {
      const [statsResult, registrationsResult] = await Promise.all([
        getEventRegistrationStats(event.id),
        isAdmin ? getEventRegistrations(event.id) : Promise.resolve({ ok: true, data: [] })
      ])

      if (statsResult.ok) {
        setRegistrationStats(statsResult.data || null)
      }

      if (registrationsResult.ok && isAdmin) {
        setRegistrations(registrationsResult.data || [])
      }
    } catch (error) {
      console.error('Error loading registration data:', error)
    }
  }

  if (!event) return null

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const isUpcoming = new Date(event.startDate) > new Date()
  const isPast = new Date(event.startDate) < new Date()

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{event.title}</DialogTitle>
          <DialogDescription>
            {formatDate(event.startDate)} at {formatTime(event.startDate)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Badges */}
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

            {isPast && (
              <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200">
                Past Event
              </Badge>
            )}
          </div>

          {/* Event Details */}
          <div className="space-y-4">
            {/* Description */}
            {event.description && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-sm text-gray-600">{event.description}</p>
              </div>
            )}

            {/* Event Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date & Time */}
              <div className="flex items-center gap-3">
                <churchIcons.calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm font-medium">{formatDate(event.startDate)}</div>
                  <div className="text-xs text-gray-600">
                    {formatTime(event.startDate)}
                    {event.endDate && ` - ${formatTime(event.endDate)}`}
                  </div>
                </div>
              </div>

              {/* Location */}
              {event.location && (
                <div className="flex items-center gap-3">
                  <churchIcons.alertTriangle className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium">Location</div>
                    <div className="text-xs text-gray-600">{event.location}</div>
                  </div>
                </div>
              )}

              {/* Cost */}
              {(event.cost || 0) > 0 && (
                <div className="flex items-center gap-3">
                  <churchIcons.giving className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium">Cost</div>
                    <div className="text-xs text-gray-600">₵{((event.cost || 0) / 100).toFixed(2)}</div>
                  </div>
                </div>
              )}

              {/* Capacity */}
              {event.maxAttendees && (
                <div className="flex items-center gap-3">
                  <churchIcons.members className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium">Capacity</div>
                    <div className="text-xs text-gray-600">
                      {event.currentAttendees || 0}/{event.maxAttendees} attendees
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tags */}
            {event.tags && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Tags</h3>
                <div className="flex gap-1 flex-wrap">
                  {JSON.parse(event.tags).map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Registration Information */}
          {event.requiresRegistration && registrationStats && (
            <div>
              <Separator />
              <div className="pt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <churchIcons.attendance className="h-4 w-4" />
                  Registration Information
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-700">{registrationStats.totalRegistered}</div>
                    <div className="text-xs text-green-600">Registered</div>
                  </div>
                  
                  {registrationStats.totalWaitlisted > 0 && (
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-lg font-bold text-orange-700">{registrationStats.totalWaitlisted}</div>
                      <div className="text-xs text-orange-600">Waitlisted</div>
                    </div>
                  )}
                  
                  {registrationStats.maxAttendees && (
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-700">{registrationStats.maxAttendees}</div>
                      <div className="text-xs text-blue-600">Capacity</div>
                    </div>
                  )}
                  
                  {registrationStats.availableSpots !== null && (
                    <div className={cn(
                      "text-center p-3 rounded-lg",
                      registrationStats.availableSpots === 0 ? "bg-red-50" : "bg-gray-50"
                    )}>
                      <div className={cn(
                        "text-lg font-bold",
                        registrationStats.availableSpots === 0 ? "text-red-700" : "text-gray-700"
                      )}>
                        {registrationStats.availableSpots}
                      </div>
                      <div className={cn(
                        "text-xs",
                        registrationStats.availableSpots === 0 ? "text-red-600" : "text-gray-600"
                      )}>
                        Available
                      </div>
                    </div>
                  )}
                </div>

                {/* Registration Lists (Admin Only) */}
                {isAdmin && registrations.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Registered Members ({registrations.filter(r => r.status === 'registered').length})</h4>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {registrations
                        .filter(r => r.status === 'registered')
                        .map(registration => (
                          <div key={registration.id} className="text-xs p-2 bg-green-50 rounded flex justify-between">
                            <span>{registration.member.firstName} {registration.member.lastName}</span>
                            <span className="text-gray-500">
                              {registration.registrationDate ? new Date(registration.registrationDate).toLocaleDateString() : 'Unknown date'}
                            </span>
                          </div>
                        ))}
                    </div>

                    {registrations.filter(r => r.status === 'waitlisted').length > 0 && (
                      <>
                        <h4 className="text-sm font-medium mt-4">Waitlisted Members ({registrations.filter(r => r.status === 'waitlisted').length})</h4>
                        <div className="max-h-32 overflow-y-auto space-y-1">
                          {registrations
                            .filter(r => r.status === 'waitlisted')
                            .sort((a, b) => (a.waitlistPosition || 0) - (b.waitlistPosition || 0))
                            .map(registration => (
                              <div key={registration.id} className="text-xs p-2 bg-orange-50 rounded flex justify-between">
                                <span>#{registration.waitlistPosition} {registration.member.firstName} {registration.member.lastName}</span>
                                <span className="text-gray-500">
                                  {registration.registrationDate ? new Date(registration.registrationDate).toLocaleDateString() : 'Unknown date'}
                                </span>
                              </div>
                            ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-end pt-4">
            <Button onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
