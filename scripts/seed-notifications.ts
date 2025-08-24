import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { 
  notificationTemplates, 
  notifications, 
  notificationRecipients, 
  notificationPreferences, 
  members 
} from '../src/lib/db/schema'

// Load environment variables
config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

const sampleTemplates = [
  {
    name: 'Welcome New Member',
    description: 'Welcome message for new church members',
    category: 'welcome',
    title: 'Welcome to ChurchSuite Ghana! 🎉',
    content: 'Welcome {{MEMBER_NAME}}! We\'re excited to have you join our church family. Your spiritual journey starts here.',
    priority: 'high',
    icon: 'church',
    color: 'blue',
    isActive: true,
  },
  {
    name: 'Event Reminder',
    description: 'Reminder for upcoming events',
    category: 'reminder',
    title: 'Event Reminder: {{EVENT_NAME}}',
    content: 'Don\'t forget! {{EVENT_NAME}} is happening {{EVENT_DATE}} at {{EVENT_TIME}}. See you there!',
    priority: 'normal',
    icon: 'calendar',
    color: 'green',
    isActive: true,
  },
  {
    name: 'Emergency Alert',
    description: 'Urgent notifications for emergencies',
    category: 'emergency',
    title: 'URGENT: {{ALERT_TITLE}}',
    content: '🚨 {{MESSAGE}} Please check the church website or call {{CONTACT_NUMBER}} for more information.',
    priority: 'urgent',
    icon: 'alert',
    color: 'red',
    isActive: true,
  }
]

const sampleNotifications = [
  {
    title: 'Christmas Service Announcement 🎄',
    content: 'Join us for our special Christmas service on December 25th at 10:00 AM. Celebrate the birth of our Savior with worship, carols, and fellowship! Location: Main Sanctuary',
    category: 'announcement',
    priority: 'high',
    icon: 'church',
    color: 'green',
    targetType: 'all',
    actionType: 'none',
    expiresAt: new Date('2024-12-26T00:00:00'),
  },
  {
    title: 'Youth Group Meeting Today',
    content: 'Youth group meets today at 6 PM in the fellowship hall. Bring a friend! 🙌 We\'ll be discussing our upcoming community service project.',
    category: 'reminder',
    priority: 'normal',
    icon: 'users',
    color: 'blue',
    targetType: 'role',
    actionType: 'none',
    expiresAt: new Date('2024-12-22T00:00:00'),
  },
  {
    title: 'New Bible Study Series Starting',
    content: 'Join us for a new 8-week Bible study series on "Faith in Action" starting this Wednesday at 7 PM. Sign up at the welcome desk or online.',
    category: 'announcement',
    priority: 'normal',
    icon: 'template',
    color: 'purple',
    targetType: 'all',
    actionType: 'link',
    actionData: JSON.stringify({ url: '/events' }),
  },
  {
    title: 'Thanksgiving Offering Results',
    content: 'Thank you for your generous Thanksgiving offering! We raised GH₵15,000 for our community outreach programs. Your generosity will make a real difference! 🙏',
    category: 'announcement',
    priority: 'normal',
    icon: 'heart',
    color: 'orange',
    targetType: 'all',
    actionType: 'none',
  },
  {
    title: 'Church Cleaning Day - Volunteers Needed',
    content: 'We need volunteers for our monthly church cleaning day this Saturday at 8 AM. Bring cleaning supplies if you can. Breakfast will be provided! 🧹',
    category: 'general',
    priority: 'low',
    icon: 'users',
    color: 'gray',
    targetType: 'all',
    actionType: 'none',
    expiresAt: new Date('2024-12-28T00:00:00'),
  },
  {
    title: 'Prayer Request: Pastor Johnson\'s Recovery',
    content: 'Please keep Pastor Johnson in your prayers as he recovers from surgery. Cards and well-wishes can be dropped off at the church office.',
    category: 'general',
    priority: 'high',
    icon: 'heart',
    color: 'pink',
    targetType: 'all',
    actionType: 'none',
  },
  {
    title: 'Children\'s Sunday School Teachers Needed',
    content: 'We\'re looking for dedicated volunteers to help with our children\'s Sunday school program. If you have a heart for teaching kids, please contact Sister Grace.',
    category: 'general',
    priority: 'normal',
    icon: 'users',
    color: 'yellow',
    targetType: 'all',
    actionType: 'none',
  }
]

async function seedNotifications() {
  try {
    console.log('🌱 Starting to seed notifications system...\n')
    
    // Get all members to create recipients
    const allMembers = await db.select().from(members)
    console.log(`📋 Found ${allMembers.length} members in database`)
    
    if (allMembers.length === 0) {
      console.log('❌ No members found. Please run member seeding first: npx tsx scripts/seed-members.ts')
      return
    }
    
    // 1. Seed notification templates
    console.log('📝 Seeding notification templates...')
    const insertedTemplates = await db.insert(notificationTemplates).values(sampleTemplates).returning()
    console.log(`✅ Created ${insertedTemplates.length} notification templates`)
    
    // 2. Seed notifications
    console.log('📢 Seeding notifications...')
    const insertedNotifications = await db.insert(notifications).values(sampleNotifications).returning()
    console.log(`✅ Created ${insertedNotifications.length} notifications`)
    
    // 3. Create notification recipients (all members get all notifications)
    console.log('👥 Creating notification recipients...')
    const recipients = []
    
    for (const notification of insertedNotifications) {
      for (const member of allMembers) {
        recipients.push({
          notificationId: notification.id,
          memberId: member.id,
          isRead: Math.random() > 0.7, // 30% chance already read for realistic data
          readAt: Math.random() > 0.7 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null,
        })
      }
    }
    
    const insertedRecipients = await db.insert(notificationRecipients).values(recipients).returning()
    console.log(`✅ Created ${insertedRecipients.length} notification recipients`)
    
    // 4. Create default notification preferences for members who don't have them
    console.log('⚙️ Setting up notification preferences...')
    const existingPrefs = await db.select().from(notificationPreferences)
    const membersWithPrefs = existingPrefs.map(p => p.memberId)
    const membersNeedingPrefs = allMembers.filter(m => !membersWithPrefs.includes(m.id))
    
    if (membersNeedingPrefs.length > 0) {
      const defaultPreferences = membersNeedingPrefs.map(member => ({
        memberId: member.id,
        generalNotifications: true,
        eventNotifications: true,
        announcementNotifications: true,
        emergencyNotifications: true,
        reminderNotifications: true,
        soundEnabled: true,
        browserNotifications: false,
      }))
      
      const insertedPrefs = await db.insert(notificationPreferences).values(defaultPreferences).returning()
      console.log(`✅ Created ${insertedPrefs.length} notification preference records`)
    } else {
      console.log('✅ All members already have notification preferences')
    }
    
    // 5. Summary
    console.log('\n📊 Notification System Summary:')
    console.log(`   • ${insertedTemplates.length} notification templates`)
    console.log(`   • ${insertedNotifications.length} notifications`)
    console.log(`   • ${insertedRecipients.length} recipient records`)
    console.log(`   • ${allMembers.length} members with preferences`)
    
    // Calculate unread counts
    const unreadCounts = {}
    for (const member of allMembers) {
      const memberRecipients = insertedRecipients.filter(r => r.memberId === member.id)
      const unreadCount = memberRecipients.filter(r => !r.isRead).length
      unreadCounts[member.firstName + ' ' + member.lastName] = unreadCount
    }
    
    console.log('\n🔔 Unread notification counts by member:')
    Object.entries(unreadCounts).forEach(([name, count]) => {
      console.log(`   • ${name}: ${count} unread`)
    })
    
    console.log('\n🎉 Notifications seeded successfully!')
    console.log('📱 You can now test:')
    console.log('   • Admin Communications: http://localhost:5173/communications')
    console.log('   • Member Notifications: http://localhost:5173/notifications')
    console.log('   • Check notification badges in navigation')
    
  } catch (error) {
    console.error('❌ Error seeding notifications:', error)
    process.exit(1)
  }
}

// Run the seeding
seedNotifications()
  .then(() => {
    console.log('✨ Notification seeding completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Notification seeding failed:', error)
    process.exit(1)
  })
