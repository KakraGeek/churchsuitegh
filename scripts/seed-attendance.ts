import { config } from 'dotenv'
config({ path: '.env.local' })

import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { attendance, attendanceQRCodes, members, events } from '../src/lib/db/schema'
import { eq } from 'drizzle-orm'

// Create database connection for Node.js environment
const databaseUrl = process.env.VITE_DATABASE_URL
if (!databaseUrl) {
  throw new Error('VITE_DATABASE_URL is not set in .env.local')
}

const sql = neon(databaseUrl)
const db = drizzle(sql)

async function seedAttendance() {
  console.log('🎯 Starting to seed attendance data...')
  
  try {
    // Get existing members and events
    console.log('📋 Fetching existing members and events...')
    const existingMembers = await db.select().from(members)
    const existingEvents = await db.select().from(events)
    
    if (existingMembers.length === 0) {
      console.log('❌ No members found. Please seed members first.')
      return
    }
    
    if (existingEvents.length === 0) {
      console.log('❌ No events found. Please seed events first.')
      return
    }
    
    console.log(`✅ Found ${existingMembers.length} members and ${existingEvents.length} events`)
    
    // Clear existing attendance data
    console.log('🗑️  Clearing existing attendance data...')
    await db.delete(attendanceQRCodes)
    await db.delete(attendance)
    console.log('✅ Cleared existing attendance data')
    
    // Generate QR codes for upcoming events
    console.log('📱 Creating QR codes for events...')
    const qrCodesToCreate = []
    
    for (const event of existingEvents) {
      const qrCodeId = `QR-${event.eventType.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
      
      qrCodesToCreate.push({
        qrCodeId,
        eventId: event.id,
        serviceType: event.eventType === 'service' ? 'sunday-service' : 
                    event.eventType === 'bible-study' ? 'bible-study' :
                    event.eventType === 'prayer-meeting' ? 'prayer-meeting' :
                    'special-event',
        serviceDate: event.startDate,
        location: event.location || 'Main Sanctuary',
        isActive: true,
        expiresAt: new Date(event.endDate.getTime() + 60 * 60 * 1000), // 1 hour after event ends
        maxUses: null, // Unlimited
        currentUses: 0,
        createdBy: existingMembers[0].id, // Admin/Pastor
      })
    }
    
    // Also create QR codes for regular services
    const regularServices = [
      {
        qrCodeId: `QR-SUNDAY-${Date.now()}`,
        serviceType: 'sunday-service',
        serviceDate: new Date('2025-09-07T10:00:00'), // Next Sunday
        location: 'Main Sanctuary',
      },
      {
        qrCodeId: `QR-MIDWEEK-${Date.now()}`,
        serviceType: 'midweek-service', 
        serviceDate: new Date('2025-09-03T19:00:00'), // Next Wednesday
        location: 'Fellowship Hall',
      },
      {
        qrCodeId: `QR-PRAYER-${Date.now()}`,
        serviceType: 'prayer-meeting',
        serviceDate: new Date('2025-09-05T18:00:00'), // Next Friday
        location: 'Prayer Room',
      }
    ]
    
    for (const service of regularServices) {
      qrCodesToCreate.push({
        ...service,
        eventId: null,
        isActive: true,
        expiresAt: new Date(service.serviceDate.getTime() + 3 * 60 * 60 * 1000), // 3 hours after start
        maxUses: null,
        currentUses: 0,
        createdBy: existingMembers[0].id,
      })
    }
    
    // Insert QR codes
    console.log(`📱 Inserting ${qrCodesToCreate.length} QR codes...`)
    const insertedQRCodes = await db.insert(attendanceQRCodes).values(qrCodesToCreate).returning()
    console.log(`✅ Created ${insertedQRCodes.length} QR codes`)
    
    // Generate sample attendance records
    console.log('📊 Creating sample attendance records...')
    const attendanceToCreate = []
    
    // Create attendance for past events and services
    const pastDates = [
      new Date('2025-08-31T10:00:00'), // Last Sunday
      new Date('2025-08-28T19:00:00'), // Last Wednesday
      new Date('2025-08-24T10:00:00'), // Previous Sunday
      new Date('2025-08-21T19:00:00'), // Previous Wednesday
    ]
    
    for (const serviceDate of pastDates) {
      const isWeekend = serviceDate.getDay() === 0 // Sunday
      const serviceType = isWeekend ? 'sunday-service' : 'midweek-service'
      const location = isWeekend ? 'Main Sanctuary' : 'Fellowship Hall'
      
      // Random number of attendees (more on Sundays)
      const numAttendees = isWeekend ? 
        Math.floor(Math.random() * 15) + 10 : // 10-25 for Sunday
        Math.floor(Math.random() * 8) + 5     // 5-13 for midweek
      
      // Select random members for attendance
      const shuffledMembers = [...existingMembers].sort(() => Math.random() - 0.5)
      const attendingMembers = shuffledMembers.slice(0, numAttendees)
      
      for (const member of attendingMembers) {
        const checkInTime = new Date(serviceDate.getTime() + (Math.random() - 0.5) * 30 * 60 * 1000) // ±30 minutes
        const checkOutTime = Math.random() > 0.3 ? // 70% chance of checkout
          new Date(checkInTime.getTime() + (90 + Math.random() * 60) * 60 * 1000) : // 1.5-2.5 hours later
          null
        
        attendanceToCreate.push({
          memberId: member.id,
          eventId: null, // Regular service, not linked to specific event
          serviceDate,
          serviceType,
          checkInTime,
          checkOutTime,
          checkInMethod: Math.random() > 0.3 ? 'qr-code' : 'manual', // 70% QR, 30% manual
          qrCodeId: Math.random() > 0.3 ? `QR-${serviceType.toUpperCase()}-MOCK` : null,
          location,
          notes: Math.random() > 0.8 ? 
            ['Brought friend', 'Late arrival', 'Early departure', 'First time visitor'][Math.floor(Math.random() * 4)] : 
            null,
          recordedBy: Math.random() > 0.7 ? existingMembers[0].id : null, // 30% admin recorded
        })
      }
    }
    
    // Insert attendance records
    console.log(`📊 Inserting ${attendanceToCreate.length} attendance records...`)
    const insertedAttendance = await db.insert(attendance).values(attendanceToCreate).returning()
    console.log(`✅ Created ${insertedAttendance.length} attendance records`)
    
    // Update QR code usage counts to reflect realistic usage
    console.log('🔄 Updating QR code usage counts...')
    let qrUpdateCount = 0
    for (const qrCode of insertedQRCodes) {
      const usageCount = Math.floor(Math.random() * 20) + 5 // 5-25 uses
      await db
        .update(attendanceQRCodes)
        .set({ currentUses: usageCount })
        .where(eq(attendanceQRCodes.id, qrCode.id))
      qrUpdateCount++
    }
    console.log(`✅ Updated ${qrUpdateCount} QR code usage counts`)
    
    // Summary
    console.log('\n📈 Attendance Seeding Summary:')
    console.log(`   📱 QR Codes: ${insertedQRCodes.length}`)
    console.log(`   📊 Attendance Records: ${insertedAttendance.length}`)
    console.log(`   👥 Members who attended: ${new Set(attendanceToCreate.map(a => a.memberId)).size}`)
    console.log(`   📅 Service dates covered: ${pastDates.length}`)
    
    console.log('\n✅ Attendance seeding completed successfully!')
    
  } catch (error) {
    console.error('❌ Error seeding attendance:', error)
    throw error
  }
}

// Run the seeding function
seedAttendance()
  .then(() => {
    console.log('🎉 Attendance seeding finished!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Attendance seeding failed:', error)
    process.exit(1)
  })
