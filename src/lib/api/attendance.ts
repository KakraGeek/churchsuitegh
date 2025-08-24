import { db } from '@/lib/db'
import { 
  attendance, 
  attendanceQRCodes, 
  members, 
  events,
  insertAttendanceSchema, 
  insertQRCodeSchema 
} from '@/lib/db/schema'
import { eq, and, gte, lte, desc, asc, count, sql } from 'drizzle-orm'
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/lib/utils'
import type { 
  Attendance, 
  NewAttendance, 
  AttendanceQRCode, 
  NewAttendanceQRCode,
  Member,
  ChurchEvent
} from '@/lib/db/schema'

// Check if we're in development mode without a real database
const isDevelopmentMode = !import.meta.env.VITE_DATABASE_URL

// Mock data for development
let mockAttendance: Attendance[] = [
  {
    id: '1',
    memberId: '1',
    eventId: '1',
    serviceDate: new Date('2025-09-07T10:00:00'),
    serviceType: 'sunday-service',
    checkInTime: new Date('2025-09-07T09:45:00'),
    checkOutTime: new Date('2025-09-07T12:15:00'),
    checkInMethod: 'qr-code',
    qrCodeId: 'QR-SUNDAY-001',
    location: 'Main Sanctuary',
    notes: null,
    recordedBy: null,
    createdAt: new Date('2025-09-07T09:45:00'),
    updatedAt: new Date('2025-09-07T09:45:00'),
  },
  {
    id: '2',
    memberId: '2',
    eventId: '2',
    serviceDate: new Date('2025-09-10T19:00:00'),
    serviceType: 'bible-study',
    checkInTime: new Date('2025-09-10T18:55:00'),
    checkOutTime: null,
    checkInMethod: 'manual',
    qrCodeId: null,
    location: 'Fellowship Hall',
    notes: 'Late arrival',
    recordedBy: '1',
    createdAt: new Date('2025-09-10T18:55:00'),
    updatedAt: new Date('2025-09-10T18:55:00'),
  },
]

let mockQRCodes: AttendanceQRCode[] = [
  {
    id: '1',
    qrCodeId: 'QR-SUNDAY-001',
    eventId: '1',
    serviceType: 'sunday-service',
    serviceDate: new Date('2025-01-12T10:00:00'), // Today's date for demo
    location: 'Main Sanctuary Entrance',
    isActive: true,
    expiresAt: new Date('2025-01-12T13:00:00'), // Expires today
    maxUses: null,
    currentUses: 5,
    displayOnScreens: true, // Show on displays
    displayLocation: 'Main Entrance',
    lastDisplayed: new Date(),
    createdBy: '1',
    createdAt: new Date('2025-01-12T08:00:00'),
    updatedAt: new Date(),
  },
]

let nextAttendanceId = 3
let nextQRCodeId = 2

// Attendance Statistics Interface
interface AttendanceStats {
  totalAttendance: number
  thisWeekAttendance: number
  averageAttendance: number
  attendanceByService: Record<string, number>
  growthRate: number
  topMembers: Array<{
    memberId: string
    memberName: string
    attendanceCount: number
  }>
}

// === ATTENDANCE CRUD OPERATIONS ===

export async function recordAttendance(attendanceData: NewAttendance): Promise<ApiResponse<Attendance>> {
  try {
    // Validate the attendance data
    const validatedData = insertAttendanceSchema.parse(attendanceData)

    if (isDevelopmentMode) {
          const newAttendance: Attendance = {
      id: nextAttendanceId.toString(),
      ...validatedData,
      notes: validatedData.notes || null,
      recordedBy: validatedData.recordedBy || null,
      eventId: validatedData.eventId || null,
      checkOutTime: validatedData.checkOutTime || null,
      qrCodeId: validatedData.qrCodeId || null,
      location: validatedData.location || null,
      checkInMethod: validatedData.checkInMethod || 'manual',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
      
      mockAttendance.push(newAttendance)
      nextAttendanceId++
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 200))
      return createSuccessResponse(newAttendance)
    }

    // Insert into database
    const result = await db
      .insert(attendance)
      .values(validatedData)
      .returning()

    const newAttendance = (result as Attendance[])[0]
    return createSuccessResponse(newAttendance)
  } catch (error) {
    console.error('Error recording attendance:', error)
    return createErrorResponse('Failed to record attendance.')
  }
}

export async function getAttendanceById(id: string): Promise<ApiResponse<Attendance & { member?: Member; event?: ChurchEvent }>> {
  try {
    if (isDevelopmentMode) {
      const attendance = mockAttendance.find(a => a.id === id)
      if (!attendance) {
        return createErrorResponse('Attendance record not found.')
      }
      
      await new Promise(resolve => setTimeout(resolve, 200))
      return createSuccessResponse(attendance)
    }

    const result = await db
      .select({
        attendance: attendance,
        member: members,
        event: events,
      })
      .from(attendance)
      .leftJoin(members, eq(attendance.memberId, members.id))
      .leftJoin(events, eq(attendance.eventId, events.id))
      .where(eq(attendance.id, id))
      .limit(1)

    if (!result[0]) {
      return createErrorResponse('Attendance record not found.')
    }

    const attendanceRecord = {
      ...result[0].attendance,
      member: result[0].member,
      event: result[0].event,
    } as Attendance & { member?: Member; event?: ChurchEvent }

    return createSuccessResponse(attendanceRecord)
  } catch (error) {
    console.error('Error fetching attendance:', error)
    return createErrorResponse('Failed to fetch attendance record.')
  }
}

export async function getAttendanceByDate(
  startDate: Date,
  endDate: Date,
  serviceType?: string
): Promise<ApiResponse<(Attendance & { member?: Member; event?: ChurchEvent })[]>> {
  try {
    if (isDevelopmentMode) {
      let filteredAttendance = mockAttendance.filter(a => {
        const serviceDate = new Date(a.serviceDate)
        return serviceDate >= startDate && serviceDate <= endDate
      })

      if (serviceType) {
        filteredAttendance = filteredAttendance.filter(a => a.serviceType === serviceType)
      }

      await new Promise(resolve => setTimeout(resolve, 300))
      return createSuccessResponse(filteredAttendance)
    }

    const conditions = [
      gte(attendance.serviceDate, startDate),
      lte(attendance.serviceDate, endDate)
    ]

    if (serviceType) {
      conditions.push(eq(attendance.serviceType, serviceType))
    }

    const result = await db
      .select({
        attendance: attendance,
        member: members,
        event: events,
      })
      .from(attendance)
      .leftJoin(members, eq(attendance.memberId, members.id))
      .leftJoin(events, eq(attendance.eventId, events.id))
      .where(and(...conditions))
      .orderBy(desc(attendance.serviceDate), asc(attendance.checkInTime))

    const attendanceRecords = result.map(r => ({
      ...r.attendance,
      member: r.member,
      event: r.event,
    })) as (Attendance & { member?: Member; event?: ChurchEvent })[]

    return createSuccessResponse(attendanceRecords)
  } catch (error) {
    console.error('Error fetching attendance by date:', error)
    return createErrorResponse('Failed to fetch attendance records.')
  }
}

export async function getMemberAttendanceHistory(
  memberId: string,
  limit: number = 50
): Promise<ApiResponse<(Attendance & { event?: ChurchEvent })[]>> {
  try {
    if (isDevelopmentMode) {
      const memberAttendance = mockAttendance
        .filter(a => a.memberId === memberId)
        .sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime())
        .slice(0, limit)

      await new Promise(resolve => setTimeout(resolve, 200))
      return createSuccessResponse(memberAttendance)
    }

    const result = await db
      .select({
        attendance: attendance,
        event: events,
      })
      .from(attendance)
      .leftJoin(events, eq(attendance.eventId, events.id))
      .where(eq(attendance.memberId, memberId))
      .orderBy(desc(attendance.serviceDate))
      .limit(limit)

    const attendanceRecords = result.map(r => ({
      ...r.attendance,
      event: r.event,
    })) as (Attendance & { event?: ChurchEvent })[]

    return createSuccessResponse(attendanceRecords)
  } catch (error) {
    console.error('Error fetching member attendance history:', error)
    return createErrorResponse('Failed to fetch member attendance history.')
  }
}

// === QR CODE OPERATIONS ===

export async function generateQRCode(qrData: NewAttendanceQRCode): Promise<ApiResponse<AttendanceQRCode>> {
  try {
    // Validate the QR code data
    const validatedData = insertQRCodeSchema.parse(qrData)

    if (isDevelopmentMode) {
          const newQRCode: AttendanceQRCode = {
      id: nextQRCodeId.toString(),
      ...validatedData,
      eventId: validatedData.eventId || null,
      location: validatedData.location || null,
      isActive: validatedData.isActive ?? true,
      expiresAt: validatedData.expiresAt || null,
      maxUses: validatedData.maxUses || null,
      currentUses: validatedData.currentUses || 0,
      displayOnScreens: validatedData.displayOnScreens ?? false,
      displayLocation: validatedData.displayLocation || null,
      lastDisplayed: validatedData.lastDisplayed || null,
      createdBy: validatedData.createdBy || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
      
      mockQRCodes.push(newQRCode)
      nextQRCodeId++
      
      await new Promise(resolve => setTimeout(resolve, 200))
      return createSuccessResponse(newQRCode)
    }

    const result = await db
      .insert(attendanceQRCodes)
      .values(validatedData)
      .returning()

    const newQRCode = (result as AttendanceQRCode[])[0]
    return createSuccessResponse(newQRCode)
  } catch (error) {
    console.error('Error generating QR code:', error)
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
      return createErrorResponse(`Failed to generate QR code: ${error.message}`)
    }
    
    return createErrorResponse('Failed to generate QR code.')
  }
}

export async function validateQRCode(qrCodeId: string): Promise<ApiResponse<AttendanceQRCode & { event?: ChurchEvent }>> {
  try {
    if (isDevelopmentMode) {
      const qrCode = mockQRCodes.find(qr => qr.qrCodeId === qrCodeId && qr.isActive)
      if (!qrCode) {
        return createErrorResponse('Invalid or expired QR code.')
      }

      // Check if expired
      if (qrCode.expiresAt && new Date() > new Date(qrCode.expiresAt)) {
        return createErrorResponse('QR code has expired.')
      }

          // Check usage limits
    if (qrCode.maxUses && (qrCode.currentUses || 0) >= qrCode.maxUses) {
      return createErrorResponse('QR code usage limit reached.')
    }

      await new Promise(resolve => setTimeout(resolve, 200))
      return createSuccessResponse(qrCode)
    }

    const result = await db
      .select({
        qrCode: attendanceQRCodes,
        event: events,
      })
      .from(attendanceQRCodes)
      .leftJoin(events, eq(attendanceQRCodes.eventId, events.id))
      .where(and(
        eq(attendanceQRCodes.qrCodeId, qrCodeId),
        eq(attendanceQRCodes.isActive, true)
      ))
      .limit(1)

    if (!result[0]) {
      return createErrorResponse('Invalid or inactive QR code.')
    }

    const qrCode = result[0].qrCode
    const event = result[0].event

    // Check if expired
    if (qrCode.expiresAt && new Date() > qrCode.expiresAt) {
      return createErrorResponse('QR code has expired.')
    }

    // Check usage limits
    if (qrCode.maxUses && (qrCode.currentUses || 0) >= qrCode.maxUses) {
      return createErrorResponse('QR code usage limit reached.')
    }

    const qrCodeWithEvent = {
      ...qrCode,
      event,
    } as AttendanceQRCode & { event?: ChurchEvent }

    return createSuccessResponse(qrCodeWithEvent)
  } catch (error) {
    console.error('Error validating QR code:', error)
    return createErrorResponse('Failed to validate QR code.')
  }
}

export async function checkInWithQR(
  qrCodeId: string,
  memberId: string,
  location?: string
): Promise<ApiResponse<Attendance>> {
  try {
    // First validate the QR code
    const qrValidation = await validateQRCode(qrCodeId)
    if (!qrValidation.ok || !qrValidation.data) {
      return createErrorResponse(qrValidation.error || 'Invalid QR code.')
    }

    const qrCode = qrValidation.data

    // Check if member already checked in for this service/event
    const existingCheckIn = isDevelopmentMode 
      ? mockAttendance.find(a => 
          a.memberId === memberId && 
          a.serviceDate.toDateString() === qrCode.serviceDate.toDateString() &&
          a.serviceType === qrCode.serviceType
        )
      : await db
          .select()
          .from(attendance)
          .where(and(
            eq(attendance.memberId, memberId),
            eq(attendance.serviceDate, qrCode.serviceDate),
            eq(attendance.serviceType, qrCode.serviceType)
          ))
          .limit(1)

    if (existingCheckIn && (isDevelopmentMode ? existingCheckIn : (existingCheckIn as Attendance[])[0])) {
      return createErrorResponse('You have already checked in for this service.')
    }

    // Record attendance
    const attendanceData: NewAttendance = {
      memberId,
      eventId: qrCode.eventId,
      serviceDate: qrCode.serviceDate,
      serviceType: qrCode.serviceType as 'sunday-service' | 'midweek-service' | 'bible-study' | 'prayer-meeting' | 'special-event' | 'outreach' | 'fellowship' | 'conference',
      checkInTime: new Date(),
      checkInMethod: 'qr-code',
      qrCodeId: qrCodeId,
      location: location || qrCode.location,
    }

    const attendanceResult = await recordAttendance(attendanceData)
    if (!attendanceResult.ok) {
      return attendanceResult
    }

    // Update QR code usage count
    if (isDevelopmentMode) {
      const qrCodeIndex = mockQRCodes.findIndex(qr => qr.qrCodeId === qrCodeId)
      if (qrCodeIndex !== -1) {
        mockQRCodes[qrCodeIndex].currentUses = (mockQRCodes[qrCodeIndex].currentUses || 0) + 1
        mockQRCodes[qrCodeIndex].updatedAt = new Date()
      }
    } else {
      await db
        .update(attendanceQRCodes)
        .set({
          currentUses: sql`${attendanceQRCodes.currentUses} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(attendanceQRCodes.qrCodeId, qrCodeId))
    }

    return attendanceResult
  } catch (error) {
    console.error('Error checking in with QR:', error)
    return createErrorResponse('Failed to check in with QR code.')
  }
}

// === ATTENDANCE STATISTICS ===

export async function getAttendanceStats(): Promise<ApiResponse<AttendanceStats>> {
  try {
    if (isDevelopmentMode) {
      const now = new Date()
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      
      const thisWeekAttendance = mockAttendance.filter(a => 
        new Date(a.serviceDate) >= oneWeekAgo
      ).length

      const attendanceByService = mockAttendance.reduce((acc: Record<string, number>, attendance) => {
        acc[attendance.serviceType] = (acc[attendance.serviceType] || 0) + 1
        return acc
      }, {})

      const stats: AttendanceStats = {
        totalAttendance: mockAttendance.length,
        thisWeekAttendance,
        averageAttendance: Math.round(mockAttendance.length / 4), // Mock average
        attendanceByService,
        growthRate: 12, // Mock growth rate
        topMembers: [
          { memberId: '1', memberName: 'John Doe', attendanceCount: 8 },
          { memberId: '2', memberName: 'Jane Smith', attendanceCount: 6 },
        ]
      }

      await new Promise(resolve => setTimeout(resolve, 300))
      return createSuccessResponse(stats)
    }

    // Get total attendance
    const totalResult = await db
      .select({ count: count() })
      .from(attendance)

    // Get this week's attendance
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    const thisWeekResult = await db
      .select({ count: count() })
      .from(attendance)
      .where(gte(attendance.serviceDate, oneWeekAgo))

    // Get attendance by service type
    const serviceTypeResult = await db
      .select({
        serviceType: attendance.serviceType,
        count: count()
      })
      .from(attendance)
      .groupBy(attendance.serviceType)

    // Get average weekly attendance (last 4 weeks)
    const fourWeeksAgo = new Date()
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)
    
    const recentResult = await db
      .select({ count: count() })
      .from(attendance)
      .where(gte(attendance.serviceDate, fourWeeksAgo))

    const attendanceByService = serviceTypeResult.reduce((acc: Record<string, number>, item) => {
      acc[item.serviceType] = Number(item.count)
      return acc
    }, {})

    const stats: AttendanceStats = {
      totalAttendance: Number(totalResult[0].count),
      thisWeekAttendance: Number(thisWeekResult[0].count),
      averageAttendance: Math.round(Number(recentResult[0].count) / 4),
      attendanceByService,
      growthRate: 0, // Calculate based on historical data
      topMembers: [] // Would need more complex query
    }

    return createSuccessResponse(stats)
  } catch (error) {
    console.error('Error fetching attendance stats:', error)
    return createErrorResponse('Failed to fetch attendance statistics.')
  }
}

// === UTILITY FUNCTIONS ===

export async function getActiveQRCodes(): Promise<ApiResponse<(AttendanceQRCode & { event?: ChurchEvent })[]>> {
  try {
    if (isDevelopmentMode) {
      const activeQRCodes = mockQRCodes.filter(qr => qr.isActive)
      await new Promise(resolve => setTimeout(resolve, 200))
      return createSuccessResponse(activeQRCodes)
    }

    const result = await db
      .select({
        qrCode: attendanceQRCodes,
        event: events,
      })
      .from(attendanceQRCodes)
      .leftJoin(events, eq(attendanceQRCodes.eventId, events.id))
      .where(eq(attendanceQRCodes.isActive, true))
      .orderBy(desc(attendanceQRCodes.createdAt))

    const qrCodes = result.map(r => ({
      ...r.qrCode,
      event: r.event,
    })) as (AttendanceQRCode & { event?: ChurchEvent })[]

    return createSuccessResponse(qrCodes)
  } catch (error) {
    console.error('Error fetching active QR codes:', error)
    return createErrorResponse('Failed to fetch active QR codes.')
  }
}

export async function getDisplayQRCodes(displayLocation?: string): Promise<ApiResponse<(AttendanceQRCode & { event?: ChurchEvent })[]>> {
  try {
    if (isDevelopmentMode) {
      let displayQRs = mockQRCodes.filter(qr => 
        qr.isActive && 
        qr.displayOnScreens &&
        (!qr.expiresAt || new Date(qr.expiresAt) > new Date())
      )

      if (displayLocation) {
        displayQRs = displayQRs.filter(qr => qr.displayLocation === displayLocation)
      }

      await new Promise(resolve => setTimeout(resolve, 200))
      return createSuccessResponse(displayQRs)
    }

    let conditions = [
      eq(attendanceQRCodes.isActive, true),
      eq(attendanceQRCodes.displayOnScreens, true),
    ]

    if (displayLocation) {
      conditions.push(eq(attendanceQRCodes.displayLocation, displayLocation))
    }

    const result = await db
      .select({
        qrCode: attendanceQRCodes,
        event: events,
      })
      .from(attendanceQRCodes)
      .leftJoin(events, eq(attendanceQRCodes.eventId, events.id))
      .where(and(...conditions))
      .orderBy(desc(attendanceQRCodes.createdAt))

    // Filter out expired QR codes
    const qrCodes = result
      .map(r => ({
        ...r.qrCode,
        event: r.event,
      }))
      .filter(qr => !qr.expiresAt || new Date(qr.expiresAt) > new Date()) as (AttendanceQRCode & { event?: ChurchEvent })[]

    return createSuccessResponse(qrCodes)
  } catch (error) {
    console.error('Error fetching display QR codes:', error)
    return createErrorResponse('Failed to fetch display QR codes.')
  }
}

export async function toggleQRDisplay(qrCodeId: string, displayOnScreens: boolean, displayLocation?: string): Promise<ApiResponse<string>> {
  try {
    if (isDevelopmentMode) {
      const qrCodeIndex = mockQRCodes.findIndex(qr => qr.qrCodeId === qrCodeId)
      if (qrCodeIndex === -1) {
        return createErrorResponse('QR code not found.')
      }

      mockQRCodes[qrCodeIndex].displayOnScreens = displayOnScreens
      mockQRCodes[qrCodeIndex].displayLocation = displayLocation || null
      mockQRCodes[qrCodeIndex].lastDisplayed = displayOnScreens ? new Date() : null
      mockQRCodes[qrCodeIndex].updatedAt = new Date()

      await new Promise(resolve => setTimeout(resolve, 200))
      return createSuccessResponse(displayOnScreens ? 'QR code is now displayed on screens.' : 'QR code removed from displays.')
    }

    await db
      .update(attendanceQRCodes)
      .set({
        displayOnScreens,
        displayLocation: displayLocation || null,
        lastDisplayed: displayOnScreens ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(attendanceQRCodes.qrCodeId, qrCodeId))

    return createSuccessResponse(displayOnScreens ? 'QR code is now displayed on screens.' : 'QR code removed from displays.')
  } catch (error) {
    console.error('Error toggling QR display:', error)
    return createErrorResponse('Failed to update QR display status.')
  }
}

export async function deactivateQRCode(qrCodeId: string): Promise<ApiResponse<string>> {
  try {
    if (isDevelopmentMode) {
      const qrCodeIndex = mockQRCodes.findIndex(qr => qr.qrCodeId === qrCodeId)
      if (qrCodeIndex === -1) {
        return createErrorResponse('QR code not found.')
      }

      mockQRCodes[qrCodeIndex].isActive = false
      mockQRCodes[qrCodeIndex].displayOnScreens = false // Also remove from displays
      mockQRCodes[qrCodeIndex].updatedAt = new Date()

      await new Promise(resolve => setTimeout(resolve, 200))
      return createSuccessResponse('QR code deactivated successfully.')
    }

    await db
      .update(attendanceQRCodes)
      .set({
        isActive: false,
        displayOnScreens: false, // Also remove from displays
        updatedAt: new Date(),
      })
      .where(eq(attendanceQRCodes.qrCodeId, qrCodeId))

    return createSuccessResponse('QR code deactivated successfully.')
  } catch (error) {
    console.error('Error deactivating QR code:', error)
    return createErrorResponse('Failed to deactivate QR code.')
  }
}
