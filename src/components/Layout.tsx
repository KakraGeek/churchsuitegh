import { UserButton, useUser } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { Menu, Users, Calendar, DollarSign, Home } from '@/lib/icons'
import { churchIcons } from '@/lib/icons'
import { NotificationBadge } from '@/components/NotificationBadge'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { NavLink } from 'react-router-dom'
import { getUserRole } from '@/lib/clerk'

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
    { name: 'Children', icon: churchIcons.children, href: '/children', current: location.pathname === '/children' },
    { name: 'Volunteers', icon: churchIcons.volunteers, href: '/volunteers', current: location.pathname === '/volunteers' },
    { name: 'Inventory', icon: churchIcons.inventory, href: '/inventory', current: location.pathname === '/inventory' },
    { name: 'Analytics', icon: churchIcons.chart, href: '/analytics', current: location.pathname === '/analytics' },
    { name: 'Communications', icon: churchIcons.bell, href: '/communications', current: location.pathname === '/communications' },
    { name: 'Notifications', icon: churchIcons.bell, href: '/notifications', current: location.pathname === '/notifications' },
    { name: 'Giving', icon: DollarSign, href: '/giving', current: location.pathname === '/giving' },
  ]

  const userRole = getUserRole(user?.publicMetadata || {})
  const canManageVolunteers = userRole === 'admin' || userRole === 'pastor' || userRole === 'leader'

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <img
              className="h-8 w-auto"
              src="/brand/logo.png"
              alt="ChurchSuite"
            />
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={`group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 ${
                          item.current
                            ? 'bg-gray-800 text-white'
                            : 'text-gray-300 hover:text-white hover:bg-gray-800'
                        }`}
                      >
                        <item.icon className="h-6 w-6 shrink-0" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {canManageVolunteers && (
                    <NavLink
                      to="/volunteers"
                      className={({ isActive }) => `group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 relative ${
                        isActive
                          ? 'bg-gray-800 text-white'
                          : 'text-gray-300 hover:text-white hover:bg-gray-800'
                      }`}
                    >
                      <churchIcons.volunteers className="h-6 w-6 shrink-0" />
                      <span className="sr-only">Volunteers</span>
                      Volunteers
                    </NavLink>
                  )}

                  <NavLink
                    to="/sunday-service"
                    className={({ isActive }) => `group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 relative ${
                      isActive
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <churchIcons.sundayService className="h-6 w-6 shrink-0" />
                    <span className="sr-only">Sunday Service</span>
                    Sunday Service
                  </NavLink>
                </ul>
              </li>
            </ul>
          </nav>
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
