import { UserButton, useUser } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { Menu, Users, Calendar, DollarSign, Home } from '@/lib/icons'
import { churchIcons } from '@/lib/icons'
import { NotificationBadge } from '@/components/NotificationBadge'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { user } = useUser()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', icon: Home, href: '/', current: location.pathname === '/' },
    { name: 'Members', icon: Users, href: '/members', current: location.pathname === '/members' },
    { name: 'Events', icon: Calendar, href: '/events', current: location.pathname === '/events' },
    { name: 'Attendance', icon: churchIcons.attendance, href: '/attendance', current: location.pathname === '/attendance' },
    { name: 'Analytics', icon: churchIcons.chart, href: '/analytics', current: location.pathname === '/analytics' },
    { name: 'Communications', icon: churchIcons.bell, href: '/communications', current: location.pathname === '/communications' },
    { name: 'Notifications', icon: churchIcons.bell, href: '/notifications', current: location.pathname === '/notifications' },
    { name: 'Giving', icon: DollarSign, href: '/giving', current: location.pathname === '/giving' },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <div className="sticky top-0 z-40 lg:hidden">
        <div className="flex h-16 items-center gap-x-4 border-b bg-card px-4 shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </Button>
          
          <div className="flex items-center gap-2 flex-1">
            <img 
              src="/brand/logo.png" 
              alt="ChurchSuite Ghana Logo" 
              className="h-8 w-8 object-contain"
            />
            <span className="text-sm font-semibold leading-6">
              ChurchSuite Ghana
            </span>
          </div>
          
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "w-8 h-8"
              }
            }}
          />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-card px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center gap-3">
            <img 
              src="/brand/logo.png" 
              alt="ChurchSuite Ghana Logo" 
              className="h-10 w-10 object-contain"
            />
            <h1 className="text-xl font-bold">ChurchSuite Ghana</h1>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className={`group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 relative ${
                          item.current
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        }`}
                      >
                        <item.icon className="h-6 w-6 shrink-0" />
                        {item.name}
                        {item.name === 'Notifications' && (
                          <NotificationBadge className="absolute -top-1 -right-1" />
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
          
          <div className="flex items-center gap-x-4 px-2 py-3">
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8"
                }
              }}
            />
            <div className="text-sm font-semibold">
              {user?.firstName} {user?.lastName}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="relative z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-card px-6 py-6 sm:max-w-sm">
            <nav className="mt-6">
              <ul role="list" className="space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-muted-foreground hover:bg-accent hover:text-accent-foreground relative"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="h-6 w-6 shrink-0" />
                      {item.name}
                      {item.name === 'Notifications' && (
                        <NotificationBadge className="absolute -top-1 -right-1" />
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-72">
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
