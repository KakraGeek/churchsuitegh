import { drizzle } from 'drizzle-orm/neon-http'
import { neon, type NeonQueryFunction } from '@neondatabase/serverless'
import * as schema from './schema'

// Lazy database connection
let _db: ReturnType<typeof drizzle> | null = null

export const getDb = () => {
  if (!_db) {
    const dbUrl = import.meta.env.VITE_DATABASE_URL || import.meta.env.DATABASE_URL
    
    if (!dbUrl) {
      console.warn('Database URL not configured. Some features may not work.')
      // Return a mock database that won't break the app
      return createMockDb()
    }
    
    try {
      const sql: NeonQueryFunction<boolean, boolean> = neon(dbUrl)
      _db = drizzle(sql, { schema })
    } catch (error) {
      console.error('Failed to initialize database:', error)
      return createMockDb()
    }
  }
  
  return _db
}

// Create a mock database that won't break the app
function createMockDb() {
  return {
    select: () => ({
      from: () => ({
        where: () => ({
          execute: async () => ({ rows: [], rowCount: 0 })
        })
      })
    }),
    insert: () => ({
      values: () => ({
        returning: async () => ({ rows: [], rowCount: 0 })
      })
    }),
    update: () => ({
      set: () => ({
        where: () => ({
          returning: async () => ({ rows: [], rowCount: 0 })
        })
      })
    }),
    delete: () => ({
      where: () => ({
        returning: async () => ({ rows: [], rowCount: 0 })
      })
    })
  } as any
}

// Export db for backward compatibility
export const db = getDb()

// Re-export schema
export { schema }
export * from './schema'
