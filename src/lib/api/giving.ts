import { db } from '@/lib/db'
import { 
  paymentMethods, 
  givingCategories, 
  transactions, 
  recurringGiving, 
  momoPaymentSessions
} from '@/lib/db/schema'
import { 
  insertPaymentMethodSchema, 
  insertGivingCategorySchema, 
  insertTransactionSchema,
  insertRecurringGivingSchema,
  type NewPaymentMethod,
  type NewGivingCategory,
  type NewTransaction,
  type NewRecurringGiving,
  type NewMoMoPaymentSession
} from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

// Local ApiResponse utility functions
const createSuccessResponse = <T>(data: T): { ok: true; data: T } => ({ ok: true, data })
const createErrorResponse = (error: string): { ok: false; error: string } => ({ ok: false, error })

// Mock MoMo payment processing
const mockMoMoPayment = async () => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
  
  // Simulate success/failure (90% success rate for demo)
  const isSuccess = Math.random() > 0.1
  
  if (isSuccess) {
    return {
      success: true,
      transactionId: `MOMO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'completed',
      message: 'Payment successful'
    }
  } else {
    return {
      success: false,
      error: 'Insufficient funds',
      status: 'failed'
    }
  }
}

// Payment Methods
export const getAllPaymentMethods = async () => {
  try {
    if (process.env.VITE_DATABASE_URL === 'mock') {
      // Mock data for development
      const mockMethods = [
        {
          id: '1',
          name: 'Mobile Money (MoMo)',
          code: 'momo',
          description: 'Pay using MTN, Vodafone, or AirtelTigo Mobile Money',
          isActive: true,
          requiresAccountNumber: false,
          icon: 'smartphone',
          color: 'green',
          processingFee: 0,
          processingFeeType: 'fixed',
          minAmount: 100, // 1 GHS
          maxAmount: 1000000, // 10,000 GHS
          accountNumberFormat: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          name: 'Bank Transfer',
          code: 'bank',
          description: 'Direct bank transfer to church account',
          isActive: true,
          requiresAccountNumber: true,
          accountNumberFormat: null,
          icon: 'building',
          color: 'blue',
          processingFee: 0,
          processingFeeType: 'fixed',
          minAmount: 1000, // 10 GHS
          maxAmount: 10000000, // 100,000 GHS
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '3',
          name: 'Cash',
          code: 'cash',
          description: 'Physical cash payment at church',
          isActive: true,
          requiresAccountNumber: false,
          icon: 'dollar-sign',
          color: 'yellow',
          processingFee: 0,
          processingFeeType: 'fixed',
          minAmount: 100, // 1 GHS
          maxAmount: 100000, // 1,000 GHS
          accountNumberFormat: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
      return createSuccessResponse(mockMethods)
    }

    const methods = await db.select().from(paymentMethods).where(eq(paymentMethods.isActive, true))
    return createSuccessResponse(methods)
  } catch (error) {
    console.error('Error fetching payment methods:', error)
    return createErrorResponse('Failed to fetch payment methods')
  }
}

export const createPaymentMethod = async (data: NewPaymentMethod) => {
  try {
    const validatedData = insertPaymentMethodSchema.parse(data)
    
    if (process.env.VITE_DATABASE_URL === 'mock') {
      return createSuccessResponse({ ...validatedData, id: `pm_${Date.now()}` })
    }

    const [method] = await db.insert(paymentMethods).values(validatedData).returning()
    return createSuccessResponse(method)
  } catch (error) {
    console.error('Error creating payment method:', error)
    return createErrorResponse('Failed to create payment method')
  }
}

// Giving Categories
export const getAllGivingCategories = async () => {
  try {
    if (process.env.VITE_DATABASE_URL === 'mock') {
      // Mock data for development
      const mockCategories = [
        {
          id: '1',
          name: 'Tithe',
          code: 'tithe',
          description: 'Regular tithe offering (10% of income)',
          isActive: true,
          isDefault: true,
          icon: 'percent',
          color: 'green',
          targetAmount: null,
          startDate: null,
          endDate: null,
          createdBy: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          name: 'Offering',
          code: 'offering',
          description: 'General church offering',
          isActive: true,
          isDefault: true,
          icon: 'heart',
          color: 'blue',
          targetAmount: null,
          startDate: null,
          endDate: null,
          createdBy: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '3',
          name: 'Building Fund',
          code: 'building',
          description: 'Contributions for church building projects',
          isActive: true,
          isDefault: false,
          icon: 'building',
          color: 'purple',
          targetAmount: 1000000000, // 10,000,000 GHS
          startDate: new Date('2024-01-01'),
          endDate: new Date('2025-12-31'),
          createdBy: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '4',
          name: 'Missions',
          code: 'missions',
          description: 'Support for missionary work and outreach',
          isActive: true,
          isDefault: false,
          icon: 'globe',
          color: 'orange',
          targetAmount: 50000000, // 500,000 GHS
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          createdBy: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '5',
          name: 'Special Project',
          code: 'special',
          description: 'One-time special project contributions',
          isActive: true,
          isDefault: false,
          icon: 'star',
          color: 'red',
          targetAmount: null,
          startDate: null,
          endDate: null,
          createdBy: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
      return createSuccessResponse(mockCategories)
    }

    const categories = await db.select().from(givingCategories).where(eq(givingCategories.isActive, true))
    return createSuccessResponse(categories)
  } catch (error) {
    console.error('Error fetching giving categories:', error)
    return createErrorResponse('Failed to fetch giving categories')
  }
}

export const createGivingCategory = async (data: NewGivingCategory) => {
  try {
    const validatedData = insertGivingCategorySchema.parse(data)
    
    if (process.env.VITE_DATABASE_URL === 'mock') {
      return createSuccessResponse({ ...validatedData, id: `cat_${Date.now()}` })
    }

    const [category] = await db.insert(givingCategories).values(validatedData).returning()
    return createSuccessResponse(category)
  } catch (error) {
    console.error('Error creating giving category:', error)
    return createErrorResponse('Failed to create giving category')
  }
}

// Transactions
export const createTransaction = async (data: NewTransaction) => {
  try {
    const validatedData = insertTransactionSchema.parse(data)
    
    if (process.env.VITE_DATABASE_URL === 'mock') {
      const transaction = {
        ...validatedData,
        id: `txn_${Date.now()}`,
        transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      return createSuccessResponse(transaction)
    }

    const [transaction] = await db.insert(transactions).values(validatedData).returning()
    return createSuccessResponse(transaction)
  } catch (error) {
    console.error('Error creating transaction:', error)
    return createErrorResponse('Failed to create transaction')
  }
}

export const getMemberTransactions = async (memberId: string) => {
  try {
    if (process.env.VITE_DATABASE_URL === 'mock') {
      // Mock transaction data
      const mockTransactions = [
        {
          id: '1',
          transactionId: 'TXN_001',
          memberId,
          paymentMethodId: '1',
          categoryId: '1',
          amount: 50000, // 500 GHS
          processingFee: 0,
          netAmount: 50000,
          currency: 'GHS',
          status: 'completed',
          paymentStatus: 'captured',
          transactionType: 'payment',
          reference: 'REF_001',
          description: 'Tithe payment',
          notes: null,
          metadata: null,
          momoPhoneNumber: '233244123456',
          momoNetwork: 'MTN',
          momoTransactionId: 'MOMO_001',
          processedAt: new Date(),
          failedAt: null,
          failureReason: null,
          retryCount: 0,
          nextRetryAt: null,
          createdBy: memberId,
          processedBy: null,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15')
        },
        {
          id: '2',
          transactionId: 'TXN_002',
          memberId,
          paymentMethodId: '1',
          categoryId: '2',
          amount: 20000, // 200 GHS
          processingFee: 0,
          netAmount: 20000,
          currency: 'GHS',
          status: 'completed',
          paymentStatus: 'captured',
          transactionType: 'payment',
          reference: 'REF_002',
          description: 'Sunday offering',
          notes: null,
          metadata: null,
          momoPhoneNumber: '233244123456',
          momoNetwork: 'MTN',
          momoTransactionId: 'MOMO_002',
          processedAt: new Date(),
          failedAt: null,
          failureReason: null,
          retryCount: 0,
          nextRetryAt: null,
          createdBy: memberId,
          processedBy: null,
          createdAt: new Date('2024-01-20'),
          updatedAt: new Date('2024-01-20')
        }
      ]
      return createSuccessResponse(mockTransactions)
    }

    const memberTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.memberId, memberId))
      .orderBy(desc(transactions.createdAt))
    
    return createSuccessResponse(memberTransactions)
  } catch (error) {
    console.error('Error fetching member transactions:', error)
    return createErrorResponse('Failed to fetch member transactions')
  }
}

export const getAllTransactions = async () => {
  try {
    if (process.env.VITE_DATABASE_URL === 'mock') {
      // Mock data for admin view
      const mockTransactions = [
        {
          id: '1',
          transactionId: 'TXN_001',
          memberId: 'member_1',
          paymentMethodId: '1',
          categoryId: '1',
          amount: 50000,
          processingFee: 0,
          netAmount: 50000,
          currency: 'GHS',
          status: 'completed',
          paymentStatus: 'captured',
          transactionType: 'payment',
          reference: 'REF_001',
          description: 'Tithe payment',
          notes: null,
          metadata: null,
          momoPhoneNumber: '233244123456',
          momoNetwork: 'MTN',
          momoTransactionId: 'MOMO_001',
          processedAt: new Date(),
          failedAt: null,
          failureReason: null,
          retryCount: 0,
          nextRetryAt: null,
          createdBy: 'member_1',
          processedBy: null,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15')
        }
      ]
      return createSuccessResponse(mockTransactions)
    }

    const allTransactions = await db
      .select()
      .from(transactions)
      .orderBy(desc(transactions.createdAt))
    
    return createSuccessResponse(allTransactions)
  } catch (error) {
    console.error('Error fetching all transactions:', error)
    return createErrorResponse('Failed to fetch transactions')
  }
}

// MoMo Payment Processing
export const initiateMoMoPayment = async (
  memberId: string,
  phoneNumber: string,
  network: 'MTN' | 'Vodafone' | 'AirtelTigo',
  amount: number,
  categoryId: string,
  description?: string
) => {
  try {
    // Create transaction record
    const transactionData: NewTransaction = {
      memberId,
      transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      paymentMethodId: '1', // MoMo payment method
      categoryId,
      amount,
      processingFee: 0,
      netAmount: amount,
      currency: 'GHS',
      status: 'pending',
      paymentStatus: 'pending',
      transactionType: 'payment',
      reference: `REF_${Date.now()}`,
      description: description || 'MoMo payment',
      momoPhoneNumber: phoneNumber,
      momoNetwork: network,
      createdBy: memberId
    }

    const transactionResult = await createTransaction(transactionData)
    if (!transactionResult.ok) {
      return createErrorResponse('Failed to create transaction')
    }

    const transaction = transactionResult.data

    // Create MoMo payment session
    const sessionData: NewMoMoPaymentSession = {
      sessionId: `SESSION_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      transactionId: transaction.id,
      phoneNumber,
      network,
      amount,
      status: 'initiated',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      retryCount: 0
    }

    if (process.env.VITE_DATABASE_URL === 'mock') {
      const session = { ...sessionData, id: `session_${Date.now()}` }
      
      // Simulate MoMo payment processing
      const paymentResult = await mockMoMoPayment()
      
      if (paymentResult.success) {
        // Update transaction status
        const updatedTransaction = {
          ...transaction,
          status: 'completed',
          paymentStatus: 'captured',
          momoTransactionId: paymentResult.transactionId,
          processedAt: new Date()
        }
        
        return createSuccessResponse({
          transaction: updatedTransaction,
          session,
          paymentResult
        })
      } else {
        // Update transaction status
        return createErrorResponse(paymentResult.error || 'Payment failed')
      }
    }

    const [session] = await db.insert(momoPaymentSessions).values(sessionData).returning()
    
    // In real implementation, this would integrate with actual MoMo API
    // For now, return the session for manual processing
    return createSuccessResponse({
      transaction,
      session,
      message: 'Payment session created. Please complete payment on your phone.'
    })
  } catch (error) {
    console.error('Error initiating MoMo payment:', error)
    return createErrorResponse('Failed to initiate MoMo payment')
  }
}

export const processMoMoPayment = async (sessionId: string, momoResponse: any) => {
  try {
    if (process.env.VITE_DATABASE_URL === 'mock') {
      return createSuccessResponse({ message: 'Payment processed successfully' })
    }

    // Update session status
    await db
      .update(momoPaymentSessions)
      .set({
        status: 'completed',
        completedAt: new Date(),
        momoResponse: JSON.stringify(momoResponse)
      })
      .where(eq(momoPaymentSessions.sessionId, sessionId))

    // Get session details
    const [session] = await db
      .select()
      .from(momoPaymentSessions)
      .where(eq(momoPaymentSessions.sessionId, sessionId))

    if (!session) {
      return createErrorResponse('Payment session not found')
    }

    // Update transaction status
    await db
      .update(transactions)
      .set({
        status: 'completed',
        paymentStatus: 'captured',
        momoTransactionId: momoResponse.transactionId,
        processedAt: new Date()
      })
      .where(eq(transactions.id, session.transactionId))

    return createSuccessResponse({ message: 'Payment processed successfully' })
  } catch (error) {
    console.error('Error processing MoMo payment:', error)
    return createErrorResponse('Failed to process payment')
  }
}

// Giving Statistics
export const getGivingStatistics = async () => {
  try {
    if (process.env.VITE_DATABASE_URL === 'mock') {
      // Mock statistics
      const mockStats = {
        totalAmount: 150000, // 1,500 GHS
        totalTransactions: 25,
        monthlyAverage: 75000, // 750 GHS
        topCategory: 'Tithe',
        topCategoryAmount: 100000, // 1,000 GHS
        recentTransactions: 5,
        pendingTransactions: 2,
        failedTransactions: 1
      }
      return createSuccessResponse(mockStats)
    }

    // Real database queries would go here
    const stats = {
      totalAmount: 0,
      totalTransactions: 0,
      monthlyAverage: 0,
      topCategory: '',
      topCategoryAmount: 0,
      recentTransactions: 0,
      pendingTransactions: 0,
      failedTransactions: 0
    }

    return createSuccessResponse(stats)
  } catch (error) {
    console.error('Error fetching giving statistics:', error)
    return createErrorResponse('Failed to fetch giving statistics')
  }
}

// Recurring Giving
export const createRecurringGiving = async (data: NewRecurringGiving) => {
  try {
    const validatedData = insertRecurringGivingSchema.parse(data)
    
    if (process.env.VITE_DATABASE_URL === 'mock') {
      return createSuccessResponse({ ...validatedData, id: `rg_${Date.now()}` })
    }

    const [recurring] = await db.insert(recurringGiving).values(validatedData).returning()
    return createSuccessResponse(recurring)
  } catch (error) {
    console.error('Error creating recurring giving:', error)
    return createErrorResponse('Failed to create recurring giving')
  }
}

export const getMemberRecurringGiving = async (memberId: string) => {
  try {
    if (process.env.VITE_DATABASE_URL === 'mock') {
      // Mock recurring giving data
      const mockRecurring = [
        {
          id: '1',
          memberId,
          categoryId: '1',
          paymentMethodId: '1',
          amount: 50000, // 500 GHS
          frequency: 'monthly',
          startDate: new Date('2024-01-01'),
          endDate: null,
          nextPaymentDate: new Date('2024-02-01'),
          isActive: true,
          maxPayments: null,
          currentPayments: 1,
          lastPaymentDate: new Date('2024-01-01'),
          failureCount: 0,
          status: 'active',
          notes: 'Monthly tithe',
          createdBy: memberId,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        }
      ]
      return createSuccessResponse(mockRecurring)
    }

    const memberRecurring = await db
      .select()
      .from(recurringGiving)
      .where(eq(recurringGiving.memberId, memberId))
      .orderBy(desc(recurringGiving.createdAt))
    
    return createSuccessResponse(memberRecurring)
  } catch (error) {
    console.error('Error fetching member recurring giving:', error)
    return createErrorResponse('Failed to fetch recurring giving')
  }
}
