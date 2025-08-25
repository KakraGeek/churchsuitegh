import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { members } from '../src/lib/db/schema'
import { eq } from 'drizzle-orm'

// Load environment variables
config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

async function verifyTestUsers() {
  try {
    console.log('🔍 Verifying test users in database...')
    
    // Check for mockadmin
    const adminUser = await db.select().from(members).where(eq(members.clerkUserId, 'user_31mVt35hDYVwCFf4grogXeRj3zQ'))
    
    if (adminUser.length > 0) {
      const admin = adminUser[0]
      console.log('\n✅ Admin User Found:')
      console.log(`   Name: ${admin.firstName} ${admin.lastName}`)
      console.log(`   Email: ${admin.email}`)
      console.log(`   Role: ${admin.role}`)
      console.log(`   Status: ${admin.status}`)
      console.log(`   Department: ${admin.department}`)
    } else {
      console.log('\n❌ Admin User NOT Found')
    }
    
    // Check for mockuser
    const memberUser = await db.select().from(members).where(eq(members.clerkUserId, 'user_31mVp2Sivc64F6tpXjV2sVM3Q0h'))
    
    if (memberUser.length > 0) {
      const member = memberUser[0]
      console.log('\n✅ Member User Found:')
      console.log(`   Name: ${member.firstName} ${member.lastName}`)
      console.log(`   Email: ${member.email}`)
      console.log(`   Role: ${member.role}`)
      console.log(`   Status: ${member.status}`)
      console.log(`   Department: ${member.department}`)
    } else {
      console.log('\n❌ Member User NOT Found')
    }
    
    // Get total count
    const allMembers = await db.select().from(members)
    console.log(`\n📊 Total members in database: ${allMembers.length}`)
    
    // Group by role
    const roleGroups = allMembers.reduce((acc, member) => {
      acc[member.role] = (acc[member.role] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    console.log('\n👥 Members by role:')
    Object.entries(roleGroups).forEach(([role, count]) => {
      console.log(`   • ${count} ${role}${count > 1 ? 's' : ''}`)
    })
    
    console.log('\n🎯 Test Users Status:')
    if (adminUser.length > 0 && memberUser.length > 0) {
      console.log('✅ Both test users are ready in the database')
      console.log('⚠️  Remember to create them in Clerk Dashboard too!')
    } else {
      console.log('❌ Some test users are missing from the database')
    }
    
  } catch (error) {
    console.error('❌ Error verifying test users:', error)
    process.exit(1)
  }
}

// Run the verification
verifyTestUsers()
  .then(() => {
    console.log('\n✨ Verification completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Verification failed:', error)
    process.exit(1)
  })
