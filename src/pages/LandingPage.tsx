import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { churchIcons } from '@/lib/icons'
import { useNavigate } from 'react-router-dom'

export function LandingPage() {
  const navigate = useNavigate()

  // Note: Removed automatic redirect - users must manually click Sign In/Sign Up
  // This allows the landing page to be publicly accessible for social media crawlers

  const features = [
    {
      icon: churchIcons.users,
      title: 'Member Management',
      description: 'Comprehensive member database with role-based access control, attendance tracking, and member profiles.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: churchIcons.gift,
      title: 'MoMo Giving',
      description: 'Integrated mobile money giving with MTN, Telecel, and AirtelTigo. Real-time tracking and reporting.',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: churchIcons.chart,
      title: 'Analytics & Reporting',
      description: 'Detailed insights into member growth, giving patterns, attendance trends, and church performance metrics.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: churchIcons.service,
      title: 'Sunday Services',
      description: 'Plan and manage weekly service programs, song lyrics, scripture readings, and service schedules.',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      icon: churchIcons.qrcode,
      title: 'QR Code Check-in',
      description: 'Streamlined attendance tracking with QR codes for services, events, and child check-in systems.',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      icon: churchIcons.volunteers,
      title: 'Volunteer Management',
      description: 'Organize volunteer teams, track service assignments, and manage ministry schedules efficiently.',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/brand/logo.png" alt="ChurchSuite Ghana Logo" className="w-12 h-12 object-contain" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ChurchSuite Ghana</h1>
                <p className="text-gray-600">Smart Church Management Platform</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => navigate('/sign-in')}
                className="flex items-center gap-2"
              >
                <churchIcons.checkIn className="w-4 h-4" />
                Sign In
              </Button>
              <Button 
                onClick={() => navigate('/sign-up')}
                className="flex items-center gap-2"
              >
                <churchIcons.userPlus className="w-4 h-4" />
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Transform Your Church Management
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            ChurchSuite Ghana is the complete church management solution designed specifically for Ghanaian churches. 
            Streamline operations, improve member engagement, and focus more on ministry with our mobile-first platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/sign-in')}
              className="flex items-center gap-2 text-lg px-8 py-3"
            >
              <churchIcons.checkIn className="w-5 h-5" />
              Access Your Account
            </Button>
            <Button 
              size="lg"
              onClick={() => navigate('/sign-up')}
              className="flex items-center gap-2 text-lg px-8 py-3"
            >
              <churchIcons.userPlus className="w-5 h-5" />
              Create Account
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything Your Church Needs
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From member management to financial tracking, ChurchSuite provides all the tools 
              modern churches need to thrive in the digital age.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="text-center">
                  <div className={`flex justify-center mb-4 p-3 rounded-lg ${feature.bgColor}`}>
                    <feature.icon className={`w-8 h-8 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join churches across Ghana who are already using ChurchSuite to streamline their operations, 
            improve member engagement, and focus more on ministry.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/sign-in')}
              className="flex items-center gap-2 text-lg px-8 py-3 border-white text-white bg-transparent hover:bg-white hover:text-primary transition-colors duration-200"
            >
              <churchIcons.checkIn className="w-5 h-5" />
              Sign In Now
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
                      <div className="flex items-center justify-center gap-3 mb-6">
              <img src="/brand/logo.png" alt="ChurchSuite Ghana Logo" className="w-10 h-10 object-contain" />
              <span className="text-xl font-bold">ChurchSuite Ghana</span>
            </div>
          <p className="text-gray-300 mb-4">
            © 2025 ChurchSuite Ghana. All rights reserved.
          </p>
          <p className="text-gray-400">
            Powered by The Geek Toolbox | Call 024.429.9095
          </p>
        </div>
      </div>
    </div>
  )
}
