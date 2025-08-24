import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { members } from '../src/lib/db/schema'

// Load environment variables
config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

const sampleMembers = [
  // Pastors
  {
    clerkUserId: 'seed_pastor_1',
    firstName: 'Rev. Emmanuel',
    lastName: 'Mensah',
    email: 'emmanuel.mensah@churchsuite.com',
    phone: '+233 24 111 2222',
    dateOfBirth: new Date('1975-03-15'),
    address: 'East Legon, Accra, Ghana',
    emergencyContact: 'Mrs. Joyce Mensah - +233 24 111 2223',
    role: 'pastor',
    status: 'active',
    department: 'Senior Leadership',
    notes: 'Associate Pastor, oversees youth and family ministries',
    membershipDate: new Date('2018-01-01'),
    isActive: true,
  },
  {
    clerkUserId: 'seed_pastor_2',
    firstName: 'Pastor Grace',
    lastName: 'Osei',
    email: 'grace.osei@churchsuite.com',
    phone: '+233 20 333 4444',
    dateOfBirth: new Date('1982-08-22'),
    address: 'Airport Residential, Accra, Ghana',
    emergencyContact: 'Dr. Kwame Osei - +233 20 333 4445',
    role: 'pastor',
    status: 'active',
    department: 'Pastoral Care',
    notes: 'Women\'s ministry leader, counseling pastor',
    membershipDate: new Date('2020-06-15'),
    isActive: true,
  },

  // Admins
  {
    clerkUserId: 'seed_admin_1',
    firstName: 'Samuel',
    lastName: 'Adjei',
    email: 'samuel.adjei@churchsuite.com',
    phone: '+233 26 555 6666',
    dateOfBirth: new Date('1988-11-10'),
    address: 'Tema Community 25, Ghana',
    emergencyContact: 'Esther Adjei - +233 26 555 6667',
    role: 'admin',
    status: 'active',
    department: 'Church Administration',
    notes: 'IT Administrator, manages church systems and data',
    membershipDate: new Date('2019-04-20'),
    isActive: true,
  },
  {
    clerkUserId: 'seed_admin_2',
    firstName: 'Abigail',
    lastName: 'Asante',
    email: 'abigail.asante@churchsuite.com',
    phone: '+233 24 777 8888',
    dateOfBirth: new Date('1985-05-18'),
    address: 'Spintex, Accra, Ghana',
    emergencyContact: 'Michael Asante - +233 24 777 8889',
    role: 'admin',
    status: 'active',
    department: 'Finance & Operations',
    notes: 'Church treasurer, manages finances and operations',
    membershipDate: new Date('2017-09-12'),
    isActive: true,
  },

  // Leaders
  {
    clerkUserId: 'seed_leader_1',
    firstName: 'Kwame',
    lastName: 'Boateng',
    email: 'kwame.boateng@gmail.com',
    phone: '+233 20 999 1111',
    dateOfBirth: new Date('1990-12-05'),
    address: 'Dansoman, Accra, Ghana',
    emergencyContact: 'Akosua Boateng - +233 20 999 1112',
    role: 'leader',
    status: 'active',
    department: 'Youth Ministry',
    notes: 'Youth leader, organizes youth programs and mentorship',
    membershipDate: new Date('2021-02-14'),
    isActive: true,
  },
  {
    clerkUserId: 'seed_leader_2',
    firstName: 'Doris',
    lastName: 'Amponsah',
    email: 'doris.amponsah@yahoo.com',
    phone: '+233 24 222 3333',
    dateOfBirth: new Date('1987-07-30'),
    address: 'Kasoa, Central Region, Ghana',
    emergencyContact: 'Joseph Amponsah - +233 24 222 3334',
    role: 'leader',
    status: 'active',
    department: 'Worship Team',
    notes: 'Worship leader, choir director, plays piano and organ',
    membershipDate: new Date('2020-11-08'),
    isActive: true,
  },

  // Members
  {
    clerkUserId: 'seed_member_1',
    firstName: 'Kofi',
    lastName: 'Asiedu',
    email: 'kofi.asiedu@outlook.com',
    phone: '+233 26 444 5555',
    dateOfBirth: new Date('1992-01-28'),
    address: 'Adenta, Greater Accra, Ghana',
    emergencyContact: 'Ama Asiedu - +233 26 444 5556',
    role: 'member',
    status: 'active',
    department: 'Men\'s Fellowship',
    notes: 'Regular member, participates in men\'s ministry activities',
    membershipDate: new Date('2022-05-20'),
    isActive: true,
  },
  {
    clerkUserId: 'seed_member_2',
    firstName: 'Akosua',
    lastName: 'Owusu',
    email: 'akosua.owusu@gmail.com',
    phone: '+233 20 666 7777',
    dateOfBirth: new Date('1995-09-14'),
    address: 'Madina, Accra, Ghana',
    emergencyContact: 'Kwaku Owusu - +233 20 666 7778',
    role: 'member',
    status: 'active',
    department: 'Children\'s Ministry',
    notes: 'Sunday school teacher, works with young children',
    membershipDate: new Date('2023-01-10'),
    isActive: true,
  },

  // Visitors
  {
    clerkUserId: 'seed_visitor_1',
    firstName: 'Michael',
    lastName: 'Tetteh',
    email: 'michael.tetteh@hotmail.com',
    phone: '+233 24 888 9999',
    dateOfBirth: new Date('1989-04-03'),
    address: 'Labadi, Accra, Ghana',
    emergencyContact: 'Jennifer Tetteh - +233 24 888 9990',
    role: 'visitor',
    status: 'visitor',
    department: null,
    notes: 'New visitor, attended for 3 weeks, interested in joining',
    membershipDate: new Date('2024-12-01'),
    isActive: true,
  },
  {
    clerkUserId: 'seed_visitor_2',
    firstName: 'Priscilla',
    lastName: 'Darko',
    email: 'priscilla.darko@gmail.com',
    phone: '+233 26 111 2222',
    dateOfBirth: new Date('1993-06-25'),
    address: 'Cantonments, Accra, Ghana',
    emergencyContact: 'Richmond Darko - +233 26 111 2223',
    role: 'visitor',
    status: 'visitor',
    department: null,
    notes: 'Visiting from Kumasi, considering relocating to Accra',
    membershipDate: new Date('2024-11-15'),
    isActive: true,
  },
]

async function seedMembers() {
  try {
    console.log('🌱 Starting to seed church members...')
    
    // Insert all sample members
    const insertedMembers = await db.insert(members).values(sampleMembers).returning()
    
    console.log(`✅ Successfully seeded ${insertedMembers.length} members:`)
    
    // Group by role for summary
    const roleGroups = insertedMembers.reduce((acc, member) => {
      acc[member.role] = (acc[member.role] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    Object.entries(roleGroups).forEach(([role, count]) => {
      console.log(`   • ${count} ${role}${count > 1 ? 's' : ''}`)
    })
    
    console.log('\n🎉 Church database seeded successfully!')
    console.log('📋 You can now view these members at: http://localhost:5173/members')
    console.log('🗄️ Or in Drizzle Studio at: https://local.drizzle.studio')
    
  } catch (error) {
    console.error('❌ Error seeding members:', error)
    process.exit(1)
  }
}

// Run the seeding
seedMembers()
  .then(() => {
    console.log('✨ Seeding completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error)
    process.exit(1)
  })
