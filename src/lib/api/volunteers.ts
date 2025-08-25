// Volunteer & Ministry Team Management API
// Handles all operations related to volunteers, teams, scheduling, and training

import { db } from '@/lib/db'
import { 
  ministryTeams, 
  teamMembers, 
  serviceSchedules, 
  serviceAssignments,
  volunteerSkills,
  trainingPrograms,
  trainingRecords,
  volunteerAvailability
} from '@/lib/db/schema'
import { eq, and, desc, sql, gte, lte, asc } from 'drizzle-orm'
import type { 
  NewMinistryTeam, 
  NewTeamMember, 
  NewServiceSchedule, 
  NewServiceAssignment,
  NewVolunteerSkill,
  NewTrainingProgram,
  NewTrainingRecord,
  NewVolunteerAvailability,
  MinistryTeam,
  TeamMember,
  ServiceSchedule,
  ServiceAssignment,
  VolunteerSkill,
  TrainingProgram,
  TrainingRecord,
  VolunteerAvailability
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

// === MINISTRY TEAM MANAGEMENT ===

export async function createMinistryTeam(teamData: NewMinistryTeam): Promise<ApiResponse<MinistryTeam>> {
  try {
    const [newTeam] = await db
      .insert(ministryTeams)
      .values(teamData)
      .returning()

    return createSuccessResponse(newTeam)
  } catch (error) {
    console.error('Error creating ministry team:', error)
    return createErrorResponse('Failed to create ministry team')
  }
}

export async function getMinistryTeam(teamId: string): Promise<ApiResponse<MinistryTeam>> {
  try {
    const [team] = await db
      .select()
      .from(ministryTeams)
      .where(eq(ministryTeams.id, teamId))
      .limit(1)

    if (!team) {
      return createErrorResponse('Ministry team not found')
    }

    return createSuccessResponse(team)
  } catch (error) {
    console.error('Error fetching ministry team:', error)
    return createErrorResponse('Failed to fetch ministry team')
  }
}

export async function getAllMinistryTeams(): Promise<ApiResponse<MinistryTeam[]>> {
  try {
    const teams = await db
      .select()
      .from(ministryTeams)
      .where(eq(ministryTeams.isActive, true))
      .orderBy(desc(ministryTeams.createdAt))

    return createSuccessResponse(teams)
  } catch (error) {
    console.error('Error fetching ministry teams:', error)
    return createErrorResponse('Failed to fetch ministry teams')
  }
}

export async function updateMinistryTeam(teamId: string, updates: Partial<NewMinistryTeam>): Promise<ApiResponse<MinistryTeam>> {
  try {
    const [updatedTeam] = await db
      .update(ministryTeams)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(ministryTeams.id, teamId))
      .returning()

    if (!updatedTeam) {
      return createErrorResponse('Ministry team not found')
    }

    return createSuccessResponse(updatedTeam)
  } catch (error) {
    console.error('Error updating ministry team:', error)
    return createErrorResponse('Failed to update ministry team')
  }
}

export async function deactivateMinistryTeam(teamId: string): Promise<ApiResponse<MinistryTeam>> {
  try {
    const [deactivatedTeam] = await db
      .update(ministryTeams)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(ministryTeams.id, teamId))
      .returning()

    if (!deactivatedTeam) {
      return createErrorResponse('Ministry team not found')
    }

    return createSuccessResponse(deactivatedTeam)
  } catch (error) {
    console.error('Error deactivating ministry team:', error)
    return createErrorResponse('Failed to deactivate ministry team')
  }
}

// === TEAM MEMBER MANAGEMENT ===

export async function addTeamMember(memberData: NewTeamMember): Promise<ApiResponse<TeamMember>> {
  try {
    // Check if team exists and is active
    const [team] = await db
      .select()
      .from(ministryTeams)
      .where(and(
        eq(ministryTeams.id, memberData.teamId),
        eq(ministryTeams.isActive, true)
      ))
      .limit(1)

    if (!team) {
      return createErrorResponse('Ministry team not found or inactive')
    }

    // Check if member is already in the team
    const existingMember = await db
      .select()
      .from(teamMembers)
      .where(and(
        eq(teamMembers.teamId, memberData.teamId),
        eq(teamMembers.memberId, memberData.memberId),
        eq(teamMembers.isActive, true)
      ))
      .limit(1)

    if (existingMember.length > 0) {
      return createErrorResponse('Member is already in this team')
    }

    const [newMember] = await db
      .insert(teamMembers)
      .values(memberData)
      .returning()

    // Update team member count
    await db
      .update(ministryTeams)
      .set({ 
        currentMembers: sql`${ministryTeams.currentMembers} + 1`,
        updatedAt: new Date()
      })
      .where(eq(ministryTeams.id, memberData.teamId))

    return createSuccessResponse(newMember)
  } catch (error) {
    console.error('Error adding team member:', error)
    return createErrorResponse('Failed to add team member')
  }
}

export async function getTeamMembers(teamId: string): Promise<ApiResponse<TeamMember[]>> {
  try {
    const members = await db
      .select()
      .from(teamMembers)
      .where(and(
        eq(teamMembers.teamId, teamId),
        eq(teamMembers.isActive, true)
      ))
      .orderBy(desc(teamMembers.role), desc(teamMembers.startDate))

    return createSuccessResponse(members)
  } catch (error) {
    console.error('Error fetching team members:', error)
    return createErrorResponse('Failed to fetch team members')
  }
}

export async function removeTeamMember(memberId: string): Promise<ApiResponse<boolean>> {
  try {
    const [member] = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.id, memberId))
      .limit(1)

    if (!member) {
      return createErrorResponse('Team member not found')
    }

    await db
      .update(teamMembers)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(teamMembers.id, memberId))

    // Update team member count
    await db
      .update(ministryTeams)
      .set({ 
        currentMembers: sql`${ministryTeams.currentMembers} - 1`,
        updatedAt: new Date()
      })
      .where(eq(ministryTeams.id, member.teamId))

    return createSuccessResponse(true)
  } catch (error) {
    console.error('Error removing team member:', error)
    return createErrorResponse('Failed to remove team member')
  }
}

// === SERVICE SCHEDULING ===

export async function createServiceSchedule(scheduleData: NewServiceSchedule): Promise<ApiResponse<ServiceSchedule>> {
  try {
    // Check if team exists and is active
    const [team] = await db
      .select()
      .from(ministryTeams)
      .where(and(
        eq(ministryTeams.id, scheduleData.teamId),
        eq(ministryTeams.isActive, true)
      ))
      .limit(1)

    if (!team) {
      return createErrorResponse('Ministry team not found or inactive')
    }

    const [newSchedule] = await db
      .insert(serviceSchedules)
      .values(scheduleData)
      .returning()

    return createSuccessResponse(newSchedule)
  } catch (error) {
    console.error('Error creating service schedule:', error)
    return createErrorResponse('Failed to create service schedule')
  }
}

export async function getServiceSchedules(teamId?: string, startDate?: Date, endDate?: Date): Promise<ApiResponse<ServiceSchedule[]>> {
  try {
    let whereConditions = []

    if (teamId) {
      whereConditions.push(eq(serviceSchedules.teamId, teamId))
    }

    if (startDate && endDate) {
      whereConditions.push(
        gte(serviceSchedules.serviceDate, startDate),
        lte(serviceSchedules.serviceDate, endDate)
      )
    }

    const schedules = await db
      .select()
      .from(serviceSchedules)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(asc(serviceSchedules.serviceDate), asc(serviceSchedules.startTime))

    return createSuccessResponse(schedules)
  } catch (error) {
    console.error('Error fetching service schedules:', error)
    return createErrorResponse('Failed to fetch service schedules')
  }
}

export async function updateServiceSchedule(scheduleId: string, updates: Partial<NewServiceSchedule>): Promise<ApiResponse<ServiceSchedule>> {
  try {
    const [updatedSchedule] = await db
      .update(serviceSchedules)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(serviceSchedules.id, scheduleId))
      .returning()

    if (!updatedSchedule) {
      return createErrorResponse('Service schedule not found')
    }

    return createSuccessResponse(updatedSchedule)
  } catch (error) {
    console.error('Error updating service schedule:', error)
    return createErrorResponse('Failed to update service schedule')
  }
}

// === SERVICE ASSIGNMENTS ===

export async function assignVolunteerToService(assignmentData: NewServiceAssignment): Promise<ApiResponse<ServiceAssignment>> {
  try {
    // Check if schedule exists
    const [schedule] = await db
      .select()
      .from(serviceSchedules)
      .where(eq(serviceSchedules.id, assignmentData.scheduleId))
      .limit(1)

    if (!schedule) {
      return createErrorResponse('Service schedule not found')
    }

    // Check if volunteer is already assigned
    const existingAssignment = await db
      .select()
      .from(serviceAssignments)
      .where(and(
        eq(serviceAssignments.scheduleId, assignmentData.scheduleId),
        eq(serviceAssignments.memberId, assignmentData.memberId)
      ))
      .limit(1)

    if (existingAssignment.length > 0) {
      return createErrorResponse('Volunteer is already assigned to this service')
    }

    const [newAssignment] = await db
      .insert(serviceAssignments)
      .values(assignmentData)
      .returning()

    // Update assigned members count
    await db
      .update(serviceSchedules)
      .set({ 
        assignedMembers: sql`${serviceSchedules.assignedMembers} + 1`,
        updatedAt: new Date()
      })
      .where(eq(serviceSchedules.id, assignmentData.scheduleId))

    return createSuccessResponse(newAssignment)
  } catch (error) {
    console.error('Error assigning volunteer to service:', error)
    return createErrorResponse('Failed to assign volunteer to service')
  }
}

export async function getServiceAssignments(scheduleId: string): Promise<ApiResponse<ServiceAssignment[]>> {
  try {
    const assignments = await db
      .select()
      .from(serviceAssignments)
      .where(eq(serviceAssignments.scheduleId, scheduleId))
      .orderBy(desc(serviceAssignments.createdAt))

    return createSuccessResponse(assignments)
  } catch (error) {
    console.error('Error fetching service assignments:', error)
    return createErrorResponse('Failed to fetch service assignments')
  }
}

export async function updateAssignmentStatus(assignmentId: string, status: string, notes?: string): Promise<ApiResponse<ServiceAssignment>> {
  try {
    const updates: Partial<NewServiceAssignment> = { 
      status: status,
      updatedAt: new Date()
    }

    if (status === 'confirmed') {
      updates.isConfirmed = true
      updates.confirmedAt = new Date()
    } else if (status === 'checked-in') {
      updates.checkInTime = new Date()
    } else if (status === 'completed') {
      updates.checkOutTime = new Date()
    }

    if (notes) {
      updates.notes = notes
    }

    const [updatedAssignment] = await db
      .update(serviceAssignments)
      .set(updates)
      .where(eq(serviceAssignments.id, assignmentId))
      .returning()

    if (!updatedAssignment) {
      return createErrorResponse('Service assignment not found')
    }

    return createSuccessResponse(updatedAssignment)
  } catch (error) {
    console.error('Error updating assignment status:', error)
    return createErrorResponse('Failed to update assignment status')
  }
}

// === VOLUNTEER SKILLS ===

export async function addVolunteerSkill(skillData: NewVolunteerSkill): Promise<ApiResponse<VolunteerSkill>> {
  try {
    const [newSkill] = await db
      .insert(volunteerSkills)
      .values(skillData)
      .returning()

    return createSuccessResponse(newSkill)
  } catch (error) {
    console.error('Error adding volunteer skill:', error)
    return createErrorResponse('Failed to add volunteer skill')
  }
}

export async function getVolunteerSkills(memberId: string): Promise<ApiResponse<VolunteerSkill[]>> {
  try {
    const skills = await db
      .select()
      .from(volunteerSkills)
      .where(eq(volunteerSkills.memberId, memberId))
      .orderBy(desc(volunteerSkills.proficiencyLevel), asc(volunteerSkills.skillName))

    return createSuccessResponse(skills)
  } catch (error) {
    console.error('Error fetching volunteer skills:', error)
    return createErrorResponse('Failed to fetch volunteer skills')
  }
}

export async function updateVolunteerSkill(skillId: string, updates: Partial<NewVolunteerSkill>): Promise<ApiResponse<VolunteerSkill>> {
  try {
    const [updatedSkill] = await db
      .update(volunteerSkills)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(volunteerSkills.id, skillId))
      .returning()

    if (!updatedSkill) {
      return createErrorResponse('Volunteer skill not found')
    }

    return createSuccessResponse(updatedSkill)
  } catch (error) {
    console.error('Error updating volunteer skill:', error)
    return createErrorResponse('Failed to update volunteer skill')
  }
}

// === TRAINING PROGRAMS ===

export async function createTrainingProgram(programData: NewTrainingProgram): Promise<ApiResponse<TrainingProgram>> {
  try {
    const [newProgram] = await db
      .insert(trainingPrograms)
      .values(programData)
      .returning()

    return createSuccessResponse(newProgram)
  } catch (error) {
    console.error('Error creating training program:', error)
    return createErrorResponse('Failed to create training program')
  }
}

export async function getAllTrainingPrograms(): Promise<ApiResponse<TrainingProgram[]>> {
  try {
    const programs = await db
      .select()
      .from(trainingPrograms)
      .orderBy(asc(trainingPrograms.programName))

    return createSuccessResponse(programs)
  } catch (error) {
    console.error('Error fetching training programs:', error)
    return createErrorResponse('Failed to fetch training programs')
  }
}

// === TRAINING RECORDS ===

export async function recordTrainingCompletion(recordData: NewTrainingRecord): Promise<ApiResponse<TrainingRecord>> {
  try {
    const [newRecord] = await db
      .insert(trainingRecords)
      .values(recordData)
      .returning()

    return createSuccessResponse(newRecord)
  } catch (error) {
    console.error('Error recording training completion:', error)
    return createErrorResponse('Failed to record training completion')
  }
}

export async function getTrainingRecords(memberId: string): Promise<ApiResponse<TrainingRecord[]>> {
  try {
    const records = await db
      .select()
      .from(trainingRecords)
      .where(eq(trainingRecords.memberId, memberId))
      .orderBy(desc(trainingRecords.completionDate))

    return createSuccessResponse(records)
  } catch (error) {
    console.error('Error fetching training records:', error)
    return createErrorResponse('Failed to fetch training records')
  }
}

// === VOLUNTEER AVAILABILITY ===

export async function setVolunteerAvailability(availabilityData: NewVolunteerAvailability): Promise<ApiResponse<VolunteerAvailability>> {
  try {
    // Check if availability already exists for this day
    const existingAvailability = await db
      .select()
      .from(volunteerAvailability)
      .where(and(
        eq(volunteerAvailability.memberId, availabilityData.memberId),
        eq(volunteerAvailability.dayOfWeek, availabilityData.dayOfWeek)
      ))
      .limit(1)

    let result: VolunteerAvailability

    if (existingAvailability.length > 0) {
      // Update existing availability
      const [updatedAvailability] = await db
        .update(volunteerAvailability)
        .set({ ...availabilityData, updatedAt: new Date() })
        .where(eq(volunteerAvailability.id, existingAvailability[0].id))
        .returning()

      result = updatedAvailability
    } else {
      // Create new availability
      const [newAvailability] = await db
        .insert(volunteerAvailability)
        .values(availabilityData)
        .returning()

      result = newAvailability
    }

    return createSuccessResponse(result)
  } catch (error) {
    console.error('Error setting volunteer availability:', error)
    return createErrorResponse('Failed to set volunteer availability')
  }
}

export async function getVolunteerAvailability(memberId: string): Promise<ApiResponse<VolunteerAvailability[]>> {
  try {
    const availability = await db
      .select()
      .from(volunteerAvailability)
      .where(eq(volunteerAvailability.memberId, memberId))
      .orderBy(volunteerAvailability.dayOfWeek)

    return createSuccessResponse(availability)
  } catch (error) {
    console.error('Error fetching volunteer availability:', error)
    return createErrorResponse('Failed to fetch volunteer availability')
  }
}

// === ANALYTICS & REPORTING ===

export interface VolunteerAnalytics {
  totalVolunteers: number
  activeVolunteers: number
  totalTeams: number
  upcomingServices: number
  volunteerUtilization: number
  skillDistribution: { skill: string; count: number }[]
  teamPerformance: { team: string; memberCount: number; serviceCount: number }[]
  trainingCompletion: { program: string; completed: number; required: number }[]
}

export async function getVolunteerAnalytics(): Promise<ApiResponse<VolunteerAnalytics>> {
  try {
    // Get total volunteers
    const [totalVolunteersResult] = await db
      .select({ count: sql<number>`count(distinct ${teamMembers.memberId})` })
      .from(teamMembers)
      .where(eq(teamMembers.isActive, true))

    const totalVolunteers = totalVolunteersResult?.count || 0

    // Get active volunteers (in active teams)
    const [activeVolunteersResult] = await db
      .select({ count: sql<number>`count(distinct ${teamMembers.memberId})` })
      .from(teamMembers)
      .innerJoin(ministryTeams, eq(teamMembers.teamId, ministryTeams.id))
      .where(and(
        eq(teamMembers.isActive, true),
        eq(ministryTeams.isActive, true)
      ))

    const activeVolunteers = activeVolunteersResult?.count || 0

    // Get total teams
    const [totalTeamsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(ministryTeams)
      .where(eq(ministryTeams.isActive, true))

    const totalTeams = totalTeamsResult?.count || 0

    // Get upcoming services
    const [upcomingServicesResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(serviceSchedules)
      .where(and(
        gte(serviceSchedules.serviceDate, new Date()),
        eq(serviceSchedules.status, 'scheduled')
      ))

    const upcomingServices = upcomingServicesResult?.count || 0

    // Calculate volunteer utilization
    const volunteerUtilization = totalVolunteers > 0 ? Math.round((activeVolunteers / totalVolunteers) * 100) : 0

    // Get skill distribution
    const skillResults = await db
      .select({
        skill: volunteerSkills.skillCategory,
        count: sql<number>`count(*)`
      })
      .from(volunteerSkills)
      .groupBy(volunteerSkills.skillCategory)

    const skillDistribution = skillResults.map(item => ({
      skill: item.skill,
      count: item.count
    }))

    // Get team performance
    const teamResults = await db
      .select({
        team: ministryTeams.teamName,
        memberCount: sql<number>`count(distinct ${teamMembers.memberId})`,
        serviceCount: sql<number>`count(distinct ${serviceSchedules.id})`
      })
      .from(ministryTeams)
      .leftJoin(teamMembers, eq(ministryTeams.id, teamMembers.teamId))
      .leftJoin(serviceSchedules, eq(ministryTeams.id, serviceSchedules.teamId))
      .where(eq(ministryTeams.isActive, true))
      .groupBy(ministryTeams.id, ministryTeams.teamName)

    const teamPerformance = teamResults.map(item => ({
      team: item.team,
      memberCount: item.memberCount,
      serviceCount: item.serviceCount
    }))

    // Get training completion
    const trainingResults = await db
      .select({
        program: trainingPrograms.programName,
        completed: sql<number>`count(distinct ${trainingRecords.memberId})`,
        required: sql<number>`count(*)`
      })
      .from(trainingPrograms)
      .leftJoin(trainingRecords, eq(trainingPrograms.id, trainingRecords.programId))
      .groupBy(trainingPrograms.id, trainingPrograms.programName)

    const trainingCompletion = trainingResults.map(item => ({
      program: item.program,
      completed: item.completed,
      required: item.required
    }))

    return createSuccessResponse({
      totalVolunteers,
      activeVolunteers,
      totalTeams,
      upcomingServices,
      volunteerUtilization,
      skillDistribution,
      teamPerformance,
      trainingCompletion
    })

  } catch (error) {
    console.error('Error fetching volunteer analytics:', error)
    return createErrorResponse('Failed to fetch volunteer analytics')
  }
}
