import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { churchIcons } from '@/lib/icons'
import { getUserRole } from '@/lib/clerk'
import { 
  getAllNotifications, 
  createNotification, 
  getNotificationTemplates,
  getNotificationStatistics
} from '@/lib/api/notifications'
import type { 
  Notification,
  NotificationTemplate,
  NewNotification
} from '@/lib/db/schema'

interface NotificationStats {
  totalNotifications: number
  totalRecipients: number
  unreadNotifications: number
  readRate: number
}

export default function Communications() {
  const { user } = useUser()
  const [userRole, setUserRole] = useState<string>('')
  const [notifications, setNotifications] = useState<(Notification & { recipientCount?: number })[]>([])
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [stats, setStats] = useState<NotificationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showComposer, setShowComposer] = useState(false)

  // Notification composer form
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    content: '',
    category: 'general' as const,
    priority: 'normal' as const,
    targetType: 'all' as const,
    icon: '',
    color: '',
    actionType: 'none' as const,
    expiresAt: ''
  })

  useEffect(() => {
    if (user) {
      const role = getUserRole(user.publicMetadata || {})
      setUserRole(role)
    }
  }, [user])

  const loadData = async () => {
    try {
      setLoading(true)
      const [notificationsResult, templatesResult, statsResult] = await Promise.all([
        getAllNotifications(),
        getNotificationTemplates(),
        getNotificationStatistics()
      ])

      if (notificationsResult.ok && notificationsResult.data) {
        setNotifications(notificationsResult.data)
      }

      if (templatesResult.ok && templatesResult.data) {
        setTemplates(templatesResult.data)
      }

      if (statsResult.ok && statsResult.data) {
        setStats(statsResult.data)
      }
    } catch (error) {
      console.error('Error loading communications data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const canManageNotifications = ['admin', 'pastor', 'leader'].includes(userRole)

  if (!canManageNotifications) {
    return (
      <div className="container mx-auto py-6 px-4">
        <Alert>
          <churchIcons.alert className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access communications management.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)

    try {
      const notificationData: NewNotification = {
        title: notificationForm.title,
        content: notificationForm.content,
        category: notificationForm.category,
        priority: notificationForm.priority,
        targetType: notificationForm.targetType,
        icon: notificationForm.icon || null,
        color: notificationForm.color || null,
        actionType: notificationForm.actionType,
        actionData: null,
        targetCriteria: null,
        expiresAt: notificationForm.expiresAt ? new Date(notificationForm.expiresAt) : null,
        createdBy: user?.id
      }

      const result = await createNotification(notificationData)

      if (result.ok) {
        setShowComposer(false)
        setNotificationForm({
          title: '',
          content: '',
          category: 'general',
          priority: 'normal',
          targetType: 'all',
          icon: '',
          color: '',
          actionType: 'none',
          expiresAt: ''
        })
        await loadData() // Refresh the data
      } else {
        console.error('Failed to send notification:', result.error)
      }
    } catch (error) {
      console.error('Error sending notification:', error)
    } finally {
      setSending(false)
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

  return (
    <div className="container mx-auto py-6 px-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <churchIcons.bell className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            Communications Center
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage in-app notifications and member communications</p>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowComposer(true)}
            className="border-blue-200 text-blue-700 hover:bg-blue-50 text-sm"
            size="sm"
          >
            <churchIcons.template className="h-4 w-4 mr-2" />
            Use Template
          </Button>
          <Dialog open={showComposer} onOpenChange={setShowComposer}>
            <DialogTrigger asChild onClick={() => setShowComposer(true)}>
              <Button className="bg-blue-600 hover:bg-blue-700 text-sm" size="sm">
                <churchIcons.add className="h-4 w-4 mr-2" />
                Send New Notification
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Send New Notification</DialogTitle>
                <DialogDescription>
                  Create and send a notification to church members
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSendNotification} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Notification Title</Label>
                    <Input
                      id="title"
                      value={notificationForm.title}
                      onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter notification title..."
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={notificationForm.category} onValueChange={(value: any) => setNotificationForm(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="announcement">Announcement</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                        <SelectItem value="reminder">Reminder</SelectItem>
                        <SelectItem value="welcome">Welcome</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Message Content</Label>
                  <Textarea
                    id="content"
                    value={notificationForm.content}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter your message..."
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={notificationForm.priority} onValueChange={(value: any) => setNotificationForm(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetType">Send To</Label>
                    <Select value={notificationForm.targetType} onValueChange={(value: any) => setNotificationForm(prev => ({ ...prev, targetType: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Members</SelectItem>
                        <SelectItem value="role">Specific Roles</SelectItem>
                        <SelectItem value="individual">Individual Member</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    value={notificationForm.expiresAt}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowComposer(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={sending}>
                    {sending ? (
                      <>
                        <churchIcons.spinner className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <churchIcons.send className="h-4 w-4 mr-2" />
                        Send Notification
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Actions Banner */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-full">
                <churchIcons.megaphone className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-blue-900">Ready to communicate?</h3>
                <p className="text-sm text-blue-700">Send notifications to keep your church members informed and engaged</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowComposer(true)}
                className="border-blue-300 text-blue-700 hover:bg-blue-100 text-sm"
                size="sm"
              >
                <churchIcons.template className="h-4 w-4 mr-2" />
                Use Template
              </Button>
              <Button 
                onClick={() => setShowComposer(true)}
                className="bg-blue-600 hover:bg-blue-700 text-sm"
                size="sm"
              >
                <churchIcons.add className="h-4 w-4 mr-2" />
                Send New Message
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <churchIcons.bell className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Notifications</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalNotifications}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <churchIcons.users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Recipients</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRecipients}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <churchIcons.alert className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Unread</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.unreadNotifications}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <churchIcons.checkCircle className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Read Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.round(stats.readRate * 100)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="border-t pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <churchIcons.chart className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <churchIcons.bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <churchIcons.template className="h-4 w-4" />
              Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Quick Start Guide */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <churchIcons.info className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-green-900 mb-2">How to Send Notifications</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-green-800">
                      <div className="flex items-start gap-2">
                        <span className="font-semibold">1.</span>
                        <span>Click "Send New Message" to create a notification from scratch</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-semibold">2.</span>
                        <span>Use "Use Template" to start with a pre-built message</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-semibold">3.</span>
                        <span>Choose your audience (all members, specific roles, or individuals)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Recent notifications and member engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.slice(0, 5).map((notification) => (
                    <div key={notification.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        {React.createElement(getCategoryIcon(notification.category), {
                          className: "h-5 w-5 text-gray-600"
                        })}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{notification.title}</h4>
                        <p className="text-sm text-gray-600 truncate">{notification.content}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={getPriorityColor(notification.priority || 'normal')}>
                          {notification.priority || 'normal'}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {notification.recipientCount || 0} recipients
                        </p>
                      </div>
                    </div>
                  ))}

                  {notifications.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <churchIcons.bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No notifications sent yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Notifications</CardTitle>
                <CardDescription>
                  Manage and track all sent notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-gray-100 rounded-lg">
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
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <churchIcons.users className="h-4 w-4" />
                              {notification.recipientCount || 0} recipients
                            </span>
                            <span className="flex items-center gap-1">
                              <churchIcons.clock className="h-4 w-4" />
                              {notification.createdAt ? new Date(notification.createdAt).toLocaleDateString() : 'Unknown date'}
                            </span>
                            {notification.expiresAt && (
                              <span className="flex items-center gap-1">
                                <churchIcons.calendar className="h-4 w-4" />
                                Expires {new Date(notification.expiresAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {notifications.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <churchIcons.bell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium mb-2">No notifications yet</h3>
                      <p className="mb-4">Start engaging with your church members by sending notifications</p>
                      <Button onClick={() => setShowComposer(true)}>
                        <churchIcons.add className="h-4 w-4 mr-2" />
                        Send First Notification
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Templates</CardTitle>
                <CardDescription>
                  Pre-built templates for common notification types
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map((template) => (
                    <div key={template.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {React.createElement(getCategoryIcon(template.category), {
                            className: "h-5 w-5 text-gray-600"
                          })}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{template.name}</h4>
                          <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="outline" className="capitalize text-xs">
                              {template.category}
                            </Badge>
                            <Badge className={`text-xs ${getPriorityColor(template.priority || 'normal')}`}>
                              {template.priority || 'normal'}
                            </Badge>
                          </div>
                          <div className="bg-gray-100 rounded p-3 mb-3">
                            <p className="font-medium text-sm text-gray-900 mb-1">{template.title}</p>
                            <p className="text-sm text-gray-700">{template.content}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setNotificationForm(prev => ({
                                  ...prev,
                                  title: template.title,
                                  content: template.content,
                                  category: template.category as any,
                                  priority: template.priority as any,
                                  icon: template.icon || '',
                                  color: template.color || ''
                                }))
                                setShowComposer(true)
                              }}
                            >
                              <churchIcons.copy className="h-4 w-4 mr-2" />
                              Use Template
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                setNotificationForm(prev => ({
                                  ...prev,
                                  title: template.title,
                                  content: template.content,
                                  category: template.category as any,
                                  priority: template.priority as any,
                                  icon: template.icon || '',
                                  color: template.color || ''
                                }))
                                setShowComposer(true)
                              }}
                            >
                              <churchIcons.send className="h-4 w-4 mr-2" />
                              Send Now
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {templates.length === 0 && (
                    <div className="col-span-2 text-center py-8 text-gray-500">
                      <churchIcons.template className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No templates available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <churchIcons.spinner className="h-6 w-6 animate-spin text-blue-600" />
            <span>Loading communications...</span>
          </div>
        </div>
      )}
    </div>
  )
}
