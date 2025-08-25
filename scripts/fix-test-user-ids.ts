import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { members } from '../src/lib/db/schema'
import { eq } from 'drizzle-orm'

// Load environment variables
config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

// Test user Clerk IDs to update
const testUserUpdates = [
  {
    // Update mockadmin with actual Clerk ID
    oldClerkUserId: 'mockadmin',
    newClerkUserId: 'user_31mVt35hDYVwCFf4grogXeRj3zQ', // Actual Clerk ID for mockadmin
    description: 'mockadmin user'
  },
  {
    // Update mockuser with actual Clerk ID
    oldClerkUserId: 'mockuser',
    newClerkUserId: 'user_31mVp2Sivc64F6tpXjV2sVM3Q0h', // This is the actual Clerk ID from console logs
    description: 'mockuser user'
  }
]

async function fixTestUserIds() {
  try {
    console.log('🔧 Starting to fix test user Clerk IDs...')
    
    for (const update of testUserUpdates) {
      console.log(`\n📝 Updating ${update.description}:`)
      console.log(`   Old Clerk ID: ${update.oldClerkUserId}`)
      console.log(`   New Clerk ID: ${update.newClerkUserId}`)
      
      // Update the member record
      const [updatedMember] = await db
        .update(members)
        .set({ 
          clerkUserId: update.newClerkUserId,
          updatedAt: new Date()
        })
        .where(eq(members.clerkUserId, update.oldClerkUserId))
        .returning()
      
      if (updatedMember) {
        console.log(`   ✅ Successfully updated ${updatedMember.firstName} ${updatedMember.lastName}`)
      } else {
        console.log(`   ❌ No member found with Clerk ID: ${update.oldClerkUserId}`)
      }
    }
    
    console.log('\n🎉 Test user Clerk ID updates completed!')
    console.log('\n📋 Next Steps:')
    console.log('1. Test the Notifications page again')
    console.log('2. Verify that member profile loading works')
    console.log('3. Check other pages that use getMemberByClerkId')
    
  } catch (error) {
    console.error('❌ Error fixing test user IDs:', error)
    process.exit(1)
  }
}

// Run the fix
fixTestUserIds()
  .then(() => {
    console.log('\n✨ Clerk ID fix completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Clerk ID fix failed:', error)
    process.exit(1)
  })
