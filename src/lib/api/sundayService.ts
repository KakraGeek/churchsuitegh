// Sunday Service Management API
// Handles all operations related to Sunday service programs, songs, and sections

import { db } from '@/lib/db'
import { 
  sundayServicePrograms, 
  serviceSongs, 
  serviceProgramSections
} from '@/lib/db/schema'
import { eq, and, desc, asc, gte } from 'drizzle-orm'
import type { 
  NewSundayServiceProgram, 
  NewServiceSong, 
  NewServiceProgramSection,
  SundayServiceProgram,
  ServiceSong,
  ServiceProgramSection
} from '@/lib/db/schema'

// === API RESPONSE TYPES ===

export interface ApiResponse<T> {
  ok: boolean
  data?: T
  error?: string
}

function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return { ok: true, data }
}

function createErrorResponse<T>(error: string): ApiResponse<T> {
  return { error, ok: false }
}

// === SUNDAY SERVICE PROGRAMS ===

export async function createSundayServiceProgram(programData: NewSundayServiceProgram): Promise<ApiResponse<SundayServiceProgram>> {
  try {
    // Check if a program already exists for this date
    const [existingProgram] = await db
      .select()
      .from(sundayServicePrograms)
      .where(eq(sundayServicePrograms.serviceDate, programData.serviceDate))
      .limit(1)

    if (existingProgram) {
      return createErrorResponse('A service program already exists for this date')
    }

    const [newProgram] = await db
      .insert(sundayServicePrograms)
      .values(programData)
      .returning()

    return createSuccessResponse(newProgram)
  } catch (error) {
    console.error('Error creating Sunday service program:', error)
    return createErrorResponse('Failed to create Sunday service program')
  }
}

export async function getSundayServiceProgram(programId: string): Promise<ApiResponse<SundayServiceProgram>> {
  try {
    const [program] = await db
      .select()
      .from(sundayServicePrograms)
      .where(eq(sundayServicePrograms.id, programId))
      .limit(1)

    if (!program) {
      return createErrorResponse('Service program not found')
    }

    return createSuccessResponse(program)
  } catch (error) {
    console.error('Error fetching Sunday service program:', error)
    return createErrorResponse('Failed to fetch Sunday service program')
  }
}

export async function getSundayServiceProgramByDate(serviceDate: string): Promise<ApiResponse<SundayServiceProgram>> {
  try {
    const [program] = await db
      .select()
      .from(sundayServicePrograms)
      .where(eq(sundayServicePrograms.serviceDate, serviceDate))
      .limit(1)

    if (!program) {
      return createErrorResponse('Service program not found for this date')
    }

    return createSuccessResponse(program)
  } catch (error) {
    console.error('Error fetching Sunday service program by date:', error)
    return createErrorResponse('Failed to fetch Sunday service program by date')
  }
}

export async function getAllSundayServicePrograms(): Promise<ApiResponse<SundayServiceProgram[]>> {
  try {
    const programs = await db
      .select()
      .from(sundayServicePrograms)
      .where(eq(sundayServicePrograms.isActive, true))
      .orderBy(desc(sundayServicePrograms.serviceDate))

    return createSuccessResponse(programs)
  } catch (error) {
    console.error('Error fetching Sunday service programs:', error)
    return createErrorResponse('Failed to fetch Sunday service programs')
  }
}

export async function getUpcomingSundayServicePrograms(): Promise<ApiResponse<SundayServiceProgram[]>> {
  try {
    const today = new Date().toISOString().split('T')[0] // Convert to YYYY-MM-DD string

    const programs = await db
      .select()
      .from(sundayServicePrograms)
      .where(and(
        eq(sundayServicePrograms.isActive, true),
        gte(sundayServicePrograms.serviceDate, today)
      ))
      .orderBy(asc(sundayServicePrograms.serviceDate))

    return createSuccessResponse(programs)
  } catch (error) {
    console.error('Error fetching upcoming Sunday service programs:', error)
    return createErrorResponse('Failed to fetch upcoming Sunday service programs')
  }
}

export async function updateSundayServiceProgram(programId: string, updates: Partial<NewSundayServiceProgram>): Promise<ApiResponse<SundayServiceProgram>> {
  try {
    const [updatedProgram] = await db
      .update(sundayServicePrograms)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(sundayServicePrograms.id, programId))
      .returning()

    if (!updatedProgram) {
      return createErrorResponse('Service program not found')
    }

    return createSuccessResponse(updatedProgram)
  } catch (error) {
    console.error('Error updating Sunday service program:', error)
    return createErrorResponse('Failed to update Sunday service program')
  }
}

export async function deactivateSundayServiceProgram(programId: string): Promise<ApiResponse<SundayServiceProgram>> {
  try {
    const [deactivatedProgram] = await db
      .update(sundayServicePrograms)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(sundayServicePrograms.id, programId))
      .returning()

    if (!deactivatedProgram) {
      return createErrorResponse('Service program not found')
    }

    return createSuccessResponse(deactivatedProgram)
  } catch (error) {
    console.error('Error deactivating Sunday service program:', error)
    return createErrorResponse('Failed to deactivate Sunday service program')
  }
}

// === SERVICE SONGS ===

export async function createServiceSong(songData: NewServiceSong): Promise<ApiResponse<ServiceSong>> {
  try {
    const [newSong] = await db
      .insert(serviceSongs)
      .values(songData)
      .returning()

    return createSuccessResponse(newSong)
  } catch (error) {
    console.error('Error creating service song:', error)
    return createErrorResponse('Failed to create service song')
  }
}

export async function getServiceSongsByProgram(programId: string): Promise<ApiResponse<ServiceSong[]>> {
  try {
    const songs = await db
      .select()
      .from(serviceSongs)
      .where(and(
        eq(serviceSongs.programId, programId),
        eq(serviceSongs.isActive, true)
      ))
      .orderBy(asc(serviceSongs.orderInService))

    return createSuccessResponse(songs)
  } catch (error) {
    console.error('Error fetching service songs:', error)
    return createErrorResponse('Failed to fetch service songs')
  }
}

export async function getServiceSong(songId: string): Promise<ApiResponse<ServiceSong>> {
  try {
    const [song] = await db
      .select()
      .from(serviceSongs)
      .where(eq(serviceSongs.id, songId))
      .limit(1)

    if (!song) {
      return createErrorResponse('Service song not found')
    }

    return createSuccessResponse(song)
  } catch (error) {
    console.error('Error fetching service song:', error)
    return createErrorResponse('Failed to fetch service song')
  }
}

export async function updateServiceSong(songId: string, updates: Partial<NewServiceSong>): Promise<ApiResponse<ServiceSong>> {
  try {
    const [updatedSong] = await db
      .update(serviceSongs)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(serviceSongs.id, songId))
      .returning()

    if (!updatedSong) {
      return createErrorResponse('Service song not found')
    }

    return createSuccessResponse(updatedSong)
  } catch (error) {
    console.error('Error updating service song:', error)
    return createErrorResponse('Failed to update service song')
  }
}

export async function deleteServiceSong(songId: string): Promise<ApiResponse<boolean>> {
  try {
    await db
      .delete(serviceSongs)
      .where(eq(serviceSongs.id, songId))

    return createSuccessResponse(true)
  } catch (error) {
    console.error('Error deleting service song:', error)
    return createErrorResponse('Failed to delete service song')
  }
}

// === SERVICE PROGRAM SECTIONS ===

export async function createServiceProgramSection(sectionData: NewServiceProgramSection): Promise<ApiResponse<ServiceProgramSection>> {
  try {
    const [newSection] = await db
      .insert(serviceProgramSections)
      .values(sectionData)
      .returning()

    return createSuccessResponse(newSection)
  } catch (error) {
    console.error('Error creating service program section:', error)
    return createErrorResponse('Failed to create service program section')
  }
}

export async function getServiceProgramSections(programId: string): Promise<ApiResponse<ServiceProgramSection[]>> {
  try {
    const sections = await db
      .select()
      .from(serviceProgramSections)
      .where(and(
        eq(serviceProgramSections.programId, programId),
        eq(serviceProgramSections.isActive, true)
      ))
      .orderBy(asc(serviceProgramSections.orderInService))

    return createSuccessResponse(sections)
  } catch (error) {
    console.error('Error fetching service program sections:', error)
    return createErrorResponse('Failed to fetch service program sections')
  }
}

export async function updateServiceProgramSection(sectionId: string, updates: Partial<NewServiceProgramSection>): Promise<ApiResponse<ServiceProgramSection>> {
  try {
    const [updatedSection] = await db
      .update(serviceProgramSections)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(serviceProgramSections.id, sectionId))
      .returning()

    if (!updatedSection) {
      return createErrorResponse('Service program section not found')
    }

    return createSuccessResponse(updatedSection)
  } catch (error) {
    console.error('Error updating service program section:', error)
    return createErrorResponse('Failed to update service program section')
  }
}

export async function deleteServiceProgramSection(sectionId: string): Promise<ApiResponse<boolean>> {
  try {
    await db
      .delete(serviceProgramSections)
      .where(eq(serviceProgramSections.id, sectionId))

    return createSuccessResponse(true)
  } catch (error) {
    console.error('Error deleting service program section:', error)
    return createErrorResponse('Failed to delete service program section')
  }
}

// === COMPLETE SERVICE PROGRAM WITH SONGS AND SECTIONS ===

export interface CompleteServiceProgram extends SundayServiceProgram {
  songs: ServiceSong[]
  sections: ServiceProgramSection[]
}

export async function getCompleteServiceProgram(programId: string): Promise<ApiResponse<CompleteServiceProgram>> {
  try {
    const [program] = await db
      .select()
      .from(sundayServicePrograms)
      .where(eq(sundayServicePrograms.id, programId))
      .limit(1)

    if (!program) {
      return createErrorResponse('Service program not found')
    }

    // Get songs and sections for this program
    const [songsResult, sectionsResult] = await Promise.all([
      getServiceSongsByProgram(programId),
      getServiceProgramSections(programId)
    ])

    const completeProgram: CompleteServiceProgram = {
      ...program,
      songs: songsResult.ok ? songsResult.data || [] : [],
      sections: sectionsResult.ok ? sectionsResult.data || [] : []
    }

    return createSuccessResponse(completeProgram)
  } catch (error) {
    console.error('Error fetching complete service program:', error)
    return createErrorResponse('Failed to fetch complete service program')
  }
}

export async function getCompleteServiceProgramByDate(serviceDate: string): Promise<ApiResponse<CompleteServiceProgram>> {
  try {
    const programResult = await getSundayServiceProgramByDate(serviceDate)
    if (!programResult.ok) {
      return createErrorResponse(programResult.error || 'Failed to fetch service program by date')
    }

    const program = programResult.data!
    return getCompleteServiceProgram(program.id)
  } catch (error) {
    console.error('Error fetching complete service program by date:', error)
    return createErrorResponse('Failed to fetch complete service program by date')
  }
}
