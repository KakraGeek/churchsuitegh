import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { events } from '../src/lib/db/schema'

// Load environment variables
config({ path: '.env.local' })

const sql = neon(process.env.VITE_DATABASE_URL!)
const db = drizzle(sql)

// Sample events for each event type (September 2025 and later)
const sampleEvents = [
  {
    title: 'Sunday Morning Service',
    description: 'Join us for worship, prayer, and the Word of God. Come as you are and experience the love of Christ in our community.',
    startDate: new Date('2025-09-07T10:00:00'), // First Sunday in September 2025
    endDate: new Date('2025-09-07T12:00:00'),
    location: 'Main Sanctuary',
    eventType: 'service' as const,
    maxAttendees: 500,
    currentAttendees: 245,
    isPublic: true,
    isRecurring: true,
    recurringPattern: 'weekly' as const,
    requiresRegistration: false,
    cost: 0,
    tags: '["worship", "sunday", "main-service", "community"]',
    status: 'scheduled' as const,
  },
  {
    title: 'Wednesday Bible Study',
    description: 'Deep dive into Scripture with fellowship and discussion. This week we\'re studying the Book of James - faith in action.',
    startDate: new Date('2025-09-10T19:00:00'), // Wednesday after first Sunday
    endDate: new Date('2025-09-10T21:00:00'),
    location: 'Fellowship Hall',
    eventType: 'bible-study' as const,
    maxAttendees: 80,
    currentAttendees: 42,
    isPublic: true,
    isRecurring: true,
    recurringPattern: 'weekly' as const,
    requiresRegistration: false,
    cost: 0,
    tags: '["bible-study", "wednesday", "fellowship", "scripture"]',
    status: 'scheduled' as const,
  },
  {
    title: 'Morning Prayer Meeting',
    description: 'Start your day with prayer and intercession. Come and join us as we seek God\'s face for our church and community.',
    startDate: new Date('2025-09-12T06:00:00'), // Friday after first week
    endDate: new Date('2025-09-12T07:00:00'),
    location: 'Prayer Room',
    eventType: 'prayer-meeting' as const,
    maxAttendees: 30,
    currentAttendees: 18,
    isPublic: true,
    isRecurring: true,
    recurringPattern: 'weekly' as const,
    requiresRegistration: false,
    cost: 0,
    tags: '["prayer", "morning", "intercession", "spiritual"]',
    status: 'scheduled' as const,
  },
  {
    title: 'Community Outreach - Tema Market',
    description: 'Join us as we reach out to the Tema Market community with the love of Christ. We\'ll be distributing food packages and sharing the Gospel.',
    startDate: new Date('2025-09-20T09:00:00'), // Third Saturday in September
    endDate: new Date('2025-09-20T15:00:00'),
    location: 'Tema Community Market',
    eventType: 'outreach' as const,
    maxAttendees: 50,
    currentAttendees: 32,
    isPublic: true,
    isRecurring: false,
    requiresRegistration: true,
    cost: 0,
    tags: '["outreach", "community", "tema", "evangelism", "service"]',
    status: 'scheduled' as const,
  },
  {
    title: 'Youth Fellowship Night',
    description: 'An evening of fun, games, worship, and fellowship for our young people. Pizza will be served! Ages 13-25 welcome.',
    startDate: new Date('2025-09-27T18:00:00'), // Last Saturday in September
    endDate: new Date('2025-09-27T21:00:00'),
    location: 'Youth Center',
    eventType: 'fellowship' as const,
    maxAttendees: 100,
    currentAttendees: 67,
    isPublic: true,
    isRecurring: true,
    recurringPattern: 'monthly' as const,
    requiresRegistration: true,
    cost: 500, // 5.00 GHS in pesewas
    tags: '["youth", "fellowship", "games", "worship", "pizza"]',
    status: 'scheduled' as const,
  },
  {
    title: 'Annual Church Conference 2025',
    description: 'Join us for our annual church conference featuring guest speakers, workshops, and spiritual renewal. Theme: "Walking in Purpose".',
    startDate: new Date('2025-10-11T09:00:00'), // October weekend
    endDate: new Date('2025-10-12T16:00:00'),
    location: 'Main Sanctuary & Conference Rooms',
    eventType: 'conference' as const,
    maxAttendees: 800,
    currentAttendees: 234,
    isPublic: true,
    isRecurring: true,
    recurringPattern: 'yearly' as const,
    requiresRegistration: true,
    cost: 5000, // 50.00 GHS in pesewas
    imageUrl: 'https://example.com/conference2025.jpg',
    tags: '["conference", "annual", "speakers", "workshops", "spiritual-growth"]',
    status: 'scheduled' as const,
  },
  {
    title: 'Pastor\'s Appreciation Banquet',
    description: 'A special evening to honor and appreciate our pastoral team. Formal dinner with special presentations and testimonies.',
    startDate: new Date('2025-11-15T18:00:00'), // Mid November
    endDate: new Date('2025-11-15T22:00:00'),
    location: 'Grand Ballroom - Labadi Beach Hotel',
    eventType: 'special' as const,
    maxAttendees: 200,
    currentAttendees: 145,
    isPublic: true,
    isRecurring: false,
    requiresRegistration: true,
    cost: 15000, // 150.00 GHS in pesewas
    tags: '["special", "appreciation", "pastor", "banquet", "formal"]',
    status: 'scheduled' as const,
  },
]

async function seedEvents() {
  console.log('🌱 Starting to seed events...')

  try {
    // First, clear existing events
    console.log('🗑️  Clearing existing events...')
    await db.delete(events)
    console.log('✅ Cleared all existing events')

    // Insert all sample events
    for (const event of sampleEvents) {
      console.log(`📅 Creating event: ${event.title}`)
      
      await db.insert(events).values({
        ...event,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      
      console.log(`✅ Created: ${event.title} (${event.eventType})`)
    }

    console.log('\n🎉 Successfully seeded all event types!')
    console.log(`📊 Created ${sampleEvents.length} events:`)
    
    // Count events by type
    const eventsByType = sampleEvents.reduce((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    Object.entries(eventsByType).forEach(([type, count]) => {
      console.log(`   - ${type}: ${count} event${count > 1 ? 's' : ''}`)
    })

    console.log('\n🏃‍♂️ You can now visit http://localhost:5174/events to see your events!')
    
  } catch (error) {
    console.error('❌ Error seeding events:', error)
    process.exit(1)
  }
}

// Run the seeding
seedEvents()
  .then(() => {
    console.log('✨ Event seeding completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Event seeding failed:', error)
    process.exit(1)
  })
