import { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import * as XLSX from 'xlsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { churchIcons } from '@/lib/icons'
import { getUserRole } from '@/lib/clerk'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'
import { getAttendanceByDate } from '@/lib/api/attendance'
import { getMemberStatistics } from '@/lib/api/members'
import { getEventStats } from '@/lib/api/events'


interface AnalyticsData {
  attendanceOverTime: { date: string; attendance: number; service: string }[]
  serviceTypeBreakdown: { name: string; value: number; color: string }[]
  memberEngagement: { status: string; count: number; percentage: number }[]
  eventPerformance: { event: string; attendance: number; capacity: number }[]
  growthMetrics: {
    totalMembers: number
    monthlyGrowth: number
    attendanceGrowth: number
    activeMembers: number
  }
}

export default function Analytics() {
  const { user } = useUser()
  const userRole = getUserRole(user?.publicMetadata || {})
  const canViewAnalytics = userRole === 'admin' || userRole === 'pastor' || userRole === 'leader'

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState('3months') // 1month, 3months, 6months, 1year
  const [activeTab, setActiveTab] = useState('overview')
  const [exporting, setExporting] = useState(false)

  // Colors for charts
  const serviceColors = {
    'sunday-service': '#8B5CF6',
    'midweek-service': '#06B6D4', 
    'bible-study': '#10B981',
    'prayer-meeting': '#F59E0B',
    'special-event': '#EF4444',
    'outreach': '#6366F1',
    'fellowship': '#EC4899',
    'conference': '#84CC16'
  }

  // Load analytics data
  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      
      // Calculate date range
      const now = new Date()
      let startDate: Date
      
      switch (dateRange) {
        case '1month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case '6months':
          startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
          break
        case '1year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          break
        default: // 3months
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      }

      // Fetch all data
      const [attendanceResult, memberStatsResult] = await Promise.all([
        getAttendanceByDate(startDate, now),
        getMemberStatistics(),
        getEventStats()
      ])

      if (!attendanceResult.ok || !memberStatsResult.ok) {
        throw new Error('Failed to load analytics data')
      }

      const attendanceRecords = attendanceResult.data || []
      const memberStats = memberStatsResult.data || { totalMembers: 0, newThisMonth: 0, activeMembers: 0, membersByRole: {} }


      // Process attendance over time
      const attendanceByDate = attendanceRecords.reduce((acc, record) => {
        const date = new Date(record.serviceDate).toLocaleDateString()
        const key = `${date}-${record.serviceType}`
        
        if (!acc[key]) {
          acc[key] = { 
            date, 
            attendance: 0, 
            service: record.serviceType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
          }
        }
        acc[key].attendance++
        return acc
      }, {} as Record<string, { date: string; attendance: number; service: string }>)

      const attendanceOverTime = Object.values(attendanceByDate)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      // Process service type breakdown
      const serviceTypeCounts = attendanceRecords.reduce((acc, record) => {
        const service = record.serviceType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
        acc[service] = (acc[service] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const serviceTypeBreakdown = Object.entries(serviceTypeCounts).map(([name, value], index) => ({
        name,
        value,
        color: Object.values(serviceColors)[index % Object.values(serviceColors).length]
      }))

      // Process member engagement
      const memberEngagement = [
        { status: 'Active Members', count: memberStats.activeMembers, percentage: 0 },
        { status: 'Leaders', count: (memberStats.roleBreakdown.find(r => r.role === 'pastor')?.count || 0) + (memberStats.roleBreakdown.find(r => r.role === 'leader')?.count || 0), percentage: 0 },
        { status: 'Visitors', count: memberStats.roleBreakdown.find(r => r.role === 'visitor')?.count || 0, percentage: 0 }
      ].map(item => ({
        ...item,
        percentage: memberStats.totalMembers > 0 ? Math.round((item.count / memberStats.totalMembers) * 100) : 0
      }))

      // Mock event performance data (replace with real data when available)
      const eventPerformance = [
        { event: 'Sunday Service', attendance: attendanceRecords.filter(r => r.serviceType === 'sunday-service').length, capacity: 200 },
        { event: 'Bible Study', attendance: attendanceRecords.filter(r => r.serviceType === 'bible-study').length, capacity: 50 },
        { event: 'Prayer Meeting', attendance: attendanceRecords.filter(r => r.serviceType === 'prayer-meeting').length, capacity: 100 },
      ]

      // Growth metrics
      const growthMetrics = {
        totalMembers: memberStats.totalMembers,
        monthlyGrowth: 0, // Not available in new API
        attendanceGrowth: attendanceRecords.length,
        activeMembers: memberStats.activeMembers
      }

      setAnalyticsData({
        attendanceOverTime,
        serviceTypeBreakdown,
        memberEngagement,
        eventPerformance,
        growthMetrics
      })

    } catch (err) {
      console.error('Error loading analytics:', err)
      setError('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (canViewAnalytics) {
      loadAnalyticsData()
    } else {
      setLoading(false)
      setError('You do not have permission to view analytics')
    }
  }, [canViewAnalytics, dateRange])

  const formatPercentage = (value: number, total: number) => {
    return total > 0 ? `${Math.round((value / total) * 100)}%` : '0%'
  }

  // Export functionality
  const exportToPDF = async () => {
    setExporting(true)
    try {
      const element = document.getElementById('analytics-dashboard')
      if (!element) {
        throw new Error('Dashboard element not found')
      }

      // Create canvas from the dashboard
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const imgWidth = 210 // A4 width in mm
      const pageHeight = 295 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      // Add title page
      pdf.setFontSize(20)
      pdf.text('Church Analytics Report', 20, 30)
      pdf.setFontSize(12)
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45)
      pdf.text(`Period: ${dateRange.replace(/\d+/, (m) => m + ' ')}`, 20, 55)
      pdf.text(`Total Members: ${analyticsData?.growthMetrics.totalMembers || 0}`, 20, 65)
      pdf.text(`Active Members: ${analyticsData?.growthMetrics.activeMembers || 0}`, 20, 75)
      pdf.text(`Total Attendance: ${analyticsData?.growthMetrics.attendanceGrowth || 0}`, 20, 85)

      // Add charts
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`church-analytics-report-${dateRange}-${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF report')
    } finally {
      setExporting(false)
    }
  }

  const exportToExcel = () => {
    setExporting(true)
    try {
      if (!analyticsData) {
        throw new Error('No analytics data available')
      }

      // Create workbook
      const wb = XLSX.utils.book_new()

      // Summary sheet
      const summaryData = [
        ['Church Analytics Report'],
        ['Generated on:', new Date().toLocaleDateString()],
        ['Period:', dateRange.replace(/\d+/, (m) => m + ' ')],
        [''],
        ['Key Metrics'],
        ['Total Members', analyticsData.growthMetrics.totalMembers],
        ['Active Members', analyticsData.growthMetrics.activeMembers],
        ['Monthly Growth', analyticsData.growthMetrics.monthlyGrowth],
        ['Total Attendance', analyticsData.growthMetrics.attendanceGrowth],
        [''],
        ['Service Type Distribution'],
        ...analyticsData.serviceTypeBreakdown.map(item => [item.name, item.value])
      ]
      const summaryWS = XLSX.utils.aoa_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(wb, summaryWS, 'Summary')

      // Attendance data sheet
      if (analyticsData.attendanceOverTime.length > 0) {
        const attendanceWS = XLSX.utils.json_to_sheet(analyticsData.attendanceOverTime)
        XLSX.utils.book_append_sheet(wb, attendanceWS, 'Attendance Trends')
      }

      // Member engagement sheet
      const memberEngagementWS = XLSX.utils.json_to_sheet(analyticsData.memberEngagement)
      XLSX.utils.book_append_sheet(wb, memberEngagementWS, 'Member Engagement')

      // Event performance sheet
      const eventPerformanceWS = XLSX.utils.json_to_sheet(analyticsData.eventPerformance)
      XLSX.utils.book_append_sheet(wb, eventPerformanceWS, 'Event Performance')

      // Save file
      XLSX.writeFile(wb, `church-analytics-data-${dateRange}-${new Date().toISOString().split('T')[0]}.xlsx`)
    } catch (error) {
      console.error('Error generating Excel:', error)
      alert('Failed to generate Excel report')
    } finally {
      setExporting(false)
    }
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

  if (!analyticsData) {
    return (
      <div className="container mx-auto py-6 px-4">
        <Card>
          <CardContent className="p-6 text-center">
            <churchIcons.chart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Data Available</h2>
            <p className="text-muted-foreground">No analytics data to display.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div id="analytics-dashboard" className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Insights and trends for church growth and engagement
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                disabled={exporting || !analyticsData}
              >
                {exporting ? (
                  <churchIcons.spinner className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <churchIcons.download className="mr-2 h-4 w-4" />
                )}
                {exporting ? 'Generating...' : 'Export Report'}
                <churchIcons.chevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={exportToPDF}>
                <div className="flex items-center">
                  <churchIcons.file className="mr-2 h-4 w-4" />
                  Export as PDF
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToExcel}>
                <div className="flex items-center">
                  <churchIcons.download className="mr-2 h-4 w-4" />
                  Export as Excel
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <churchIcons.members className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.growthMetrics.totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              +{analyticsData.growthMetrics.monthlyGrowth} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <churchIcons.active className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.growthMetrics.activeMembers}</div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage(analyticsData.growthMetrics.activeMembers, analyticsData.growthMetrics.totalMembers)} of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attendance</CardTitle>
            <churchIcons.attendance className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.growthMetrics.attendanceGrowth}</div>
            <p className="text-xs text-muted-foreground">
              Last {dateRange.replace(/\d+/, (m) => m + ' ')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Per Service</CardTitle>
            <churchIcons.trending className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.attendanceOverTime.length > 0 
                ? Math.round(analyticsData.growthMetrics.attendanceGrowth / analyticsData.attendanceOverTime.length) 
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Average attendance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Detailed Analytics */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendance">Attendance Trends</TabsTrigger>
          <TabsTrigger value="members">Member Analytics</TabsTrigger>
          <TabsTrigger value="events">Event Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Service Type Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Service Type Distribution</CardTitle>
                <CardDescription>Attendance breakdown by service type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.serviceTypeBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {analyticsData.serviceTypeBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Member Engagement */}
            <Card>
              <CardHeader>
                <CardTitle>Member Engagement</CardTitle>
                <CardDescription>Breakdown of member activity levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.memberEngagement.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: Object.values(serviceColors)[index % Object.values(serviceColors).length] }}
                        />
                        <span className="text-sm font-medium">{item.status}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{item.count}</div>
                        <div className="text-xs text-muted-foreground">{item.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Trends Over Time</CardTitle>
              <CardDescription>Daily attendance patterns across all services</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analyticsData.attendanceOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="attendance" 
                    stroke="#8B5CF6" 
                    strokeWidth={2}
                    dot={{ fill: '#8B5CF6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Member Growth</CardTitle>
                <CardDescription>New member registrations over time</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-8">
                <churchIcons.members className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-muted-foreground">Member growth chart coming soon</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Member Status Distribution</CardTitle>
                <CardDescription>Active vs inactive member breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.memberEngagement}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Performance</CardTitle>
              <CardDescription>Attendance vs capacity for different events</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analyticsData.eventPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="event" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="attendance" fill="#10B981" name="Attendance" />
                  <Bar dataKey="capacity" fill="#E5E7EB" name="Capacity" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
