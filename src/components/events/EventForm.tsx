import { useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { churchIcons } from '@/lib/icons'
import { createEvent, updateEvent } from '@/lib/api/events'
import type { ChurchEvent, NewChurchEvent } from '@/lib/db/schema'


interface EventFormProps {
  event?: ChurchEvent
  onSuccess: (event: ChurchEvent) => void
  onCancel: () => void
}

const eventTypes = [
  { value: 'service', label: 'Service' },
  { value: 'bible-study', label: 'Bible Study' },
  { value: 'prayer-meeting', label: 'Prayer Meeting' },
  { value: 'outreach', label: 'Outreach' },
  { value: 'fellowship', label: 'Fellowship' },
  { value: 'conference', label: 'Conference' },
  { value: 'special', label: 'Special Event' },
]

const recurringPatterns = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
]

const eventStatuses = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'postponed', label: 'Postponed' },
  { value: 'completed', label: 'Completed' },
]

export function EventForm({ event, onSuccess, onCancel }: EventFormProps) {
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Convert dates to local timezone for form inputs
  const formatDateForInput = (date: Date | string | null) => {
    if (!date) return ''
    const d = new Date(date)
    return d.toISOString().slice(0, 16) // Format: YYYY-MM-DDTHH:MM
  }
  
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    startDate: formatDateForInput(event?.startDate || null),
    endDate: formatDateForInput(event?.endDate || null),
    location: event?.location || '',
    eventType: event?.eventType || 'service',
    maxAttendees: event?.maxAttendees?.toString() || '',
    isPublic: event?.isPublic ?? true,
    isRecurring: event?.isRecurring ?? false,
    recurringPattern: event?.recurringPattern || 'weekly',
    recurringEndDate: formatDateForInput(event?.recurringEndDate || null),
    requiresRegistration: event?.requiresRegistration ?? false,
    cost: event?.cost ? (event.cost / 100).toString() : '0',
    imageUrl: event?.imageUrl || '',
    tags: event?.tags || '',
    status: event?.status || 'scheduled',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Convert form data to API format
      const eventData: NewChurchEvent = {
        title: formData.title,
        description: formData.description || undefined,
        startDate: new Date(formData.startDate),
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        location: formData.location || undefined,
        eventType: formData.eventType as 'service' | 'bible-study' | 'prayer-meeting' | 'outreach' | 'fellowship' | 'conference' | 'special',
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined,
        isPublic: formData.isPublic,
        isRecurring: formData.isRecurring,
        recurringPattern: formData.isRecurring ? formData.recurringPattern as 'weekly' | 'monthly' | 'yearly' : undefined,
        recurringEndDate: formData.isRecurring && formData.recurringEndDate ? new Date(formData.recurringEndDate) : undefined,
        requiresRegistration: formData.requiresRegistration,
        cost: Math.round(parseFloat(formData.cost) * 100), // Convert to pesewas
        imageUrl: formData.imageUrl || undefined,
        tags: formData.tags || undefined,
        status: formData.status as 'scheduled' | 'cancelled' | 'postponed' | 'completed',
        createdBy: event?.createdBy || user?.id || undefined,
      }

      const result = event 
        ? await updateEvent(event.id, eventData)
        : await createEvent(eventData)

      if (result.ok && result.data) {
        onSuccess(result.data)
      } else {
        setError(result.error || 'An unexpected error occurred')
      }
    } catch (err) {
      setError('Failed to save event. Please try again.')
      console.error('Event form error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError(null)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <churchIcons.events className="h-5 w-5" />
          {event ? 'Edit Event' : 'Create New Event'}
        </CardTitle>
        <CardDescription>
          {event ? 'Update event details and settings' : 'Fill in the details for your new church event'}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <churchIcons.alertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Sunday Morning Service"
                  required
                />
              </div>
              
              <div className="sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Join us for worship, prayer, and the Word of God"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="eventType">Event Type *</Label>
                <Select
                  value={formData.eventType}
                  onValueChange={(value) => handleInputChange('eventType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Event Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select event status" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            status.value === 'scheduled' ? 'bg-green-500' :
                            status.value === 'cancelled' ? 'bg-red-500' :
                            status.value === 'postponed' ? 'bg-yellow-500' :
                            'bg-gray-500'
                          }`} />
                          {status.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Main Sanctuary"
                />
              </div>
            </div>
          </div>

          {/* Date and Time */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Date & Time</h3>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="startDate">Start Date & Time *</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="endDate">End Date & Time</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Event Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Event Settings</h3>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="maxAttendees">Max Attendees</Label>
                <Input
                  id="maxAttendees"
                  type="number"
                  min="1"
                  value={formData.maxAttendees}
                  onChange={(e) => handleInputChange('maxAttendees', e.target.value)}
                  placeholder="No limit"
                />
              </div>
              
              <div>
                <Label htmlFor="cost">Cost (GHS)</Label>
                <Input
                  id="cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => handleInputChange('cost', e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Public Event</Label>
                  <p className="text-sm text-gray-600">Make this event visible to all members</p>
                </div>
                <Switch
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Requires Registration</Label>
                  <p className="text-sm text-gray-600">Members must register to attend</p>
                </div>
                <Switch
                  checked={formData.requiresRegistration}
                  onCheckedChange={(checked) => handleInputChange('requiresRegistration', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Recurring Event</Label>
                  <p className="text-sm text-gray-600">This event repeats on a schedule</p>
                </div>
                <Switch
                  checked={formData.isRecurring}
                  onCheckedChange={(checked) => handleInputChange('isRecurring', checked)}
                />
              </div>
            </div>
            
            {formData.isRecurring && (
              <div className="grid gap-4 sm:grid-cols-2 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="recurringPattern">Repeat Pattern</Label>
                  <Select
                    value={formData.recurringPattern}
                    onValueChange={(value) => handleInputChange('recurringPattern', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {recurringPatterns.map((pattern) => (
                        <SelectItem key={pattern.value} value={pattern.value}>
                          {pattern.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="recurringEndDate">Stop Repeating</Label>
                  <Input
                    id="recurringEndDate"
                    type="datetime-local"
                    value={formData.recurringEndDate}
                    onChange={(e) => handleInputChange('recurringEndDate', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Information</h3>
            
            <div>
              <Label htmlFor="imageUrl">Event Image URL</Label>
              <Input
                id="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                placeholder="https://example.com/event-image.jpg"
              />
            </div>
            
            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                placeholder="worship, sunday, main-service"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.title || !formData.startDate}
              className="bg-church-burgundy-600 hover:bg-church-burgundy-700"
            >
              {loading ? (
                <>
                  <churchIcons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  {event ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <churchIcons.check className="mr-2 h-4 w-4" />
                  {event ? 'Update Event' : 'Create Event'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
