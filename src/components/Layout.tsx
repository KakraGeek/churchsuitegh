import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { UserButton, useUser } from '@clerk/clerk-react'
import { Menu, X, Home, Users, Calendar, BarChart3, Gift, Bell, Settings, Package, Child, CheckSquare, Users2 } from 'lucide-react'
// import { PWAUpdateNotification } from '@/components/PWAUpdateNotification'
// import { PWAStatus } from '@/components/PWAStatus'
import { NotificationBadge } from '@/components/NotificationBadge'
import { useUnreadNotificationCount } from '@/hooks/useUnreadNotificationCount'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { user } = useUser()
  const { signOut } = useClerk()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

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

  const handleSignOut = () => {
    signOut(() => {
      // Redirect to landing page after successful sign-out
      navigate('/')
    })
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <img
              className="h-10 w-auto"
              src="/brand/logo.png"
              alt="ChurchSuite Ghana"
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
                   <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-card px-4 sm:px-6 py-4 sm:py-6 sm:max-w-sm">
           {/* Close button */}
           <div className="flex items-center justify-between mb-4 sm:mb-6">
             <div className="flex items-center gap-3">
               <img
                 className="h-8 w-auto"
                 src="/brand/logo.png"
                 alt="ChurchSuite Ghana"
               />
               <h2 className="text-base sm:text-lg font-semibold text-gray-900">Menu</h2>
             </div>
             <Button
               type="button"
               variant="ghost"
               size="sm"
               className="text-gray-500 hover:text-gray-700"
               onClick={() => setSidebarOpen(false)}
             >
               <span className="sr-only">Close sidebar</span>
               <X className="h-5 w-5" />
             </Button>
           </div>
           
           <nav className="mt-4 sm:mt-6">
              <ul role="list" className="space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className="group flex gap-x-3 rounded-md p-2 sm:p-2 text-sm font-semibold leading-6 text-muted-foreground hover:bg-accent hover:text-accent-foreground relative"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
                      <span className="text-sm sm:text-base">{item.name}</span>
                      {item.name === 'Notifications' && (
                        <NotificationBadge className="absolute -top-1 -right-1" />
                      )}
                    </a>
                  </li>
                ))}
                
                {/* Additional navigation items for mobile */}
                {canManageVolunteers && (
                  <li>
                    <a
                      href="/volunteers"
                      className="group flex gap-x-3 rounded-md p-2 sm:p-2 text-sm font-semibold leading-6 text-muted-foreground hover:bg-accent hover:text-accent-foreground relative"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <churchIcons.volunteers className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
                      <span className="text-sm sm:text-base">Volunteers</span>
                    </a>
                  </li>
                )}
                
                <li>
                  <a
                    href="/sunday-service"
                    className="group flex gap-x-3 rounded-md p-2 sm:p-2 text-sm font-semibold leading-6 text-muted-foreground hover:bg-accent hover:text-accent-foreground relative"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <churchIcons.sundayService className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
                    <span className="text-sm sm:text-base">Sunday Service</span>
                  </a>
                </li>
                
                {/* Logout option in mobile sidebar */}
                <li className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      handleSignOut()
                      setSidebarOpen(false)
                    }}
                    className="group flex w-full gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <svg className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                    </svg>
                    <span className="text-sm sm:text-base">Sign Out</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}

      {/* Desktop header */}
      <div className="hidden lg:block">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-6 shadow-sm">
          <div className="flex flex-1 gap-x-4 self-stretch">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4">
              {/* <PWAStatus /> */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="text-gray-700 hover:text-gray-900"
              >
                Sign Out
              </Button>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="lg:hidden">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-3 sm:gap-x-4 border-b border-gray-200 bg-white px-3 sm:px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="-m-2.5 p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </Button>

          {/* Mobile Logo */}
          <div className="flex flex-1 justify-center">
            <img
              className="h-8 w-auto"
              src="/brand/logo.png"
              alt="ChurchSuite Ghana"
            />
          </div>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="text-gray-700 hover:text-gray-900"
              >
                Sign Out
              </Button>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        <main className="py-4 sm:py-6">
          <div className="px-3 sm:px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="lg:pl-72">
        <div className="border-t border-gray-200 bg-white px-3 sm:px-4 py-4 sm:py-6 sm:px-6 lg:px-8">
          <div className="text-center text-xs sm:text-sm text-gray-600">
            © 2025 ChurchSuiteGH. All rights reserved. | Powered by The Geek Toolbox. | Call 024.429.9095
          </div>
        </div>
      </footer>
      
      {/* PWA Install Prompt - temporarily disabled */}
      {/* <PWAInstallPrompt /> */}
      
      {/* PWA Update Notification - temporarily disabled */}
      {/* <PWAUpdateNotification /> */}
    </div>
  )
}
