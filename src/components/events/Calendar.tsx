import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { churchIcons } from '@/lib/icons'
import type { ChurchEvent } from '@/lib/db/schema'
import { cn } from '@/lib/utils'

interface CalendarProps {
  events: ChurchEvent[]
  onEventClick?: (event: ChurchEvent) => void
  onDateClick?: (date: Date) => void
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export function Calendar({ events, onEventClick, onDateClick }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  
  const { year, month } = useMemo(() => ({
    year: currentDate.getFullYear(),
    month: currentDate.getMonth()
  }), [currentDate])
  
  // Get the first day of the month and how many days in the month
  const firstDayOfMonth = useMemo(() => new Date(year, month, 1), [year, month])

  const startDate = useMemo(() => {
    const date = new Date(firstDayOfMonth)
    date.setDate(date.getDate() - firstDayOfMonth.getDay()) // Start from Sunday
    return date
  }, [firstDayOfMonth])
  

  
  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days = []
    const totalDays = 42 // 6 weeks × 7 days
    
    for (let i = 0; i < totalDays; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      days.push(date)
    }
    
    return days
  }, [startDate])
  
  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, ChurchEvent[]> = {}
    
    events.forEach(event => {
      const eventDate = new Date(event.startDate)
      const dateKey = eventDate.toDateString()
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(event)
    })
    
    return grouped
  }, [events])
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }
  
  const goToToday = () => {
    setCurrentDate(new Date())
  }
  
  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }
  
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === month && date.getFullYear() === year
  }
  
  const getEventsForDate = (date: Date) => {
    return eventsByDate[date.toDateString()] || []
  }
  
  const eventTypeColors = {
    service: 'bg-blue-500',
    'bible-study': 'bg-green-500',
    'prayer-meeting': 'bg-purple-500',
    outreach: 'bg-orange-500',
    fellowship: 'bg-yellow-500',
    conference: 'bg-red-500',
    special: 'bg-pink-500',
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <churchIcons.events className="h-5 w-5" />
            Calendar
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <churchIcons.chevronUp className="h-4 w-4 rotate-[-90deg]" />
            </Button>
            
            <div className="flex items-center gap-2 min-w-[200px] justify-center">
              <h2 className="text-lg font-semibold">
                {MONTHS[month]} {year}
              </h2>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <churchIcons.chevronUp className="h-4 w-4 rotate-90" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="ml-2"
            >
              Today
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {DAYS.map(day => (
            <div
              key={day}
              className="p-2 text-center text-sm font-medium text-gray-500 border-b"
            >
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendarDays.map((date, index) => {
            const dayEvents = getEventsForDate(date)
            const isCurrentMonthDay = isCurrentMonth(date)
            const isTodayDate = isToday(date)
            
            return (
              <div
                key={index}
                className={cn(
                  "min-h-[100px] p-1 border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors",
                  !isCurrentMonthDay && "text-gray-300 bg-gray-50",
                  isTodayDate && "bg-church-burgundy-50 border-church-burgundy-200"
                )}
                onClick={() => onDateClick?.(date)}
              >
                <div className={cn(
                  "text-sm font-medium mb-1",
                  isTodayDate && "text-church-burgundy-700"
                )}>
                  {date.getDate()}
                </div>
                
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className={cn(
                        "text-xs p-1 rounded text-white cursor-pointer hover:opacity-80 transition-opacity truncate",
                        eventTypeColors[event.eventType as keyof typeof eventTypeColors] || 'bg-gray-500'
                      )}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEventClick?.(event)
                      }}
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                  
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 px-1">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Legend */}
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Event Types</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(eventTypeColors).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1">
                <div className={cn("w-3 h-3 rounded", color)} />
                <span className="text-xs text-gray-600">
                  {type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
