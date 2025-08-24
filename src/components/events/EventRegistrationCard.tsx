import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { churchIcons } from '@/lib/icons'
import { 
  getEventRegistrations, 
  getEventRegistrationStats 
} from '@/lib/api/events'
import type { ChurchEvent, EventRegistration, Member } from '@/lib/db/schema'
import { cn } from '@/lib/utils'

interface EventRegistrationCardProps {
  event: ChurchEvent
}

export function EventRegistrationCard({ event }: EventRegistrationCardProps) {
  const [registrations, setRegistrations] = useState<(EventRegistration & { member: Member })[]>([])
  const [stats, setStats] = useState<{
    totalRegistered: number
    totalWaitlisted: number
    availableSpots: number | null
    maxAttendees: number | null
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [showRegistrations, setShowRegistrations] = useState(false)

  useEffect(() => {
    const loadRegistrationData = async () => {
      setLoading(true)
      try {
        const [registrationsResult, statsResult] = await Promise.all([
          getEventRegistrations(event.id),
          getEventRegistrationStats(event.id)
        ])

        if (registrationsResult.ok) {
          setRegistrations(registrationsResult.data || [])
        }

        if (statsResult.ok) {
          setStats(statsResult.data || null)
        }
      } catch (error) {
        console.error('Error loading registration data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadRegistrationData()
  }, [event.id])

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
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

  const registeredMembers = registrations.filter(reg => reg.status === 'registered')
  const waitlistedMembers = registrations.filter(reg => reg.status === 'waitlisted')

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{event.title}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
              <span>{formatDate(event.startDate)} at {formatTime(event.startDate)}</span>
              {event.location && (
                <span className="flex items-center gap-1">
                  <churchIcons.alertTriangle className="h-3 w-3" />
                  {event.location}
                </span>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRegistrations(!showRegistrations)}
            className="flex items-center gap-2"
          >
            <churchIcons.members className="h-4 w-4" />
            {showRegistrations ? 'Hide' : 'Show'} Registrations
            <churchIcons.chevronDown className={cn(
              "h-4 w-4 transition-transform",
              showRegistrations && "rotate-180"
            )} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Registration Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">{stats.totalRegistered}</div>
              <div className="text-sm text-green-600">Registered</div>
            </div>
            
            {stats.totalWaitlisted > 0 && (
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-700">{stats.totalWaitlisted}</div>
                <div className="text-sm text-orange-600">Waitlisted</div>
              </div>
            )}
            
            {stats.maxAttendees && (
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">{stats.maxAttendees}</div>
                <div className="text-sm text-blue-600">Capacity</div>
              </div>
            )}
            
            {stats.availableSpots !== null && (
              <div className={cn(
                "text-center p-3 rounded-lg",
                stats.availableSpots === 0 ? "bg-red-50" : "bg-gray-50"
              )}>
                <div className={cn(
                  "text-2xl font-bold",
                  stats.availableSpots === 0 ? "text-red-700" : "text-gray-700"
                )}>
                  {stats.availableSpots}
                </div>
                <div className={cn(
                  "text-sm",
                  stats.availableSpots === 0 ? "text-red-600" : "text-gray-600"
                )}>
                  Available
                </div>
              </div>
            )}
          </div>
        )}

        {/* Capacity Bar */}
        {stats?.maxAttendees && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Event Capacity</span>
              <span>{stats.totalRegistered}/{stats.maxAttendees}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={cn(
                  "h-3 rounded-full transition-all",
                  stats.totalRegistered >= stats.maxAttendees ? "bg-red-500" : "bg-green-500"
                )}
                style={{ 
                  width: `${Math.min((stats.totalRegistered / stats.maxAttendees) * 100, 100)}%` 
                }}
              />
            </div>
          </div>
        )}

        {/* Registration Lists */}
        {showRegistrations && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-4">
                <churchIcons.spinner className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-600">Loading registrations...</p>
              </div>
            ) : (
              <>
                {/* Registered Members */}
                {registeredMembers.length > 0 && (
                  <div>
                    <h4 className="font-medium text-green-700 mb-2 flex items-center gap-2">
                      <churchIcons.check className="h-4 w-4" />
                      Registered Members ({registeredMembers.length})
                    </h4>
                    <div className="grid gap-2">
                      {registeredMembers.map((registration) => (
                        <div key={registration.id} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                          <div>
                            <span className="font-medium">
                              {registration.member.firstName} {registration.member.lastName}
                            </span>
                            <span className="text-sm text-gray-600 ml-2">
                              {registration.member.email}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {registration.registrationDate ? new Date(registration.registrationDate).toLocaleDateString() : 'Unknown date'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Waitlisted Members */}
                {waitlistedMembers.length > 0 && (
                  <div>
                    <h4 className="font-medium text-orange-700 mb-2 flex items-center gap-2">
                      <churchIcons.alertCircle className="h-4 w-4" />
                      Waitlisted Members ({waitlistedMembers.length})
                    </h4>
                    <div className="grid gap-2">
                      {waitlistedMembers
                        .sort((a, b) => (a.waitlistPosition || 0) - (b.waitlistPosition || 0))
                        .map((registration) => (
                          <div key={registration.id} className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                            <div>
                              <span className="font-medium">
                                {registration.member.firstName} {registration.member.lastName}
                              </span>
                              <span className="text-sm text-gray-600 ml-2">
                                {registration.member.email}
                              </span>
                              <Badge variant="outline" className="ml-2 text-xs">
                                #{registration.waitlistPosition}
                              </Badge>
                            </div>
                            <div className="text-xs text-gray-500">
                              {registration.registrationDate ? new Date(registration.registrationDate).toLocaleDateString() : 'Unknown date'}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* No Registrations */}
                {registrations.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <churchIcons.members className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No registrations yet</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
