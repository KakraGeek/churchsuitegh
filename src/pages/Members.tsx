import React, { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/clerk-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { churchIcons } from '@/lib/icons'
import { getUserRole } from '@/lib/clerk'
import { 
  getAllMembers,
  getMemberById,
  createMember,
  updateMemberStatus,
  getMemberStatistics
} from '@/lib/api/members'
import type { Member } from '@/lib/db/schema'

interface MemberStats {
  totalMembers: number
  activeMembers: number
  visitors: number
  statusBreakdown: Array<{ status: string | null; count: number }>
  roleBreakdown: Array<{ role: string | null; count: number }>
}

export default function Members() {
  const { user } = useUser()
  const [userRole, setUserRole] = useState<string>('')
  const [members, setMembers] = useState<Member[]>([])
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [stats, setStats] = useState<MemberStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  
  // Search and filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  
  // Forms
  const [memberForm, setMemberForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    emergencyContact: '',
    role: 'member' as string,
    department: '',
    notes: ''
  })

  // Status update form
  const [newStatus, setNewStatus] = useState('active')
  const [statusReason, setStatusReason] = useState('')

  const loadUserRole = useCallback(async () => {
    if (user) {
      const role = await getUserRole(user.publicMetadata || {})
      console.log('User role loaded:', role, 'User:', user)
      setUserRole(role)
    }
  }, [user])

  const loadMembers = async () => {
    try {
      setLoading(true)
      const result = await getAllMembers()
      if (result.ok && result.data) {
        setMembers(result.data)
        setFilteredMembers(result.data)
      }
    } catch (error) {
      console.error('Error loading members:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const result = await getMemberStatistics()
      if (result.ok && result.data) {
        setStats(result.data)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  useEffect(() => {
    loadUserRole()
  }, [loadUserRole])

  useEffect(() => {
    if (userRole === 'admin') {
      loadMembers()
      loadStats()
    }
  }, [userRole])

  // Access Control Check
  if (userRole && userRole !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <div className="mb-4">
              <churchIcons.admin className="h-16 w-16 text-red-500 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">Admins Only!</p>
            <p className="text-sm text-gray-500">
              Member management is restricted to administrators only. 
              Please contact your church administrator if you need access.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show loading while checking user role
  if (!userRole) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Checking permissions...</span>
        </div>
      </div>
    )
  }

  const handleSearch = () => {
    let filtered = members

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(member => 
        member.firstName?.toLowerCase().includes(query) ||
        member.lastName?.toLowerCase().includes(query) ||
        member.email?.toLowerCase().includes(query) ||
        member.phone?.toLowerCase().includes(query)
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(member => member.status === statusFilter)
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(member => member.role === roleFilter)
    }

    setFilteredMembers(filtered)
  }

  const handleMemberSelect = async (memberId: string) => {
    try {
      const result = await getMemberById(memberId)
      if (result.ok && result.data) {
        setSelectedMember(result.data)
        setShowMemberModal(true)
      }
    } catch (error) {
      console.error('Error loading member details:', error)
    }
  }

  const handleStatusUpdate = async (memberId: string, newStatus: string, reason?: string) => {
    if (!user?.id) return

    try {
      const result = await updateMemberStatus(memberId, newStatus, user.id, reason)
      if (result.ok && result.data) {
        await loadMembers()
        setSelectedMember(prev => prev ? { ...prev, status: newStatus, statusReason: reason || null } : null)
      }
    } catch (error) {
      console.error('Error updating member status:', error)
    }
  }

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const memberData = {
        ...memberForm,
        clerkUserId: user?.id || '',
        membershipDate: new Date(),
        status: 'active' as const,
        role: memberForm.role as "admin" | "pastor" | "leader" | "member" | "visitor" | null,
        dateOfBirth: memberForm.dateOfBirth ? new Date(memberForm.dateOfBirth) : null,
      }

      console.log('Creating member with data:', memberData)
      console.log('User ID:', user?.id)

      const result = await createMember(memberData)
      console.log('Create member result:', result)
      
      if (result.ok && result.data) {
        console.log('Member created successfully:', result.data)
        await loadMembers()
        setShowAddModal(false)
        setMemberForm({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          dateOfBirth: '',
          address: '',
          emergencyContact: '',
          role: 'member',
          department: '',
          notes: ''
        })
      } else {
        console.error('Failed to create member')
      }
    } catch (error) {
      console.error('Error creating member:', error)
    }
  }



  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'suspended': return 'bg-red-100 text-red-800 border-red-200'
      case 'transferred': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'deceased': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'visitor': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRoleColor = (role: string | null) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200'
      case 'pastor': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'leader': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'member': return 'bg-green-100 text-green-800 border-green-200'
      case 'visitor': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }





  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3">
            <churchIcons.spinner className="h-6 w-6 animate-spin text-blue-600" />
            <span>Loading member information...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <churchIcons.users className="h-8 w-8 text-blue-600" />
            Member Management
          </h1>
          <p className="text-gray-600 mt-2">Manage church members and their information</p>
        </div>
        
        <div className="flex gap-3">
          <Button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700">
            <churchIcons.add className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <churchIcons.users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Members</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalMembers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <churchIcons.checkCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Members</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeMembers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <churchIcons.userPlus className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Visitors</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.visitors}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <churchIcons.chart className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Departments</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.roleBreakdown.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search Members</Label>
              <Input
                id="search"
                placeholder="Name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="visitor">Visitor</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="transferred">Transferred</SelectItem>
                  <SelectItem value="deceased">Deceased</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="pastor">Pastor</SelectItem>
                  <SelectItem value="leader">Leader</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="visitor">Visitor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button onClick={handleSearch} className="w-full">
                <churchIcons.search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <churchIcons.users className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="families" className="flex items-center gap-2">
            <churchIcons.heart className="h-4 w-4" />
            Families
          </TabsTrigger>
          <TabsTrigger value="ministries" className="flex items-center gap-2">
            <churchIcons.building className="h-4 w-4" />
            Ministries
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Members List */}
          <Card>
            <CardHeader>
              <CardTitle>Members ({filteredMembers.length})</CardTitle>
              <CardDescription>
                Click on a member to view detailed information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredMembers.map((member) => (
                  <div 
                    key={member.id} 
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleMemberSelect(member.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <churchIcons.user className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">
                            {member.firstName} {member.lastName}
                          </h4>
                          <Badge className={getStatusColor(member.status)}>
                            {member.status || 'unknown'}
                          </Badge>
                          <Badge className={getRoleColor(member.role)}>
                            {member.role || 'unknown'}
                          </Badge>
                          {member.department && (
                            <Badge variant="outline">
                              {member.department}
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-700 mb-2">{member.email}</p>
                        {member.phone && (
                          <p className="text-gray-600 text-sm mb-2">
                            📞 {member.phone}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <churchIcons.calendar className="h-4 w-4" />
                            Member since {member.membershipDate ? new Date(member.membershipDate).toLocaleDateString() : 'Unknown'}
                          </span>
                          {member.dateOfBirth && (
                            <span className="flex items-center gap-1">
                              <churchIcons.calendar className="h-4 w-4" />
                              {new Date(member.dateOfBirth).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredMembers.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <churchIcons.users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">No members found</h3>
                    <p className="mb-4">Try adjusting your search criteria or add new members</p>
                    {userRole === 'admin' && (
                      <Button onClick={() => setShowAddModal(true)}>
                        <churchIcons.add className="h-4 w-4 mr-2" />
                        Add Member
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="families" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Family Relationships</CardTitle>
              <CardDescription>
                View and manage family connections between members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <churchIcons.heart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Family Management Coming Soon</h3>
                <p className="mb-4">View family trees, manage relationships, and track family involvement</p>
                <Button variant="outline" disabled>
                  <churchIcons.clock className="h-4 w-4 mr-2" />
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ministries" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ministry Involvement</CardTitle>
              <CardDescription>
                Track member participation in various ministries and roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <churchIcons.building className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Ministry Management Coming Soon</h3>
                <p className="mb-4">Assign roles, track involvement, and manage ministry teams</p>
                <Button variant="outline" disabled>
                  <churchIcons.clock className="h-4 w-4 mr-2" />
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Member Details Modal */}
      <Dialog open={showMemberModal} onOpenChange={setShowMemberModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Member Details</DialogTitle>
            <DialogDescription>
              Member information and management
            </DialogDescription>
          </DialogHeader>
          
          {selectedMember && (
            <div className="space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <churchIcons.user className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Name</Label>
                    <p className="text-gray-900">{selectedMember.firstName} {selectedMember.lastName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-gray-900">{selectedMember.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Phone</Label>
                    <p className="text-gray-900">{selectedMember.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Role</Label>
                    <Badge className={getRoleColor(selectedMember.role)}>
                      {selectedMember.role || 'unknown'}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge className={getStatusColor(selectedMember.status)}>
                      {selectedMember.status || 'unknown'}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Department</Label>
                    <p className="text-gray-900">{selectedMember.department || 'Not assigned'}</p>
                  </div>
                </CardContent>
              </Card>

                             {/* Status Management */}
                <Card>
                  <CardHeader>
                    <CardTitle>Status Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                                         <div className="space-y-4">
                       <div className="grid grid-cols-2 gap-4">
                         <div>
                           <Label htmlFor="newStatus">New Status</Label>
                           <Select onValueChange={(value) => setNewStatus(value)}>
                             <SelectTrigger>
                               <SelectValue placeholder="Select status" />
                             </SelectTrigger>
                             <SelectContent>
                               <SelectItem value="active">Active</SelectItem>
                               <SelectItem value="inactive">Inactive</SelectItem>
                               <SelectItem value="suspended">Suspended</SelectItem>
                               <SelectItem value="transferred">Transferred</SelectItem>
                               <SelectItem value="deceased">Deceased</SelectItem>
                               <SelectItem value="visitor">Visitor</SelectItem>
                             </SelectContent>
                           </Select>
                         </div>
                         <div>
                           <Label htmlFor="statusReason">Reason (Optional)</Label>
                           <Input
                             id="statusReason"
                             placeholder="Reason for status change"
                             value={statusReason}
                             onChange={(e) => setStatusReason(e.target.value)}
                           />
                         </div>
                       </div>
                       <div className="flex gap-2">
                         <Button 
                           onClick={() => handleStatusUpdate(selectedMember.id, newStatus, statusReason)}
                           className="bg-blue-600 hover:bg-blue-700"
                         >
                           Update Status
                         </Button>
                         <Button 
                           variant="outline" 
                           onClick={() => {
                             setNewStatus(selectedMember.status || 'active')
                             setStatusReason('')
                           }}
                         >
                           Reset
                         </Button>
                       </div>
                     </div>
                  </CardContent>
                                 </Card>
               </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Member Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Member</DialogTitle>
            <DialogDescription>
              Enter member information to add them to the church database
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateMember} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={memberForm.firstName}
                  onChange={(e) => setMemberForm(prev => ({ ...prev, firstName: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={memberForm.lastName}
                  onChange={(e) => setMemberForm(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={memberForm.email}
                  onChange={(e) => setMemberForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={memberForm.phone}
                  onChange={(e) => setMemberForm(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={memberForm.dateOfBirth}
                  onChange={(e) => setMemberForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={memberForm.role} onValueChange={(value: string) => setMemberForm(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="leader">Leader</SelectItem>
                    <SelectItem value="pastor">Pastor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="visitor">Visitor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={memberForm.department}
                onChange={(e) => setMemberForm(prev => ({ ...prev, department: e.target.value }))}
                placeholder="e.g., Youth Ministry, Worship Team"
              />
            </div>
            
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={memberForm.address}
                onChange={(e) => setMemberForm(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Full address"
              />
            </div>
            
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={memberForm.notes}
                onChange={(e) => setMemberForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional information about the member"
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <churchIcons.add className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
