import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { members } from '../src/lib/db/schema'
import { eq } from 'drizzle-orm'

// Load environment variables
config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

async function fixMockAdminOnly() {
  try {
    console.log('🔧 Fixing Mock Admin Clerk ID...')
    
    // Update Mock Admin with the correct Clerk ID
    const [updatedMember] = await db
      .update(members)
      .set({ 
        clerkUserId: 'user_31mVt35hDYVwCFf4grogXeRj3zQ',
        updatedAt: new Date()
      })
      .where(eq(members.clerkUserId, 'REPLACE_WITH_ACTUAL_MOCKADMIN_CLERK_ID'))
      .returning()
    
    if (updatedMember) {
      console.log(`✅ Successfully updated ${updatedMember.firstName} ${updatedMember.lastName}`)
      console.log(`   New Clerk ID: user_31mVt35hDYVwCFf4grogXeRj3zQ`)
    } else {
      console.log('❌ No member found with placeholder Clerk ID')
    }
    
    console.log('\n🎉 Mock Admin Clerk ID fix completed!')
    
  } catch (error) {
    console.error('❌ Error fixing Mock Admin Clerk ID:', error)
    process.exit(1)
  }
}

// Run the fix
fixMockAdminOnly()
  .then(() => {
    console.log('\n✨ Mock Admin fix completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Mock Admin fix failed:', error)
    process.exit(1)
  })
