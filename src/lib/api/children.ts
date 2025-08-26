// Child Check-in & Security API
// Handles all operations related to children, guardians, and secure check-ins

import { db } from '@/lib/db'
import { 
  children, 
  childGuardians, 
  childCheckIns, 
  childQRCodes, 
  childSecurityAudit,
  members
} from '@/lib/db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'
import { generateId } from '@/lib/utils'
import type { 
  NewChild, 
  NewChildGuardian, 
  NewChildCheckIn, 
  NewChildQRCode,
  Child,
  ChildGuardian,
  ChildCheckIn,
  ChildQRCode
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

// === CHILD MANAGEMENT ===

export async function createChild(childData: NewChild): Promise<ApiResponse<Child>> {
  try {
    const [newChild] = await db
      .insert(children)
      .values(childData)
      .returning()

    // Log the action for security audit
    await logSecurityAction({
      childId: newChild.id,
      action: 'child-created',
      actionDetails: `Child ${newChild.firstName} ${newChild.lastName} registered`,
      severity: 'info'
    })

    return createSuccessResponse(newChild)
  } catch (error) {
    console.error('Error creating child:', error)
    return createErrorResponse('Failed to create child profile')
  }
}

export async function getChild(childId: string): Promise<ApiResponse<Child>> {
  try {
    const [child] = await db
      .select()
      .from(children)
      .where(eq(children.id, childId))
      .limit(1)

    if (!child) {
      return createErrorResponse('Child not found')
    }

    return createSuccessResponse(child)
  } catch (error) {
    console.error('Error fetching child:', error)
    return createErrorResponse('Failed to fetch child')
  }
}

export async function getAllChildren(): Promise<ApiResponse<Child[]>> {
  try {
    const allChildren = await db
      .select()
      .from(children)
      .where(eq(children.isActive, true))
      .orderBy(desc(children.createdAt))

    return createSuccessResponse(allChildren)
  } catch (error) {
    console.error('Error fetching children:', error)
    return createErrorResponse('Failed to fetch children')
  }
}

export async function updateChild(childId: string, updates: Partial<NewChild>): Promise<ApiResponse<Child>> {
  try {
    const [updatedChild] = await db
      .update(children)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(children.id, childId))
      .returning()

    if (!updatedChild) {
      return createErrorResponse('Child not found')
    }

    // Log the action for security audit
    await logSecurityAction({
      childId,
      action: 'child-updated',
      actionDetails: `Child profile updated`,
      severity: 'info'
    })

    return createSuccessResponse(updatedChild)
  } catch (error) {
    console.error('Error updating child:', error)
    return createErrorResponse('Failed to update child')
  }
}

export async function deactivateChild(childId: string): Promise<ApiResponse<Child>> {
  try {
    const [deactivatedChild] = await db
      .update(children)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(children.id, childId))
      .returning()

    if (!deactivatedChild) {
      return createErrorResponse('Child not found')
    }

    // Log the action for security audit
    await logSecurityAction({
      childId,
      action: 'child-deactivated',
      actionDetails: `Child deactivated`,
      severity: 'warning'
    })

    return createSuccessResponse(deactivatedChild)
  } catch (error) {
    console.error('Error deactivating child:', error)
    return createErrorResponse('Failed to deactivate child')
  }
}

// === GUARDIAN MANAGEMENT ===

export async function addGuardian(guardianData: NewChildGuardian): Promise<ApiResponse<ChildGuardian>> {
  try {
    // Verify the guardian is a valid member
    const [guardianMember] = await db
      .select()
      .from(members)
      .where(eq(members.id, guardianData.guardianId))
      .limit(1)

    if (!guardianMember) {
      return createErrorResponse('Guardian not found in members')
    }

    // If this is the first guardian, make them primary
    const existingGuardians = await db
      .select()
      .from(childGuardians)
      .where(eq(childGuardians.childId, guardianData.childId))

    if (existingGuardians.length === 0) {
      guardianData.isPrimary = true
      guardianData.emergencyContact = true
    }

    const [newGuardian] = await db
      .insert(childGuardians)
      .values(guardianData)
      .returning()

    // Log the action for security audit
    await logSecurityAction({
      childId: guardianData.childId,
      action: 'guardian-added',
      actionDetails: `Guardian ${guardianMember.firstName} ${guardianMember.lastName} added`,
      severity: 'info'
    })

    return createSuccessResponse(newGuardian)
  } catch (error) {
    console.error('Error adding guardian:', error)
    return createErrorResponse('Failed to add guardian')
  }
}

export async function getChildGuardians(childId: string): Promise<ApiResponse<ChildGuardian[]>> {
  try {
    const guardians = await db
      .select()
      .from(childGuardians)
      .where(eq(childGuardians.childId, childId))
      .orderBy(desc(childGuardians.isPrimary), desc(childGuardians.createdAt))

    return createSuccessResponse(guardians)
  } catch (error) {
    console.error('Error fetching guardians:', error)
    return createErrorResponse('Failed to fetch guardians')
  }
}

export async function removeGuardian(guardianId: string): Promise<ApiResponse<boolean>> {
  try {
    const [guardian] = await db
      .select()
      .from(childGuardians)
      .where(eq(childGuardians.id, guardianId))
      .limit(1)

    if (!guardian) {
      return createErrorResponse('Guardian relationship not found')
    }

    // Don't allow removal of the last primary guardian
    if (guardian.isPrimary) {
      const otherGuardians = await db
        .select()
        .from(childGuardians)
        .where(and(
          eq(childGuardians.childId, guardian.childId),
          eq(childGuardians.id, guardianId)
        ))

      if (otherGuardians.length === 0) {
        return createErrorResponse('Cannot remove the last primary guardian')
      }
    }

    await db
      .delete(childGuardians)
      .where(eq(childGuardians.id, guardianId))

    // Log the action for security audit
    await logSecurityAction({
      childId: guardian.childId,
      action: 'guardian-removed',
      actionDetails: `Guardian relationship removed`,
      severity: 'warning'
    })

    return createSuccessResponse(true)
  } catch (error) {
    console.error('Error removing guardian:', error)
    return createErrorResponse('Failed to remove guardian')
  }
}

// === CHILD CHECK-IN OPERATIONS ===

export async function generateChildQRCode(childId: string, serviceData: {
  serviceType: string
  serviceDate: Date
  location: string
  eventId?: string
}): Promise<ApiResponse<ChildQRCode>> {
  try {
    // Verify child exists and is active
    const [child] = await db
      .select()
      .from(children)
      .where(and(
        eq(children.id, childId),
        eq(children.isActive, true)
      ))
      .limit(1)

    if (!child) {
      return createErrorResponse('Child not found or inactive')
    }

    // Generate unique QR code ID
    const qrCodeId = `CHILD_${generateId()}_${Date.now()}`

    const qrCodeData: NewChildQRCode = {
      qrCodeId,
      childId,
      eventId: serviceData.eventId,
      serviceType: serviceData.serviceType as "sunday-service" | "bible-study" | "prayer-meeting" | "special-event" | "outreach" | "fellowship" | "conference" | "children-church" | "nursery" | "youth-group",
      serviceDate: serviceData.serviceDate,
      location: serviceData.location,
      isActive: true,
      maxUses: 1, // Child QR codes are single-use
      currentUses: 0,
      createdBy: 'system' // Will be updated with actual user ID
    }

    const [newQRCode] = await db
      .insert(childQRCodes)
      .values(qrCodeData)
      .returning()

    // Log the action for security audit
    await logSecurityAction({
      childId,
      action: 'qr-code-generated',
      actionDetails: `QR code generated for ${serviceData.serviceType}`,
      severity: 'info'
    })

    return createSuccessResponse(newQRCode)
  } catch (error) {
    console.error('Error generating child QR code:', error)
    return createErrorResponse('Failed to generate QR code')
  }
}

export async function checkInChild(qrCodeId: string, checkedInBy: string): Promise<ApiResponse<ChildCheckIn>> {
  try {
    // Validate QR code
    const [qrCode] = await db
      .select()
      .from(childQRCodes)
      .where(and(
        eq(childQRCodes.qrCodeId, qrCodeId),
        eq(childQRCodes.isActive, true)
      ))
      .limit(1)

    if (!qrCode) {
      return createErrorResponse('Invalid or inactive QR code')
    }

    // Check if QR code has expired
    if (qrCode.expiresAt && new Date() > qrCode.expiresAt) {
      return createErrorResponse('QR code has expired')
    }

    // Check if QR code has reached usage limit
    if (qrCode.currentUses && qrCode.maxUses && qrCode.currentUses >= qrCode.maxUses) {
      return createErrorResponse('QR code usage limit reached')
    }

    // Check if child is already checked in for this service
    const existingCheckIn = await db
      .select()
      .from(childCheckIns)
      .where(and(
        eq(childCheckIns.childId, qrCode.childId),
        eq(childCheckIns.serviceDate, qrCode.serviceDate),
        eq(childCheckIns.serviceType, qrCode.serviceType),
        eq(childCheckIns.status, 'checked-in')
      ))
      .limit(1)

    if (existingCheckIn.length > 0) {
      return createErrorResponse('Child is already checked in for this service')
    }

    // Record check-in
    const checkInData: NewChildCheckIn = {
      childId: qrCode.childId,
      eventId: qrCode.eventId,
      serviceType: qrCode.serviceType as "sunday-service" | "bible-study" | "prayer-meeting" | "special-event" | "outreach" | "fellowship" | "conference" | "children-church" | "nursery" | "youth-group",
      serviceDate: qrCode.serviceDate,
      checkInTime: new Date(),
      checkInMethod: 'qr-code',
      qrCodeId: qrCodeId,
      location: qrCode.location,
      checkedInBy,
      status: 'checked-in'
    }

    const [newCheckIn] = await db
      .insert(childCheckIns)
      .values(checkInData)
      .returning()

    // Update QR code usage count
    await db
      .update(childQRCodes)
      .set({
        currentUses: sql`${childQRCodes.currentUses} + 1`,
        updatedAt: new Date()
      })
      .where(eq(childQRCodes.id, qrCode.id))

    // Log the action for security audit
    await logSecurityAction({
      childId: qrCode.childId,
      action: 'child-checked-in',
      actionDetails: `Child checked in via QR code`,
      severity: 'info'
    })

    return createSuccessResponse(newCheckIn)
  } catch (error) {
    console.error('Error checking in child:', error)
    return createErrorResponse('Failed to check in child')
  }
}

export async function checkOutChild(checkInId: string, checkedOutBy: string): Promise<ApiResponse<ChildCheckIn>> {
  try {
    // Get the check-in record
    const [checkIn] = await db
      .select()
      .from(childCheckIns)
      .where(and(
        eq(childCheckIns.id, checkInId),
        eq(childCheckIns.status, 'checked-in')
      ))
      .limit(1)

    if (!checkIn) {
      return createErrorResponse('Check-in record not found or child already checked out')
    }

    // Update check-out time and status
    const [updatedCheckIn] = await db
      .update(childCheckIns)
      .set({
        checkOutTime: new Date(),
        checkedOutBy,
        status: 'checked-out',
        updatedAt: new Date()
      })
      .where(eq(childCheckIns.id, checkInId))
      .returning()

    // Log the action for security audit
    await logSecurityAction({
      childId: checkIn.childId,
      action: 'child-checked-out',
      actionDetails: `Child checked out`,
      severity: 'info'
    })

    return createSuccessResponse(updatedCheckIn)
  } catch (error) {
    console.error('Error checking out child:', error)
    return createErrorResponse('Failed to check out child')
  }
}

export async function getChildCheckInHistory(childId: string): Promise<ApiResponse<ChildCheckIn[]>> {
  try {
    const checkInHistory = await db
      .select()
      .from(childCheckIns)
      .where(eq(childCheckIns.childId, childId))
      .orderBy(desc(childCheckIns.serviceDate))

    return createSuccessResponse(checkInHistory)
  } catch (error) {
    console.error('Error fetching check-in history:', error)
    return createErrorResponse('Failed to fetch check-in history')
  }
}

// === SECURITY AUDIT LOGGING ===

async function logSecurityAction(auditData: {
  childId: string
  action: string
  actionDetails?: string
  severity?: 'info' | 'warning' | 'critical'
  ipAddress?: string
  userAgent?: string
  location?: string
}): Promise<void> {
  try {
    await db.insert(childSecurityAudit).values({
      childId: auditData.childId,
      action: auditData.action,
      actionDetails: auditData.actionDetails,
      severity: auditData.severity || 'info',
      ipAddress: auditData.ipAddress,
      userAgent: auditData.userAgent,
      location: auditData.location,
      performedBy: 'system' // Will be updated with actual user ID
    })
  } catch (error) {
    console.error('Error logging security action:', error)
    // Don't fail the main operation if audit logging fails
  }
}

export async function getSecurityAuditLog(childId: string): Promise<ApiResponse<typeof childSecurityAudit.$inferSelect[]>> {
  try {
    const auditLog = await db
      .select()
      .from(childSecurityAudit)
      .where(eq(childSecurityAudit.childId, childId))
      .orderBy(desc(childSecurityAudit.createdAt))

    return createSuccessResponse(auditLog)
  } catch (error) {
    console.error('Error fetching security audit log:', error)
    return createErrorResponse('Failed to fetch security audit log')
  }
}

// === UTILITY FUNCTIONS ===

export async function getChildrenByGuardian(guardianId: string): Promise<ApiResponse<Child[]>> {
  try {
    const guardianRelationships = await db
      .select({
        child: children
      })
      .from(childGuardians)
      .innerJoin(children, eq(childGuardians.childId, children.id))
      .where(and(
        eq(childGuardians.guardianId, guardianId),
        eq(children.isActive, true)
      ))

    const childrenList = guardianRelationships.map((rel: { child: Child }) => rel.child)
    return createSuccessResponse(childrenList)
  } catch (error) {
    console.error('Error fetching children by guardian:', error)
    return createErrorResponse('Failed to fetch children')
  }
}

export async function getCurrentlyCheckedInChildren(): Promise<ApiResponse<ChildCheckIn[]>> {
  try {
    const checkedInChildren = await db
      .select()
      .from(childCheckIns)
      .where(eq(childCheckIns.status, 'checked-in'))
      .orderBy(desc(childCheckIns.checkInTime))

    return createSuccessResponse(checkedInChildren)
  } catch (error) {
    console.error('Error fetching checked-in children:', error)
    return createErrorResponse('Failed to fetch checked-in children')
  }
}

// === ANALYTICS FUNCTIONS ===

export interface ChildrenAnalytics {
  totalChildren: number
  activeChildren: number
  newChildrenThisMonth: number
  checkInStats: {
    totalCheckIns: number
    currentlyCheckedIn: number
    averageCheckInDuration: number
  }
  guardianStats: {
    totalGuardians: number
    activeGuardians: number
    averageChildrenPerGuardian: number
  }
  serviceTypeBreakdown: { serviceType: string; count: number }[]
  monthlyTrends: { month: string; newChildren: number; checkIns: number }[]
  ageDistribution: { ageGroup: string; count: number }[]
  medicalAlerts: { count: number; percentage: number }
  securityAudit: { totalActions: number; criticalActions: number }
}

export async function getChildrenAnalytics(startDate: Date, endDate: Date): Promise<ApiResponse<ChildrenAnalytics>> {
  try {
    // Get total children count
    const [totalChildrenResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(children)
      .where(eq(children.isActive, true))

    const totalChildren = totalChildrenResult?.count || 0

    // Get active children (checked in within last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const [activeChildrenResult] = await db
      .select({ count: sql<number>`count(distinct ${childCheckIns.childId})` })
      .from(childCheckIns)
      .where(and(
        eq(childCheckIns.status, 'checked-in'),
        sql`${childCheckIns.checkInTime} >= ${thirtyDaysAgo}`
      ))

    const activeChildren = activeChildrenResult?.count || 0

    // Get new children this month
    const startOfMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1)
    const [newChildrenResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(children)
      .where(and(
        eq(children.isActive, true),
        sql`${children.createdAt} >= ${startOfMonth}`
      ))

    const newChildrenThisMonth = newChildrenResult?.count || 0

    // Get check-in statistics
    const [checkInStatsResult] = await db
      .select({
        totalCheckIns: sql<number>`count(*)`,
        currentlyCheckedIn: sql<number>`count(case when ${childCheckIns.status} = 'checked-in' then 1 end)`,
        averageDuration: sql<number>`avg(extract(epoch from (${childCheckIns.checkOutTime} - ${childCheckIns.checkInTime}))/3600)`
      })
      .from(childCheckIns)
      .where(sql`${childCheckIns.checkInTime} >= ${startDate}`)

    const checkInStats = {
      totalCheckIns: checkInStatsResult?.totalCheckIns || 0,
      currentlyCheckedIn: checkInStatsResult?.currentlyCheckedIn || 0,
      averageCheckInDuration: Math.round((checkInStatsResult?.averageDuration || 0) * 100) / 100
    }

    // Get guardian statistics
    const [guardianStatsResult] = await db
      .select({
        totalGuardians: sql<number>`count(distinct ${childGuardians.guardianId})`,
        activeGuardians: sql<number>`count(distinct ${childGuardians.guardianId})`, // All guardians are considered active
        averageChildren: sql<number>`avg(children_per_guardian.count)`
      })
      .from(childGuardians)
      .leftJoin(
        db.select({
          guardianId: childGuardians.guardianId,
          count: sql<number>`count(*)`
        })
        .from(childGuardians)
        .groupBy(childGuardians.guardianId)
        .as('children_per_guardian'),
        eq(childGuardians.guardianId, sql`children_per_guardian.guardianId`)
      )

    const guardianStats = {
      totalGuardians: guardianStatsResult?.totalGuardians || 0,
      activeGuardians: guardianStatsResult?.activeGuardians || 0,
      averageChildrenPerGuardian: Math.round((guardianStatsResult?.averageChildren || 0) * 100) / 100
    }

    // Get service type breakdown
    const serviceTypeResults = await db
      .select({
        serviceType: childCheckIns.serviceType,
        count: sql<number>`count(*)`
      })
      .from(childCheckIns)
      .where(sql`${childCheckIns.checkInTime} >= ${startDate}`)
      .groupBy(childCheckIns.serviceType)

    const serviceTypeBreakdown = serviceTypeResults.map((item: { serviceType: string; count: number }) => ({
      serviceType: item.serviceType.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      count: item.count
    }))

    // Get monthly trends
    const monthlyResults = await db
      .select({
        month: sql<string>`to_char(${children.createdAt}, 'YYYY-MM')`,
        newChildren: sql<number>`count(*)`
      })
      .from(children)
      .where(and(
        sql`${children.createdAt} >= ${startDate}`,
        eq(children.isActive, true)
      ))
      .groupBy(sql`to_char(${children.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`to_char(${children.createdAt}, 'YYYY-MM')`)

    const monthlyTrends = monthlyResults.map((item: { month: string; newChildren: number }) => ({
      month: new Date(item.month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
      newChildren: item.newChildren,
      checkIns: 0 // Will be calculated separately
    }))

    // Add check-in counts to monthly trends
    for (const trend of monthlyTrends) {
      const monthStart = new Date(trend.month + '-01')
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0)
      
      const [checkInCountResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(childCheckIns)
        .where(and(
          sql`${childCheckIns.checkInTime} >= ${monthStart}`,
          sql`${childCheckIns.checkInTime} <= ${monthEnd}`
        ))
      
      trend.checkIns = checkInCountResult?.count || 0
    }

    // Get age distribution
    const ageResults = await db
      .select({
        dateOfBirth: children.dateOfBirth
      })
      .from(children)
      .where(eq(children.isActive, true))

    const ageDistribution = [
      { ageGroup: '0-2 years', count: 0 },
      { ageGroup: '3-5 years', count: 0 },
      { ageGroup: '6-8 years', count: 0 },
      { ageGroup: '9-11 years', count: 0 },
      { ageGroup: '12-14 years', count: 0 },
      { ageGroup: '15-17 years', count: 0 }
    ]

    ageResults.forEach((child: { dateOfBirth: Date }) => {
      const age = Math.floor((Date.now() - new Date(child.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
      if (age <= 2) ageDistribution[0].count++
      else if (age <= 5) ageDistribution[1].count++
      else if (age <= 8) ageDistribution[2].count++
      else if (age <= 11) ageDistribution[3].count++
      else if (age <= 14) ageDistribution[4].count++
      else if (age <= 17) ageDistribution[5].count++
    })

    // Get medical alerts count
    const [medicalAlertsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(children)
      .where(and(
        eq(children.isActive, true),
        sql`${children.medicalNotes} is not null and ${children.medicalNotes} != ''`
      ))

    const medicalAlerts = {
      count: medicalAlertsResult?.count || 0,
      percentage: totalChildren > 0 ? Math.round((medicalAlertsResult?.count || 0) / totalChildren * 100) : 0
    }

    // Get security audit statistics
    const [securityAuditResult] = await db
      .select({
        totalActions: sql<number>`count(*)`,
        criticalActions: sql<number>`count(case when ${childSecurityAudit.severity} = 'critical' then 1 end)`
      })
      .from(childSecurityAudit)
      .where(sql`${childSecurityAudit.createdAt} >= ${startDate}`)

    const securityAudit = {
      totalActions: securityAuditResult?.totalActions || 0,
      criticalActions: securityAuditResult?.criticalActions || 0
    }

    return createSuccessResponse({
      totalChildren,
      activeChildren,
      newChildrenThisMonth,
      checkInStats,
      guardianStats,
      serviceTypeBreakdown,
      monthlyTrends,
      ageDistribution,
      medicalAlerts,
      securityAudit
    })

  } catch (error) {
    console.error('Error fetching children analytics:', error)
    return createErrorResponse('Failed to fetch children analytics')
  }
}
