import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { MemberForm } from '@/components/members/MemberForm'
import { MemberCard } from '@/components/members/MemberCard'

import { MemberGridSkeleton } from '@/components/ui/member-skeleton'
import { getAllMembers, searchMembers } from '@/lib/api/members'
import { getUserRole } from '@/lib/clerk'
import type { Member } from '@/lib/db/schema'
import { Search, Plus, Users, UserPlus, Crown, Shield } from '@/lib/icons'
import { cn } from '@/lib/utils'

export function Members() {
  const { user } = useUser()
  const userRole = getUserRole(user?.publicMetadata || {})
  
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('active')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [error, setError] = useState<string | null>(null)

  const canManageMembers = ['admin', 'pastor'].includes(userRole)
  
  // Debug: Log the current user role (remove this in production)
  console.log('Current user role:', userRole, 'Can manage members:', canManageMembers)

  const loadMembers = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await getAllMembers(statusFilter)
      if (result.ok && result.data) {
        setMembers(result.data)
      } else {
        setError(result.error || 'Failed to load members')
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Error loading members:', err)
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  // Load members on component mount
  useEffect(() => {
    loadMembers()
  }, [loadMembers])

  // Search when query or status filter changes
  useEffect(() => {
    if (searchQuery.trim()) {
      searchMembers(searchQuery)
        .then(result => {
          if (result.ok && result.data) {
            setMembers(result.data)
          }
        })
        .catch(console.error)
    } else {
      loadMembers()
    }
  }, [searchQuery, statusFilter, loadMembers])

  const handleAddMember = () => {
    setEditingMember(null)
    setShowAddForm(true)
  }

  const handleEditMember = (member: Member) => {
    setEditingMember(member)
    setShowAddForm(true)
  }

  const handleFormSuccess = (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _member: Member
  ) => {
    setShowAddForm(false)
    setEditingMember(null)
    loadMembers() // Refresh the list
  }

  const handleFormCancel = () => {
    setShowAddForm(false)
    setEditingMember(null)
  }

  const handleStatusChange = (updatedMember: Member) => {
    // Update the member in the local state
    setMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m))
  }

  const getRoleStats = () => {
    const stats = members.reduce((acc, member) => {
      const role = member.role || 'member'
      acc[role] = (acc[role] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return [
      { 
        label: 'Pastors', 
        count: stats.pastor || 0, 
        icon: Crown, 
        color: 'text-church-gold-600 bg-church-gold-100' 
      },
      { 
        label: 'Leaders', 
        count: stats.leader || 0, 
        icon: Shield, 
        color: 'text-purple-600 bg-purple-100' 
      },
      { 
        label: 'Members', 
        count: stats.member || 0, 
        icon: Users, 
        color: 'text-green-600 bg-green-100' 
      },
      { 
        label: 'Visitors', 
        count: stats.visitor || 0, 
        icon: UserPlus, 
        color: 'text-gray-600 bg-gray-100' 
      },
    ]
  }

  if (showAddForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleFormCancel}>
            ← Back to Members
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {editingMember ? 'Edit Member' : 'Add New Member'}
            </h1>
            <p className="text-muted-foreground">
              {editingMember 
                ? 'Update member information and church details.'
                : 'Register a new member to your church community.'
              }
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <MemberForm
            member={editingMember || undefined}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Members</h1>
          <p className="text-muted-foreground">
            Manage your church community and member information.
          </p>
        </div>
        
        {canManageMembers && (
          <Button onClick={handleAddMember} className="bg-church-sky-500 hover:bg-church-sky-600">
            <Plus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {getRoleStats().map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-full", stat.color)}>
                  <stat.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.count}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active Members</SelectItem>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="transferred">Transferred</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="visitor">Visitors</SelectItem>
                  <SelectItem value="deceased">Deceased</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      {loading ? (
        <MemberGridSkeleton count={6} />
      ) : error ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" onClick={loadMembers} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : members.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No members found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? 'No members match your search criteria. Try a different search term.'
                : 'Start building your church community by adding your first member.'
              }
            </p>
            {canManageMembers && !searchQuery && (
              <Button onClick={handleAddMember} className="bg-church-sky-500 hover:bg-church-sky-600">
                <Plus className="mr-2 h-4 w-4" />
                Add First Member
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              onEdit={canManageMembers ? handleEditMember : undefined}
              onView={(member) => console.log('View member:', member)}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Results count */}
      {!loading && members.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {members.length} member{members.length !== 1 ? 's' : ''}
          {searchQuery && ` matching "${searchQuery}"`}
        </div>
      )}
    </div>
  )
}
