import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { churchIcons } from '@/lib/icons'
import { getMemberByClerkId } from '@/lib/api/members'
import { 
  getAllPaymentMethods,
  getAllGivingCategories,
  initiateMoMoPayment,
  getMemberTransactions,
  getGivingStatistics
} from '@/lib/api/giving'
import type { 
  PaymentMethod,
  GivingCategory,
  Transaction
} from '@/lib/db/schema'

interface GivingStats {
  totalAmount: number
  totalTransactions: number
  monthlyAverage: number
  topCategory: string
  topCategoryAmount: number
  recentTransactions: number
  pendingTransactions: number
  failedTransactions: number
}

export default function Giving() {
  const { user } = useUser()
  const [member, setMember] = useState<any>(null)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [givingCategories, setGivingCategories] = useState<GivingCategory[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState<GivingStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState('give')
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  // Payment form
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    categoryId: '',
    paymentMethodId: '',
    description: '',
    phoneNumber: '',
    network: 'MTN' as 'MTN' | 'Vodafone' | 'AirtelTigo'
  })

  useEffect(() => {
    if (user) {
      loadMemberData()
    }
  }, [user])

  const loadMemberData = async () => {
    try {
      setLoading(true)
      
      if (user?.id) {
        const memberResult = await getMemberByClerkId(user.id)
        if (memberResult.ok && memberResult.data) {
          setMember(memberResult.data)
          
          // Load member-specific data
          const [transactionsResult] = await Promise.all([
            getMemberTransactions(memberResult.data.id)
          ])

          if (transactionsResult.ok && transactionsResult.data) {
            setTransactions(transactionsResult.data)
          }
        }
      }

      // Load general data
      const [methodsResult, categoriesResult, statsResult] = await Promise.all([
        getAllPaymentMethods(),
        getAllGivingCategories(),
        getGivingStatistics()
      ])

      if (methodsResult.ok && methodsResult.data) {
        console.log('Payment methods loaded:', methodsResult.data)
        setPaymentMethods(methodsResult.data)
      }

      if (categoriesResult.ok && categoriesResult.data) {
        console.log('Giving categories loaded:', categoriesResult.data)
        setGivingCategories(categoriesResult.data)
      }

      if (statsResult.ok && statsResult.data) {
        setStats(statsResult.data)
      }
    } catch (error) {
      console.error('Error loading giving data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)

    try {
      if (!member) {
        throw new Error('Member not found')
      }

      const amount = parseInt(paymentForm.amount) * 100 // Convert GHS to pesewas
      
      if (paymentForm.paymentMethodId === '1') { // MoMo
        const result = await initiateMoMoPayment(
          member.id,
          paymentForm.phoneNumber,
          paymentForm.network,
          amount,
          paymentForm.categoryId,
          paymentForm.description
        )

        if (result.ok) {
          setShowPaymentModal(false)
          setPaymentForm({
            amount: '',
            categoryId: '',
            paymentMethodId: '',
            description: '',
            phoneNumber: '',
            network: 'MTN'
          })
          await loadMemberData() // Refresh data
          
          // Show success message
          alert('Payment initiated successfully! Please check your phone for the MoMo prompt.')
        } else {
          alert(`Payment failed: ${result.error}`)
        }
      } else {
        // Handle other payment methods
        alert('This payment method is not yet implemented.')
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      alert('Payment failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const formatAmount = (amount: number) => {
    return `₵${(amount / 100).toFixed(2)}` // Convert pesewas to GHS
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'failed': return 'bg-red-100 text-red-800 border-red-200'
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCategoryIcon = (categoryCode: string) => {
    switch (categoryCode) {
      case 'tithe': return churchIcons.percent
      case 'offering': return churchIcons.heart
      case 'building': return churchIcons.building
      case 'missions': return churchIcons.globe
      case 'special': return churchIcons.star
      default: return churchIcons.gift
    }
  }

  const getPaymentMethodIcon = (methodCode: string) => {
    switch (methodCode) {
      case 'momo': return churchIcons.smartphone
      case 'bank': return churchIcons.building
      case 'cash': return churchIcons.dollarSign
      default: return churchIcons.creditCard
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3">
            <churchIcons.spinner className="h-6 w-6 animate-spin text-blue-600" />
            <span>Loading giving information...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
          <churchIcons.gift className="h-8 w-8 text-green-600" />
          Give to the Church
        </h1>
        <p className="text-gray-600 mt-2">Support the ministry through your generous giving</p>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <churchIcons.dollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Given</p>
                  <p className="text-2xl font-bold text-gray-900">{formatAmount(stats.totalAmount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <churchIcons.repeat className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Average</p>
                  <p className="text-2xl font-bold text-gray-900">{formatAmount(stats.monthlyAverage)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <churchIcons.barChart className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <churchIcons.trendingUp className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Top Category</p>
                  <p className="text-lg font-bold text-gray-900">{stats.topCategory}</p>
                  <p className="text-sm text-gray-600">{formatAmount(stats.topCategoryAmount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="give" className="flex items-center gap-2">
            <churchIcons.gift className="h-4 w-4" />
            Give Now
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <churchIcons.history className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="recurring" className="flex items-center gap-2">
            <churchIcons.repeat className="h-4 w-4" />
            Recurring
          </TabsTrigger>
        </TabsList>

        <TabsContent value="give" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Make a Donation</CardTitle>
              <CardDescription>
                Choose your payment method and give to support the ministry
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePayment} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (GHS)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoryId">Giving Category</Label>
                    <div className="text-xs text-gray-500 mb-2">
                      Available: {givingCategories.length} | Selected: {paymentForm.categoryId || 'none'}
                    </div>
                    <Select value={paymentForm.categoryId} onValueChange={(value) => setPaymentForm(prev => ({ ...prev, categoryId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {givingCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center gap-2">
                              {React.createElement(getCategoryIcon(category.code), { className: "h-4 w-4" })}
                              {category.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethodId">Payment Method</Label>
                    <div className="text-xs text-gray-500 mb-2">
                      Available: {paymentMethods.length} | Selected: {paymentForm.paymentMethodId || 'none'}
                    </div>
                    <Select value={paymentForm.paymentMethodId} onValueChange={(value) => setPaymentForm(prev => ({ ...prev, paymentMethodId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method.id} value={method.id}>
                            <div className="flex items-center gap-2">
                              {React.createElement(getPaymentMethodIcon(method.code), { className: "h-4 w-4" })}
                              {method.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      value={paymentForm.description}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="e.g., Sunday offering, Special project"
                    />
                  </div>
                </div>

                {/* MoMo specific fields */}
                {paymentForm.paymentMethodId === '1' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">MoMo Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        value={paymentForm.phoneNumber}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        placeholder="233244123456"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="network">Network</Label>
                      <Select value={paymentForm.network} onValueChange={(value: any) => setPaymentForm(prev => ({ ...prev, network: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MTN">MTN Mobile Money</SelectItem>
                          <SelectItem value="Vodafone">Vodafone Cash</SelectItem>
                          <SelectItem value="AirtelTigo">AirtelTigo Money</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button type="submit" disabled={processing} className="bg-green-600 hover:bg-green-700">
                    {processing ? (
                      <>
                        <churchIcons.spinner className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <churchIcons.gift className="h-4 w-4 mr-2" />
                        Give Now
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Quick Give Options */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Give</CardTitle>
              <CardDescription>
                Common giving amounts and categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { amount: '10', label: 'Offering' },
                  { amount: '50', label: 'Tithe' },
                  { amount: '100', label: 'Building' },
                  { amount: '200', label: 'Missions' }
                ].map((option) => (
                  <Button
                    key={option.amount}
                    variant="outline"
                    onClick={() => setPaymentForm(prev => ({ ...prev, amount: option.amount }))}
                    className="h-20 flex flex-col gap-1"
                  >
                    <span className="text-lg font-bold">₵{option.amount}</span>
                    <span className="text-xs">{option.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Giving History</CardTitle>
              <CardDescription>
                Your previous donations and contributions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((transaction) => {
                  const category = givingCategories.find(cat => cat.id === transaction.categoryId)
                  const paymentMethod = paymentMethods.find(method => method.id === transaction.paymentMethodId)
                  
                  return (
                    <div key={transaction.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {React.createElement(getCategoryIcon(category?.code || 'general'), {
                            className: "h-5 w-5 text-gray-600"
                          })}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{transaction.description || 'Donation'}</h4>
                            <Badge className={getStatusColor(transaction.status)}>
                              {transaction.status}
                            </Badge>
                            {category && (
                              <Badge variant="outline" className="capitalize">
                                {category.name}
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-700 mb-3">
                            Amount: <span className="font-semibold">{formatAmount(transaction.amount)}</span>
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            {paymentMethod && (
                              <span className="flex items-center gap-1">
                                {React.createElement(getPaymentMethodIcon(paymentMethod.code), { className: "h-4 w-4" })}
                                {paymentMethod.name}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <churchIcons.calendar className="h-4 w-4" />
                              {transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString() : 'Unknown date'}
                            </span>
                            {transaction.momoPhoneNumber && (
                              <span className="flex items-center gap-1">
                                <churchIcons.phone className="h-4 w-4" />
                                {transaction.momoPhoneNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {transactions.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <churchIcons.gift className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">No giving history yet</h3>
                    <p className="mb-4">Start supporting the ministry with your first donation</p>
                    <Button onClick={() => setActiveTab('give')}>
                      <churchIcons.gift className="h-4 w-4 mr-2" />
                      Give Now
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recurring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recurring Giving</CardTitle>
              <CardDescription>
                Set up automatic recurring donations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <churchIcons.repeat className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Recurring Giving Coming Soon</h3>
                <p className="mb-4">Set up automatic monthly or weekly donations</p>
                <Button variant="outline" disabled>
                  <churchIcons.clock className="h-4 w-4 mr-2" />
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Processing Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Processing Payment</DialogTitle>
            <DialogDescription>
              Please wait while we process your payment...
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <churchIcons.spinner className="h-8 w-8 animate-spin text-green-600" />
              <span className="text-lg">Processing payment...</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
