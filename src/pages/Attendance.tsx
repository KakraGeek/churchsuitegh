import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { churchIcons } from '@/lib/icons'
import { 
  getAttendanceStats, 
  getAttendanceByDate,
  getActiveQRCodes,
  generateQRCode,
  deactivateQRCode,
  toggleQRDisplay
} from '@/lib/api/attendance'
import { getAllEvents } from '@/lib/api/events'
import { getUserRole } from '@/lib/clerk'
import type { 
  Attendance, 
  AttendanceQRCode, 
  ChurchEvent,
  Member,
  NewAttendanceQRCode 
} from '@/lib/db/schema'

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

export default function Attendance() {
  const { user } = useUser()
  const [stats, setStats] = useState<AttendanceStats | null>(null)
  const [attendanceRecords, setAttendanceRecords] = useState<(Attendance & { member?: Member; event?: ChurchEvent })[]>([])
  const [qrCodes, setQRCodes] = useState<(AttendanceQRCode & { event?: ChurchEvent })[]>([])
  const [events, setEvents] = useState<ChurchEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // UI State
  const [dateRange, setDateRange] = useState('week') // week, month, all
  const [serviceTypeFilter, setServiceTypeFilter] = useState('all')
  const [showQRForm, setShowQRForm] = useState(false)
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  // User permissions
  const userRole = getUserRole(user?.publicMetadata || {})
  const canManageAttendance = userRole === 'admin' || userRole === 'pastor' || userRole === 'leader'

  // QR Code Form Data
  const [qrFormData, setQRFormData] = useState({
    serviceType: 'sunday-service',
    eventId: 'none',
    serviceDate: '',
    location: '',
    expiresAt: '',
    maxUses: '',
  })

  console.log('Attendance Debug:', {
    user: user?.id,
    publicMetadata: user?.publicMetadata,
    userRole,
    canManageAttendance
  })

  // Load data functions
  const loadStats = useCallback(async () => {
    try {
      const result = await getAttendanceStats()
      if (result.ok && result.data) {
        setStats(result.data)
      }
    } catch (err) {
      console.error('Error loading attendance stats:', err)
    }
  }, [])

  const loadAttendanceRecords = useCallback(async () => {
    try {
      const now = new Date()
      let startDate: Date
      
      switch (dateRange) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        default:
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) // Last year
      }

      const result = await getAttendanceByDate(
        startDate, 
        now, 
        serviceTypeFilter === 'all' ? undefined : serviceTypeFilter
      )
      
      if (result.ok && result.data) {
        setAttendanceRecords(result.data)
      }
    } catch (err) {
      console.error('Error loading attendance records:', err)
    }
  }, [dateRange, serviceTypeFilter])

  const loadQRCodes = useCallback(async () => {
    try {
      const result = await getActiveQRCodes()
      if (result.ok && result.data) {
        setQRCodes(result.data)
      }
    } catch (err) {
      console.error('Error loading QR codes:', err)
    }
  }, [])

  const loadEvents = useCallback(async () => {
    try {
      const result = await getAllEvents()
      if (result.ok && result.data) {
        setEvents(result.data)
      }
    } catch (err) {
      console.error('Error loading events:', err)
    }
  }, [])

  // Load data on component mount
  useEffect(() => {
    const loadAllData = async () => {
      try {
        await Promise.all([
          loadStats(),
          loadAttendanceRecords(),
          loadQRCodes(),
          loadEvents()
        ])
      } catch (err) {
        console.error('Error loading attendance data:', err)
        setError('Failed to load attendance data')
      } finally {
        setLoading(false)
      }
    }

    loadAllData()
  }, [loadStats, loadAttendanceRecords, loadQRCodes, loadEvents])

  // Reload attendance records when filters change
  useEffect(() => {
    if (!loading) {
      loadAttendanceRecords()
      setCurrentPage(1) // Reset to first page when filters change
    }
  }, [loadAttendanceRecords, loading])

  // Handle QR code generation
  const handleGenerateQR = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!qrFormData.serviceDate) {
      alert('Please select a service date')
      return
    }
    
    try {
      
      const qrData: NewAttendanceQRCode = {
        qrCodeId: `QR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        serviceType: qrFormData.serviceType as "sunday-service" | "midweek-service" | "bible-study" | "prayer-meeting" | "special-event" | "outreach" | "fellowship" | "conference",
        eventId: qrFormData.eventId && qrFormData.eventId !== 'none' ? qrFormData.eventId : undefined,
        serviceDate: new Date(qrFormData.serviceDate),
        location: qrFormData.location || undefined,
        expiresAt: qrFormData.expiresAt ? new Date(qrFormData.expiresAt) : undefined,
        maxUses: qrFormData.maxUses ? parseInt(qrFormData.maxUses) : undefined,
        displayOnScreens: false, // Start with display off by default
        displayLocation: undefined,
        lastDisplayed: undefined,
        createdBy: undefined, // Skip createdBy for now since Clerk IDs aren't UUIDs
      }

      const result = await generateQRCode(qrData)
      
      if (result.ok) {
        alert('QR Code generated successfully!')
        setShowQRForm(false)
        setQRFormData({
          serviceType: 'sunday-service',
          eventId: 'none',
          serviceDate: '',
          location: '',
          expiresAt: '',
          maxUses: '',
        })
        loadQRCodes() // Refresh QR codes list
      } else {
        alert(result.error || 'Failed to generate QR code')
      }
    } catch (err) {
      console.error('Error generating QR code:', err)
      alert(`An unexpected error occurred: ${err}`)
    }
  }

  const handleDeactivateQR = async (qrCodeId: string) => {
    if (!confirm('Are you sure you want to deactivate this QR code?')) {
      return
    }

    try {
      const result = await deactivateQRCode(qrCodeId)
      if (result.ok) {
        loadQRCodes() // Refresh QR codes list
      } else {
        alert(result.error || 'Failed to deactivate QR code')
      }
    } catch (err) {
      console.error('Error deactivating QR code:', err)
      alert('An unexpected error occurred')
    }
  }

  const handleToggleDisplay = async (qrCodeId: string, currentlyDisplayed: boolean) => {
    try {
      const result = await toggleQRDisplay(qrCodeId, !currentlyDisplayed, 'Main Entrance')
      if (result.ok) {
        loadQRCodes() // Refresh QR codes list
      } else {
        alert(result.error || 'Failed to update display status')
      }
    } catch (err) {
      console.error('Error toggling QR display:', err)
      alert('An unexpected error occurred')
    }
  }

  const formatServiceType = (serviceType: string) => {
    return serviceType.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  // Pagination calculations
  const totalRecords = attendanceRecords.length
  const totalPages = Math.ceil(totalRecords / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentRecords = attendanceRecords.slice(startIndex, endIndex)
  
  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }
  
  const goToPreviousPage = () => {
    goToPage(currentPage - 1)
  }
  
  const goToNextPage = () => {
    goToPage(currentPage + 1)
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

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance Tracking</h1>
          <p className="text-muted-foreground">
            Monitor church attendance and generate QR codes for check-ins
          </p>
        </div>
        {canManageAttendance && (
          <Button 
            onClick={() => setShowQRForm(true)}
            className="bg-church-burgundy-600 hover:bg-church-burgundy-700"
          >
            <churchIcons.add className="mr-2 h-4 w-4" />
            Generate QR Code
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats ? (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Attendance</CardTitle>
                <churchIcons.attendance className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalAttendance}</div>
                <p className="text-xs text-muted-foreground">
                  All recorded check-ins
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Week</CardTitle>
                <churchIcons.trending className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.thisWeekAttendance}</div>
                <p className="text-xs text-muted-foreground">
                  Check-ins this week
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Weekly Average</CardTitle>
                <churchIcons.chart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageAttendance}</div>
                <p className="text-xs text-muted-foreground">
                  Average per week
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Most Popular</CardTitle>
                <churchIcons.calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Object.entries(stats.attendanceByService || {}).length > 0 
                    ? formatServiceType(Object.entries(stats.attendanceByService).reduce((a, b) => a[1] > b[1] ? a : b)[0])
                    : 'N/A'
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Most attended service
                </p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Loading Skeleton */}
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="animate-pulse rounded-md bg-muted h-4 w-24" />
                  <div className="animate-pulse rounded-md bg-muted h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="animate-pulse rounded-md bg-muted h-8 w-16 mb-2" />
                  <div className="animate-pulse rounded-md bg-muted h-3 w-20" />
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="records" className="space-y-4">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 gap-1">
          <TabsTrigger value="records" className="text-xs sm:text-sm px-2 sm:px-3 py-2">Attendance Records</TabsTrigger>
          {canManageAttendance && <TabsTrigger value="qrcodes" className="text-xs sm:text-sm px-2 sm:px-3 py-2">QR Codes</TabsTrigger>}
        </TabsList>

        <TabsContent value="records" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filter Records</CardTitle>
              <CardDescription>View attendance by date range and service type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex-1">
                  <Select value={serviceTypeFilter} onValueChange={setServiceTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Services</SelectItem>
                      <SelectItem value="sunday-service">Sunday Service</SelectItem>
                      <SelectItem value="midweek-service">Midweek Service</SelectItem>
                      <SelectItem value="bible-study">Bible Study</SelectItem>
                      <SelectItem value="prayer-meeting">Prayer Meeting</SelectItem>
                      <SelectItem value="special-event">Special Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Records */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Attendance</CardTitle>
              <CardDescription>
                {totalRecords > 0 
                  ? `Showing ${startIndex + 1}-${Math.min(endIndex, totalRecords)} of ${totalRecords} records`
                  : 'No records found'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {totalRecords > 0 ? (
                <div className="space-y-4">
                  {/* Attendance Records List */}
                  <div className="space-y-3">
                    {currentRecords.map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {record.member?.firstName} {record.member?.lastName}
                            </span>
                            <Badge variant="outline">
                              {formatServiceType(record.serviceType)}
                            </Badge>
                            {record.checkInMethod === 'qr-code' && (
                              <Badge variant="secondary">QR Check-in</Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(record.serviceDate).toLocaleDateString()} at {' '}
                            {new Date(record.checkInTime).toLocaleTimeString()}
                            {record.location && ` • ${record.location}`}
                          </div>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          {record.event?.title || 'Regular Service'}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToPreviousPage}
                          disabled={currentPage <= 1}
                        >
                          <churchIcons.chevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </Button>
                        
                        {/* Page Number Buttons */}
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum: number;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }
                            
                            return (
                              <Button
                                key={pageNum}
                                variant={pageNum === currentPage ? "default" : "outline"}
                                size="sm"
                                className="w-8 h-8 p-0"
                                onClick={() => goToPage(pageNum)}
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToNextPage}
                          disabled={currentPage >= totalPages}
                        >
                          Next
                          <churchIcons.chevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <churchIcons.attendance className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium">No attendance records found</h3>
                  <p className="text-sm">
                    No attendance records match your current filters.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {canManageAttendance && (
          <TabsContent value="qrcodes" className="space-y-4">
            {/* Active QR Codes */}
            <Card>
              <CardHeader>
                <CardTitle>Active QR Codes</CardTitle>
                <CardDescription>
                  Manage QR codes for attendance check-ins
                </CardDescription>
              </CardHeader>
              <CardContent>
                {qrCodes.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {qrCodes.map((qrCode) => (
                      <Card key={qrCode.id} className="relative">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <Badge>{formatServiceType(qrCode.serviceType)}</Badge>
                            <div className="flex items-center gap-2">
                              {qrCode.displayOnScreens && (
                                <Badge variant="secondary" className="text-xs">
                                  <churchIcons.qrcode className="h-3 w-3 mr-1" />
                                  On Display
                                </Badge>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeactivateQR(qrCode.qrCodeId)}
                                className="h-6 w-6 p-0 text-red-500"
                              >
                                <churchIcons.x className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-3 text-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <div><strong>QR ID:</strong> {qrCode.qrCodeId}</div>
                              <div><strong>Date:</strong> {new Date(qrCode.serviceDate).toLocaleDateString()}</div>
                              <div><strong>Location:</strong> {qrCode.location || 'Not specified'}</div>
                              <div><strong>Uses:</strong> {qrCode.currentUses}{qrCode.maxUses ? `/${qrCode.maxUses}` : ''}</div>
                            </div>
                            {qrCode.event && (
                              <div><strong>Event:</strong> {qrCode.event.title}</div>
                            )}
                            
                            {/* Display Controls */}
                            <div className="pt-3 border-t space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Church Displays:</span>
                                <Button
                                  size="sm"
                                  variant={qrCode.displayOnScreens ? "default" : "outline"}
                                  onClick={() => handleToggleDisplay(qrCode.qrCodeId, qrCode.displayOnScreens || false)}
                                  className="h-7 text-xs"
                                >
                                  {qrCode.displayOnScreens ? (
                                    <>
                                      <churchIcons.check className="h-3 w-3 mr-1" />
                                      Displayed
                                    </>
                                  ) : (
                                    <>
                                      <churchIcons.qrcode className="h-3 w-3 mr-1" />
                                      Show on Screens
                                    </>
                                  )}
                                </Button>
                              </div>
                              
                              {qrCode.displayOnScreens && (
                                <div className="text-xs text-muted-foreground bg-green-50 p-2 rounded">
                                  <div className="flex items-center gap-1">
                                    <churchIcons.check className="h-3 w-3 text-green-600" />
                                    <span>QR code is visible on church screens</span>
                                  </div>
                                  <div className="mt-1">
                                    Visit: <a href="/display/qr" target="_blank" className="text-blue-600 hover:underline font-medium">/display/qr</a>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <churchIcons.qrcode className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium">No active QR codes</h3>
                    <p className="text-sm">
                      Generate QR codes to enable mobile check-ins.
                    </p>
                    <Button 
                      className="mt-4"
                      onClick={() => setShowQRForm(true)}
                    >
                      Generate First QR Code
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* QR Code Generation Modal */}
      {showQRForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Generate QR Code</CardTitle>
              <CardDescription>
                Create a QR code for attendance check-ins
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleGenerateQR}>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Service Type *</label>
                  <Select 
                    value={qrFormData.serviceType} 
                    onValueChange={(value) => setQRFormData({...qrFormData, serviceType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sunday-service">Sunday Service</SelectItem>
                      <SelectItem value="midweek-service">Midweek Service</SelectItem>
                      <SelectItem value="bible-study">Bible Study</SelectItem>
                      <SelectItem value="prayer-meeting">Prayer Meeting</SelectItem>
                      <SelectItem value="special-event">Special Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Linked Event (Optional)</label>
                  <Select 
                    value={qrFormData.eventId} 
                    onValueChange={(value) => setQRFormData({...qrFormData, eventId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an event" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No specific event</SelectItem>
                      {events.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Service Date *</label>
                  <Input
                    type="datetime-local"
                    value={qrFormData.serviceDate}
                    onChange={(e) => setQRFormData({...qrFormData, serviceDate: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    type="text"
                    placeholder="e.g., Main Sanctuary, Fellowship Hall"
                    value={qrFormData.location}
                    onChange={(e) => setQRFormData({...qrFormData, location: e.target.value})}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Expires At (Optional)</label>
                  <Input
                    type="datetime-local"
                    value={qrFormData.expiresAt}
                    onChange={(e) => setQRFormData({...qrFormData, expiresAt: e.target.value})}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Max Uses (Optional)</label>
                  <Input
                    type="number"
                    placeholder="Leave empty for unlimited"
                    value={qrFormData.maxUses}
                    onChange={(e) => setQRFormData({...qrFormData, maxUses: e.target.value})}
                  />
                </div>
              </CardContent>
              <div className="flex justify-end gap-2 p-6 pt-0">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowQRForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Generate QR Code
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
