import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { churchIcons } from '@/lib/icons'
import { ChildRegistrationForm } from '@/components/children/ChildRegistrationForm'
import { ChildCheckIn } from '@/components/children/ChildCheckIn'

export default function Children() {
  const [activeTab, setActiveTab] = useState('checkin')
  const [recentActions, setRecentActions] = useState<string[]>([])

  const handleRegistrationSuccess = (childId: string) => {
    setRecentActions(prev => [`Child registered successfully (ID: ${childId})`, ...prev.slice(0, 4)])
  }

  const handleCheckInSuccess = (message: string) => {
    setRecentActions(prev => [message, ...prev.slice(0, 4)])
  }

  const handleCheckOutSuccess = (message: string) => {
    setRecentActions(prev => [message, ...prev.slice(0, 4)])
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <img 
              src="/brand/logo.png" 
              alt="ChurchSuite Ghana Logo" 
              className="h-16 w-16 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold">Children's Ministry</h1>
          <p className="text-muted-foreground">
            Secure child check-in and check-out system
          </p>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-1">
            <TabsTrigger value="checkin" className="flex items-center gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2">
              <churchIcons.qrcode className="h-4 w-4" />
              Check-In/Out
            </TabsTrigger>
            <TabsTrigger value="register" className="flex items-center gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2">
              <churchIcons.userPlus className="h-4 w-4" />
              Register Child
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2">
              <churchIcons.users className="h-4 w-4" />
              Overview
            </TabsTrigger>
          </TabsList>

          {/* Check-In/Out Tab */}
          <TabsContent value="checkin" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Check-In Interface */}
              <div className="lg:col-span-2">
                <ChildCheckIn 
                  onCheckInSuccess={handleCheckInSuccess}
                  onCheckOutSuccess={handleCheckOutSuccess}
                />
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Currently Checked In</span>
                      <span className="text-2xl font-bold text-green-600">0</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Children</span>
                      <span className="text-2xl font-bold text-blue-600">0</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Today's Check-ins</span>
                      <span className="text-2xl font-bold text-purple-600">0</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Actions */}
                {recentActions.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Recent Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {recentActions.map((action, index) => (
                          <div 
                            key={index} 
                            className="text-sm p-2 bg-muted rounded-md"
                          >
                            {action}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Register Child Tab */}
          <TabsContent value="register" className="space-y-6">
            <div className="max-w-4xl mx-auto">
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <churchIcons.info className="h-5 w-5" />
                    Important Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-blue-800 space-y-3">
                  <p>
                    <strong>Before registering a child:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Ensure you have parental/guardian consent</li>
                    <li>Collect emergency contact information</li>
                    <li>Note any medical conditions or allergies</li>
                    <li>Verify the child's age (must be under 18)</li>
                  </ul>
                  <p className="text-sm mt-4">
                    All child registrations are logged for security purposes and require proper authorization.
                  </p>
                </CardContent>
              </Card>

              <ChildRegistrationForm onSuccess={handleRegistrationSuccess} />
            </div>
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Security Features */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <churchIcons.admin className="h-5 w-5" />
                    Security Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <churchIcons.check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">QR code authentication</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <churchIcons.check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Audit trail logging</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <churchIcons.check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Guardian verification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <churchIcons.check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Emergency contact system</span>
                  </div>
                </CardContent>
              </Card>

              {/* Safety Protocols */}
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <churchIcons.alertCircle className="h-5 w-5" />
                    Safety Protocols
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <churchIcons.check className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Medical alert system</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <churchIcons.check className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Check-in/out verification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <churchIcons.check className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Location tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <churchIcons.check className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Emergency notifications</span>
                  </div>
                </CardContent>
              </Card>

              {/* Parent Benefits */}
              <Card className="border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-800">
                    <churchIcons.heart className="h-5 w-5" />
                    Parent Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <churchIcons.check className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">Peace of mind</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <churchIcons.check className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">Real-time updates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <churchIcons.check className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">Secure check-in/out</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <churchIcons.check className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">Emergency contact system</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                                  <CardTitle className="flex items-center gap-2 text-amber-800">
                    <churchIcons.phone className="h-5 w-5" />
                    Need Help?
                  </CardTitle>
              </CardHeader>
              <CardContent className="text-amber-800">
                <p className="mb-3">
                  If you have questions about the child check-in system or need assistance:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold">Children's Ministry Leader</p>
                    <p className="text-sm">Available during services</p>
                  </div>
                  <div>
                    <p className="font-semibold">Technical Support</p>
                    <p className="text-sm">Contact church administration</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
