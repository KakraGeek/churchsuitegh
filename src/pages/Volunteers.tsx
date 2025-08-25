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
  getAllMinistryTeams, 
  getTeamMembers, 
  getServiceSchedules, 
  getVolunteerAnalytics
} from '@/lib/api/volunteers'
import type { 
  MinistryTeam,
  TeamMember,
  ServiceSchedule
} from '@/lib/db/schema'

interface VolunteerAnalytics {
  totalVolunteers: number
  activeVolunteers: number
  totalTeams: number
  upcomingServices: number
  volunteerUtilization: number
  skillDistribution: Array<{ skill: string; count: number }>
  trainingCompletion: Array<{ program: string; completed: number; required: number }>
}

interface VolunteerData {
  teams: MinistryTeam[]
  teamMembers: Record<string, TeamMember[]>
  schedules: ServiceSchedule[]
  analytics?: VolunteerAnalytics
}

export default function Volunteers() {
  const { user, isLoaded } = useUser()
  const userRole = getUserRole(user?.publicMetadata || {})
  const canManageVolunteers = userRole === 'admin' || userRole === 'pastor' || userRole === 'leader'

  const [volunteerData, setVolunteerData] = useState<VolunteerData>({
    teams: [],
    teamMembers: {},
    schedules: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)

  // Form states
  const [showCreateTeam, setShowCreateTeam] = useState(false)

  // Load volunteer data
  const loadVolunteerData = async () => {
    try {
      setLoading(true)
      
      const [teamsResult, analyticsResult] = await Promise.all([
        getAllMinistryTeams(),
        getVolunteerAnalytics()
      ])

      if (!teamsResult.ok) {
        throw new Error('Failed to load ministry teams')
      }

      const teams = teamsResult.data || []
      
      // Load team members for each team
      const teamMembersData: Record<string, TeamMember[]> = {}
      for (const team of teams) {
        const membersResult = await getTeamMembers(team.id)
        if (membersResult.ok) {
          teamMembersData[team.id] = membersResult.data || []
        }
      }

      // Load service schedules
      const schedulesResult = await getServiceSchedules()
      const schedules = schedulesResult.ok ? schedulesResult.data || [] : []

      setVolunteerData({
        teams,
        teamMembers: teamMembersData,
        schedules,
        analytics: analyticsResult.ok ? analyticsResult.data : undefined
      })

    } catch (err) {
      console.error('Error loading volunteer data:', err)
      setError('Failed to load volunteer data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isLoaded) {
      // Wait for Clerk to finish loading user data
      return
    }
    
    if (canManageVolunteers) {
      loadVolunteerData()
    } else {
      setLoading(false)
      setError('You do not have permission to view volunteer management')
    }
  }, [isLoaded, canManageVolunteers])

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
          <h1 className="text-3xl font-bold tracking-tight">Volunteer Management</h1>
          <p className="text-muted-foreground">
            Manage ministry teams, volunteer assignments, and service scheduling
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Dialog open={showCreateTeam} onOpenChange={setShowCreateTeam}>
            <DialogTrigger asChild>
              <Button>
                <churchIcons.team className="mr-2 h-4 w-4" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Ministry Team</DialogTitle>
                <DialogDescription>
                  Set up a new ministry team with leader and member roles.
                </DialogDescription>
              </DialogHeader>
              <CreateTeamForm onSuccess={() => {
                setShowCreateTeam(false)
                loadVolunteerData()
              }} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Key Metrics */}
      {volunteerData.analytics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Volunteers</CardTitle>
              <churchIcons.volunteers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{volunteerData.analytics.totalVolunteers}</div>
              <p className="text-xs text-muted-foreground">
                {volunteerData.analytics.activeVolunteers} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ministry Teams</CardTitle>
              <churchIcons.team className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{volunteerData.analytics.totalTeams}</div>
              <p className="text-xs text-muted-foreground">
                All teams active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Services</CardTitle>
              <churchIcons.schedule className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{volunteerData.analytics.upcomingServices}</div>
              <p className="text-xs text-muted-foreground">
                Scheduled this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilization</CardTitle>
              <churchIcons.trending className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{volunteerData.analytics.volunteerUtilization}%</div>
              <p className="text-xs text-muted-foreground">
                Volunteer engagement
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="teams">Ministry Teams</TabsTrigger>
          <TabsTrigger value="scheduling">Service Scheduling</TabsTrigger>
          <TabsTrigger value="skills">Skills & Training</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Team Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Ministry Teams Overview</CardTitle>
                <CardDescription>Active teams and member counts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {volunteerData.teams.map((team) => (
                    <div key={team.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: team.color || '#8B5CF6' }}
                        />
                        <div>
                          <div className="font-medium">{team.teamName}</div>
                          <div className="text-sm text-muted-foreground">{team.teamType}</div>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {volunteerData.teamMembers[team.id]?.length || 0} members
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Services */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Services</CardTitle>
                <CardDescription>Next scheduled volunteer assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {volunteerData.schedules
                    .filter(schedule => new Date(schedule.serviceDate) >= new Date())
                    .slice(0, 5)
                    .map((schedule) => (
                    <div key={schedule.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">
                          {new Date(schedule.serviceDate).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {schedule.startTime && new Date(schedule.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <Badge variant="outline">
                        {schedule.assignedMembers}/{schedule.requiredMembers}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Teams Tab */}
        <TabsContent value="teams" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Ministry Teams</h2>
            <Button onClick={() => setShowCreateTeam(true)}>
              <churchIcons.team className="mr-2 h-4 w-4" />
              Create Team
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {volunteerData.teams.map((team) => (
              <Card key={team.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                                          <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: team.color || '#8B5CF6' }}
                      />
                    <Badge variant="outline">{team.teamType}</Badge>
                  </div>
                  <CardTitle className="text-lg">{team.teamName}</CardTitle>
                  <CardDescription>{team.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Members:</span>
                      <span className="font-medium">
                        {volunteerData.teamMembers[team.id]?.length || 0}
                        {team.maxMembers && ` / ${team.maxMembers}`}
                      </span>
                    </div>
                    
                    {team.meetingSchedule && (
                      <div className="text-sm text-muted-foreground">
                        📅 {team.meetingSchedule}
                      </div>
                    )}

                    <div className="pt-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => setSelectedTeam(team.id)}
                      >
                        <churchIcons.users className="mr-2 h-4 w-4" />
                        Manage Team
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Scheduling Tab */}
        <TabsContent value="scheduling" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Service Scheduling</h2>
            <Button>
              <churchIcons.schedule className="mr-2 h-4 w-4" />
              Schedule Service
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Service Schedule</CardTitle>
              <CardDescription>Upcoming services and volunteer assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {volunteerData.schedules
                  .filter(schedule => new Date(schedule.serviceDate) >= new Date())
                  .map((schedule) => (
                  <div key={schedule.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">
                          {new Date(schedule.serviceDate).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {schedule.startTime && new Date(schedule.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                          {schedule.endTime && new Date(schedule.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <Badge variant={schedule.status === 'scheduled' ? 'default' : 'secondary'}>
                        {schedule.status}
                      </Badge>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <Label className="text-sm font-medium">Team</Label>
                        <p className="text-sm">
                          {volunteerData.teams.find(t => t.id === schedule.teamId)?.teamName}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Location</Label>
                        <p className="text-sm">{schedule.location || 'Main Sanctuary'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Volunteers</Label>
                        <p className="text-sm">
                          {schedule.assignedMembers} / {schedule.requiredMembers}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-4">
          <h2 className="text-2xl font-bold">Skills & Training</h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Skill Distribution</CardTitle>
                <CardDescription>Volunteer skills across ministry areas</CardDescription>
              </CardHeader>
              <CardContent>
                {volunteerData.analytics?.skillDistribution ? (
                  <div className="space-y-3">
                    {volunteerData.analytics.skillDistribution.map((skill, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{skill.skill}</span>
                        <Badge variant="secondary">{skill.count}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No skill data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Training Programs</CardTitle>
                <CardDescription>Required and completed training</CardDescription>
              </CardHeader>
              <CardContent>
                {volunteerData.analytics?.trainingCompletion ? (
                  <div className="space-y-3">
                    {volunteerData.analytics.trainingCompletion.map((training, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{training.program}</span>
                        <Badge variant="outline">
                          {training.completed}/{training.required}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No training data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Team Management Dialog */}
      {selectedTeam && (
        <Dialog open={!!selectedTeam} onOpenChange={() => setSelectedTeam(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Manage Team</DialogTitle>
              <DialogDescription>
                Add/remove members and manage team settings
              </DialogDescription>
            </DialogHeader>
            <TeamManagementForm 
              members={volunteerData.teamMembers[selectedTeam] || []}
              onSuccess={() => {
                setSelectedTeam(null)
                loadVolunteerData()
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// Form Components
function CreateTeamForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    teamName: '',
    description: '',
    teamType: '',
    maxMembers: '',
    meetingSchedule: '',
    meetingLocation: '',
    color: '#8B5CF6'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement team creation
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="teamName">Team Name</Label>
          <Input
            id="teamName"
            value={formData.teamName}
            onChange={(e) => setFormData(prev => ({ ...prev, teamName: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="teamType">Team Type</Label>
          <Select value={formData.teamType} onValueChange={(value) => setFormData(prev => ({ ...prev, teamType: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select team type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="worship">Worship</SelectItem>
              <SelectItem value="children">Children's Ministry</SelectItem>
              <SelectItem value="youth">Youth</SelectItem>
              <SelectItem value="hospitality">Hospitality</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="outreach">Outreach</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="maxMembers">Max Members</Label>
          <Input
            id="maxMembers"
            type="number"
            value={formData.maxMembers}
            onChange={(e) => setFormData(prev => ({ ...prev, maxMembers: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="color">Team Color</Label>
          <Input
            id="color"
            type="color"
            value={formData.color}
            onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
            className="h-10"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="meetingSchedule">Meeting Schedule</Label>
          <Input
            id="meetingSchedule"
            value={formData.meetingSchedule}
            onChange={(e) => setFormData(prev => ({ ...prev, meetingSchedule: e.target.value }))}
            placeholder="e.g., Every Sunday 8:00 AM"
          />
        </div>
        <div>
          <Label htmlFor="meetingLocation">Meeting Location</Label>
          <Input
            id="meetingLocation"
            value={formData.meetingLocation}
            onChange={(e) => setFormData(prev => ({ ...prev, meetingLocation: e.target.value }))}
            placeholder="e.g., Fellowship Hall"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit">Create Team</Button>
      </div>
    </form>
  )
}

function TeamManagementForm({ 
  members, 
  onSuccess 
}: { 
  members: TeamMember[]
  onSuccess: () => void 
}) {
  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Team Members ({members.length})</h3>
        <div className="space-y-2">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-2 border rounded">
              <span className="text-sm">{member.role}</span>
              <Badge variant="outline">{member.commitmentLevel}</Badge>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onSuccess}>Close</Button>
        <Button>Add Member</Button>
      </div>
    </div>
  )
}
