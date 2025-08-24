import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { churchIcons } from '@/lib/icons'
import { 
  getMemberNotifications, 
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getMemberNotificationPreferences,
  updateMemberNotificationPreferences
} from '@/lib/api/notifications'
import { getMemberByClerkId } from '@/lib/api/members'
import type { 
  Notification,
  NotificationRecipient,
  NotificationPreferences,
  Member
} from '@/lib/db/schema'

type MemberNotification = Notification & NotificationRecipient

export default function Notifications() {
  const { user } = useUser()
  const [notifications, setNotifications] = useState<MemberNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('notifications')

  useEffect(() => {
    const loadMemberData = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setError(null)
        // Get member ID from Clerk user
        const memberResult = await getMemberByClerkId(user.id)
        if (memberResult.ok && memberResult.data) {
          setMember(memberResult.data)
          await loadNotificationData(memberResult.data.id)
        } else {
          setError(memberResult.error || 'Failed to load member profile')
          setLoading(false)
        }
      } catch (error) {
        console.error('Error loading member data:', error)
        setError('Failed to load member data')
        setLoading(false)
      }
    }

    loadMemberData()
  }, [user])

  const loadNotificationData = async (memberId: string) => {
    try {
      setLoading(true)
      const [notificationsResult, unreadResult, preferencesResult] = await Promise.all([
        getMemberNotifications(memberId),
        getUnreadNotificationCount(memberId),
        getMemberNotificationPreferences(memberId)
      ])

      if (notificationsResult.ok) {
        setNotifications(notificationsResult.data || [])
      }

      if (unreadResult.ok) {
        setUnreadCount(unreadResult.data || 0)
      }

      if (preferencesResult.ok) {
        setPreferences(preferencesResult.data || null)
      }
    } catch (error) {
      console.error('Error loading notification data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    if (!member) return

    try {
      const result = await markNotificationAsRead(member.id, notificationId)
      if (result.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, isRead: true, readAt: new Date() }
              : notif
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!member) return

    try {
      const result = await markAllNotificationsAsRead(member.id)
      if (result.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, isRead: true, readAt: new Date() }))
        )
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const handlePreferenceUpdate = async (preferenceKey: string, value: boolean) => {
    if (!member) return

    try {
      const result = await updateMemberNotificationPreferences(member.id, {
        [preferenceKey]: value
      })

      if (result.ok) {
        setPreferences(result.data || null)
      }
    } catch (error) {
      console.error('Error updating preferences:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'welcome': return churchIcons.user
      case 'event': return churchIcons.calendar
      case 'announcement': return churchIcons.megaphone
      case 'emergency': return churchIcons.alert
      case 'reminder': return churchIcons.clock
      default: return churchIcons.bell
    }
  }

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return 'Yesterday'
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return new Date(date).toLocaleDateString()
  }

  if (!user) {
    return (
      <div className="container mx-auto py-6 px-4">
        <Alert>
          <churchIcons.alert className="h-4 w-4" />
          <AlertDescription>
            Please sign in to view your notifications.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 px-4">
        <Alert variant="destructive">
          <churchIcons.alert className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const unreadNotifications = notifications.filter(n => !n.isRead)
  const readNotifications = notifications.filter(n => n.isRead)

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <churchIcons.bell className="h-8 w-8 text-blue-600" />
            Notifications
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white ml-2">
                {unreadCount}
              </Badge>
            )}
          </h1>
          <p className="text-gray-600 mt-1">Stay updated with church announcements and events</p>
        </div>

        {unreadCount > 0 && (
          <Button 
            variant="outline" 
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2"
          >
            <churchIcons.checkCircle className="h-4 w-4" />
            Mark All Read
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <churchIcons.bell className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Notifications</p>
                <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <churchIcons.alert className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
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
                <p className="text-sm font-medium text-gray-600">Read</p>
                <p className="text-2xl font-bold text-gray-900">{readNotifications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <churchIcons.bell className="h-4 w-4" />
            Notifications
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white ml-1 text-xs px-1.5 py-0.5">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <churchIcons.settings className="h-4 w-4" />
            Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
          {/* Unread Notifications */}
          {unreadNotifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <churchIcons.alert className="h-5 w-5 text-red-600" />
                  Unread Notifications
                  <Badge className="bg-red-100 text-red-800">{unreadNotifications.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {unreadNotifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className="border-l-4 border-blue-500 bg-blue-50 rounded-lg p-4 hover:bg-blue-100 transition-colors cursor-pointer"
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        {React.createElement(getCategoryIcon(notification.category), {
                          className: "h-5 w-5 text-gray-600"
                        })}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                          <Badge className={getPriorityColor(notification.priority || 'normal')}>
                            {notification.priority || 'normal'}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {notification.category}
                          </Badge>
                        </div>
                        <p className="text-gray-700 mb-3">{notification.content}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            {notification.createdAt ? getTimeAgo(notification.createdAt) : 'Unknown time'}
                          </span>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMarkAsRead(notification.id)
                            }}
                          >
                            Mark as Read
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Read Notifications */}
          {readNotifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <churchIcons.checkCircle className="h-5 w-5 text-green-600" />
                  Read Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {readNotifications.map((notification) => (
                  <div key={notification.id} className="border rounded-lg p-4 bg-gray-50 opacity-75">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        {React.createElement(getCategoryIcon(notification.category), {
                          className: "h-5 w-5 text-gray-400"
                        })}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-gray-700">{notification.title}</h4>
                          <Badge className={`${getPriorityColor(notification.priority || 'normal')} opacity-75`}>
                            {notification.priority || 'normal'}
                          </Badge>
                          <Badge variant="outline" className="capitalize opacity-75">
                            {notification.category}
                          </Badge>
                          <churchIcons.checkCircle className="h-4 w-4 text-green-500 ml-auto" />
                        </div>
                        <p className="text-gray-600 mb-2">{notification.content}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Received: {notification.createdAt ? getTimeAgo(notification.createdAt) : 'Unknown time'}</span>
                          {notification.readAt && (
                            <span>Read: {getTimeAgo(notification.readAt)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* No Notifications */}
          {notifications.length === 0 && !loading && (
            <Card>
              <CardContent className="text-center py-12">
                <churchIcons.bell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2 text-gray-700">No notifications yet</h3>
                <p className="text-gray-500">You'll see church announcements and updates here</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Control which types of notifications you receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {preferences && (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="general">General Notifications</Label>
                        <p className="text-sm text-gray-500">Church announcements and updates</p>
                      </div>
                      <Switch
                        id="general"
                        checked={preferences.generalNotifications || false}
                        onCheckedChange={(checked) => handlePreferenceUpdate('generalNotifications', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="events">Event Notifications</Label>
                        <p className="text-sm text-gray-500">Upcoming events and activities</p>
                      </div>
                      <Switch
                        id="events"
                        checked={preferences.eventNotifications || false}
                        onCheckedChange={(checked) => handlePreferenceUpdate('eventNotifications', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="announcements">Announcements</Label>
                        <p className="text-sm text-gray-500">Important church announcements</p>
                      </div>
                      <Switch
                        id="announcements"
                        checked={preferences.announcementNotifications || false}
                        onCheckedChange={(checked) => handlePreferenceUpdate('announcementNotifications', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="emergency">Emergency Alerts</Label>
                        <p className="text-sm text-gray-500">Urgent notifications (always enabled)</p>
                      </div>
                      <Switch
                        id="emergency"
                        checked={preferences.emergencyNotifications || false}
                        disabled
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="reminders">Reminders</Label>
                        <p className="text-sm text-gray-500">Event reminders and deadlines</p>
                      </div>
                      <Switch
                        id="reminders"
                        checked={preferences.reminderNotifications || false}
                        onCheckedChange={(checked) => handlePreferenceUpdate('reminderNotifications', checked)}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="sound">Sound Notifications</Label>
                        <p className="text-sm text-gray-500">Play sound when receiving notifications</p>
                      </div>
                      <Switch
                        id="sound"
                        checked={preferences.soundEnabled || false}
                        onCheckedChange={(checked) => handlePreferenceUpdate('soundEnabled', checked)}
                      />
                    </div>
                  </div>
                </>
              )}

              {!preferences && !loading && (
                <div className="text-center py-8 text-gray-500">
                  <churchIcons.settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No preferences found. Default settings will be used.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <churchIcons.spinner className="h-6 w-6 animate-spin text-blue-600" />
            <span>Loading notifications...</span>
          </div>
        </div>
      )}
    </div>
  )
}
