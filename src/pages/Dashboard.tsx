import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatsGridSkeleton } from '@/components/ui/stats-skeleton'
import { churchIcons } from '@/lib/icons'
import { useUser } from '@clerk/clerk-react'
import { getUserRole } from '@/lib/clerk'
import { useNavigate } from 'react-router-dom'
import { getMemberStatistics } from '@/lib/api/members'
import { getUpcomingEvents } from '@/lib/api/events'
import type { ChurchEvent } from '@/lib/db/schema'

export function Dashboard() {
  const { user } = useUser()
  const userRole = getUserRole(user?.publicMetadata || {})
  const navigate = useNavigate()

  // Helper function to format event dates
  const formatEventDate = (dateStr: string | Date) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return `Today ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
    } else if (diffDays === 1) {
      return `Tomorrow ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
    } else if (diffDays <= 7) {
      return `${date.toLocaleDateString('en-US', { weekday: 'short' })} ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
    } else {
      return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
    }
  }
  
  const [memberStats, setMemberStats] = useState({
    totalMembers: 0,
    newThisMonth: 0,
    activeMembers: 0,
    membersByRole: {} as Record<string, number>
  })
  const [upcomingEvents, setUpcomingEvents] = useState<ChurchEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [eventsLoading, setEventsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load member statistics
  useEffect(() => {
    const loadStats = async () => {
      try {
        const result = await getMemberStatistics()
        if (result.ok && result.data) {
          // Transform the data to match expected structure
          const transformedData = {
            totalMembers: result.data.totalMembers,
            newThisMonth: 0, // Not available in new API
            activeMembers: result.data.activeMembers,
            membersByRole: result.data.roleBreakdown.reduce((acc: Record<string, number>, item: { role: string | null; count: number }) => {
              if (item.role) acc[item.role] = item.count
              return acc
            }, {} as Record<string, number>)
          }
          setMemberStats(transformedData)
          setError(null)
        } else {
          setError('Failed to load statistics')
        }
      } catch (err) {
        console.error('Error loading member stats:', err)
        setError('Unable to connect to database')
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  // Load upcoming events
  useEffect(() => {
    const loadUpcomingEvents = async () => {
      try {
        const result = await getUpcomingEvents(3)
        if (result.ok && result.data) {
          setUpcomingEvents(result.data)
        } else {
          console.error('Failed to load upcoming events:', result.error)
        }
      } catch (err) {
        console.error('Error loading upcoming events:', err)
      } finally {
        setEventsLoading(false)
      }
    }

    loadUpcomingEvents()
  }, [])

  const stats = [
    { 
      name: 'Total Members', 
      value: loading ? '...' : memberStats.totalMembers.toString(), 
      icon: churchIcons.members, 
      change: memberStats.newThisMonth > 0 ? `+${memberStats.newThisMonth} this month` : ''
    },
    { 
      name: 'Active Members', 
      value: loading ? '...' : memberStats.activeMembers.toString(), 
      icon: churchIcons.active, 
      change: 'Currently active'
    },
    { 
      name: 'Church Leaders', 
      value: loading ? '...' : ((memberStats.membersByRole.pastor || 0) + (memberStats.membersByRole.leader || 0)).toString(), 
      icon: churchIcons.pastor, 
      change: `${memberStats.membersByRole.pastor || 0} pastors, ${memberStats.membersByRole.leader || 0} leaders`
    },
    { 
      name: 'New Visitors', 
      value: loading ? '...' : (memberStats.membersByRole.visitor || 0).toString(), 
      icon: churchIcons.visitor, 
      change: 'This month'
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-church-burgundy-800 to-church-burgundy-700 p-6 text-white">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-church-burgundy-100 mt-2">
            Here's what's happening with your church today.
          </p>
        </div>
        <div className="absolute right-0 top-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-church-bronze-400 opacity-20"></div>
        <div className="absolute right-8 bottom-0 -mb-8 h-16 w-16 rounded-full bg-church-bronze-300 opacity-30"></div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <StatsGridSkeleton />
      ) : error ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-destructive">{error}</p>
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.name}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.change && (
                  <p className="text-xs text-muted-foreground">
                    {stat.change}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks for church management
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              className="w-full justify-start bg-church-burgundy-50 text-church-burgundy-700 border-church-burgundy-200 hover:bg-church-burgundy-100" 
              variant="outline"
              onClick={() => navigate('/members')}
            >
              <churchIcons.members className="mr-2 h-4 w-4" />
              Manage Members
            </Button>
            <Button 
              className="w-full justify-start bg-church-bronze-50 text-church-bronze-700 border-church-bronze-200 hover:bg-church-bronze-100" 
              variant="outline"
              onClick={() => navigate('/events')}
            >
              <churchIcons.events className="mr-2 h-4 w-4" />
              Schedule Event
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <churchIcons.attendance className="mr-2 h-4 w-4" />
              Record Attendance
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates from your church
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>New member registered</span>
                <span className="text-muted-foreground">2 hours ago</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday service attendance</span>
                <span className="text-muted-foreground">3 days ago</span>
              </div>
              <div className="flex justify-between">
                <span>Monthly giving report</span>
                <span className="text-muted-foreground">1 week ago</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>
              Next scheduled activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {eventsLoading ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-28"></div>
                </div>
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div className="space-y-2 text-sm">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex justify-between">
                    <span className="truncate mr-2">{event.title}</span>
                    <span className="text-muted-foreground whitespace-nowrap">
                      {formatEventDate(event.startDate)}
                    </span>
                  </div>
                ))}
                {upcomingEvents.length < 3 && (
                  <div className="text-xs text-muted-foreground italic">
                    No more upcoming events
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No upcoming events scheduled
              </div>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-3"
              onClick={() => navigate('/events')}
            >
              View All Events
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Role-based sections */}
      {(userRole === 'admin' || userRole === 'pastor') && (
        <Card>
          <CardHeader>
            <CardTitle>Admin Dashboard</CardTitle>
            <CardDescription>
              Administrative tools and reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-3">
              <Button variant="outline">Member Reports</Button>
              <Button variant="outline">Financial Reports</Button>
              <Button variant="outline">System Settings</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
