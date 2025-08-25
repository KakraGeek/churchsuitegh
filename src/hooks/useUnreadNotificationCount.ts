import { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { getUnreadNotificationCount } from '@/lib/api/notifications'
import { getMemberByClerkId } from '@/lib/api/members'

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
