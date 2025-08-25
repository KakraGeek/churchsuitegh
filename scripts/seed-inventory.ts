import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { 
  inventoryItems, 
  inventoryCategories,
  members 
} from '../src/lib/db/schema'
import { eq } from 'drizzle-orm'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

async function seedInventory() {
  try {
    console.log('🌱 Starting inventory seeding...')

    // First, let's get a member ID to use as createdBy
    const [firstMember] = await db
      .select({ id: members.id })
      .from(members)
      .limit(1)

    if (!firstMember) {
      console.log('❌ No members found in database. Please seed members first.')
      return
    }

    const createdBy = firstMember.id
    console.log(`📝 Using member ID: ${createdBy} as creator`)

    // Create inventory categories
    console.log('📂 Creating inventory categories...')
    
    const categories = [
      {
        name: 'Audio-Visual',
        description: 'Audio and visual equipment for church services and events',
        color: '#3B82F6',
        icon: 'speaker'
      },
      {
        name: 'Literature',
        description: 'Books, Bibles, and printed materials',
        color: '#10B981',
        icon: 'book'
      },
      {
        name: 'Vehicles',
        description: 'Church vehicles for transportation',
        color: '#F59E0B',
        icon: 'car'
      }
    ]

    const createdCategories = []
    for (const category of categories) {
      const [newCategory] = await db
        .insert(inventoryCategories)
        .values({
          ...category,
          createdBy
        })
        .returning()
      
      createdCategories.push(newCategory)
      console.log(`✅ Created category: ${newCategory.name}`)
    }

    // Create inventory items
    console.log('📦 Creating inventory items...')

    const items = [
      // Audio-Visual Equipment
      {
        itemName: 'Epson Projector EB-X41',
        category: 'Audio-Visual',
        itemType: 'Projector',
        description: 'High-quality projector for presentations and worship services',
        serialNumber: 'AV-PROJ-001',
        location: 'Main Sanctuary',
        condition: 'good',
        purchasePrice: 2500000, // 25,000 GHS (stored in pesewas)
        isAvailable: true
      },
      {
        itemName: 'Shure SM58 Microphone',
        category: 'Audio-Visual',
        itemType: 'Microphone',
        description: 'Professional vocal microphone for worship leaders',
        serialNumber: 'AV-MIC-001',
        location: 'Main Sanctuary',
        condition: 'good',
        purchasePrice: 800000, // 8,000 GHS (stored in pesewas)
        isAvailable: true
      },
      {
        itemName: 'Shure SM58 Microphone',
        category: 'Audio-Visual',
        itemType: 'Microphone',
        description: 'Professional vocal microphone for backup singers',
        serialNumber: 'AV-MIC-002',
        location: 'Main Sanctuary',
        condition: 'good',
        purchasePrice: 800000, // 8,000 GHS (stored in pesewas)
        isAvailable: true
      },
      {
        itemName: 'JBL Professional Speaker',
        category: 'Audio-Visual',
        itemType: 'Speaker',
        description: 'Powerful speaker for main sanctuary sound system',
        serialNumber: 'AV-SPK-001',
        location: 'Main Sanctuary',
        condition: 'good',
        purchasePrice: 1500000, // 15,000 GHS (stored in pesewas)
        isAvailable: true
      },
      {
        itemName: 'Yamaha MG10XU Mixer',
        category: 'Audio-Visual',
        itemType: 'Mixer',
        description: '10-channel audio mixer for sound control',
        serialNumber: 'AV-MIX-001',
        location: 'Sound Booth',
        condition: 'good',
        purchasePrice: 1200000, // 12,000 GHS (stored in pesewas)
        isAvailable: true
      },
      {
        itemName: 'Wireless Microphone System',
        category: 'Audio-Visual',
        itemType: 'Wireless System',
        description: 'Complete wireless microphone system with receiver',
        serialNumber: 'AV-WMIC-001',
        location: 'Main Sanctuary',
        condition: 'good',
        purchasePrice: 2000000, // 20,000 GHS (stored in pesewas)
        isAvailable: true
      },

      // Literature
      {
        itemName: 'King James Bible (Hardcover)',
        category: 'Literature',
        itemType: 'Bible',
        description: 'Traditional King James Version Bible for church use',
        serialNumber: 'LIT-BIBLE-001',
        location: 'Main Sanctuary',
        condition: 'good',
        purchasePrice: 150000, // 1,500 GHS (stored in pesewas)
        isAvailable: true
      },
      {
        itemName: 'King James Bible (Hardcover)',
        category: 'Literature',
        itemType: 'Bible',
        description: 'Traditional King James Version Bible for church use',
        serialNumber: 'LIT-BIBLE-002',
        location: 'Main Sanctuary',
        condition: 'good',
        purchasePrice: 150000, // 1,500 GHS (stored in pesewas)
        isAvailable: true
      },
      {
        itemName: 'King James Bible (Hardcover)',
        category: 'Literature',
        itemType: 'Bible',
        description: 'Traditional King James Version Bible for church use',
        serialNumber: 'LIT-BIBLE-003',
        location: 'Main Sanctuary',
        condition: 'good',
        purchasePrice: 150000, // 1,500 GHS (stored in pesewas)
        isAvailable: true
      },
      {
        itemName: 'Hymn Book - Songs of Praise',
        category: 'Literature',
        itemType: 'Hymn Book',
        description: 'Traditional hymn book for congregational singing',
        serialNumber: 'LIT-HYMN-001',
        location: 'Main Sanctuary',
        condition: 'good',
        purchasePrice: 80000, // 800 GHS (stored in pesewas)
        isAvailable: true
      },
      {
        itemName: 'Hymn Book - Songs of Praise',
        category: 'Literature',
        itemType: 'Hymn Book',
        description: 'Traditional hymn book for congregational singing',
        serialNumber: 'LIT-HYMN-002',
        location: 'Main Sanctuary',
        condition: 'good',
        purchasePrice: 80000, // 800 GHS (stored in pesewas)
        isAvailable: true
      },
      {
        itemName: 'Hymn Book - Songs of Praise',
        category: 'Literature',
        itemType: 'Hymn Book',
        description: 'Traditional hymn book for congregational singing',
        serialNumber: 'LIT-HYMN-003',
        location: 'Main Sanctuary',
        condition: 'good',
        purchasePrice: 80000, // 800 GHS (stored in pesewas)
        isAvailable: true
      },
      {
        itemName: 'Hymn Book - Songs of Praise',
        category: 'Literature',
        itemType: 'Hymn Book',
        description: 'Traditional hymn book for congregational singing',
        serialNumber: 'LIT-HYMN-004',
        location: 'Main Sanctuary',
        condition: 'good',
        purchasePrice: 80000, // 800 GHS (stored in pesewas)
        isAvailable: true
      },
      {
        itemName: 'Hymn Book - Songs of Praise',
        category: 'Literature',
        itemType: 'Hymn Book',
        description: 'Traditional hymn book for congregational singing',
        serialNumber: 'LIT-HYMN-005',
        location: 'Main Sanctuary',
        condition: 'good',
        purchasePrice: 80000, // 800 GHS (stored in pesewas)
        isAvailable: true
      },
      {
        itemName: 'Study Bible - NIV',
        category: 'Literature',
        itemType: 'Study Bible',
        description: 'New International Version study Bible for Bible study groups',
        serialNumber: 'LIT-STUDY-001',
        location: 'Library',
        condition: 'good',
        purchasePrice: 200000, // 2,000 GHS (stored in pesewas)
        isAvailable: true
      },
      {
        itemName: 'Study Bible - NIV',
        category: 'Literature',
        itemType: 'Study Bible',
        description: 'New International Version study Bible for Bible study groups',
        serialNumber: 'LIT-STUDY-002',
        location: 'Library',
        condition: 'good',
        purchasePrice: 200000, // 2,000 GHS (stored in pesewas)
        isAvailable: true
      },

      // Vehicles
      {
        itemName: 'Church Bus - Toyota Coaster',
        category: 'Vehicles',
        itemType: 'Bus',
        description: '22-seater bus for church events, youth trips, and transportation',
        serialNumber: 'VEH-BUS-001',
        location: 'Church Parking Lot',
        condition: 'good',
        purchasePrice: 99999999, // 999,999.99 GHS (stored in pesewas)
        isAvailable: true
      },
      {
        itemName: 'Church Van - Toyota Hiace',
        category: 'Vehicles',
        itemType: 'Van',
        description: '15-seater van for smaller group transportation',
        serialNumber: 'VEH-VAN-001',
        location: 'Church Parking Lot',
        condition: 'good',
        purchasePrice: 50000000, // 500,000.00 GHS (stored in pesewas)
        isAvailable: true
      }
    ]

    for (const item of items) {
      const [newItem] = await db
        .insert(inventoryItems)
        .values({
          ...item,
          createdBy
        })
        .returning()
      
      console.log(`✅ Created item: ${newItem.itemName} (${newItem.category})`)
    }

    console.log('🎉 Inventory seeding completed successfully!')
    console.log(`📊 Created ${categories.length} categories and ${items.length} items`)

  } catch (error) {
    console.error('❌ Error seeding inventory:', error)
    process.exit(1)
  }
}

// Run the seeding
seedInventory()
  .then(() => {
    console.log('✅ Seeding completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  })
