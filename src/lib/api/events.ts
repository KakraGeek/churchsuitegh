import { db } from '@/lib/db'
import { events, eventVolunteers, eventRegistrations, members, insertEventSchema, insertEventVolunteerSchema, insertEventRegistrationSchema } from '@/lib/db/schema'
import { eq, gte, lte, and, asc, ilike, or, count, sql } from 'drizzle-orm'
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/lib/utils'
import type { NewChurchEvent, ChurchEvent, NewEventVolunteer, EventVolunteer, EventRegistration, NewEventRegistration, Member } from '@/lib/db/schema'

// Check if we're in development mode without a real database
const isDevelopmentMode = !import.meta.env.VITE_DATABASE_URL

// Mock data for development
let mockEvents: ChurchEvent[] = [
  {
    id: '1',
    title: 'Sunday Morning Service',
    description: 'Join us for worship, prayer, and the Word of God',
    startDate: new Date('2024-01-14T10:00:00'),
    endDate: new Date('2024-01-14T12:00:00'),
    location: 'Main Sanctuary',
    eventType: 'service',
    maxAttendees: 500,
    currentAttendees: 245,
    isPublic: true,
    isRecurring: true,
    recurringPattern: 'weekly',
    recurringEndDate: null,
    requiresRegistration: false,
    cost: 0,
    imageUrl: null,
    tags: '["worship", "sunday", "main-service"]',
    status: 'scheduled',
    createdBy: '1',
    createdAt: new Date('2024-01-01T10:00:00'),
    updatedAt: new Date('2024-01-01T10:00:00'),
  },
  {
    id: '2',
    title: 'Wednesday Bible Study',
    description: 'Deep dive into Scripture with fellowship and discussion',
    startDate: new Date('2024-01-17T19:00:00'),
    endDate: new Date('2024-01-17T21:00:00'),
    location: 'Fellowship Hall',
    eventType: 'bible-study',
    maxAttendees: 80,
    currentAttendees: 42,
    isPublic: true,
    isRecurring: true,
    recurringPattern: 'weekly',
    recurringEndDate: null,
    requiresRegistration: false,
    cost: 0,
    imageUrl: null,
    tags: '["bible-study", "wednesday", "fellowship"]',
    status: 'scheduled',
    createdBy: '1',
    createdAt: new Date('2024-01-01T10:00:00'),
    updatedAt: new Date('2024-01-01T10:00:00'),
  },
  {
    id: '3',
    title: 'Youth Outreach Program',
    description: 'Community service and evangelism in Tema',
    startDate: new Date('2024-12-25T09:00:00'),
    endDate: new Date('2024-12-25T15:00:00'),
    location: 'Tema Community Center',
    eventType: 'outreach',
    maxAttendees: 30,
    currentAttendees: 18,
    isPublic: true,
    isRecurring: false,
    recurringPattern: null,
    recurringEndDate: null,
    requiresRegistration: true,
    cost: 0,
    imageUrl: null,
    tags: '["youth", "outreach", "community", "tema"]',
    status: 'scheduled',
    createdBy: '2',
    createdAt: new Date('2024-01-05T10:00:00'),
    updatedAt: new Date('2024-01-05T10:00:00'),
  }
]

let mockEventVolunteers: EventVolunteer[] = [
  {
    id: '1',
    eventId: '1',
    memberId: '3',
    role: 'Usher',
    status: 'confirmed',
    notes: 'Main entrance assignment',
    createdAt: new Date('2024-01-10T10:00:00'),
  },
  {
    id: '2',
    eventId: '1',
    memberId: '4',
    role: 'Worship Team',
    status: 'confirmed',
    notes: 'Keyboard player',
    createdAt: new Date('2024-01-10T10:00:00'),
  }
]

let nextEventId = 4
let nextVolunteerId = 3

// Mock event registrations for development
let mockEventRegistrations: EventRegistration[] = [
  {
    id: '1',
    eventId: '3', // Youth Outreach Event
    memberId: '1', // John Doe
    status: 'registered',
    registrationDate: new Date('2024-01-20T09:00:00'),
    notes: 'Vegetarian meal preference',
    isWaitlisted: false,
    waitlistPosition: null,
    notificationsSent: true,
    cancellationReason: null,
    cancelledAt: null,
    createdAt: new Date('2024-01-20T09:00:00'),
    updatedAt: new Date('2024-01-20T09:00:00'),
  },
  {
    id: '2',
    eventId: '3', // Youth Outreach Event
    memberId: '2', // Jane Smith
    status: 'registered',
    registrationDate: new Date('2024-01-21T14:30:00'),
    notes: null,
    isWaitlisted: false,
    waitlistPosition: null,
    notificationsSent: true,
    cancellationReason: null,
    cancelledAt: null,
    createdAt: new Date('2024-01-21T14:30:00'),
    updatedAt: new Date('2024-01-21T14:30:00'),
  },
]

let nextRegistrationId = 3

// Event Type Stats for Dashboard
interface EventStats {
  totalEvents: number
  upcomingEvents: number
  thisWeekEvents: number
  eventsByType: Record<string, number>
}

export async function createEvent(eventData: NewChurchEvent): Promise<ApiResponse<ChurchEvent>> {
  try {
    // Validate the event data
    const validatedData = insertEventSchema.parse(eventData)
    
    if (isDevelopmentMode) {
      // Mock implementation for development
      const newEvent: ChurchEvent = {
        id: nextEventId.toString(),
        title: validatedData.title,
        description: validatedData.description || null,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate || null,
        location: validatedData.location || null,
        eventType: validatedData.eventType,
        maxAttendees: validatedData.maxAttendees || null,
        currentAttendees: validatedData.currentAttendees || 0,
        isPublic: validatedData.isPublic || true,
        isRecurring: validatedData.isRecurring || false,
        recurringPattern: validatedData.recurringPattern || null,
        recurringEndDate: validatedData.recurringEndDate || null,
        requiresRegistration: validatedData.requiresRegistration || false,
        cost: validatedData.cost || 0,
        imageUrl: validatedData.imageUrl || null,
        tags: validatedData.tags || null,
        status: validatedData.status || 'scheduled',
        createdBy: validatedData.createdBy || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      mockEvents.push(newEvent)
      nextEventId++
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500))
      return createSuccessResponse(newEvent)
    }
    
    // Insert into database
    const result = await db
      .insert(events)
      .values(validatedData)
      .returning()
    
    const newEvent = (result as ChurchEvent[])[0]
    
    return createSuccessResponse(newEvent)
  } catch (error) {
    console.error('Error creating event:', error)
    return createErrorResponse('Failed to create event. Please check your information and try again.')
  }
}

export async function getEventById(id: string): Promise<ApiResponse<ChurchEvent>> {
  try {
    if (isDevelopmentMode) {
      // Mock implementation for development
      const event = mockEvents.find(e => e.id === id)
      
      if (!event) {
        return createErrorResponse('Event not found.')
      }
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300))
      return createSuccessResponse(event)
    }

    const result = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1)
    
    const event = (result as ChurchEvent[])[0]
    
    if (!event) {
      return createErrorResponse('Event not found.')
    }
    
    return createSuccessResponse(event)
  } catch (error) {
    console.error('Error fetching event:', error)
    return createErrorResponse('Failed to fetch event details.')
  }
}

export async function getAllEvents(
  eventType?: string,
  status?: string,
  startDate?: Date,
  endDate?: Date
): Promise<ApiResponse<ChurchEvent[]>> {
  try {
    if (isDevelopmentMode) {
      // Mock implementation for development
      let filteredEvents = [...mockEvents]
      
      if (eventType && eventType !== 'all') {
        filteredEvents = filteredEvents.filter(e => e.eventType === eventType)
      }
      
      if (status && status !== 'all') {
        filteredEvents = filteredEvents.filter(e => e.status === status)
      }
      
      if (startDate) {
        filteredEvents = filteredEvents.filter(e => new Date(e.startDate) >= startDate)
      }
      
      if (endDate) {
        filteredEvents = filteredEvents.filter(e => new Date(e.startDate) <= endDate)
      }
      
      // Sort by start date
      const sortedEvents = filteredEvents
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300))
      return createSuccessResponse(sortedEvents)
    }
    
    let eventsResult: ChurchEvent[]
    
    // Build query conditions
    const conditions = []
    
    if (eventType && eventType !== 'all') {
      conditions.push(eq(events.eventType, eventType))
    }
    
    if (status && status !== 'all') {
      conditions.push(eq(events.status, status))
    }
    
    if (startDate) {
      conditions.push(gte(events.startDate, startDate))
    }
    
    if (endDate) {
      conditions.push(lte(events.startDate, endDate))
    }
    
    if (conditions.length > 0) {
      eventsResult = await db
        .select()
        .from(events)
        .where(and(...conditions))
        .orderBy(asc(events.startDate)) as ChurchEvent[]
    } else {
      eventsResult = await db
        .select()
        .from(events)
        .orderBy(asc(events.startDate)) as ChurchEvent[]
    }
    
    return createSuccessResponse(eventsResult)
  } catch (error) {
    console.error('Error fetching events:', error)
    return createErrorResponse('Failed to fetch events list.')
  }
}

export async function updateEvent(id: string, eventData: Partial<NewChurchEvent>): Promise<ApiResponse<ChurchEvent>> {
  try {
    if (isDevelopmentMode) {
      // Mock implementation for development
      const eventIndex = mockEvents.findIndex(e => e.id === id)
      
      if (eventIndex === -1) {
        return createErrorResponse('Event not found.')
      }
      
      const updatedEvent = {
        ...mockEvents[eventIndex],
        ...eventData,
        updatedAt: new Date()
      }
      
      mockEvents[eventIndex] = updatedEvent
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500))
      return createSuccessResponse(updatedEvent)
    }
    
    // Remove fields that shouldn't be updated
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { createdBy: _, createdAt: __, ...updateData } = eventData
    
    const dataWithTimestamp = {
      ...updateData,
      updatedAt: new Date()
    }
    
    const updateResult = await db
      .update(events)
      .set(dataWithTimestamp)
      .where(eq(events.id, id))
      .returning()
    
    const updatedEvent = (updateResult as ChurchEvent[])[0]
    
    if (!updatedEvent) {
      return createErrorResponse('Event not found.')
    }
    
    return createSuccessResponse(updatedEvent)
  } catch (error) {
    console.error('Error updating event:', error)
    return createErrorResponse('Failed to update event.')
  }
}

export async function deleteEvent(id: string): Promise<ApiResponse<{ success: boolean }>> {
  try {
    if (isDevelopmentMode) {
      // Mock implementation for development
      const eventIndex = mockEvents.findIndex(e => e.id === id)
      
      if (eventIndex === -1) {
        return createErrorResponse('Event not found.')
      }
      
      mockEvents.splice(eventIndex, 1)
      
      // Also remove associated volunteers
      mockEventVolunteers = mockEventVolunteers.filter(v => v.eventId !== id)
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300))
      return createSuccessResponse({ success: true })
    }
    
    // Delete associated volunteers first
    await db.delete(eventVolunteers).where(eq(eventVolunteers.eventId, id))
    
    // Delete the event
    const deleteResult = await db
      .delete(events)
      .where(eq(events.id, id))
      .returning()
    
    if (deleteResult.length === 0) {
      return createErrorResponse('Event not found.')
    }
    
    return createSuccessResponse({ success: true })
  } catch (error) {
    console.error('Error deleting event:', error)
    return createErrorResponse('Failed to delete event.')
  }
}

export async function searchEvents(query: string): Promise<ApiResponse<ChurchEvent[]>> {
  try {
    if (isDevelopmentMode) {
      // Mock implementation for development
      const searchTerm = query.toLowerCase()
      const filteredEvents = mockEvents.filter(event =>
        event.title.toLowerCase().includes(searchTerm) ||
        (event.description && event.description.toLowerCase().includes(searchTerm)) ||
        (event.location && event.location.toLowerCase().includes(searchTerm)) ||
        event.eventType.toLowerCase().includes(searchTerm)
      )
      
      const sortedEvents = filteredEvents
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300))
      return createSuccessResponse(sortedEvents)
    }
    
    const searchResult = await db
      .select()
      .from(events)
      .where(
        or(
          ilike(events.title, `%${query}%`),
          ilike(events.description, `%${query}%`),
          ilike(events.location, `%${query}%`),
          ilike(events.eventType, `%${query}%`)
        )
      )
      .orderBy(asc(events.startDate))
    
    const eventsList = searchResult as ChurchEvent[]
    return createSuccessResponse(eventsList)
  } catch (error) {
    console.error('Error searching events:', error)
    return createErrorResponse('Failed to search events.')
  }
}

export async function getEventStats(): Promise<ApiResponse<EventStats>> {
  try {
    if (isDevelopmentMode) {
      // Mock implementation for development
      const now = new Date()
      const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      
      const upcomingEvents = mockEvents.filter(e => 
        new Date(e.startDate) > now && e.status === 'scheduled'
      ).length
      
      const thisWeekEvents = mockEvents.filter(e => 
        new Date(e.startDate) > now && 
        new Date(e.startDate) <= oneWeekFromNow && 
        e.status === 'scheduled'
      ).length
      
      const eventsByType = mockEvents.reduce((acc: Record<string, number>, event: ChurchEvent) => {
        acc[event.eventType] = (acc[event.eventType] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      const stats = {
        totalEvents: mockEvents.length,
        upcomingEvents,
        thisWeekEvents,
        eventsByType
      }
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300))
      return createSuccessResponse(stats)
    }

    // Get all events for statistics
    const allEventsResult = await db
      .select()
      .from(events)
    
    const allEvents = allEventsResult as ChurchEvent[]
    
    const now = new Date()
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    const upcomingEvents = allEvents.filter((e: ChurchEvent) => 
      new Date(e.startDate) > now && e.status === 'scheduled'
    ).length
    
    const thisWeekEvents = allEvents.filter((e: ChurchEvent) => 
      new Date(e.startDate) > now && 
      new Date(e.startDate) <= oneWeekFromNow && 
      e.status === 'scheduled'
    ).length
    
    const eventsByType = allEvents.reduce((acc: Record<string, number>, event: ChurchEvent) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const stats = {
      totalEvents: allEvents.length,
      upcomingEvents,
      thisWeekEvents,
      eventsByType
    }
    
    return createSuccessResponse(stats)
  } catch (error) {
    console.error('Error fetching event stats:', error)
    return createErrorResponse('Failed to fetch event statistics.')
  }
}

// Volunteer Management for Events
export async function addEventVolunteer(volunteerData: NewEventVolunteer): Promise<ApiResponse<EventVolunteer>> {
  try {
    const validatedData = insertEventVolunteerSchema.parse(volunteerData)
    
    if (isDevelopmentMode) {
      const newVolunteer: EventVolunteer = {
        id: nextVolunteerId.toString(),
        eventId: validatedData.eventId,
        memberId: validatedData.memberId,
        role: validatedData.role,
        status: validatedData.status || 'confirmed',
        notes: validatedData.notes || null,
        createdAt: new Date(),
      }
      
      mockEventVolunteers.push(newVolunteer)
      nextVolunteerId++
      
      await new Promise(resolve => setTimeout(resolve, 300))
      return createSuccessResponse(newVolunteer)
    }
    
    const result = await db
      .insert(eventVolunteers)
      .values(validatedData)
      .returning()
    
    const newVolunteer = (result as EventVolunteer[])[0]
    return createSuccessResponse(newVolunteer)
  } catch (error) {
    console.error('Error adding event volunteer:', error)
    return createErrorResponse('Failed to add volunteer to event.')
  }
}

export async function getEventVolunteers(eventId: string): Promise<ApiResponse<EventVolunteer[]>> {
  try {
    if (isDevelopmentMode) {
      const volunteers = mockEventVolunteers.filter(v => v.eventId === eventId)
      
      await new Promise(resolve => setTimeout(resolve, 200))
      return createSuccessResponse(volunteers)
    }
    
    const result = await db
      .select()
      .from(eventVolunteers)
      .where(eq(eventVolunteers.eventId, eventId))
    
    const volunteers = result as EventVolunteer[]
    return createSuccessResponse(volunteers)
  } catch (error) {
    console.error('Error fetching event volunteers:', error)
    return createErrorResponse('Failed to fetch event volunteers.')
  }
}

// Get upcoming events for dashboard (next 3 events)
export async function getUpcomingEvents(limit: number = 3): Promise<ApiResponse<ChurchEvent[]>> {
  try {
    if (isDevelopmentMode) {
      const now = new Date()
      const upcomingEvents = mockEvents
        .filter(event => new Date(event.startDate) > now && event.status === 'scheduled')
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        .slice(0, limit)
      
      await new Promise(resolve => setTimeout(resolve, 200))
      return createSuccessResponse(upcomingEvents)
    }
    
    const now = new Date()
    const result = await db
      .select()
      .from(events)
      .where(and(
        gte(events.startDate, now),
        eq(events.status, 'scheduled')
      ))
      .orderBy(asc(events.startDate))
      .limit(limit)
    
    const upcomingEvents = result as ChurchEvent[]
    return createSuccessResponse(upcomingEvents)
  } catch (error) {
    console.error('Error fetching upcoming events:', error)
    return createErrorResponse('Failed to fetch upcoming events.')
  }
}

// ============================================
// EVENT REGISTRATION FUNCTIONS
// ============================================

/**
 * Register a member for an event
 */
export async function registerForEvent(
  eventId: string, 
  memberId: string, 
  notes?: string
): Promise<ApiResponse<EventRegistration>> {
  try {
    if (isDevelopmentMode) {
      // Check if already registered
      const existingRegistration = mockEventRegistrations.find(
        reg => reg.eventId === eventId && reg.memberId === memberId && reg.status !== 'cancelled'
      )
      
      if (existingRegistration) {
        return createErrorResponse('You are already registered for this event.')
      }

      // Check event capacity
      const event = mockEvents.find(e => e.id === eventId)
      if (!event) {
        return createErrorResponse('Event not found.')
      }

      if (!event.requiresRegistration) {
        return createErrorResponse('This event does not require registration.')
      }

      const currentRegistrations = mockEventRegistrations.filter(
        reg => reg.eventId === eventId && reg.status === 'registered'
      ).length

      const isWaitlisted = event.maxAttendees && currentRegistrations >= event.maxAttendees
      const waitlistPosition = isWaitlisted 
        ? mockEventRegistrations.filter(reg => reg.eventId === eventId && reg.isWaitlisted).length + 1
        : null

      const newRegistration: EventRegistration = {
        id: nextRegistrationId.toString(),
        eventId,
        memberId,
        status: isWaitlisted ? 'waitlisted' : 'registered',
        registrationDate: new Date(),
        notes: notes || null,
        isWaitlisted: Boolean(isWaitlisted),
        waitlistPosition,
        notificationsSent: false,
        cancellationReason: null,
        cancelledAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockEventRegistrations.push(newRegistration)
      nextRegistrationId++

      // Update event current attendees count if not waitlisted
      if (!isWaitlisted) {
        const eventIndex = mockEvents.findIndex(e => e.id === eventId)
        if (eventIndex !== -1) {
          mockEvents[eventIndex].currentAttendees = (mockEvents[eventIndex].currentAttendees || 0) + 1
        }
      }

      await new Promise(resolve => setTimeout(resolve, 200))
      return createSuccessResponse(newRegistration)
    }

    // Database implementation
    const registrationData: NewEventRegistration = {
      eventId,
      memberId,
      notes,
      status: 'registered',
      isWaitlisted: false,
    }

    // Check if already registered
    const existingRegistration = await db
      .select()
      .from(eventRegistrations)
      .where(and(
        eq(eventRegistrations.eventId, eventId),
        eq(eventRegistrations.memberId, memberId),
        or(
          eq(eventRegistrations.status, 'registered'),
          eq(eventRegistrations.status, 'waitlisted')
        )
      ))
      .limit(1)

    if (existingRegistration.length > 0) {
      return createErrorResponse('You are already registered for this event.')
    }

    // Check event exists and requires registration
    const event = await db.select().from(events).where(eq(events.id, eventId)).limit(1)
    if (event.length === 0) {
      return createErrorResponse('Event not found.')
    }

    if (!event[0].requiresRegistration) {
      return createErrorResponse('This event does not require registration.')
    }

    // Check capacity and determine if waitlisted
    const registrationCount = await db
      .select({ count: count() })
      .from(eventRegistrations)
      .where(and(
        eq(eventRegistrations.eventId, eventId),
        eq(eventRegistrations.status, 'registered')
      ))

    const currentRegistrations = registrationCount[0].count
    const isWaitlisted = event[0].maxAttendees && currentRegistrations >= event[0].maxAttendees

    if (isWaitlisted) {
      const waitlistCount = await db
        .select({ count: count() })
        .from(eventRegistrations)
        .where(and(
          eq(eventRegistrations.eventId, eventId),
          eq(eventRegistrations.isWaitlisted, true)
        ))

      registrationData.status = 'waitlisted'
      registrationData.isWaitlisted = true
      registrationData.waitlistPosition = waitlistCount[0].count + 1
    }

    const validatedData = insertEventRegistrationSchema.parse(registrationData)
    const result = await db.insert(eventRegistrations).values(validatedData).returning()

    // Update event current attendees if not waitlisted
    if (!isWaitlisted) {
      await db
        .update(events)
        .set({ 
          currentAttendees: sql`${events.currentAttendees} + 1`,
          updatedAt: new Date()
        })
        .where(eq(events.id, eventId))
    }

    return createSuccessResponse(result[0] as EventRegistration)
  } catch (error) {
    console.error('Error registering for event:', error)
    return createErrorResponse('Failed to register for event.')
  }
}

/**
 * Unregister/cancel registration for an event
 */
export async function unregisterFromEvent(
  eventId: string, 
  memberId: string, 
  reason?: string
): Promise<ApiResponse<string>> {
  try {
    if (isDevelopmentMode) {
      const registrationIndex = mockEventRegistrations.findIndex(
        reg => reg.eventId === eventId && reg.memberId === memberId && reg.status !== 'cancelled'
      )

      if (registrationIndex === -1) {
        return createErrorResponse('Registration not found.')
      }

      const registration = mockEventRegistrations[registrationIndex]
      const wasRegistered = registration.status === 'registered'

      // Update registration status
      mockEventRegistrations[registrationIndex] = {
        ...registration,
        status: 'cancelled',
        cancellationReason: reason || null,
        cancelledAt: new Date(),
        updatedAt: new Date(),
      }

      // Update event attendee count if was registered (not waitlisted)
      if (wasRegistered) {
        const eventIndex = mockEvents.findIndex(e => e.id === eventId)
        if (eventIndex !== -1) {
          mockEvents[eventIndex].currentAttendees = Math.max(0, (mockEvents[eventIndex].currentAttendees || 0) - 1)
        }

        // Promote waitlisted person if space available
        const nextWaitlisted = mockEventRegistrations.find(
          reg => reg.eventId === eventId && reg.status === 'waitlisted'
        )
        
        if (nextWaitlisted) {
          const nextIndex = mockEventRegistrations.findIndex(reg => reg.id === nextWaitlisted.id)
          mockEventRegistrations[nextIndex] = {
            ...nextWaitlisted,
            status: 'registered',
            isWaitlisted: false,
            waitlistPosition: null,
            updatedAt: new Date(),
          }
          mockEvents[eventIndex].currentAttendees = (mockEvents[eventIndex].currentAttendees || 0) + 1
        }
      }

      await new Promise(resolve => setTimeout(resolve, 200))
      return createSuccessResponse('Successfully unregistered from event.')
    }

    // Database implementation
    const result = await db
      .update(eventRegistrations)
      .set({ 
        status: 'cancelled',
        cancellationReason: reason,
        cancelledAt: new Date(),
        updatedAt: new Date()
      })
      .where(and(
        eq(eventRegistrations.eventId, eventId),
        eq(eventRegistrations.memberId, memberId),
        or(
          eq(eventRegistrations.status, 'registered'),
          eq(eventRegistrations.status, 'waitlisted')
        )
      ))
      .returning()

    if (result.length === 0) {
      return createErrorResponse('Registration not found.')
    }

    const cancelledRegistration = result[0]

    // Update event attendee count if was registered (not waitlisted)
    if (cancelledRegistration.status === 'registered' && !cancelledRegistration.isWaitlisted) {
      await db
        .update(events)
        .set({ 
          currentAttendees: sql`${events.currentAttendees} - 1`,
          updatedAt: new Date()
        })
        .where(eq(events.id, eventId))

      // Promote next waitlisted person
      const nextWaitlisted = await db
        .select()
        .from(eventRegistrations)
        .where(and(
          eq(eventRegistrations.eventId, eventId),
          eq(eventRegistrations.status, 'waitlisted')
        ))
        .orderBy(asc(eventRegistrations.waitlistPosition))
        .limit(1)

      if (nextWaitlisted.length > 0) {
        await db
          .update(eventRegistrations)
          .set({
            status: 'registered',
            isWaitlisted: false,
            waitlistPosition: null,
            updatedAt: new Date()
          })
          .where(eq(eventRegistrations.id, nextWaitlisted[0].id))

        await db
          .update(events)
          .set({ 
            currentAttendees: sql`${events.currentAttendees} + 1`,
            updatedAt: new Date()
          })
          .where(eq(events.id, eventId))
      }
    }

    return createSuccessResponse('Successfully unregistered from event.')
  } catch (error) {
    console.error('Error unregistering from event:', error)
    return createErrorResponse('Failed to unregister from event.')
  }
}

/**
 * Get member's registration status for an event
 */
export async function getEventRegistrationStatus(
  eventId: string, 
  memberId: string
): Promise<ApiResponse<EventRegistration | null>> {
  try {
    if (isDevelopmentMode) {
      const registration = mockEventRegistrations.find(
        reg => reg.eventId === eventId && reg.memberId === memberId && reg.status !== 'cancelled'
      )

      await new Promise(resolve => setTimeout(resolve, 100))
      return createSuccessResponse(registration || null)
    }

    const result = await db
      .select()
      .from(eventRegistrations)
      .where(and(
        eq(eventRegistrations.eventId, eventId),
        eq(eventRegistrations.memberId, memberId),
        or(
          eq(eventRegistrations.status, 'registered'),
          eq(eventRegistrations.status, 'waitlisted')
        )
      ))
      .limit(1)

    const registration = result.length > 0 ? result[0] as EventRegistration : null
    return createSuccessResponse(registration)
  } catch (error) {
    console.error('Error getting registration status:', error)
    return createErrorResponse('Failed to get registration status.')
  }
}

/**
 * Get all registrations for an event (admin function)
 */
export async function getEventRegistrations(eventId: string): Promise<ApiResponse<(EventRegistration & { member: Member })[]>> {
  try {
    if (isDevelopmentMode) {
      // Mock implementation - would need to join with mock members
      const registrations = mockEventRegistrations
        .filter(reg => reg.eventId === eventId)
        .map(reg => ({
          ...reg,
          member: {
            id: reg.memberId,
            firstName: 'Mock',
            lastName: 'Member',
            email: 'mock@example.com',
          } as Member
        }))

      await new Promise(resolve => setTimeout(resolve, 200))
      return createSuccessResponse(registrations)
    }

    const result = await db
      .select({
        registration: eventRegistrations,
        member: members
      })
      .from(eventRegistrations)
      .innerJoin(members, eq(eventRegistrations.memberId, members.id))
      .where(eq(eventRegistrations.eventId, eventId))
      .orderBy(asc(eventRegistrations.registrationDate))

    const registrationsWithMembers = result.map((row: { registration: EventRegistration; member: Member }) => ({
      ...row.registration,
      member: row.member
    })) as (EventRegistration & { member: Member })[]

    return createSuccessResponse(registrationsWithMembers)
  } catch (error) {
    console.error('Error getting event registrations:', error)
    return createErrorResponse('Failed to get event registrations.')
  }
}

/**
 * Get registration statistics for an event
 */
export async function getEventRegistrationStats(eventId: string): Promise<ApiResponse<{
  totalRegistered: number
  totalWaitlisted: number
  availableSpots: number | null
  maxAttendees: number | null
}>> {
  try {
    if (isDevelopmentMode) {
      const event = mockEvents.find(e => e.id === eventId)
      if (!event) {
        return createErrorResponse('Event not found.')
      }

      const registrations = mockEventRegistrations.filter(reg => reg.eventId === eventId)
      const totalRegistered = registrations.filter(reg => reg.status === 'registered').length
      const totalWaitlisted = registrations.filter(reg => reg.status === 'waitlisted').length
      const availableSpots = event.maxAttendees ? Math.max(0, event.maxAttendees - totalRegistered) : null

      await new Promise(resolve => setTimeout(resolve, 100))
      return createSuccessResponse({
        totalRegistered,
        totalWaitlisted,
        availableSpots,
        maxAttendees: event.maxAttendees
      })
    }

    const event = await db.select().from(events).where(eq(events.id, eventId)).limit(1)
    if (event.length === 0) {
      return createErrorResponse('Event not found.')
    }

    const registrationStats = await db
      .select({
        status: eventRegistrations.status,
        count: count()
      })
      .from(eventRegistrations)
      .where(eq(eventRegistrations.eventId, eventId))
      .groupBy(eventRegistrations.status)

    const totalRegistered = registrationStats.find((stat: { status: string; count: number }) => stat.status === 'registered')?.count || 0
    const totalWaitlisted = registrationStats.find((stat: { status: string; count: number }) => stat.status === 'waitlisted')?.count || 0
    const maxAttendees = event[0].maxAttendees
    const availableSpots = maxAttendees ? Math.max(0, maxAttendees - totalRegistered) : null

    return createSuccessResponse({
      totalRegistered,
      totalWaitlisted,
      availableSpots,
      maxAttendees
    })
  } catch (error) {
    console.error('Error getting registration stats:', error)
    return createErrorResponse('Failed to get registration statistics.')
  }
}
