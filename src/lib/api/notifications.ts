import { db } from '@/lib/db'
import { 
  notificationTemplates, 
  notifications, 
  notificationRecipients, 
  notificationPreferences,
  members,
  insertNotificationTemplateSchema,
  insertNotificationSchema,

  insertNotificationPreferencesSchema
} from '@/lib/db/schema'
import { eq, desc, and, count } from 'drizzle-orm'
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/lib/utils'
import type { 
  NotificationTemplate, 
  NewNotificationTemplate,
  Notification,
  NewNotification,
  NotificationRecipient,

  NotificationPreferences,
  NewNotificationPreferences,

} from '@/lib/db/schema'

// Check if we're in development mode without a real database
const isDevelopmentMode = !import.meta.env.VITE_DATABASE_URL

// Mock data for development
let mockTemplates: NotificationTemplate[] = [
  {
    id: '1',
    name: 'Welcome New Member',
    description: 'Welcome notification for new church members',
    category: 'welcome',
    title: 'Welcome to {{CHURCH_NAME}}! 🎉',
    content: 'Welcome {{MEMBER_NAME}}! We\'re excited to have you join our church family. Your spiritual journey starts here.',
    priority: 'high',
    icon: 'church',
    color: 'blue',
    isActive: true,
    createdBy: '1',
    createdAt: new Date('2024-01-01T10:00:00'),
    updatedAt: new Date('2024-01-01T10:00:00'),
  },
  {
    id: '2',
    name: 'Event Reminder',
    description: 'Reminder for upcoming events',
    category: 'reminder',
    title: 'Event Reminder: {{EVENT_NAME}}',
    content: 'Don\'t forget! {{EVENT_NAME}} is happening {{EVENT_DATE}} at {{EVENT_TIME}}. See you there!',
    priority: 'normal',
    icon: 'calendar',
    color: 'green',
    isActive: true,
    createdBy: '1',
    createdAt: new Date('2024-01-02T10:00:00'),
    updatedAt: new Date('2024-01-02T10:00:00'),
  },
  {
    id: '3',
    name: 'Emergency Alert',
    description: 'Urgent notifications for emergencies',
    category: 'emergency',
    title: 'URGENT: {{ALERT_TITLE}}',
    content: '🚨 {{MESSAGE}} Please check the church website or call {{CONTACT_NUMBER}} for more information.',
    priority: 'urgent',
    icon: 'alert',
    color: 'red',
    isActive: true,
    createdBy: '1',
    createdAt: new Date('2024-01-03T10:00:00'),
    updatedAt: new Date('2024-01-03T10:00:00'),
  }
]

let mockNotifications: (Notification & { recipientCount?: number })[] = [
  {
    id: '1',
    title: 'Christmas Service Announcement 🎄',
    content: 'Join us for our special Christmas service on December 25th at 10:00 AM. Celebrate the birth of our Savior with worship, carols, and fellowship!',
    category: 'announcement',
    priority: 'high',
    icon: 'church',
    color: 'green',
    targetType: 'all',
    targetCriteria: null,
    actionType: 'event',
    actionData: JSON.stringify({ eventId: '3' }),
    expiresAt: new Date('2024-12-26T00:00:00'),
    createdBy: '1',
    createdAt: new Date('2024-12-20T10:00:00'),
    updatedAt: new Date('2024-12-20T10:00:00'),
    recipientCount: 85
  },
  {
    id: '2',
    title: 'Youth Group Meeting Today',
    content: 'Youth group meets today at 6 PM in the fellowship hall. Bring a friend! 🙌',
    category: 'reminder',
    priority: 'normal',
    icon: 'users',
    color: 'blue',
    targetType: 'role',
    targetCriteria: JSON.stringify({ roles: ['youth', 'young_adult'] }),
    actionType: 'none',
    actionData: null,
    expiresAt: new Date('2024-12-22T00:00:00'),
    createdBy: '1',
    createdAt: new Date('2024-12-22T08:00:00'),
    updatedAt: new Date('2024-12-22T08:00:00'),
    recipientCount: 24
  }
]

let mockRecipients: NotificationRecipient[] = [
  {
    id: '1',
    notificationId: '1',
    memberId: '1',
    isRead: false,
    readAt: null,
    isArchived: false,
    archivedAt: null,
    createdAt: new Date('2024-12-20T10:05:00'),
    updatedAt: new Date('2024-12-20T10:05:00'),
  },
  {
    id: '2',
    notificationId: '2',
    memberId: '1',
    isRead: true,
    readAt: new Date('2024-12-22T09:15:00'),
    isArchived: false,
    archivedAt: null,
    createdAt: new Date('2024-12-22T08:05:00'),
    updatedAt: new Date('2024-12-22T09:15:00'),
  }
]

let mockPreferences: NotificationPreferences[] = [
  {
    id: '1',
    memberId: '1',
    generalNotifications: true,
    eventNotifications: true,
    announcementNotifications: true,
    emergencyNotifications: true,
    reminderNotifications: true,
    soundEnabled: true,
    browserNotifications: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
    createdAt: new Date('2024-01-01T10:00:00'),
    updatedAt: new Date('2024-01-01T10:00:00'),
  }
]

let nextTemplateId = 4
let nextNotificationId = 3
let nextRecipientId = 3
let nextPreferenceId = 2

// ============================================
// NOTIFICATION TEMPLATE FUNCTIONS
// ============================================

/**
 * Get all notification templates
 */
export async function getNotificationTemplates(): Promise<ApiResponse<NotificationTemplate[]>> {
  try {
    if (isDevelopmentMode) {
      await new Promise(resolve => setTimeout(resolve, 200))
      return createSuccessResponse(mockTemplates)
    }

    const result = await db
      .select()
      .from(notificationTemplates)
      .orderBy(desc(notificationTemplates.createdAt))

    return createSuccessResponse(result as NotificationTemplate[])
  } catch (error) {
    console.error('Error fetching notification templates:', error)
    return createErrorResponse('Failed to fetch notification templates.')
  }
}

/**
 * Get notification templates by category
 */
export async function getNotificationTemplatesByCategory(category: string): Promise<ApiResponse<NotificationTemplate[]>> {
  try {
    if (isDevelopmentMode) {
      const filtered = mockTemplates.filter(template => template.category === category && template.isActive)
      await new Promise(resolve => setTimeout(resolve, 200))
      return createSuccessResponse(filtered)
    }

    const result = await db
      .select()
      .from(notificationTemplates)
      .where(and(
        eq(notificationTemplates.category, category),
        eq(notificationTemplates.isActive, true)
      ))
      .orderBy(desc(notificationTemplates.createdAt))

    return createSuccessResponse(result as NotificationTemplate[])
  } catch (error) {
    console.error('Error fetching templates by category:', error)
    return createErrorResponse('Failed to fetch templates.')
  }
}

/**
 * Create a new notification template
 */
export async function createNotificationTemplate(templateData: NewNotificationTemplate): Promise<ApiResponse<NotificationTemplate>> {
  try {
    const validatedData = insertNotificationTemplateSchema.parse(templateData)

    if (isDevelopmentMode) {
      const newTemplate: NotificationTemplate = {
        id: nextTemplateId.toString(),
        ...validatedData,
        description: validatedData.description || null,
        icon: validatedData.icon || null,
        color: validatedData.color || null,
        createdBy: validatedData.createdBy || null,
        isActive: validatedData.isActive || false,
        priority: (validatedData.priority || 'normal') as string,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockTemplates.push(newTemplate)
      nextTemplateId++

      await new Promise(resolve => setTimeout(resolve, 200))
      return createSuccessResponse(newTemplate)
    }

    const result = await db.insert(notificationTemplates).values(validatedData).returning()
    return createSuccessResponse(result[0] as NotificationTemplate)
  } catch (error) {
    console.error('Error creating notification template:', error)
    return createErrorResponse('Failed to create notification template.')
  }
}

// ============================================
// NOTIFICATION FUNCTIONS
// ============================================

/**
 * Get all notifications (admin view)
 */
export async function getAllNotifications(): Promise<ApiResponse<(Notification & { recipientCount?: number })[]>> {
  try {
    if (isDevelopmentMode) {
      await new Promise(resolve => setTimeout(resolve, 200))
      return createSuccessResponse(mockNotifications)
    }

    // In real implementation, join with recipient count
    const result = await db
      .select()
      .from(notifications)
      .orderBy(desc(notifications.createdAt))

    return createSuccessResponse(result as Notification[])
  } catch (error) {
    console.error('Error fetching all notifications:', error)
    return createErrorResponse('Failed to fetch notifications.')
  }
}

/**
 * Get notifications for a specific member
 */
export async function getMemberNotifications(memberId: string): Promise<ApiResponse<(Notification & NotificationRecipient)[]>> {
  try {
    if (isDevelopmentMode) {
      // Filter notifications for this member
      const memberRecipients = mockRecipients.filter(r => r.memberId === memberId)
      const memberNotifications = memberRecipients.map(recipient => {
        const notification = mockNotifications.find(n => n.id === recipient.notificationId)
        if (!notification) return null
        
        return {
          ...notification,
          ...recipient,
          // Override IDs to avoid conflicts
          recipientId: recipient.id,
          id: notification.id
        }
      }).filter(Boolean) as (Notification & NotificationRecipient)[]

      await new Promise(resolve => setTimeout(resolve, 200))
      return createSuccessResponse(memberNotifications)
    }

    const result = await db
      .select()
      .from(notifications)
      .innerJoin(notificationRecipients, eq(notifications.id, notificationRecipients.notificationId))
      .where(eq(notificationRecipients.memberId, memberId))
      .orderBy(desc(notifications.createdAt))

    return createSuccessResponse(result.map(r => ({ ...r.notifications, ...r.notification_recipients })) as (Notification & NotificationRecipient)[])
  } catch (error) {
    console.error('Error fetching member notifications:', error)
    return createErrorResponse('Failed to fetch member notifications.')
  }
}

/**
 * Get unread notification count for a member
 */
export async function getUnreadNotificationCount(memberId: string): Promise<ApiResponse<number>> {
  try {
    if (isDevelopmentMode) {
      const unreadCount = mockRecipients.filter(r => r.memberId === memberId && !r.isRead).length
      await new Promise(resolve => setTimeout(resolve, 100))
      return createSuccessResponse(unreadCount)
    }

    const result = await db
      .select({ count: count() })
      .from(notificationRecipients)
      .where(and(
        eq(notificationRecipients.memberId, memberId),
        eq(notificationRecipients.isRead, false)
      ))

    return createSuccessResponse(result[0]?.count || 0)
  } catch (error) {
    console.error('Error fetching unread notification count:', error)
    return createErrorResponse('Failed to fetch unread count.')
  }
}

/**
 * Create and send a new notification
 */
export async function createNotification(notificationData: NewNotification): Promise<ApiResponse<Notification>> {
  try {
    const validatedData = insertNotificationSchema.parse(notificationData)

    if (isDevelopmentMode) {
      const newNotification: Notification = {
        id: nextNotificationId.toString(),
        ...validatedData,
        icon: validatedData.icon || null,
        color: validatedData.color || null,
        targetCriteria: validatedData.targetCriteria || null,
        actionData: validatedData.actionData || null,
        expiresAt: validatedData.expiresAt || null,
        createdBy: validatedData.createdBy || null,
        priority: (validatedData.priority || 'normal') as string,
        actionType: validatedData.actionType || 'none' as string,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockNotifications.push(newNotification)
      nextNotificationId++

      // Create recipients based on target type
      await createNotificationRecipients(newNotification.id, newNotification.targetType, newNotification.targetCriteria)

      await new Promise(resolve => setTimeout(resolve, 300))
      return createSuccessResponse(newNotification)
    }

    const result = await db.insert(notifications).values(validatedData).returning()
    const notification = result[0] as Notification

    // Create recipients
    await createNotificationRecipients(notification.id, notification.targetType, notification.targetCriteria)

    return createSuccessResponse(notification)
  } catch (error) {
    console.error('Error creating notification:', error)
    return createErrorResponse('Failed to create notification.')
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(memberId: string, notificationId: string): Promise<ApiResponse<string>> {
  try {
    if (isDevelopmentMode) {
      const recipientIndex = mockRecipients.findIndex(r => 
        r.memberId === memberId && r.notificationId === notificationId
      )
      
      if (recipientIndex === -1) {
        return createErrorResponse('Notification not found.')
      }

      mockRecipients[recipientIndex] = {
        ...mockRecipients[recipientIndex],
        isRead: true,
        readAt: new Date(),
        updatedAt: new Date(),
      }

      await new Promise(resolve => setTimeout(resolve, 100))
      return createSuccessResponse('Notification marked as read.')
    }

    const result = await db
      .update(notificationRecipients)
      .set({ 
        isRead: true,
        readAt: new Date(),
        updatedAt: new Date()
      })
      .where(and(
        eq(notificationRecipients.memberId, memberId),
        eq(notificationRecipients.notificationId, notificationId)
      ))
      .returning()

    if (result.length === 0) {
      return createErrorResponse('Notification not found.')
    }

    return createSuccessResponse('Notification marked as read.')
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return createErrorResponse('Failed to mark notification as read.')
  }
}

/**
 * Mark all notifications as read for a member
 */
export async function markAllNotificationsAsRead(memberId: string): Promise<ApiResponse<string>> {
  try {
    if (isDevelopmentMode) {
      mockRecipients.forEach(recipient => {
        if (recipient.memberId === memberId && !recipient.isRead) {
          recipient.isRead = true
          recipient.readAt = new Date()
          recipient.updatedAt = new Date()
        }
      })

      await new Promise(resolve => setTimeout(resolve, 200))
      return createSuccessResponse('All notifications marked as read.')
    }

    await db
      .update(notificationRecipients)
      .set({ 
        isRead: true,
        readAt: new Date(),
        updatedAt: new Date()
      })
      .where(and(
        eq(notificationRecipients.memberId, memberId),
        eq(notificationRecipients.isRead, false)
      ))

    return createSuccessResponse('All notifications marked as read.')
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return createErrorResponse('Failed to mark all notifications as read.')
  }
}

// ============================================
// NOTIFICATION PREFERENCES FUNCTIONS
// ============================================

/**
 * Get notification preferences for a member
 */
export async function getMemberNotificationPreferences(memberId: string): Promise<ApiResponse<NotificationPreferences | null>> {
  try {
    if (isDevelopmentMode) {
      const preferences = mockPreferences.find(p => p.memberId === memberId)
      await new Promise(resolve => setTimeout(resolve, 200))
      return createSuccessResponse(preferences || null)
    }

    const result = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.memberId, memberId))
      .limit(1)

    const preferences = result.length > 0 ? result[0] as NotificationPreferences : null
    return createSuccessResponse(preferences)
  } catch (error) {
    console.error('Error fetching notification preferences:', error)
    return createErrorResponse('Failed to fetch notification preferences.')
  }
}

/**
 * Update notification preferences for a member
 */
export async function updateMemberNotificationPreferences(
  memberId: string, 
  preferencesData: Partial<NewNotificationPreferences>
): Promise<ApiResponse<NotificationPreferences>> {
  try {
    if (isDevelopmentMode) {
      let preferenceIndex = mockPreferences.findIndex(p => p.memberId === memberId)
      
      if (preferenceIndex === -1) {
        // Create new preferences
        const newPreferences: NotificationPreferences = {
          id: nextPreferenceId.toString(),
          memberId,
          generalNotifications: true,
          eventNotifications: true,
          announcementNotifications: true,
          emergencyNotifications: true,
          reminderNotifications: true,
          soundEnabled: true,
          browserNotifications: false,
          quietHoursStart: null,
          quietHoursEnd: null,
          ...preferencesData,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        mockPreferences.push(newPreferences)
        nextPreferenceId++
        
        await new Promise(resolve => setTimeout(resolve, 200))
        return createSuccessResponse(newPreferences)
      } else {
        // Update existing preferences
        mockPreferences[preferenceIndex] = {
          ...mockPreferences[preferenceIndex],
          ...preferencesData,
          updatedAt: new Date(),
        }
        
        await new Promise(resolve => setTimeout(resolve, 200))
        return createSuccessResponse(mockPreferences[preferenceIndex])
      }
    }

    // Try to update existing preferences
    const updateResult = await db
      .update(notificationPreferences)
      .set({ ...preferencesData, updatedAt: new Date() })
      .where(eq(notificationPreferences.memberId, memberId))
      .returning()

    if (updateResult.length > 0) {
      return createSuccessResponse(updateResult[0] as NotificationPreferences)
    }

    // If no existing preferences, create new ones
    const validatedData = insertNotificationPreferencesSchema.parse({
      memberId,
      ...preferencesData
    })

    const insertResult = await db.insert(notificationPreferences).values(validatedData).returning()
    return createSuccessResponse(insertResult[0] as NotificationPreferences)
  } catch (error) {
    console.error('Error updating notification preferences:', error)
    return createErrorResponse('Failed to update notification preferences.')
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Create notification recipients based on target criteria
 */
async function createNotificationRecipients(
  notificationId: string, 
  targetType: string, 
  targetCriteria: string | null
): Promise<void> {
  try {
    if (isDevelopmentMode) {
      // Mock recipient creation
      let recipientIds: string[] = []

      switch (targetType) {
        case 'all':
          recipientIds = ['1', '2', '3'] // Mock all member IDs
          break
        case 'role':
          recipientIds = ['1', '2'] // Mock filtered by role
          break
        case 'individual':
          if (targetCriteria) {
            const criteria = JSON.parse(targetCriteria)
            recipientIds = [criteria.memberId]
          }
          break
      }

      recipientIds.forEach(memberId => {
        mockRecipients.push({
          id: nextRecipientId.toString(),
          notificationId,
          memberId,
          isRead: false,
          readAt: null,
          isArchived: false,
          archivedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        nextRecipientId++
      })
      return
    }

    // Database implementation would include complex member filtering
    // For now, just create recipients for all active members
    const allMembers = await db.select({ id: members.id }).from(members)
    
    const recipients = allMembers.map(member => ({
      notificationId,
      memberId: member.id,
    }))

    if (recipients.length > 0) {
      await db.insert(notificationRecipients).values(recipients)
    }
  } catch (error) {
    console.error('Error creating notification recipients:', error)
  }
}

/**
 * Process template placeholders with actual data
 */
export function processNotificationPlaceholders(
  content: string, 
  placeholders: Record<string, string>
): string {
  let processedContent = content

  Object.entries(placeholders).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`
    processedContent = processedContent.replace(new RegExp(placeholder, 'g'), value)
  })

  return processedContent
}

/**
 * Get notification statistics
 */
export async function getNotificationStatistics(): Promise<ApiResponse<{
  totalNotifications: number
  totalRecipients: number
  unreadNotifications: number
  readRate: number
}>> {
  try {
    if (isDevelopmentMode) {
      const stats = {
        totalNotifications: mockNotifications.length,
        totalRecipients: mockRecipients.length,
        unreadNotifications: mockRecipients.filter(r => !r.isRead).length,
        readRate: 0.85 // 85% read rate
      }

      await new Promise(resolve => setTimeout(resolve, 200))
      return createSuccessResponse(stats)
    }

    const totalNotifications = await db.select({ count: count() }).from(notifications)
    const totalRecipients = await db.select({ count: count() }).from(notificationRecipients)
    const unreadNotifications = await db
      .select({ count: count() })
      .from(notificationRecipients)
      .where(eq(notificationRecipients.isRead, false))

    const total = totalRecipients[0]?.count || 0
    const unread = unreadNotifications[0]?.count || 0
    const readRate = total > 0 ? (total - unread) / total : 0

    const stats = {
      totalNotifications: totalNotifications[0].count,
      totalRecipients: total,
      unreadNotifications: unread,
      readRate
    }

    return createSuccessResponse(stats)
  } catch (error) {
    console.error('Error fetching notification statistics:', error)
    return createErrorResponse('Failed to fetch notification statistics.')
  }
}
