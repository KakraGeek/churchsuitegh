import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { members } from '../src/lib/db/schema'

// Load environment variables
config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

async function checkAllMembers() {
  try {
    console.log('🔍 Checking all members in database...')
    
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
    
    console.log('\n📋 All Members Details:')
    allMembers.forEach((member, index) => {
      console.log(`\n${index + 1}. ${member.firstName} ${member.lastName}`)
      console.log(`   Clerk ID: ${member.clerkUserId}`)
      console.log(`   Email: ${member.email}`)
      console.log(`   Role: ${member.role}`)
      console.log(`   Status: ${member.status}`)
      console.log(`   Department: ${member.department}`)
    })
    
    // Check for test users by email
    const testUsers = allMembers.filter(member => 
      member.email.includes('mockadmin') || 
      member.email.includes('mockuser') ||
      member.firstName === 'Mock'
    )
    
    if (testUsers.length > 0) {
      console.log('\n🎯 Test Users Found:')
      testUsers.forEach(user => {
        console.log(`   • ${user.firstName} ${user.lastName} (${user.email})`)
        console.log(`     Clerk ID: ${user.clerkUserId}`)
        console.log(`     Role: ${user.role}`)
      })
    } else {
      console.log('\n❌ No test users found in database')
    }
    
  } catch (error) {
    console.error('❌ Error checking members:', error)
    process.exit(1)
  }
}

// Run the check
checkAllMembers()
  .then(() => {
    console.log('\n✨ Member check completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Member check failed:', error)
    process.exit(1)
  })
