import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EventCard } from '@/components/events/EventCard'
import { EventForm } from '@/components/events/EventForm'
import { Calendar } from '@/components/events/Calendar'
import { EventRegistrationCard } from '@/components/events/EventRegistrationCard'
import { EventDetailsModal } from '@/components/events/EventDetailsModal'
import { churchIcons } from '@/lib/icons'
import { getAllEvents, deleteEvent, searchEvents, getEventStats } from '@/lib/api/events'
import { getUserRole } from '@/lib/clerk'
import type { ChurchEvent } from '@/lib/db/schema'


interface EventStats {
  totalEvents: number
  upcomingEvents: number
  thisWeekEvents: number
  eventsByType: Record<string, number>
}

export default function Events() {
  const { user } = useUser()
  const [events, setEvents] = useState<ChurchEvent[]>([])
  const [stats, setStats] = useState<EventStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string>('')
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('')
  const [eventTypeFilter, setEventTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'registrations'>('list')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<ChurchEvent | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<ChurchEvent | null>(null)
  const [showEventDetails, setShowEventDetails] = useState(false)
  
  // User permissions
  const canManageEvents = userRole === 'admin' || userRole === 'pastor' || userRole === 'leader'
  
  // Load user role
  useEffect(() => {
    if (user?.publicMetadata) {
      const role = getUserRole(user.publicMetadata)
      setUserRole(role)
      console.log('Events Debug:', {
        user: user?.id,
        publicMetadata: user?.publicMetadata,
        userRole: role,
        canManageEvents: role === 'admin' || role === 'pastor' || role === 'leader'
      })
    }
  }, [user])

  const loadEvents = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Determine date filters based on status
      let startDate: Date | undefined
      let endDate: Date | undefined
      
      if (statusFilter === 'upcoming') {
        startDate = new Date()
      } else if (statusFilter === 'past') {
        endDate = new Date()
      }

      const result = await getAllEvents(
        eventTypeFilter !== 'all' ? eventTypeFilter : undefined,
        statusFilter !== 'all' && statusFilter !== 'upcoming' && statusFilter !== 'past' ? statusFilter : undefined,
        startDate,
        endDate
      )
      
      if (result.ok && result.data) {
        setEvents(result.data)
      } else {
        setError(result.error || 'Failed to load events')
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Error loading events:', err)
    } finally {
      setLoading(false)
    }
  }, [eventTypeFilter, statusFilter])

  const loadStats = useCallback(async () => {
    try {
      const result = await getEventStats()
      if (result.ok && result.data) {
        setStats(result.data)
      }
    } catch (err) {
      console.error('Error loading event stats:', err)
    }
  }, [])

  // Load events on component mount and filter changes
  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  // Load stats on component mount
  useEffect(() => {
    loadStats()
  }, [loadStats])

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim()) {
      const searchEventsAsync = async () => {
        try {
          const result = await searchEvents(searchQuery)
          if (result.ok && result.data) {
            setEvents(result.data)
          }
        } catch (err) {
          console.error('Error searching events:', err)
        }
      }
      
      const debounceTimer = setTimeout(searchEventsAsync, 300)
      return () => clearTimeout(debounceTimer)
    } else {
      loadEvents()
    }
  }, [searchQuery, loadEvents])

  const handleFormSuccess = () => {
    setShowAddForm(false)
    setEditingEvent(null)
    loadEvents()
    loadStats()
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return
    }

    try {
      const result = await deleteEvent(eventId)
      if (result.ok) {
        loadEvents()
        loadStats()
      } else {
        alert(result.error || 'Failed to delete event')
      }
    } catch (err) {
      alert('An unexpected error occurred while deleting the event')
      console.error('Error deleting event:', err)
    }
  }

  const handleEventClick = (event: ChurchEvent) => {
    setSelectedEvent(event)
    setShowEventDetails(true)
  }

  const handleDateClick = () => {
    if (canManageEvents) {
      // Pre-fill the form with the selected date
      setShowAddForm(true)
    }
  }

  // Filter events for display
  const filteredEvents = events.filter(event => {
    const now = new Date()
    const eventDate = new Date(event.startDate)
    
    if (statusFilter === 'upcoming') {
      return eventDate > now && event.status === 'scheduled'
    } else if (statusFilter === 'past') {
      return eventDate < now
    }
    
    return true
  })

  if (showAddForm || editingEvent) {
    return (
      <div className="container mx-auto py-6 px-4">
        <EventForm
          event={editingEvent || undefined}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowAddForm(false)
            setEditingEvent(null)
          }}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events & Calendar</h1>
          <p className="text-muted-foreground">
            Manage church events, services, and activities
          </p>
        </div>
        
        {canManageEvents && (
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-church-burgundy-600 hover:bg-church-burgundy-700"
          >
            <churchIcons.add className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats ? (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                <churchIcons.events className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalEvents}</div>
                <p className="text-xs text-muted-foreground">
                  All events in database
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
                <churchIcons.trending className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
                <p className="text-xs text-muted-foreground">
                  Scheduled future events
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Week</CardTitle>
                <churchIcons.calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.thisWeekEvents}</div>
                <p className="text-xs text-muted-foreground">
                  Events in next 7 days
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Most Common</CardTitle>
                <churchIcons.chart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Object.entries(stats.eventsByType || {}).sort(([,a], [,b]) => b - a)[0]?.[0]?.replace('-', ' ') || 'None'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Most frequent event type
                </p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Loading Skeleton */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="animate-pulse rounded-md bg-muted h-4 w-24" />
                <div className="animate-pulse rounded-md bg-muted h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="animate-pulse rounded-md bg-muted h-8 w-16 mb-2" />
                <div className="animate-pulse rounded-md bg-muted h-3 w-20" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="animate-pulse rounded-md bg-muted h-4 w-24" />
                <div className="animate-pulse rounded-md bg-muted h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="animate-pulse rounded-md bg-muted h-8 w-16 mb-2" />
                <div className="animate-pulse rounded-md bg-muted h-3 w-20" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="animate-pulse rounded-md bg-muted h-4 w-24" />
                <div className="animate-pulse rounded-md bg-muted h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="animate-pulse rounded-md bg-muted h-8 w-16 mb-2" />
                <div className="animate-pulse rounded-md bg-muted h-3 w-20" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="animate-pulse rounded-md bg-muted h-4 w-24" />
                <div className="animate-pulse rounded-md bg-muted h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="animate-pulse rounded-md bg-muted h-8 w-16 mb-2" />
                <div className="animate-pulse rounded-md bg-muted h-3 w-20" />
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Find Events</CardTitle>
          <CardDescription>Search and filter church events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <churchIcons.search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="service">Services</SelectItem>
                <SelectItem value="bible-study">Bible Studies</SelectItem>
                <SelectItem value="prayer-meeting">Prayer Meetings</SelectItem>
                <SelectItem value="outreach">Outreach</SelectItem>
                <SelectItem value="fellowship">Fellowship</SelectItem>
                <SelectItem value="conference">Conferences</SelectItem>
                <SelectItem value="special">Special Events</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="past">Past</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="postponed">Postponed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* View Toggle */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'list' | 'calendar' | 'registrations')}>
        <TabsList>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <churchIcons.members className="h-4 w-4" />
            List View
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <churchIcons.calendar className="h-4 w-4" />
            Calendar View
          </TabsTrigger>
          {canManageEvents && (
            <TabsTrigger value="registrations" className="flex items-center gap-2">
              <churchIcons.attendance className="h-4 w-4" />
              Registrations
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <churchIcons.alertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <churchIcons.events className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No events found</h3>
                <p className="text-gray-600 text-center mb-4">
                  {searchQuery ? 
                    'No events match your search criteria. Try adjusting your filters.' :
                    'No events have been created yet.'
                  }
                </p>
                {canManageEvents && (
                  <Button
                    onClick={() => setShowAddForm(true)}
                    className="bg-church-burgundy-600 hover:bg-church-burgundy-700"
                  >
                    <churchIcons.add className="mr-2 h-4 w-4" />
                    Create Your First Event
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onEdit={canManageEvents ? setEditingEvent : undefined}
                  onDelete={canManageEvents ? handleDeleteEvent : undefined}
                  onViewDetails={() => handleEventClick(event)}
                  showActions={true}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar">
          <Calendar
            events={filteredEvents}
            onEventClick={handleEventClick}
            onDateClick={handleDateClick}
          />
        </TabsContent>

        <TabsContent value="registrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Registrations</CardTitle>
              <CardDescription>
                Manage event registrations and waitlists
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Filter events that require registration */}
                {filteredEvents.filter(event => event.requiresRegistration).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <churchIcons.events className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No Registration Events</h3>
                    <p>No events currently require registration.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {filteredEvents
                      .filter(event => event.requiresRegistration)
                      .map((event) => (
                        <EventRegistrationCard 
                          key={event.id} 
                          event={event} 
                        />
                      ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Event Details Modal */}
      <EventDetailsModal 
        event={selectedEvent}
        open={showEventDetails}
        onOpenChange={setShowEventDetails}
      />
    </div>
  )
}
