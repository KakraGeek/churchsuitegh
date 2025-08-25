import { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { churchIcons } from '@/lib/icons'
import { getUserRole } from '@/lib/clerk'
import { 
  getAllInventoryItems, 
  getAllInventoryCategories,
  getActiveBorrowings,
  getOverdueBorrowings,
  getInventoryAnalytics,
  searchInventoryItems,
  createInventoryCategory,
  deleteInventoryCategory,
  createBorrowingRecord
} from '@/lib/api/inventory'
import { getAllMembers } from '@/lib/api/members'
import type { 
  InventoryItem,
  InventoryCategory,
  BorrowingRecord
} from '@/lib/db/schema'

interface InventoryData {
  items: InventoryItem[]
  categories: InventoryCategory[]
  activeBorrowings: BorrowingRecord[]
  overdueBorrowings: BorrowingRecord[]
  analytics?: any
  members?: any[]
}

export default function Inventory() {
  const { user, isLoaded } = useUser()
  const userRole = getUserRole(user?.publicMetadata || {})
  const canManageInventory = userRole === 'admin' || userRole === 'pastor' || userRole === 'leader'

  const [inventoryData, setInventoryData] = useState<InventoryData>({
    items: [],
    categories: [],
    activeBorrowings: [],
    overdueBorrowings: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Form states
  const [showAddItem, setShowAddItem] = useState(false)
  const [showBorrowItem, setShowBorrowItem] = useState(false)
  const [showReturnItem, setShowReturnItem] = useState(false)

  // Manage Categories states
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [newCategory, setNewCategory] = useState({
    name: '',
    color: '#8B5CF6', // Default color
    description: ''
  })

  // Borrowing states
  const [newBorrowing, setNewBorrowing] = useState({
    itemId: '',
    borrowerId: '',
    borrowedAt: new Date(),
    expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    conditionWhenBorrowed: 'good',
    notes: '',
    groupId: null as string | null,
    status: 'borrowed'
  })

  // Load inventory data
  const loadInventoryData = async () => {
    try {
      setLoading(true)
      
      const [itemsResult, categoriesResult, activeBorrowingsResult, overdueBorrowingsResult, analyticsResult, membersResult] = await Promise.all([
        getAllInventoryItems(),
        getAllInventoryCategories(),
        getActiveBorrowings(),
        getOverdueBorrowings(),
        getInventoryAnalytics(),
        getAllMembers()
      ])

      if (!itemsResult.ok) {
        throw new Error('Failed to load inventory items')
      }

      setInventoryData({
        items: itemsResult.data || [],
        categories: categoriesResult.ok ? categoriesResult.data || [] : [],
        activeBorrowings: activeBorrowingsResult.ok ? activeBorrowingsResult.data || [] : [],
        overdueBorrowings: overdueBorrowingsResult.ok ? overdueBorrowingsResult.data || [] : [],
        analytics: analyticsResult.ok ? analyticsResult.data : {
          totalItems: 0,
          availableItems: 0,
          borrowedItems: 0,
          overdueItems: 0,
          totalValue: 0,
          categoryBreakdown: [],
          conditionBreakdown: [],
          recentBorrowings: []
        },
        members: membersResult.ok ? membersResult.data || [] : []
      })

    } catch (err) {
      console.error('Error loading inventory data:', err)
      setError('Failed to load inventory data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isLoaded) {
      return
    }
    
    if (canManageInventory) {
      loadInventoryData()
    } else {
      setLoading(false)
      setError('You do not have permission to view inventory management')
    }
  }, [isLoaded, canManageInventory])

  // Search functionality
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadInventoryData()
      return
    }

    try {
      setLoading(true)
      const searchResult = await searchInventoryItems(searchQuery)
      if (searchResult.ok) {
        setInventoryData(prev => ({ ...prev, items: searchResult.data || [] }))
      }
    } catch (err) {
      console.error('Error searching inventory:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filter by category
  const filteredItems = selectedCategory === 'all' 
    ? inventoryData.items 
    : inventoryData.items.filter(item => {
        const category = inventoryData.categories.find(cat => cat.id === selectedCategory)
        return category ? item.category === category.name : false
      })

  // Handle category creation
  const handleCreateCategory = async () => {
    try {
      setLoading(true)
      setError(null) // Clear any previous errors
      
      const createResult = await createInventoryCategory({
        name: newCategory.name,
        color: newCategory.color,
        description: newCategory.description,
        createdBy: user?.id || '00000000-0000-0000-0000-000000000000'
      })
      
      if (createResult.ok) {
        // Reload the data to get the updated categories
        await loadInventoryData()
        setNewCategory({ name: '', color: '#8B5CF6', description: '' })
        setShowAddCategory(false)
        // Show success message
        alert('Category created successfully!')
      } else {
        setError(createResult.error || 'Failed to create category')
      }
    } catch (err) {
      console.error('Error creating category:', err)
      setError('Failed to create category')
    } finally {
      setLoading(false)
    }
  }

  // Handle category deletion
  const handleDeleteCategory = async (categoryId: string) => {
    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return
    }
    
    try {
      setLoading(true)
      setError(null) // Clear any previous errors
      
      const deleteResult = await deleteInventoryCategory(categoryId)
      if (deleteResult.ok) {
        await loadInventoryData()
        alert('Category deleted successfully!')
      } else {
        setError(deleteResult.error || 'Failed to delete category')
      }
    } catch (err) {
      console.error('Error deleting category:', err)
      setError('Failed to delete category')
    } finally {
      setLoading(false)
    }
  }

  // Handle borrowing creation
  const handleCreateBorrowing = async () => {
    try {
      setLoading(true)
      setError(null)

      const createResult = await createBorrowingRecord({
        itemId: newBorrowing.itemId,
        borrowerId: newBorrowing.borrowerId,
        groupId: newBorrowing.groupId,
        expectedReturnDate: newBorrowing.expectedReturnDate,
        conditionWhenBorrowed: newBorrowing.conditionWhenBorrowed,
        notes: newBorrowing.notes,
        createdBy: user?.id || '00000000-0000-0000-0000-000000000000'
      })
      
      if (createResult.ok) {
        // Reload the data to get the updated borrowings
        await loadInventoryData()
        setNewBorrowing({
          itemId: '',
          borrowerId: '',
          borrowedAt: new Date(),
          expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          conditionWhenBorrowed: 'good',
          notes: '',
          groupId: null,
          status: 'borrowed'
        })
        alert('Borrowing record created successfully!')
      } else {
        setError(createResult.error || 'Failed to create borrowing record')
      }
    } catch (err) {
      console.error('Error creating borrowing record:', err)
      setError('Failed to create borrowing record')
    } finally {
      setLoading(false)
    }
  }

  // Handle item return
  const handleReturnItem = async (borrowingId: string) => {
    if (!window.confirm('Are you sure you want to return this item? This action cannot be undone.')) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      // TODO: Implement actual API call to return item
      // For now, we'll just show a success message
      alert('Item returned successfully!')
      await loadInventoryData() // Reload data to update availability
    } catch (err) {
      console.error('Error returning item:', err)
      setError('Failed to return item')
    } finally {
      setLoading(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="text-center text-gray-500">Loading user data...</div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 px-4">
        <Card>
          <CardContent className="p-6 text-center">
            <churchIcons.alertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-red-700 mb-2">Access Denied</h2>
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">
            Track church property, equipment, and manage borrowing system
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
            <DialogTrigger asChild>
              <Button>
                <churchIcons.item className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Inventory Item</DialogTitle>
                <DialogDescription>
                  Register a new piece of equipment, literature, or other church property.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="itemName">Item Name</Label>
                  <Input id="itemName" placeholder="e.g., Projector, Bible, Sound System" />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {inventoryData.categories.map(category => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Detailed description of the item" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="serialNumber">Serial Number</Label>
                    <Input id="serialNumber" placeholder="Serial number if applicable" />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" placeholder="Storage location" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="condition">Condition</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="purchasePrice">Purchase Price</Label>
                    <Input id="purchasePrice" type="number" placeholder="0.00" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddItem(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    // TODO: Implement add item functionality
                    setShowAddItem(false)
                  }}>
                    Add Item
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <churchIcons.category className="mr-2 h-4 w-4" />
                Manage Categories
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Manage Inventory Categories</DialogTitle>
                <DialogDescription>
                  Create, edit, and manage inventory categories for better organization.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {/* Create New Category Form */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Create New Category</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="categoryName">Category Name</Label>
                      <Input 
                        id="categoryName" 
                        placeholder="e.g., Kitchen Appliances"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="categoryColor">Color</Label>
                      <Input 
                        id="categoryColor" 
                        type="color"
                        value={newCategory.color}
                        onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                        className="h-10 w-full"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="categoryDescription">Description</Label>
                    <Textarea 
                      id="categoryDescription" 
                      placeholder="Brief description of this category"
                      value={newCategory.description}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleCreateCategory}
                      disabled={!newCategory.name.trim()}
                    >
                      <churchIcons.category className="mr-2 h-4 w-4" />
                      Create Category
                    </Button>
                  </div>
                </div>

                {/* Existing Categories List */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Existing Categories</h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {inventoryData.categories.map((category) => (
                      <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: category.color || '#8B5CF6' }}
                          />
                          <div>
                            <p className="font-medium">{category.name}</p>
                            {category.description && (
                              <p className="text-sm text-gray-600">{category.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {inventoryData.items.filter(item => item.category === category.name).length} items
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <churchIcons.trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Input
              placeholder="Search items by name, description, or serial number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button
              size="sm"
              className="absolute right-1 top-1"
              onClick={handleSearch}
            >
              Search
            </Button>
          </div>
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {inventoryData.categories.map(category => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <churchIcons.inventory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryData.analytics.totalItems || 0}</div>
            <p className="text-xs text-muted-foreground">
              {inventoryData.analytics.availableItems || 0} available
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Borrowed Items</CardTitle>
            <churchIcons.borrow className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryData.analytics.borrowedItems || 0}</div>
            <p className="text-xs text-muted-foreground">
              {inventoryData.analytics.overdueItems || 0} overdue
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <churchIcons.value className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              GHS {(() => {
                const value = inventoryData.analytics.totalValue;
                if (typeof value === 'number') {
                  return value.toFixed(2);
                }
                return '0.00';
              })()}
            </div>
            <p className="text-xs text-muted-foreground">
              Church assets value
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <churchIcons.category className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryData.categories.length}</div>
            <p className="text-xs text-muted-foreground">
              Item categories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="items">Inventory Items</TabsTrigger>
          <TabsTrigger value="borrowing">Borrowing</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Recent Borrowings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <churchIcons.borrow className="h-5 w-5" />
                  Recent Borrowings
                </CardTitle>
                <CardDescription>
                  Latest items borrowed from the inventory
                </CardDescription>
              </CardHeader>
              <CardContent>
                {inventoryData.analytics?.recentBorrowings?.length > 0 ? (
                  <div className="space-y-3">
                    {inventoryData.analytics.recentBorrowings.slice(0, 5).map((borrowing: any) => (
                      <div key={borrowing.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{borrowing.itemName}</p>
                          <p className="text-sm text-gray-600">{borrowing.borrowerName}</p>
                        </div>
                        <Badge variant={borrowing.status === 'overdue' ? 'destructive' : 'secondary'}>
                          {borrowing.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No recent borrowings</p>
                )}
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <churchIcons.category className="h-5 w-5" />
                  Items by Category
                </CardTitle>
                <CardDescription>
                  Distribution of items across categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                {inventoryData.analytics?.categoryBreakdown?.length > 0 ? (
                  <div className="space-y-3">
                    {inventoryData.analytics.categoryBreakdown.map((category: any) => (
                      <div key={category.category} className="flex items-center justify-between">
                        <span className="capitalize">{category.category}</span>
                        <Badge variant="outline">{category.count}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No category data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Inventory Items Tab */}
        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Items</CardTitle>
              <CardDescription>
                All registered church property and equipment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredItems.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredItems.map((item) => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{item.itemName}</CardTitle>
                            <CardDescription className="capitalize">{item.category}</CardDescription>
                          </div>
                          <Badge variant={item.isAvailable ? 'default' : 'secondary'}>
                            {item.isAvailable ? 'Available' : 'Borrowed'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2 text-sm">
                          {item.description && (
                            <p className="text-gray-600">{item.description}</p>
                          )}
                          {item.location && (
                            <div className="flex items-center gap-2">
                              <churchIcons.location className="h-4 w-4 text-gray-500" />
                              <span>{item.location}</span>
                            </div>
                          )}
                          {item.condition && (
                            <div className="flex items-center gap-2">
                              <churchIcons.condition className="h-4 w-4 text-gray-500" />
                              <span className="capitalize">{item.condition}</span>
                            </div>
                          )}
                          {item.purchasePrice && (
                            <div className="flex items-center gap-2">
                              <churchIcons.value className="h-4 w-4 text-gray-500" />
                              <span>GHS {item.purchasePrice}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" variant="outline" className="flex-1">
                            <churchIcons.borrow className="mr-2 h-4 w-4" />
                            Borrow
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <churchIcons.maintenance className="mr-2 h-4 w-4" />
                            Maintain
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <churchIcons.inventory className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery ? 'No items match your search criteria.' : 'Get started by adding your first inventory item.'}
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => setShowAddItem(true)}>
                      <churchIcons.item className="mr-2 h-4 w-4" />
                      Add First Item
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Borrowing Tab */}
        <TabsContent value="borrowing" className="space-y-4">
          {/* Create New Borrowing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <churchIcons.borrow className="h-5 w-5" />
                Create New Borrowing
              </CardTitle>
              <CardDescription>
                Record when someone borrows an item from the inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              {inventoryData.items.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No inventory items available to borrow.</p>
                  <Button onClick={() => setShowAddItem(true)}>
                    <churchIcons.item className="mr-2 h-4 w-4" />
                    Add First Item
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="borrowItem">Select Item</Label>
                      <Select value={newBorrowing.itemId} onValueChange={(value) => setNewBorrowing(prev => ({ ...prev, itemId: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose an item to borrow" />
                        </SelectTrigger>
                        <SelectContent>
                          {inventoryData.items
                            .filter(item => item.isAvailable)
                            .map(item => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.itemName} - {item.category}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="borrower">Borrower</Label>
                      <Select value={newBorrowing.borrowerId} onValueChange={(value) => setNewBorrowing(prev => ({ ...prev, borrowerId: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select borrower" />
                        </SelectTrigger>
                        <SelectContent>
                          {inventoryData.members?.map(member => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.firstName} {member.lastName}
                            </SelectItem>
                          )) || (
                            <>
                              <SelectItem value="member-1">John Doe</SelectItem>
                              <SelectItem value="member-2">Jane Smith</SelectItem>
                              <SelectItem value="member-3">Bob Johnson</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="borrowDate">Borrow Date</Label>
                      <Input 
                        id="borrowDate" 
                        type="date" 
                        value={newBorrowing.borrowedAt ? newBorrowing.borrowedAt.toISOString().split('T')[0] : ''}
                        onChange={(e) => setNewBorrowing(prev => ({ 
                          ...prev, 
                          borrowedAt: e.target.value ? new Date(e.target.value) : new Date() 
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="returnDate">Expected Return Date</Label>
                      <Input 
                        id="returnDate" 
                        type="date" 
                        value={newBorrowing.expectedReturnDate ? newBorrowing.expectedReturnDate.toISOString().split('T')[0] : ''}
                        onChange={(e) => setNewBorrowing(prev => ({ 
                          ...prev, 
                          expectedReturnDate: e.target.value ? new Date(e.target.value) : new Date() 
                        }))}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="borrowGroup">Ministry Team/Group</Label>
                      <Select value={newBorrowing.groupId || 'none'} onValueChange={(value) => setNewBorrowing(prev => ({ ...prev, groupId: value === 'none' ? null : value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select group (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Group</SelectItem>
                          {/* TODO: Replace with actual ministry teams data */}
                          <SelectItem value="team-1">Worship Team</SelectItem>
                          <SelectItem value="team-2">Children's Ministry</SelectItem>
                          <SelectItem value="team-3">Youth Group</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="borrowCondition">Item Condition When Borrowed</Label>
                      <Select value={newBorrowing.conditionWhenBorrowed} onValueChange={(value) => setNewBorrowing(prev => ({ ...prev, conditionWhenBorrowed: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                          <SelectItem value="poor">Poor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="borrowNotes">Notes</Label>
                    <Textarea 
                      id="borrowNotes" 
                      placeholder="Any additional notes about this borrowing..."
                      value={newBorrowing.notes || ''}
                      onChange={(e) => setNewBorrowing(prev => ({ ...prev, notes: e.target.value }))}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setNewBorrowing({
                        itemId: '',
                        borrowerId: '',
                        borrowedAt: new Date(),
                        expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                        conditionWhenBorrowed: 'good',
                        notes: '',
                        groupId: null,
                        status: 'borrowed'
                      })}
                    >
                      Reset Form
                    </Button>
                    <Button 
                      onClick={handleCreateBorrowing}
                      disabled={!newBorrowing.itemId || !newBorrowing.borrowerId || !newBorrowing.expectedReturnDate}
                    >
                      <churchIcons.borrow className="mr-2 h-4 w-4" />
                      Create Borrowing Record
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Active Borrowings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <churchIcons.borrow className="h-5 w-5" />
                  Active Borrowings
                </CardTitle>
                <CardDescription>
                  Items currently borrowed from the inventory
                </CardDescription>
              </CardHeader>
              <CardContent>
                {inventoryData.activeBorrowings.length > 0 ? (
                  <div className="space-y-3">
                    {inventoryData.activeBorrowings.map((borrowing) => (
                      <div key={borrowing.id} className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Item ID: {borrowing.itemId}</span>
                          <Badge variant="secondary">Active</Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Expected return: {new Date(borrowing.expectedReturnDate).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleReturnItem(borrowing.id)}
                          >
                            <churchIcons.return className="mr-2 h-3 w-3" />
                            Return Item
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No active borrowings</p>
                )}
              </CardContent>
            </Card>

            {/* Overdue Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <churchIcons.overdue className="h-5 w-5" />
                  Overdue Items
                </CardTitle>
                <CardDescription>
                  Items that are past their expected return date
                </CardDescription>
              </CardHeader>
              <CardContent>
                {inventoryData.overdueBorrowings.length > 0 ? (
                  <div className="space-y-3">
                    {inventoryData.overdueBorrowings.map((borrowing) => (
                      <div key={borrowing.id} className="p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Item ID: {borrowing.itemId}</span>
                          <Badge variant="destructive">Overdue</Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Due: {new Date(borrowing.expectedReturnDate).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleReturnItem(borrowing.id)}
                          >
                            <churchIcons.return className="mr-2 h-3 w-3" />
                            Return Item
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No overdue items</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <churchIcons.maintenance className="h-5 w-5" />
                Maintenance Records
              </CardTitle>
              <CardDescription>
                Track maintenance, repairs, and inspections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <churchIcons.maintenance className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No maintenance records</h3>
                <p className="text-gray-500 mb-4">
                  Maintenance records will appear here when you start tracking repairs and inspections.
                </p>
                <Button variant="outline">
                  <churchIcons.maintenance className="mr-2 h-4 w-4" />
                  Add Maintenance Record
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
