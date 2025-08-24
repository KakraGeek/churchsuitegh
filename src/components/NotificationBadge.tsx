import { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { Badge } from '@/components/ui/badge'
import { getUnreadNotificationCount } from '@/lib/api/notifications'
import { getMemberByClerkId } from '@/lib/api/members'

interface NotificationBadgeProps {
  className?: string
  showZero?: boolean
}

export function NotificationBadge({ className = '', showZero = false }: NotificationBadgeProps) {
  const { user } = useUser()
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUnreadCount = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        // Get member ID from Clerk user
        const memberResult = await getMemberByClerkId(user.id)
        if (memberResult.ok && memberResult.data) {
          const countResult = await getUnreadNotificationCount(memberResult.data.id)
          if (countResult.ok) {
            setUnreadCount(countResult.data || 0)
          } else {
            setUnreadCount(0) // Default to 0 on error
          }
        } else {
          setUnreadCount(0) // Default to 0 if member not found
        }
      } catch (error) {
        console.error('Error loading unread count:', error)
        setUnreadCount(0) // Default to 0 on error
      } finally {
        setLoading(false)
      }
    }

    loadUnreadCount()

    // Refresh count every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [user])

  if (loading || (!showZero && unreadCount === 0)) {
    return null
  }

  return (
    <Badge 
      className={`bg-red-500 text-white text-xs px-1.5 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center ${className}`}
    >
      {unreadCount > 99 ? '99+' : unreadCount}
    </Badge>
  )
}

// Hook for getting unread count in other components
export function useUnreadNotificationCount() {
  const { user } = useUser()
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUnreadCount = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const memberResult = await getMemberByClerkId(user.id)
        if (memberResult.ok && memberResult.data) {
          const countResult = await getUnreadNotificationCount(memberResult.data.id)
          if (countResult.ok) {
            setUnreadCount(countResult.data || 0)
          } else {
            setUnreadCount(0) // Default to 0 on error
          }
        } else {
          setUnreadCount(0) // Default to 0 if member not found
        }
      } catch (error) {
        console.error('Error loading unread count:', error)
        setUnreadCount(0) // Default to 0 on error
      } finally {
        setLoading(false)
      }
    }

    loadUnreadCount()

    // Refresh count every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [user])

  return { unreadCount, loading }
}
