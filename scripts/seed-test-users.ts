import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { members } from '../src/lib/db/schema'

// Load environment variables
config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

// Test users to be created
const testUsers = [
  {
    // Admin user
    clerkUserId: 'mockadmin', // This will be the Clerk user ID
    firstName: 'Mock',
    lastName: 'Admin',
    email: 'mockadmin@churchsuite.com',
    phone: '+233 24 429 9095',
    dateOfBirth: new Date('1985-01-01'),
    address: 'Test Address, Accra, Ghana',
    emergencyContact: 'Test Contact - +233 24 429 9096',
    role: 'admin',
    status: 'active',
    department: 'Church Administration',
    notes: 'Test admin user for development and testing purposes',
    membershipDate: new Date('2024-01-01'),
    isActive: true,
    clerkCredentials: {
      username: 'mockadmin',
      password: 'Mock987123!',
      email: 'mockadmin@churchsuite.com'
    }
  },
  {
    // Regular member user
    clerkUserId: 'mockuser',
    firstName: 'Mock',
    lastName: 'User',
    email: 'mockuser@churchsuite.com',
    phone: '+233 24 429 9097',
    dateOfBirth: new Date('1990-01-01'),
    address: 'Test Address, Accra, Ghana',
    emergencyContact: 'Test Contact - +233 24 429 9098',
    role: 'member',
    status: 'active',
    department: 'General Members',
    notes: 'Test member user for development and testing purposes',
    membershipDate: new Date('2024-01-01'),
    isActive: true,
    clerkCredentials: {
      username: 'mockuser',
      password: 'Mock987123!',
      email: 'mockuser@churchsuite.com'
    }
  }
]

async function seedTestUsers() {
  try {
    console.log('🌱 Starting to seed test users...')
    console.log('\n📋 Test Users to be created:')
    
    testUsers.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.role.toUpperCase()}: ${user.firstName} ${user.lastName}`)
      console.log(`   Username: ${user.clerkCredentials.username}`)
      console.log(`   Password: ${user.clerkCredentials.password}`)
      console.log(`   Email: ${user.clerkCredentials.email}`)
      console.log(`   Role: ${user.role}`)
    })
    
    console.log('\n⚠️  IMPORTANT: You need to manually create these users in Clerk!')
    console.log('📱 Go to your Clerk Dashboard: https://dashboard.clerk.com/')
    console.log('👥 Navigate to Users → Add User')
    console.log('📝 Create each user with the credentials above')
    
    // Remove clerkCredentials before inserting into database
    const membersToInsert = testUsers.map(({ clerkCredentials, ...member }) => member)
    
    // Insert into database
    const insertedMembers = await db.insert(members).values(membersToInsert).returning()
    
    console.log(`\n✅ Successfully seeded ${insertedMembers.length} test members in database:`)
    
    // Group by role for summary
    const roleGroups = insertedMembers.reduce((acc, member) => {
      acc[member.role] = (acc[member.role] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    Object.entries(roleGroups).forEach(([role, count]) => {
      console.log(`   • ${count} ${role}${count > 1 ? 's' : ''}`)
    })
    
    console.log('\n🎉 Test users seeded successfully!')
    console.log('\n📋 Next Steps:')
    console.log('1. Create users in Clerk Dashboard with the credentials above')
    console.log('2. Test login with mockadmin/Mock987123! (Admin view)')
    console.log('3. Test login with mockuser/Mock987123! (Member view)')
    console.log('4. Verify different permissions and access levels')
    console.log('\n🔗 Test your app at: http://localhost:5173')
    console.log('🗄️  View data in Drizzle Studio: https://local.drizzle.studio')
    
  } catch (error) {
    console.error('❌ Error seeding test users:', error)
    process.exit(1)
  }
}

// Run the seeding
seedTestUsers()
  .then(() => {
    console.log('\n✨ Test user seeding completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Test user seeding failed:', error)
    process.exit(1)
  })
