import { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import * as XLSX from 'xlsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { getChildrenAnalytics } from '@/lib/api/children'
import { getVolunteerAnalytics } from '@/lib/api/volunteers'


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
  childrenAnalytics?: {
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
  volunteerAnalytics?: {
    totalVolunteers: number
    activeVolunteers: number
    totalTeams: number
    upcomingServices: number
    volunteerUtilization: number
    skillDistribution: { skill: string; count: number }[]
    teamPerformance: { team: string; memberCount: number; serviceCount: number }[]
    trainingCompletion: { program: string; completed: number; required: number }[]
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
      const [attendanceResult, memberStatsResult, eventStatsResult, childrenAnalyticsResult, volunteerAnalyticsResult] = await Promise.all([
        getAttendanceByDate(startDate, now),
        getMemberStatistics(),
        getEventStats(),
        getChildrenAnalytics(startDate, now),
        getVolunteerAnalytics()
      ])

      if (!attendanceResult.ok || !memberStatsResult.ok) {
        throw new Error('Failed to load analytics data')
      }

      // Log results for debugging
      console.log('Analytics data results:', {
        attendance: attendanceResult,
        members: memberStatsResult,
        events: eventStatsResult,
        children: childrenAnalyticsResult
      })

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
        growthMetrics,
        childrenAnalytics: childrenAnalyticsResult.ok ? childrenAnalyticsResult.data as any : undefined,
        volunteerAnalytics: volunteerAnalyticsResult.ok ? volunteerAnalyticsResult.data : undefined
      })

    } catch (err) {
      console.error('Error loading analytics:', err)
      console.error('Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined
      })
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
      if (analyticsData?.childrenAnalytics) {
        pdf.text(`Total Children: ${analyticsData.childrenAnalytics.totalChildren}`, 20, 95)
        pdf.text(`Currently Checked In: ${analyticsData.childrenAnalytics.checkInStats.currentlyCheckedIn}`, 20, 105)
      }
      if (analyticsData?.volunteerAnalytics) {
        pdf.text(`Total Volunteers: ${analyticsData.volunteerAnalytics.totalVolunteers}`, 20, 115)
        pdf.text(`Active Teams: ${analyticsData.volunteerAnalytics.totalTeams}`, 20, 125)
        pdf.text(`Utilization Rate: ${analyticsData.volunteerAnalytics.volunteerUtilization}%`, 20, 135)
      }

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

      // Children's ministry sheet (if available)
      if (analyticsData.childrenAnalytics) {
        const childrenSummaryData = [
          ['Children\'s Ministry Summary'],
          ['Total Children', analyticsData.childrenAnalytics.totalChildren],
          ['Active Children', analyticsData.childrenAnalytics.activeChildren],
          ['New This Month', analyticsData.childrenAnalytics.newChildrenThisMonth],
          ['Currently Checked In', analyticsData.childrenAnalytics.checkInStats.currentlyCheckedIn],
          ['Total Check-ins', analyticsData.childrenAnalytics.checkInStats.totalCheckIns],
          ['Medical Alerts', analyticsData.childrenAnalytics.medicalAlerts.count],
          ['Medical Alerts %', `${analyticsData.childrenAnalytics.medicalAlerts.percentage}%`],
          [''],
          ['Age Distribution'],
          ...analyticsData.childrenAnalytics.ageDistribution.map(item => [item.ageGroup, item.count])
        ]
        const childrenSummaryWS = XLSX.utils.aoa_to_sheet(childrenSummaryData)
        XLSX.utils.book_append_sheet(wb, childrenSummaryWS, 'Children\'s Ministry')
      }

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
          <TabsTrigger value="children">Children's Ministry</TabsTrigger>
          <TabsTrigger value="volunteers">Volunteer Analytics</TabsTrigger>
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

        <TabsContent value="children" className="space-y-4">
          {analyticsData.childrenAnalytics ? (
            <>
              {/* Key Children's Ministry Metrics */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Children</CardTitle>
                    <churchIcons.children className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analyticsData.childrenAnalytics.totalChildren}</div>
                    <p className="text-xs text-muted-foreground">
                      +{analyticsData.childrenAnalytics.newChildrenThisMonth} this month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Children</CardTitle>
                    <churchIcons.active className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analyticsData.childrenAnalytics.activeChildren}</div>
                    <p className="text-xs text-muted-foreground">
                      {formatPercentage(analyticsData.childrenAnalytics.activeChildren, analyticsData.childrenAnalytics.totalChildren)} of total
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Currently Checked In</CardTitle>
                    <churchIcons.userCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analyticsData.childrenAnalytics.checkInStats.currentlyCheckedIn}</div>
                    <p className="text-xs text-muted-foreground">
                      {analyticsData.childrenAnalytics.checkInStats.totalCheckIns} total check-ins
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Medical Alerts</CardTitle>
                    <churchIcons.alertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analyticsData.childrenAnalytics.medicalAlerts.count}</div>
                    <p className="text-xs text-muted-foreground">
                      {analyticsData.childrenAnalytics.medicalAlerts.percentage}% of children
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Children's Ministry Charts */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Age Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Age Distribution</CardTitle>
                    <CardDescription>Children by age groups</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analyticsData.childrenAnalytics.ageDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="ageGroup" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8B5CF6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Service Type Breakdown for Children */}
                <Card>
                  <CardHeader>
                    <CardTitle>Children's Service Participation</CardTitle>
                    <CardDescription>Check-ins by service type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={analyticsData.childrenAnalytics.serviceTypeBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="count"
                        >
                          {analyticsData.childrenAnalytics.serviceTypeBreakdown.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={Object.values(serviceColors)[index % Object.values(serviceColors).length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Monthly Trends for Children */}
              <Card>
                <CardHeader>
                  <CardTitle>Children's Ministry Growth Trends</CardTitle>
                  <CardDescription>New children and check-ins over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={analyticsData.childrenAnalytics.monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="newChildren" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        dot={{ fill: '#10B981' }}
                        name="New Children"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="checkIns" 
                        stroke="#8B5CF6" 
                        strokeWidth={2}
                        dot={{ fill: '#8B5CF6' }}
                        name="Check-ins"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Guardian and Security Metrics */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Guardian Engagement</CardTitle>
                    <CardDescription>Guardian participation and family size</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Total Guardians</span>
                        <span className="text-lg font-bold">{analyticsData.childrenAnalytics.guardianStats.totalGuardians}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Active Guardians</span>
                        <span className="text-lg font-bold">{analyticsData.childrenAnalytics.guardianStats.activeGuardians}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Avg. Children per Guardian</span>
                        <span className="text-lg font-bold">{analyticsData.childrenAnalytics.guardianStats.averageChildrenPerGuardian}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Security & Safety</CardTitle>
                    <CardDescription>Security audit and safety metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Total Security Actions</span>
                        <span className="text-lg font-bold">{analyticsData.childrenAnalytics.securityAudit.totalActions}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Critical Actions</span>
                        <span className="text-lg font-bold text-red-600">{analyticsData.childrenAnalytics.securityAudit.criticalActions}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Avg. Check-in Duration</span>
                        <span className="text-lg font-bold">{analyticsData.childrenAnalytics.checkInStats.averageCheckInDuration}h</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <churchIcons.children className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Children's Ministry Data</h2>
                <p className="text-muted-foreground">No children's ministry data available for the selected period.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Volunteer Analytics Tab */}
        <TabsContent value="volunteers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Volunteer Overview</CardTitle>
              <CardDescription>Key metrics for volunteer management and ministry teams</CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsData?.volunteerAnalytics ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Volunteer Metrics */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Volunteer Metrics</h3>
                    <div className="grid gap-3">
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span className="text-sm font-medium">Total Volunteers</span>
                        <span className="text-2xl font-bold text-primary">
                          {analyticsData.volunteerAnalytics.totalVolunteers}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span className="text-sm font-medium">Active Volunteers</span>
                        <span className="text-2xl font-bold text-green-600">
                          {analyticsData.volunteerAnalytics.activeVolunteers}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span className="text-sm font-medium">Utilization Rate</span>
                        <span className="text-2xl font-bold text-blue-600">
                          {analyticsData.volunteerAnalytics.volunteerUtilization}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Team Performance */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Team Performance</h3>
                    <div className="space-y-3">
                      {analyticsData.volunteerAnalytics.teamPerformance.map((team, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{team.team}</div>
                            <div className="text-sm text-muted-foreground">
                              {team.memberCount} members
                            </div>
                          </div>
                          <Badge variant="outline">
                            {team.serviceCount} services
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <churchIcons.volunteers className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No volunteer data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skills Distribution */}
          {analyticsData?.volunteerAnalytics?.skillDistribution && (
            <Card>
              <CardHeader>
                <CardTitle>Skill Distribution</CardTitle>
                <CardDescription>Volunteer skills across different ministry areas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.volunteerAnalytics.skillDistribution.map((skill, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">{skill.skill}</span>
                      <Badge variant="secondary">{skill.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Training Completion */}
          {analyticsData?.volunteerAnalytics?.trainingCompletion && (
            <Card>
              <CardHeader>
                <CardTitle>Training Completion</CardTitle>
                <CardDescription>Required and completed training programs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.volunteerAnalytics.trainingCompletion.map((training, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                              <span className="font-medium">{training.program}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {training.completed}/{training.required}
                        </span>
                        <Badge variant={training.completed >= training.required ? 'default' : 'secondary'}>
                          {Math.round((training.completed / training.required) * 100)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
