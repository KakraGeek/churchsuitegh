import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'
import { 
  sundayServicePrograms, 
  serviceSongs, 
  serviceProgramSections,
  members 
} from '../src/lib/db/schema'

// Load environment variables
config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

async function seedSundayServices() {
  try {
    console.log('🌅 Starting Sunday Service seeding...')

    // Get a member ID to use as createdBy (we'll use the first member)
    const [member] = await db
      .select({ id: members.id })
      .from(members)
      .limit(1)

    if (!member) {
      console.error('❌ No members found in database. Please seed members first.')
      process.exit(1)
    }

    const createdBy = member.id
    console.log(`✅ Using member ID: ${createdBy}`)

    // September 2025 dates (Sundays)
    const septemberDates = [
      new Date('2025-09-07'), // First Sunday
      new Date('2025-09-14'), // Second Sunday
      new Date('2025-09-21'), // Third Sunday
      new Date('2025-09-28')  // Fourth Sunday
    ]

    // Service themes and details
    const serviceDetails = [
      {
        title: 'Sunday Service',
        theme: 'God\'s Unfailing Love',
        preacher: 'Pastor John Mensah',
        scriptureReading: 'Romans 8:35-39 - Nothing can separate us from God\'s love',
        announcements: 'Welcome to our new members. Youth meeting next Saturday at 3 PM. Prayer meeting every Wednesday at 6 PM.',
        specialNotes: 'Communion will be served today. Please prepare your hearts.'
      },
      {
        title: 'Sunday Service',
        theme: 'Walking in Faith',
        preacher: 'Rev. Sarah Addo',
        scriptureReading: 'Hebrews 11:1-6 - Faith is confidence in what we hope for',
        announcements: 'Bible study continues this Tuesday. Women\'s fellowship meeting next Friday. Don\'t forget to bring your Bibles.',
        specialNotes: 'Special offering for missions today. Children\'s ministry registration open.'
      },
      {
        title: 'Sunday Service',
        theme: 'The Power of Prayer',
        preacher: 'Pastor Michael Osei',
        scriptureReading: 'James 5:13-18 - The prayer of a righteous person is powerful',
        announcements: 'Men\'s breakfast this Saturday at 8 AM. Choir practice every Thursday. New members class starting next week.',
        specialNotes: 'Prayer requests can be submitted at the welcome desk. Healing service next Sunday.'
      },
      {
        title: 'Sunday Service',
        theme: 'Living in Gratitude',
        preacher: 'Rev. Grace Asante',
        scriptureReading: '1 Thessalonians 5:16-18 - Give thanks in all circumstances',
        announcements: 'Thanksgiving service next month. Youth choir auditions this week. Bible reading challenge continues.',
        specialNotes: 'Special thanksgiving offering today. Fellowship lunch after service.'
      }
    ]

    // Popular hymns with lyrics
    const hymns = [
      {
        title: 'Amazing Grace',
        type: 'hymn',
        number: '1',
        composer: 'John Newton',
        key: 'C',
        lyrics: `Amazing grace! How sweet the sound
That saved a wretch like me!
I once was lost, but now am found;
Was blind, but now I see.

'Twas grace that taught my heart to fear,
And grace my fears relieved;
How precious did that grace appear
The hour I first believed.

Through many dangers, toils and snares,
I have already come;
'Tis grace hath brought me safe thus far,
And grace will lead me home.

The Lord has promised good to me,
His Word my hope secures;
He will my Shield and Portion be,
As long as life endures.

Yea, when this flesh and heart shall fail,
And mortal life shall cease,
I shall possess, within the veil,
A life of joy and peace.

The earth shall soon dissolve like snow,
The sun forbear to shine;
But God, who called me here below,
Shall be forever mine.

When we've been there ten thousand years,
Bright shining as the sun,
We've no less days to sing God's praise
Than when we'd first begun.`
      },
      {
        title: 'How Great Thou Art',
        type: 'hymn',
        number: '2',
        composer: 'Carl Boberg',
        key: 'G',
        lyrics: `O Lord my God, when I in awesome wonder
Consider all the worlds Thy hands have made
I see the stars, I hear the rolling thunder
Thy power throughout the universe displayed

Then sings my soul, my Savior God, to Thee
How great Thou art, how great Thou art
Then sings my soul, my Savior God, to Thee
How great Thou art, how great Thou art

When through the woods and forest glades I wander
And hear the birds sing sweetly in the trees
When I look down from lofty mountain grandeur
And see the brook and feel the gentle breeze

Then sings my soul, my Savior God, to Thee
How great Thou art, how great Thou art
Then sings my soul, my Savior God, to Thee
How great Thou art, how great Thou art

And when I think that God, His Son not sparing
Sent Him to die, I scarce can take it in
That on the cross, my burden gladly bearing
He bled and died to take away my sin

Then sings my soul, my Savior God, to Thee
How great Thou art, how great Thou art
Then sings my soul, my Savior God, to Thee
How great Thou art, how great Thou art

When Christ shall come with shout of acclamation
And take me home, what joy shall fill my heart
Then I shall bow in humble adoration
And there proclaim, "My God, how great Thou art!"

Then sings my soul, my Savior God, to Thee
How great Thou art, how great Thou art
Then sings my soul, my Savior God, to Thee
How great Thou art, how great Thou art`
      },
      {
        title: 'O for a Thousand Tongues to Sing',
        type: 'hymn',
        number: '3',
        composer: 'Charles Wesley',
        key: 'D',
        lyrics: `O for a thousand tongues to sing
My great Redeemer's praise,
The glories of my God and King,
The triumphs of His grace!

My gracious Master and my God,
Assist me to proclaim,
To spread through all the earth abroad
The honors of Thy name.

Jesus! the name that charms our fears,
That bids our sorrows cease;
'Tis music in the sinner's ears,
'Tis life, and health, and peace.

He breaks the power of canceled sin,
He sets the prisoner free;
His blood can make the foulest clean,
His blood availed for me.

He speaks, and listening to His voice,
New life the dead receive;
The mournful, broken hearts rejoice,
The humble poor believe.

Hear Him, ye deaf; His praise, ye dumb,
Your loosened tongues employ;
Ye blind, behold your Savior come,
And leap, ye lame, for joy.

In Christ, your Head, you then shall know,
Shall feel your sins forgiven;
Anticipate your heaven below,
And own that love is heaven.`
      },
      {
        title: 'Blessed Assurance',
        type: 'hymn',
        number: '4',
        composer: 'Fanny Crosby',
        key: 'F',
        lyrics: `Blessed assurance, Jesus is mine!
O what a foretaste of glory divine!
Heir of salvation, purchase of God,
Born of His Spirit, washed in His blood.

This is my story, this is my song,
Praising my Savior all the day long;
This is my story, this is my song,
Praising my Savior all the day long.

Perfect submission, perfect delight,
Visions of rapture now burst on my sight;
Angels, descending, bring from above
Echoes of mercy, whispers of love.

This is my story, this is my song,
Praising my Savior all the day long;
This is my story, this is my song,
Praising my Savior all the day long.

Perfect submission, all is at rest,
I in my Savior am happy and blest,
Watching and waiting, looking above,
Filled with His goodness, lost in His love.

This is my story, this is my song,
Praising my Savior all the day long;
This is my story, this is my song,
Praising my Savior all the day long.`
      },
      {
        title: 'It Is Well',
        type: 'hymn',
        number: '5',
        composer: 'Horatio Spafford',
        key: 'E♭',
        lyrics: `When peace like a river attendeth my way,
When sorrows like sea billows roll;
Whatever my lot, Thou hast taught me to say,
It is well, it is well with my soul.

It is well with my soul,
It is well, it is well with my soul.

Though Satan should buffet, though trials should come,
Let this blest assurance control,
That Christ hath regarded my helpless estate,
And hath shed His own blood for my soul.

It is well with my soul,
It is well, it is well with my soul.

My sin, oh, the bliss of this glorious thought!
My sin, not in part but the whole,
Is nailed to the cross, and I bear it no more,
Praise the Lord, praise the Lord, O my soul!

It is well with my soul,
It is well, it is well with my soul.

And Lord, haste the day when my faith shall be sight,
The clouds be rolled back as a scroll;
The trump shall resound, and the Lord shall descend,
Even so, it is well with my soul.

It is well with my soul,
It is well, it is well with my soul.`
      }
    ]

    // Service sections template
    const serviceSections = [
      { title: 'Opening Prayer', type: 'prayer', description: 'Opening prayer to begin the service', duration: 3, order: 1 },
      { title: 'Welcome & Announcements', type: 'announcement', description: 'Welcome visitors and share announcements', duration: 5, order: 2 },
      { title: 'Opening Hymn', type: 'song', description: 'First hymn of the service', duration: 4, order: 3 },
      { title: 'Scripture Reading', type: 'scripture', description: 'Reading of the day\'s scripture passage', duration: 3, order: 4 },
      { title: 'Prayer of Intercession', type: 'prayer', description: 'Prayer for the church and world', duration: 4, order: 5 },
      { title: 'Special Music', type: 'song', description: 'Special musical selection', duration: 4, order: 6 },
      { title: 'Sermon', type: 'sermon', description: 'Main message of the service', duration: 25, order: 7 },
      { title: 'Response Hymn', type: 'song', description: 'Hymn following the sermon', duration: 4, order: 8 },
      { title: 'Offering', type: 'offering', description: 'Collection of tithes and offerings', duration: 5, order: 9 },
      { title: 'Closing Hymn', type: 'song', description: 'Final hymn of the service', duration: 4, order: 10 },
      { title: 'Benediction', type: 'benediction', description: 'Closing blessing and dismissal', duration: 2, order: 11 }
    ]

    // Create service programs for each Sunday
    for (let i = 0; i < septemberDates.length; i++) {
      const date = septemberDates[i]
      const details = serviceDetails[i]
      
      console.log(`📅 Creating service program for ${date.toDateString()}...`)

      // Create the main service program
      const [serviceProgram] = await db
        .insert(sundayServicePrograms)
        .values({
          serviceDate: date,
          title: details.title,
          theme: details.theme,
          preacher: details.preacher,
          scriptureReading: details.scriptureReading,
          announcements: details.announcements,
          specialNotes: details.specialNotes,
          createdBy: createdBy
        })
        .returning()

      console.log(`✅ Created service program: ${serviceProgram.title}`)

      // Create service sections
      for (const section of serviceSections) {
        await db
          .insert(serviceProgramSections)
          .values({
            programId: serviceProgram.id,
            sectionTitle: section.title,
            sectionType: section.type,
            description: section.description,
            duration: section.duration,
            orderInService: section.order,
            createdBy: createdBy
          })
      }

      console.log(`✅ Created ${serviceSections.length} service sections`)

      // Create songs for this service (all 5 hymns)
      for (let j = 0; j < hymns.length; j++) {
        const hymn = hymns[j]
        await db
          .insert(serviceSongs)
          .values({
            programId: serviceProgram.id,
            songTitle: hymn.title,
            songType: hymn.type,
            lyrics: hymn.lyrics,
            songNumber: hymn.number,
            composer: hymn.composer,
            keySignature: hymn.key,
            orderInService: j + 1,
            createdBy: createdBy
          })
      }

      console.log(`✅ Created ${hymns.length} hymns for the service`)
      console.log(`🎵 Hymns: ${hymns.map(h => h.title).join(', ')}`)
    }

    console.log('🎉 Sunday Service seeding completed successfully!')
    console.log(`📊 Created ${septemberDates.length} service programs`)
    console.log(`🎵 Each service includes ${hymns.length} popular hymns`)
    console.log(`📅 Services scheduled for: ${septemberDates.map(d => d.toDateString()).join(', ')}`)

  } catch (error) {
    console.error('❌ Error seeding Sunday services:', error)
    process.exit(1)
  }
}

// Run the seeding
seedSundayServices()
  .then(() => {
    console.log('✅ Seeding completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  })
