import { pgTable, text, timestamp, uuid, varchar, boolean, integer } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

// Members table - core user data beyond Clerk auth
export const members = pgTable('members', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkUserId: text('clerk_user_id').unique().notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  phone: varchar('phone', { length: 20 }),
  dateOfBirth: timestamp('date_of_birth'),
  address: text('address'),
  emergencyContact: varchar('emergency_contact', { length: 255 }),
  membershipDate: timestamp('membership_date').defaultNow(),
  isActive: boolean('is_active').default(true),
  role: varchar('role', { length: 20 }).default('member'), // admin, pastor, leader, member, visitor
  // Enhanced status management
  status: varchar('status', { length: 20 }).default('active'), // active, inactive, transferred, deceased, suspended, visitor
  statusReason: text('status_reason'), // Reason for status change
  statusChangedBy: uuid('status_changed_by'), // References members.id but without circular reference
  statusChangedAt: timestamp('status_changed_at'),
  department: varchar('department', { length: 100 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Attendance tracking - Enhanced for Events integration
export const attendance = pgTable('attendance', {
  id: uuid('id').primaryKey().defaultRandom(),
  memberId: uuid('member_id').references(() => members.id).notNull(),
  eventId: uuid('event_id').references(() => events.id), // Link to specific event (optional for general services)
  serviceDate: timestamp('service_date').notNull(),
  serviceType: varchar('service_type', { length: 50 }).notNull(), // sunday-service, midweek-service, prayer-meeting, special-event, etc.
  checkInTime: timestamp('check_in_time').notNull(),
  checkOutTime: timestamp('check_out_time'),
  checkInMethod: varchar('check_in_method', { length: 20 }).default('manual'), // manual, qr-code, admin-add
  qrCodeId: varchar('qr_code_id', { length: 100 }), // QR code identifier used for check-in
  location: varchar('location', { length: 200 }), // Where they checked in (e.g., "Main Sanctuary", "Fellowship Hall")
  notes: text('notes'),
  recordedBy: uuid('recorded_by').references(() => members.id), // Who recorded this attendance (for admin-added entries)
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// QR Codes for attendance check-ins
export const attendanceQRCodes = pgTable('attendance_qr_codes', {
  id: uuid('id').primaryKey().defaultRandom(),
  qrCodeId: varchar('qr_code_id', { length: 100 }).notNull().unique(), // Unique QR identifier
  eventId: uuid('event_id').references(() => events.id), // Specific event (optional)
  serviceType: varchar('service_type', { length: 50 }).notNull(), // sunday-service, midweek-service, etc.
  serviceDate: timestamp('service_date').notNull(), // Date this QR is valid for
  location: varchar('location', { length: 200 }), // Physical location of QR code
  isActive: boolean('is_active').default(true), // Can disable QR codes
  expiresAt: timestamp('expires_at'), // Optional expiration time
  maxUses: integer('max_uses'), // Optional usage limit
  currentUses: integer('current_uses').default(0), // Track usage
  displayOnScreens: boolean('display_on_screens').default(false), // Whether to show on church displays
  displayLocation: varchar('display_location', { length: 100 }), // Which screen/location to display on
  lastDisplayed: timestamp('last_displayed'), // When it was last shown on displays
  createdBy: uuid('created_by').references(() => members.id), // Who created the QR code
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Events/Calendar
export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  location: varchar('location', { length: 200 }),
  eventType: varchar('event_type', { length: 50 }).notNull(), // Service, Bible Study, Prayer Meeting, Outreach, Fellowship, Conference, Special
  maxAttendees: integer('max_attendees'),
  currentAttendees: integer('current_attendees').default(0),
  isPublic: boolean('is_public').default(true),
  isRecurring: boolean('is_recurring').default(false),
  recurringPattern: varchar('recurring_pattern', { length: 50 }), // weekly, monthly, yearly
  recurringEndDate: timestamp('recurring_end_date'),
  requiresRegistration: boolean('requires_registration').default(false),
  cost: integer('cost').default(0), // Cost in pesewas (Ghana's smallest currency unit)
  imageUrl: varchar('image_url', { length: 500 }),
  tags: varchar('tags', { length: 500 }), // JSON string for event tags
  status: varchar('status', { length: 20 }).default('scheduled'), // scheduled, cancelled, completed, postponed
  createdBy: uuid('created_by').references(() => members.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Event Volunteers - for volunteer scheduling
export const eventVolunteers = pgTable('event_volunteers', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').references(() => events.id).notNull(),
  memberId: uuid('member_id').references(() => members.id).notNull(),
  role: varchar('role', { length: 100 }).notNull(), // Usher, Worship Team, Children's Ministry, etc.
  status: varchar('status', { length: 20 }).default('confirmed'), // confirmed, pending, declined
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
})

// Event Registrations - for member event registration
export const eventRegistrations = pgTable('event_registrations', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').references(() => events.id).notNull(),
  memberId: uuid('member_id').references(() => members.id).notNull(),
  status: varchar('status', { length: 20 }).default('registered'), // registered, waitlisted, cancelled, attended
  registrationDate: timestamp('registration_date').defaultNow(),
  notes: text('notes'), // Special requirements, dietary restrictions, etc.
  isWaitlisted: boolean('is_waitlisted').default(false),
  waitlistPosition: integer('waitlist_position'), // Position in waitlist if applicable
  notificationsSent: boolean('notifications_sent').default(false), // Email confirmations, reminders
  cancellationReason: text('cancellation_reason'),
  cancelledAt: timestamp('cancelled_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Drizzle Zod schemas for validation
export const insertMemberSchema = createInsertSchema(members, {
  email: z.string().email(),
  phone: z.string().optional(),
  role: z.enum(['admin', 'pastor', 'leader', 'member', 'visitor']).default('member'),
  status: z.enum(['active', 'inactive', 'transferred', 'deceased', 'suspended', 'visitor']).default('active'),
  statusReason: z.string().optional(),
  statusChangedBy: z.string().optional(),
})

export const selectMemberSchema = createSelectSchema(members)

export const insertAttendanceSchema = createInsertSchema(attendance, {
  serviceType: z.enum(['sunday-service', 'midweek-service', 'bible-study', 'prayer-meeting', 'special-event', 'outreach', 'fellowship', 'conference']),
  checkInMethod: z.enum(['manual', 'qr-code', 'admin-add']).default('manual'),
})

export const selectAttendanceSchema = createSelectSchema(attendance)

export const insertQRCodeSchema = createInsertSchema(attendanceQRCodes, {
  serviceType: z.enum(['sunday-service', 'midweek-service', 'bible-study', 'prayer-meeting', 'special-event', 'outreach', 'fellowship', 'conference']),
  qrCodeId: z.string().min(1),
  isActive: z.boolean().default(true),
  maxUses: z.number().min(1).optional(),
  currentUses: z.number().min(0).default(0),
  displayOnScreens: z.boolean().default(false),
  displayLocation: z.string().optional(),
  lastDisplayed: z.date().optional(),
  createdBy: z.string().optional(),
})

export const selectQRCodeSchema = createSelectSchema(attendanceQRCodes)

export const insertEventSchema = createInsertSchema(events, {
  eventType: z.enum(['service', 'bible-study', 'prayer-meeting', 'outreach', 'fellowship', 'conference', 'special']),
  status: z.enum(['scheduled', 'cancelled', 'completed', 'postponed']).default('scheduled'),
  recurringPattern: z.enum(['weekly', 'monthly', 'yearly']).optional(),
  cost: z.number().min(0).default(0),
  maxAttendees: z.number().min(1).optional(),
  currentAttendees: z.number().min(0).default(0),
})

export const selectEventSchema = createSelectSchema(events)

export const insertEventVolunteerSchema = createInsertSchema(eventVolunteers, {
  status: z.enum(['confirmed', 'pending', 'declined']).default('confirmed'),
})

export const selectEventVolunteerSchema = createSelectSchema(eventVolunteers)

export const insertEventRegistrationSchema = createInsertSchema(eventRegistrations, {
  status: z.enum(['registered', 'waitlisted', 'cancelled', 'attended']).default('registered'),
  notes: z.string().optional(),
  isWaitlisted: z.boolean().default(false),
  waitlistPosition: z.number().optional(),
  notificationsSent: z.boolean().default(false),
  cancellationReason: z.string().optional(),
})

export const selectEventRegistrationSchema = createSelectSchema(eventRegistrations)

// TypeScript types
export type Member = z.infer<typeof selectMemberSchema>
export type NewMember = z.infer<typeof insertMemberSchema>
export type Attendance = z.infer<typeof selectAttendanceSchema>
export type NewAttendance = z.infer<typeof insertAttendanceSchema>
export type AttendanceQRCode = z.infer<typeof selectQRCodeSchema>
export type NewAttendanceQRCode = z.infer<typeof insertQRCodeSchema>
export type ChurchEvent = z.infer<typeof selectEventSchema>
export type NewChurchEvent = z.infer<typeof insertEventSchema>
export type EventVolunteer = z.infer<typeof selectEventVolunteerSchema>
export type NewEventVolunteer = z.infer<typeof insertEventVolunteerSchema>
export type EventRegistration = z.infer<typeof selectEventRegistrationSchema>
export type NewEventRegistration = z.infer<typeof insertEventRegistrationSchema>
// Removed old communication types - using notifications now
export type NotificationTemplate = z.infer<typeof selectNotificationTemplateSchema>
export type NewNotificationTemplate = z.infer<typeof insertNotificationTemplateSchema>
export type Notification = z.infer<typeof selectNotificationSchema>
export type NewNotification = z.infer<typeof insertNotificationSchema>
export type NotificationRecipient = z.infer<typeof selectNotificationRecipientSchema>
export type NewNotificationRecipient = z.infer<typeof insertNotificationRecipientSchema>
export type NotificationPreferences = z.infer<typeof selectNotificationPreferencesSchema>
export type NewNotificationPreferences = z.infer<typeof insertNotificationPreferencesSchema>

// In-App Communications System Tables

// Notification Templates - for reusable notification content
export const notificationTemplates = pgTable('notification_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 50 }).notNull(), // welcome, event, announcement, emergency, reminder, general
  title: varchar('title', { length: 200 }).notNull(), // Notification title
  content: text('content').notNull(), // Message content with placeholders
  priority: varchar('priority', { length: 20 }).default('normal'), // low, normal, high, urgent
  icon: varchar('icon', { length: 50 }), // Icon name for the notification
  color: varchar('color', { length: 20 }), // Color theme for notification
  isActive: boolean('is_active').default(true),
  createdBy: uuid('created_by').references(() => members.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Notifications - individual notifications sent to members
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 200 }).notNull(),
  content: text('content').notNull(),
  category: varchar('category', { length: 50 }).notNull(), // welcome, event, announcement, emergency, reminder, general
  priority: varchar('priority', { length: 20 }).default('normal'), // low, normal, high, urgent
  icon: varchar('icon', { length: 50 }), // Icon name for the notification
  color: varchar('color', { length: 20 }), // Color theme for notification
  targetType: varchar('target_type', { length: 20 }).notNull(), // individual, role, all, custom
  targetCriteria: text('target_criteria'), // JSON string for targeting rules
  actionType: varchar('action_type', { length: 50 }), // link, event, none
  actionData: text('action_data'), // JSON string for action data (URLs, event IDs, etc.)
  expiresAt: timestamp('expires_at'), // When notification expires
  createdBy: uuid('created_by').references(() => members.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Notification Recipients - tracking who received each notification
export const notificationRecipients = pgTable('notification_recipients', {
  id: uuid('id').primaryKey().defaultRandom(),
  notificationId: uuid('notification_id').references(() => notifications.id).notNull(),
  memberId: uuid('member_id').references(() => members.id).notNull(),
  isRead: boolean('is_read').default(false),
  readAt: timestamp('read_at'),
  isArchived: boolean('is_archived').default(false),
  archivedAt: timestamp('archived_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Notification Preferences - member notification settings
export const notificationPreferences = pgTable('notification_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  memberId: uuid('member_id').references(() => members.id).notNull(),
  generalNotifications: boolean('general_notifications').default(true),
  eventNotifications: boolean('event_notifications').default(true),
  announcementNotifications: boolean('announcement_notifications').default(true),
  emergencyNotifications: boolean('emergency_notifications').default(true),
  reminderNotifications: boolean('reminder_notifications').default(true),
  soundEnabled: boolean('sound_enabled').default(true),
  browserNotifications: boolean('browser_notifications').default(false),
  quietHoursStart: varchar('quiet_hours_start', { length: 5 }), // 22:00 format
  quietHoursEnd: varchar('quiet_hours_end', { length: 5 }), // 07:00 format
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Notification schemas
export const insertNotificationTemplateSchema = createInsertSchema(notificationTemplates, {
  category: z.enum(['welcome', 'event', 'announcement', 'emergency', 'reminder', 'general']),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  name: z.string().min(1, 'Template name is required'),
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  isActive: z.boolean().default(true),
})

export const selectNotificationTemplateSchema = createSelectSchema(notificationTemplates)

export const insertNotificationSchema = createInsertSchema(notifications, {
  category: z.enum(['welcome', 'event', 'announcement', 'emergency', 'reminder', 'general']),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  targetType: z.enum(['individual', 'role', 'all', 'custom']),
  actionType: z.enum(['link', 'event', 'none']).default('none'),
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
})

export const selectNotificationSchema = createSelectSchema(notifications)

export const insertNotificationRecipientSchema = createInsertSchema(notificationRecipients, {
  isRead: z.boolean().default(false),
  isArchived: z.boolean().default(false),
})

export const selectNotificationRecipientSchema = createSelectSchema(notificationRecipients)

export const insertNotificationPreferencesSchema = createInsertSchema(notificationPreferences, {
  generalNotifications: z.boolean().default(true),
  eventNotifications: z.boolean().default(true),
  announcementNotifications: z.boolean().default(true),
  emergencyNotifications: z.boolean().default(true),
  reminderNotifications: z.boolean().default(true),
  soundEnabled: z.boolean().default(true),
  browserNotifications: z.boolean().default(false),
})

export const selectNotificationPreferencesSchema = createSelectSchema(notificationPreferences)

// MoMo Giving System Tables

// Payment Methods - different ways members can give
export const paymentMethods = pgTable('payment_methods', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(), // "MoMo", "Bank Transfer", "Cash", "Check"
  code: varchar('code', { length: 50 }).notNull().unique(), // "momo", "bank", "cash", "check"
  description: text('description'),
  isActive: boolean('is_active').default(true),
  requiresAccountNumber: boolean('requires_account_number').default(false), // For bank transfers
  accountNumberFormat: varchar('account_number_format', { length: 100 }), // Format hint for account numbers
  icon: varchar('icon', { length: 50 }), // Icon name for the payment method
  color: varchar('color', { length: 20 }), // Color theme
  processingFee: integer('processing_fee').default(0), // Fee in pesewas
  processingFeeType: varchar('processing_fee_type', { length: 20 }).default('fixed'), // fixed, percentage
  minAmount: integer('min_amount').default(0), // Minimum amount in pesewas
  maxAmount: integer('max_amount'), // Maximum amount in pesewas
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Giving Categories - different purposes for giving
export const givingCategories = pgTable('giving_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(), // "Tithe", "Offering", "Building Fund", "Missions", "Special Project"
  code: varchar('code', { length: 50 }).notNull().unique(), // "tithe", "offering", "building", "missions", "special"
  description: text('description'),
  isActive: boolean('is_active').default(true),
  isDefault: boolean('is_default').default(false), // Whether this is a default category
  icon: varchar('icon', { length: 50 }), // Icon name
  color: varchar('color', { length: 20 }), // Color theme
  targetAmount: integer('target_amount'), // Target amount in pesewas (optional)
  startDate: timestamp('start_date'), // When this category becomes active
  endDate: timestamp('end_date'), // When this category expires
  createdBy: uuid('created_by').references(() => members.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Transactions - individual giving transactions
export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  transactionId: varchar('transaction_id', { length: 100 }).notNull().unique(), // External transaction ID
  memberId: uuid('member_id').references(() => members.id).notNull(),
  paymentMethodId: uuid('payment_method_id').references(() => paymentMethods.id).notNull(),
  categoryId: uuid('category_id').references(() => givingCategories.id).notNull(),
  amount: integer('amount').notNull(), // Amount in pesewas
  processingFee: integer('processing_fee').default(0), // Processing fee in pesewas
  netAmount: integer('net_amount').notNull(), // Amount after fees
  currency: varchar('currency', { length: 3 }).default('GHS'), // Currency code
  status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, processing, completed, failed, cancelled, refunded
  paymentStatus: varchar('payment_status', { length: 20 }).notNull().default('pending'), // pending, authorized, captured, failed, cancelled
  transactionType: varchar('transaction_type', { length: 20 }).notNull().default('payment'), // payment, refund, adjustment
  reference: varchar('reference', { length: 200 }), // External reference number
  description: text('description'), // Transaction description
  notes: text('notes'), // Internal notes
  metadata: text('metadata'), // JSON string for additional data
  // MoMo specific fields
  momoPhoneNumber: varchar('momo_phone_number', { length: 20 }), // MoMo phone number used
  momoNetwork: varchar('momo_network', { length: 20 }), // MTN, Vodafone, AirtelTigo
  momoTransactionId: varchar('momo_transaction_id', { length: 100 }), // MoMo's transaction ID
  // Processing fields
  processedAt: timestamp('processed_at'), // When transaction was processed
  failedAt: timestamp('failed_at'), // When transaction failed
  failureReason: text('failure_reason'), // Reason for failure
  retryCount: integer('retry_count').default(0), // Number of retry attempts
  nextRetryAt: timestamp('next_retry_at'), // When to retry next
  // Audit fields
  createdBy: uuid('created_by').references(() => members.id), // Who initiated the transaction
  processedBy: uuid('processed_by').references(() => members.id), // Who processed it (for manual processing)
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Transaction Receipts - for generating and storing receipts
export const transactionReceipts = pgTable('transaction_receipts', {
  id: uuid('id').primaryKey().defaultRandom(),
  transactionId: uuid('transaction_id').references(() => transactions.id).notNull(),
  receiptNumber: varchar('receipt_number', { length: 100 }).notNull().unique(), // Receipt number
  receiptType: varchar('receipt_type', { length: 20 }).default('digital'), // digital, printed, email
  status: varchar('status', { length: 20 }).default('generated'), // generated, sent, delivered, failed
  sentAt: timestamp('sent_at'), // When receipt was sent
  deliveryMethod: varchar('delivery_method', { length: 20 }), // email, sms, in-app
  deliveryStatus: varchar('delivery_status', { length: 20 }), // pending, delivered, failed
  failureReason: text('failure_reason'), // Reason for delivery failure
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Recurring Giving - for automatic recurring donations
export const recurringGiving = pgTable('recurring_giving', {
  id: uuid('id').primaryKey().defaultRandom(),
  memberId: uuid('member_id').references(() => members.id).notNull(),
  categoryId: uuid('category_id').references(() => givingCategories.id).notNull(),
  paymentMethodId: uuid('payment_method_id').references(() => paymentMethods.id).notNull(),
  amount: integer('amount').notNull(), // Amount in pesewas
  frequency: varchar('frequency', { length: 20 }).notNull(), // weekly, monthly, quarterly, yearly
  startDate: timestamp('start_date').notNull(), // When to start recurring giving
  endDate: timestamp('end_date'), // When to stop (optional)
  nextPaymentDate: timestamp('next_payment_date').notNull(), // Next payment date
  isActive: boolean('is_active').default(true),
  maxPayments: integer('max_payments'), // Maximum number of payments (optional)
  currentPayments: integer('current_payments').default(0), // Current number of payments made
  lastPaymentDate: timestamp('last_payment_date'), // Last successful payment date
  failureCount: integer('failure_count').default(0), // Number of consecutive failures
  status: varchar('status', { length: 20 }).default('active'), // active, paused, cancelled, completed
  notes: text('notes'), // Notes about this recurring giving
  createdBy: uuid('created_by').references(() => members.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// MoMo Payment Sessions - for tracking payment flow
export const momoPaymentSessions = pgTable('momo_payment_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: varchar('session_id', { length: 100 }).notNull().unique(), // Unique session identifier
  transactionId: uuid('transaction_id').references(() => transactions.id).notNull(),
  phoneNumber: varchar('phone_number', { length: 20 }).notNull(), // MoMo phone number
  network: varchar('network', { length: 20 }).notNull(), // MTN, Vodafone, AirtelTigo
  amount: integer('amount').notNull(), // Amount in pesewas
  status: varchar('status', { length: 20 }).notNull().default('initiated'), // initiated, pending, completed, failed, expired
  expiresAt: timestamp('expires_at').notNull(), // When session expires
  completedAt: timestamp('completed_at'), // When payment was completed
  failureReason: text('failure_reason'), // Reason for failure
  momoResponse: text('momo_response'), // JSON response from MoMo
  retryCount: integer('retry_count').default(0), // Number of retry attempts
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Schemas for MoMo Giving System
export const insertPaymentMethodSchema = createInsertSchema(paymentMethods, {
  name: z.string().min(1, 'Payment method name is required'),
  code: z.string().min(1, 'Payment method code is required'),
  isActive: z.boolean().default(true),
  requiresAccountNumber: z.boolean().default(false),
  processingFee: z.number().min(0, 'Processing fee cannot be negative'),
  processingFeeType: z.enum(['fixed', 'percentage']).default('fixed'),
  minAmount: z.number().min(0, 'Minimum amount cannot be negative'),
})

export const selectPaymentMethodSchema = createSelectSchema(paymentMethods)

export const insertGivingCategorySchema = createInsertSchema(givingCategories, {
  name: z.string().min(1, 'Category name is required'),
  code: z.string().min(1, 'Category code is required'),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  targetAmount: z.number().min(0, 'Target amount cannot be negative').optional(),
})

export const selectGivingCategorySchema = createSelectSchema(givingCategories)

export const insertTransactionSchema = createInsertSchema(transactions, {
  amount: z.number().min(1, 'Amount must be at least 1 pesewa'),
  processingFee: z.number().min(0, 'Processing fee cannot be negative').default(0),
  netAmount: z.number().min(1, 'Net amount must be at least 1 pesewa'),
  currency: z.string().length(3, 'Currency must be 3 characters').default('GHS'),
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded']).default('pending'),
  paymentStatus: z.enum(['pending', 'authorized', 'captured', 'failed', 'cancelled']).default('pending'),
  transactionType: z.enum(['payment', 'refund', 'adjustment']).default('payment'),
  momoPhoneNumber: z.string().optional(),
  momoNetwork: z.enum(['MTN', 'Vodafone', 'AirtelTigo']).optional(),
  retryCount: z.number().min(0, 'Retry count cannot be negative').default(0),
})

export const selectTransactionSchema = createSelectSchema(transactions)

export const insertTransactionReceiptSchema = createInsertSchema(transactionReceipts, {
  receiptNumber: z.string().min(1, 'Receipt number is required'),
  receiptType: z.enum(['digital', 'printed', 'email']).default('digital'),
  status: z.enum(['generated', 'sent', 'delivered', 'failed']).default('generated'),
  deliveryMethod: z.enum(['email', 'sms', 'in-app']).optional(),
  deliveryStatus: z.enum(['pending', 'delivered', 'failed']).optional(),
})

export const selectTransactionReceiptSchema = createSelectSchema(transactionReceipts)

export const insertRecurringGivingSchema = createInsertSchema(recurringGiving, {
  amount: z.number().min(1, 'Amount must be at least 1 pesewa'),
  frequency: z.enum(['weekly', 'monthly', 'quarterly', 'yearly']),
  startDate: z.date(),
  endDate: z.date().optional(),
  nextPaymentDate: z.date(),
  isActive: z.boolean().default(true),
  maxPayments: z.number().min(1, 'Max payments must be at least 1').optional(),
  currentPayments: z.number().min(0, 'Current payments cannot be negative').default(0),
  failureCount: z.number().min(0, 'Failure count cannot be negative').default(0),
  status: z.enum(['active', 'paused', 'cancelled', 'completed']).default('active'),
})

export const selectRecurringGivingSchema = createSelectSchema(recurringGiving)

export const insertMoMoPaymentSessionSchema = createInsertSchema(momoPaymentSessions, {
  sessionId: z.string().min(1, 'Session ID is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  network: z.enum(['MTN', 'Vodafone', 'AirtelTigo']),
  amount: z.number().min(1, 'Amount must be at least 1 pesewa'),
  status: z.enum(['initiated', 'pending', 'completed', 'failed', 'expired']).default('initiated'),
  expiresAt: z.date(),
  completedAt: z.date().optional(),
  retryCount: z.number().min(0, 'Retry count cannot be negative').default(0),
})

export const selectMoMoPaymentSessionSchema = createSelectSchema(momoPaymentSessions)

// TypeScript types
export type PaymentMethod = typeof paymentMethods.$inferSelect
export type NewPaymentMethod = typeof paymentMethods.$inferInsert
export type GivingCategory = typeof givingCategories.$inferSelect
export type NewGivingCategory = typeof givingCategories.$inferInsert
export type Transaction = typeof transactions.$inferSelect
export type NewTransaction = typeof transactions.$inferInsert
export type TransactionReceipt = typeof transactionReceipts.$inferSelect
export type NewTransactionReceipt = typeof transactionReceipts.$inferInsert
export type RecurringGiving = typeof recurringGiving.$inferSelect
export type NewRecurringGiving = typeof recurringGiving.$inferInsert
export type MoMoPaymentSession = typeof momoPaymentSessions.$inferSelect
export type NewMoMoPaymentSession = typeof momoPaymentSessions.$inferInsert
