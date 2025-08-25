// Inventory Management API
// Handles all operations related to church inventory, borrowing, and maintenance

import { db } from '@/lib/db'
import { 
  inventoryItems, 
  inventoryCategories, 
  borrowingRecords, 
  inventoryMaintenance,
  inventoryAudit,
  members,
  ministryTeams
} from '@/lib/db/schema'
import { eq, and, desc, sql, gte, lte, asc, isNull, isNotNull, count, sum } from 'drizzle-orm'
import type { 
  NewInventoryItem, 
  NewInventoryCategory, 
  NewBorrowingRecord, 
  NewInventoryMaintenance,
  NewInventoryAudit,
  InventoryItem,
  InventoryCategory,
  BorrowingRecord,
  InventoryMaintenance,
  InventoryAudit
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

// === INVENTORY ITEM MANAGEMENT ===

export async function createInventoryItem(itemData: NewInventoryItem): Promise<ApiResponse<InventoryItem>> {
  try {
    const [newItem] = await db
      .insert(inventoryItems)
      .values(itemData)
      .returning()

    return createSuccessResponse(newItem)
  } catch (error) {
    console.error('Error creating inventory item:', error)
    return createErrorResponse('Failed to create inventory item')
  }
}

export async function getInventoryItem(itemId: string): Promise<ApiResponse<InventoryItem>> {
  try {
    const [item] = await db
      .select()
      .from(inventoryItems)
      .where(eq(inventoryItems.id, itemId))
      .limit(1)

    if (!item) {
      return createErrorResponse('Inventory item not found')
    }

    return createSuccessResponse(item)
  } catch (error) {
    console.error('Error fetching inventory item:', error)
    return createErrorResponse('Failed to fetch inventory item')
  }
}

export async function getAllInventoryItems(): Promise<ApiResponse<InventoryItem[]>> {
  try {
    const items = await db
      .select()
      .from(inventoryItems)
      .where(eq(inventoryItems.isActive, true))
      .orderBy(desc(inventoryItems.createdAt))

    return createSuccessResponse(items)
  } catch (error) {
    console.error('Error fetching inventory items:', error)
    return createErrorResponse('Failed to fetch inventory items')
  }
}

export async function getInventoryItemsByCategory(category: string): Promise<ApiResponse<InventoryItem[]>> {
  try {
    const items = await db
      .select()
      .from(inventoryItems)
      .where(and(
        eq(inventoryItems.category, category),
        eq(inventoryItems.isActive, true)
      ))
      .orderBy(desc(inventoryItems.createdAt))

    return createSuccessResponse(items)
  } catch (error) {
    console.error('Error fetching inventory items by category:', error)
    return createErrorResponse('Failed to fetch inventory items by category')
  }
}

export async function updateInventoryItem(itemId: string, updates: Partial<NewInventoryItem>): Promise<ApiResponse<InventoryItem>> {
  try {
    const [updatedItem] = await db
      .update(inventoryItems)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(inventoryItems.id, itemId))
      .returning()

    if (!updatedItem) {
      return createErrorResponse('Inventory item not found')
    }

    return createSuccessResponse(updatedItem)
  } catch (error) {
    console.error('Error updating inventory item:', error)
    return createErrorResponse('Failed to update inventory item')
  }
}

export async function deactivateInventoryItem(itemId: string): Promise<ApiResponse<InventoryItem>> {
  try {
    const [deactivatedItem] = await db
      .update(inventoryItems)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(inventoryItems.id, itemId))
      .returning()

    if (!deactivatedItem) {
      return createErrorResponse('Inventory item not found')
    }

    return createSuccessResponse(deactivatedItem)
  } catch (error) {
    console.error('Error deactivating inventory item:', error)
    return createErrorResponse('Failed to deactivate inventory item')
  }
}

// === INVENTORY CATEGORIES ===

export async function createInventoryCategory(categoryData: NewInventoryCategory): Promise<ApiResponse<InventoryCategory>> {
  try {
    const [newCategory] = await db
      .insert(inventoryCategories)
      .values(categoryData)
      .returning()

    return createSuccessResponse(newCategory)
  } catch (error) {
    console.error('Error creating inventory category:', error)
    return createErrorResponse('Failed to create inventory category')
  }
}

export async function getAllInventoryCategories(): Promise<ApiResponse<InventoryCategory[]>> {
  try {
    let categories = await db
      .select()
      .from(inventoryCategories)
      .where(eq(inventoryCategories.isActive, true))
      .orderBy(asc(inventoryCategories.name))

    // If no categories exist, create default ones
    if (categories.length === 0) {
      const defaultCategories = [
        { name: 'Equipment', description: 'Church equipment and tools', color: '#3B82F6', icon: 'wrench' },
        { name: 'Literature', description: 'Books, Bibles, and printed materials', color: '#10B981', icon: 'book' },
        { name: 'Furniture', description: 'Chairs, tables, and furniture items', color: '#F59E0B', icon: 'chair' },
        { name: 'Electronics', description: 'Computers, projectors, and electronic devices', color: '#8B5CF6', icon: 'monitor' },
        { name: 'Tools', description: 'Maintenance and repair tools', color: '#EF4444', icon: 'hammer' },
        { name: 'Audio/Video', description: 'Sound systems and video equipment', color: '#06B6D4', icon: 'speaker' },
        { name: 'Kitchen', description: 'Kitchen appliances and utensils', color: '#84CC16', icon: 'utensils' },
        { name: 'Office', description: 'Office supplies and equipment', color: '#6366F1', icon: 'briefcase' }
      ]

      for (const category of defaultCategories) {
        await db
          .insert(inventoryCategories)
          .values({
            ...category,
            createdBy: '00000000-0000-0000-0000-000000000000' // Default system user
          })
      }

      // Fetch the newly created categories
      categories = await db
        .select()
        .from(inventoryCategories)
        .where(eq(inventoryCategories.isActive, true))
        .orderBy(asc(inventoryCategories.name))
    }

    return createSuccessResponse(categories)
  } catch (error) {
    console.error('Error fetching inventory categories:', error)
    return createErrorResponse('Failed to fetch inventory categories')
  }
}

export async function deleteInventoryCategory(categoryId: string): Promise<ApiResponse<InventoryCategory>> {
  try {
    // Check if category has items
    const [itemCount] = await db
      .select({ count: count() })
      .from(inventoryItems)
      .where(eq(inventoryItems.category, categoryId))

    if (itemCount.count > 0) {
      return createErrorResponse('Cannot delete category that contains items')
    }

    const [deletedCategory] = await db
      .update(inventoryCategories)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(inventoryCategories.id, categoryId))
      .returning()

    if (!deletedCategory) {
      return createErrorResponse('Category not found')
    }

    return createSuccessResponse(deletedCategory)
  } catch (error) {
    console.error('Error deleting inventory category:', error)
    return createErrorResponse('Failed to delete inventory category')
  }
}

// === BORROWING MANAGEMENT ===

export async function createBorrowingRecord(borrowingData: NewBorrowingRecord): Promise<ApiResponse<BorrowingRecord>> {
  try {
    // Check if item is available
    const [item] = await db
      .select()
      .from(inventoryItems)
      .where(eq(inventoryItems.id, borrowingData.itemId))
      .limit(1)

    if (!item) {
      return createErrorResponse('Inventory item not found')
    }

    if (!item.isAvailable) {
      return createErrorResponse('Item is not available for borrowing')
    }

    // Create borrowing record
    const [newBorrowing] = await db
      .insert(borrowingRecords)
      .values(borrowingData)
      .returning()

    // Update item availability
    await db
      .update(inventoryItems)
      .set({ isAvailable: false, updatedAt: new Date() })
      .where(eq(inventoryItems.id, borrowingData.itemId))

    return createSuccessResponse(newBorrowing)
  } catch (error) {
    console.error('Error creating borrowing record:', error)
    return createErrorResponse('Failed to create borrowing record')
  }
}

export async function getBorrowingRecord(recordId: string): Promise<ApiResponse<BorrowingRecord>> {
  try {
    const [record] = await db
      .select()
      .from(borrowingRecords)
      .where(eq(borrowingRecords.id, recordId))
      .limit(1)

    if (!record) {
      return createErrorResponse('Borrowing record not found')
    }

    return createSuccessResponse(record)
  } catch (error) {
    console.error('Error fetching borrowing record:', error)
    return createErrorResponse('Failed to fetch borrowing record')
  }
}

export async function getBorrowingRecordsByBorrower(borrowerId: string): Promise<ApiResponse<BorrowingRecord[]>> {
  try {
    const records = await db
      .select()
      .from(borrowingRecords)
      .where(eq(borrowingRecords.borrowerId, borrowerId))
      .orderBy(desc(borrowingRecords.borrowedAt))

    return createSuccessResponse(records)
  } catch (error) {
    console.error('Error fetching borrowing records by borrower:', error)
    return createErrorResponse('Failed to fetch borrowing records by borrower')
  }
}

export async function getActiveBorrowings(): Promise<ApiResponse<BorrowingRecord[]>> {
  try {
    const records = await db
      .select()
      .from(borrowingRecords)
      .where(eq(borrowingRecords.status, 'borrowed'))
      .orderBy(desc(borrowingRecords.borrowedAt))

    return createSuccessResponse(records)
  } catch (error) {
    console.error('Error fetching active borrowings:', error)
    return createErrorResponse('Failed to fetch active borrowings')
  }
}

export async function getOverdueBorrowings(): Promise<ApiResponse<BorrowingRecord[]>> {
  try {
    const records = await db
      .select()
      .from(borrowingRecords)
      .where(and(
        eq(borrowingRecords.status, 'borrowed'),
        lte(borrowingRecords.expectedReturnDate, new Date())
      ))
      .orderBy(asc(borrowingRecords.expectedReturnDate))

    return createSuccessResponse(records)
  } catch (error) {
    console.error('Error fetching overdue borrowings:', error)
    return createErrorResponse('Failed to fetch overdue borrowings')
  }
}

export async function returnBorrowedItem(recordId: string, returnData: {
  actualReturnDate: Date
  conditionWhenReturned: string
  notes?: string
}): Promise<ApiResponse<BorrowingRecord>> {
  try {
    // Update borrowing record
    const [updatedRecord] = await db
      .update(borrowingRecords)
      .set({
        status: 'returned',
        actualReturnDate: returnData.actualReturnDate,
        conditionWhenReturned: returnData.conditionWhenReturned,
        notes: returnData.notes,
        updatedAt: new Date()
      })
      .where(eq(borrowingRecords.id, recordId))
      .returning()

    if (!updatedRecord) {
      return createErrorResponse('Borrowing record not found')
    }

    // Update item availability
    await db
      .update(inventoryItems)
      .set({ 
        isAvailable: true, 
        condition: returnData.conditionWhenReturned,
        updatedAt: new Date() 
      })
      .where(eq(inventoryItems.id, updatedRecord.itemId))

    return createSuccessResponse(updatedRecord)
  } catch (error) {
    console.error('Error returning borrowed item:', error)
    return createErrorResponse('Failed to return borrowed item')
  }
}

// === INVENTORY MAINTENANCE ===

export async function createMaintenanceRecord(maintenanceData: NewInventoryMaintenance): Promise<ApiResponse<InventoryMaintenance>> {
  try {
    const [newMaintenance] = await db
      .insert(inventoryMaintenance)
      .values(maintenanceData)
      .returning()

    return createSuccessResponse(newMaintenance)
  } catch (error) {
    console.error('Error creating maintenance record:', error)
    return createErrorResponse('Failed to create maintenance record')
  }
}

export async function getMaintenanceRecordsByItem(itemId: string): Promise<ApiResponse<InventoryMaintenance[]>> {
  try {
    const records = await db
      .select()
      .from(inventoryMaintenance)
      .where(eq(inventoryMaintenance.itemId, itemId))
      .orderBy(desc(inventoryMaintenance.performedAt))

    return createSuccessResponse(records)
  } catch (error) {
    console.error('Error fetching maintenance records by item:', error)
    return createErrorResponse('Failed to fetch maintenance records by item')
  }
}

// === INVENTORY ANALYTICS ===

export async function getInventoryAnalytics(): Promise<ApiResponse<any>> {
  try {
    // Total items
    const [totalItemsResult] = await db
      .select({ count: count() })
      .from(inventoryItems)
      .where(eq(inventoryItems.isActive, true))

    // Available items
    const [availableItemsResult] = await db
      .select({ count: count() })
      .from(inventoryItems)
      .where(and(
        eq(inventoryItems.isActive, true),
        eq(inventoryItems.isAvailable, true)
      ))

    // Borrowed items
    const [borrowedItemsResult] = await db
      .select({ count: count() })
      .from(borrowingRecords)
      .where(eq(borrowingRecords.status, 'borrowed'))

    // Overdue items
    const [overdueItemsResult] = await db
      .select({ count: count() })
      .from(borrowingRecords)
      .where(and(
        eq(borrowingRecords.status, 'borrowed'),
        lte(borrowingRecords.expectedReturnDate, new Date())
      ))

    // Category breakdown
    const categoryBreakdown = await db
      .select({
        category: inventoryItems.category,
        count: count()
      })
      .from(inventoryItems)
      .where(eq(inventoryItems.isActive, true))
      .groupBy(inventoryItems.category)

    // Condition breakdown
    const conditionBreakdown = await db
      .select({
        condition: inventoryItems.condition,
        count: count()
      })
      .from(inventoryItems)
      .where(eq(inventoryItems.isActive, true))
      .groupBy(inventoryItems.condition)

    // Recent borrowings
    const recentBorrowings = await db
      .select({
        id: borrowingRecords.id,
        itemName: inventoryItems.itemName,
        borrowerName: sql<string>`CONCAT(${members.firstName}, ' ', ${members.lastName})`,
        borrowedAt: borrowingRecords.borrowedAt,
        expectedReturnDate: borrowingRecords.expectedReturnDate,
        status: borrowingRecords.status
      })
      .from(borrowingRecords)
      .innerJoin(inventoryItems, eq(borrowingRecords.itemId, inventoryItems.id))
      .innerJoin(members, eq(borrowingRecords.borrowerId, members.id))
      .orderBy(desc(borrowingRecords.borrowedAt))
      .limit(10)

    // Total value
    const [totalValueResult] = await db
      .select({ totalValue: sum(inventoryItems.purchasePrice) })
      .from(inventoryItems)
      .where(and(
        eq(inventoryItems.isActive, true),
        isNotNull(inventoryItems.purchasePrice)
      ))

    const analytics = {
      totalItems: totalItemsResult?.count || 0,
      availableItems: availableItemsResult?.count || 0,
      borrowedItems: borrowedItemsResult?.count || 0,
      overdueItems: overdueItemsResult?.count || 0,
      totalValue: totalValueResult?.totalValue ? Number(totalValueResult.totalValue) : 0,
      categoryBreakdown,
      conditionBreakdown,
      recentBorrowings
    }

    return createSuccessResponse(analytics)
  } catch (error) {
    console.error('Error fetching inventory analytics:', error)
    return createErrorResponse('Failed to fetch inventory analytics')
  }
}

// === SEARCH AND FILTER ===

export async function searchInventoryItems(query: string): Promise<ApiResponse<InventoryItem[]>> {
  try {
    const items = await db
      .select()
      .from(inventoryItems)
      .where(and(
        eq(inventoryItems.isActive, true),
        sql`(${inventoryItems.itemName} ILIKE ${`%${query}%`} OR ${inventoryItems.description} ILIKE ${`%${query}%`} OR ${inventoryItems.serialNumber} ILIKE ${`%${query}%`})`
      ))
      .orderBy(desc(inventoryItems.createdAt))

    return createSuccessResponse(items)
  } catch (error) {
    console.error('Error searching inventory items:', error)
    return createErrorResponse('Failed to search inventory items')
  }
}

export async function getInventoryItemsByLocation(location: string): Promise<ApiResponse<InventoryItem[]>> {
  try {
    const items = await db
      .select()
      .from(inventoryItems)
      .where(and(
        eq(inventoryItems.location, location),
        eq(inventoryItems.isActive, true)
      ))
      .orderBy(asc(inventoryItems.itemName))

    return createSuccessResponse(items)
  } catch (error) {
    console.error('Error fetching inventory items by location:', error)
    return createErrorResponse('Failed to fetch inventory items by location')
  }
}
