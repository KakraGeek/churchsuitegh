import { drizzle } from 'drizzle-orm/neon-http'
import { neon, type NeonQueryFunction } from '@neondatabase/serverless'
import * as schema from './schema'

// Lazy database connection
let _db: ReturnType<typeof drizzle> | null = null

export const getDb = () => {
  if (!_db) {
    const dbUrl = import.meta.env.VITE_DATABASE_URL
    
    if (!dbUrl) {
      console.warn('Database URL not configured. Some features may not work.')
      // Return a mock database for development
      return {} as ReturnType<typeof drizzle>
    }
    
    const sql: NeonQueryFunction<boolean, boolean> = neon(dbUrl)
    _db = drizzle(sql, { schema })
  }
  
  return _db
}

// Export db for backward compatibility
export const db = getDb()

// Re-export schema
export { schema }
export * from './schema'
