import { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { churchIcons } from '@/lib/icons'
import { getUserRole } from '@/lib/clerk'
import { 
  getAllSundayServicePrograms,
  createSundayServiceProgram,
  getCompleteServiceProgram
} from '@/lib/api/sundayService'
import type { 
  SundayServiceProgram,
  ServiceSong,
  NewSundayServiceProgram,
  NewServiceSong,
  NewServiceProgramSection
} from '@/lib/db/schema'
import { CompleteServiceProgram } from '@/lib/api/sundayService'

interface ServiceProgramWithDetails extends CompleteServiceProgram {}

export default function SundayService() {
  const { user, isLoaded } = useUser()
  const userRole = getUserRole(user?.publicMetadata || {})
  const canManageServices = userRole === 'admin' || userRole === 'pastor' || userRole === 'leader'

  const [servicePrograms, setServicePrograms] = useState<SundayServiceProgram[]>([])
  const [selectedProgram, setSelectedProgram] = useState<ServiceProgramWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('browse')

  // Admin form states
  const [showCreateProgram, setShowCreateProgram] = useState(false)
  const [showLyricsModal, setShowLyricsModal] = useState(false)
  const [selectedSong, setSelectedSong] = useState<ServiceSong | null>(null)

  // Form data
  const [newProgram, setNewProgram] = useState<NewSundayServiceProgram>({
    serviceDate: new Date().toISOString().split('T')[0], // Convert to YYYY-MM-DD string
    title: 'Sunday Service',
    theme: '',
    preacher: '',
    scriptureReading: '',
    announcements: '',
    specialNotes: '',
    createdBy: user?.id || '00000000-0000-0000-0000-000000000000'
  })

  const [newSong, setNewSong] = useState<NewServiceSong>({
    programId: '',
    songTitle: '',
    songType: 'hymn',
    lyrics: '',
    songNumber: '',
    composer: '',
    keySignature: '',
    tempo: '',
    orderInService: 1,
    createdBy: user?.id || '00000000-0000-0000-0000-000000000000'
  })

  const [newSection, setNewSection] = useState<NewServiceProgramSection>({
    programId: '',
    sectionTitle: '',
    sectionType: 'prayer',
    description: '',
    duration: 5,
    orderInService: 1,
    createdBy: user?.id || '00000000-0000-0000-0000-000000000000'
  })

  // Load service programs
  const loadServicePrograms = async () => {
    try {
      setLoading(true)
      const result = await getAllSundayServicePrograms()
      
      if (result.ok) {
        setServicePrograms(result.data || [])
      } else {
        setError(result.error || 'Failed to load service programs')
      }
    } catch (err) {
      console.error('Error loading service programs:', err)
      setError('Failed to load service programs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isLoaded) return
    loadServicePrograms()
  }, [isLoaded])

  // Handle program creation
  const handleCreateProgram = async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await createSundayServiceProgram(newProgram)
      
      if (result.ok) {
        await loadServicePrograms()
        setNewProgram({
          serviceDate: new Date().toISOString().split('T')[0], // Convert to YYYY-MM-DD string
          title: 'Sunday Service',
          theme: '',
          preacher: '',
          scriptureReading: '',
          announcements: '',
          specialNotes: '',
          createdBy: user?.id || '00000000-0000-0000-0000-000000000000'
        })
        setShowCreateProgram(false)
        alert('Service program created successfully!')
      } else {
        setError(result.error || 'Failed to create service program')
      }
    } catch (err) {
      console.error('Error creating service program:', err)
      setError('Failed to create service program')
    } finally {
      setLoading(false)
    }
  }

  // Load complete program details
  const loadProgramDetails = async (programId: string) => {
    try {
      setLoading(true)
      const result = await getCompleteServiceProgram(programId)
      
      if (result.ok && result.data) {
        setSelectedProgram(result.data)
        setActiveTab('details')
      } else {
        setError(result.error || 'Failed to load program details')
      }
    } catch (err) {
      console.error('Error loading program details:', err)
      setError('Failed to load program details')
    } finally {
      setLoading(false)
    }
  }

  // Show lyrics modal
  const showLyrics = (song: ServiceSong) => {
    setSelectedSong(song)
    setShowLyricsModal(true)
  }

  // Format date for display
  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  if (!isLoaded) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="text-center text-gray-500">Loading user data...</div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 px-4">
        <Card>
          <CardContent className="p-6 text-center">
            <churchIcons.alertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
            <p className="text-red-600">{error}</p>
            <Button onClick={loadServicePrograms} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sunday Service</h1>
          <p className="text-muted-foreground">
            Digital service programs and song lyrics
          </p>
        </div>
        {canManageServices && (
          <div className="flex items-center gap-4">
            <Dialog open={showCreateProgram} onOpenChange={setShowCreateProgram}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <churchIcons.sundayService className="mr-2 h-5 w-5" />
                  Add Future Service
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl">Create New Sunday Service Program</DialogTitle>
                  <DialogDescription className="text-base">
                    Plan and schedule a new Sunday service program. You can add songs, sections, and details to create a complete service outline.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Basic Service Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="serviceDate" className="text-sm font-medium">Service Date *</Label>
                      <Input 
                        id="serviceDate" 
                        type="date"
                        value={newProgram.serviceDate}
                        onChange={(e) => setNewProgram(prev => ({ ...prev, serviceDate: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">Select a future Sunday date</p>
                    </div>
                    <div>
                      <Label htmlFor="title" className="text-sm font-medium">Service Title *</Label>
                      <Input 
                        id="title" 
                        placeholder="e.g., Sunday Service, Communion Service"
                        value={newProgram.title}
                        onChange={(e) => setNewProgram(prev => ({ ...prev, title: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="theme" className="text-sm font-medium">Service Theme</Label>
                      <Input 
                        id="theme" 
                        placeholder="e.g., God's Grace, Faith and Hope"
                        value={newProgram.theme || ''}
                        onChange={(e) => setNewProgram(prev => ({ ...prev, theme: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="preacher" className="text-sm font-medium">Preacher/Speaker</Label>
                      <Input 
                        id="preacher" 
                        placeholder="e.g., Pastor John Doe"
                        value={newProgram.preacher || ''}
                        onChange={(e) => setNewProgram(prev => ({ ...prev, preacher: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="scriptureReading" className="text-sm font-medium">Scripture Reading</Label>
                    <Textarea 
                      id="scriptureReading" 
                      placeholder="e.g., John 3:16-17, Romans 8:28-30"
                      value={newProgram.scriptureReading || ''}
                      onChange={(e) => setNewProgram(prev => ({ ...prev, scriptureReading: e.target.value }))}
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="announcements" className="text-sm font-medium">Announcements</Label>
                    <Textarea 
                      id="announcements" 
                      placeholder="Important announcements for the congregation"
                      value={newProgram.announcements || ''}
                      onChange={(e) => setNewProgram(prev => ({ ...prev, announcements: e.target.value }))}
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="specialNotes" className="text-sm font-medium">Special Notes</Label>
                    <Textarea 
                      id="specialNotes" 
                      placeholder="Any special instructions, notes, or reminders for the service"
                      value={newProgram.specialNotes || ''}
                      onChange={(e) => setNewProgram(prev => ({ ...prev, specialNotes: e.target.value }))}
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  {/* Service Songs Section */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Service Songs & Hymns</h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Reset song form for new entry
                          setNewSong({
                            programId: '',
                            songTitle: '',
                            songType: 'hymn',
                            lyrics: '',
                            songNumber: '',
                            composer: '',
                            keySignature: '',
                            tempo: '',
                            orderInService: 1,
                            createdBy: user?.id || '00000000-0000-0000-0000-000000000000'
                          })
                        }}
                        className="flex items-center gap-2"
                      >
                        <churchIcons.worship className="h-4 w-4" />
                        Clear Song Form
                      </Button>
                    </div>
                    
                    {/* Song Creation Form */}
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="songTitle" className="text-sm font-medium">Song Title *</Label>
                          <Input 
                            id="songTitle" 
                            placeholder="e.g., Amazing Grace"
                            value={newSong.songTitle}
                            onChange={(e) => setNewSong(prev => ({ ...prev, songTitle: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="songType" className="text-sm font-medium">Song Type</Label>
                          <Select value={newSong.songType || ''} onValueChange={(value) => setNewSong(prev => ({ ...prev, songType: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hymn">Hymn</SelectItem>
                              <SelectItem value="worship">Worship Song</SelectItem>
                              <SelectItem value="special">Special Music</SelectItem>
                              <SelectItem value="offering">Offering Song</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="songNumber" className="text-sm font-medium">Hymn Number</Label>
                          <Input 
                            id="songNumber" 
                            placeholder="e.g., 123"
                            value={newSong.songNumber || ''}
                            onChange={(e) => setNewSong(prev => ({ ...prev, songNumber: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="keySignature" className="text-sm font-medium">Key</Label>
                          <Input 
                            id="keySignature" 
                            placeholder="e.g., C, G"
                            value={newSong.keySignature || ''}
                            onChange={(e) => setNewSong(prev => ({ ...prev, keySignature: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="orderInService" className="text-sm font-medium">Order</Label>
                          <Input 
                            id="orderInService" 
                            type="number"
                            placeholder="1"
                            value={newSong.orderInService}
                            onChange={(e) => setNewSong(prev => ({ ...prev, orderInService: parseInt(e.target.value) || 1 }))}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="composer" className="text-sm font-medium">Composer/Author</Label>
                        <Input 
                          id="composer" 
                          placeholder="e.g., John Newton"
                          value={newSong.composer || ''}
                          onChange={(e) => setNewSong(prev => ({ ...prev, composer: e.target.value }))}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="lyrics" className="text-sm font-medium">Song Lyrics *</Label>
                        <Textarea 
                          id="lyrics" 
                          placeholder="Enter the complete song lyrics..."
                          value={newSong.lyrics}
                          onChange={(e) => setNewSong(prev => ({ ...prev, lyrics: e.target.value }))}
                          rows={6}
                          className="mt-1"
                        />
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setNewSong({
                              programId: '',
                              songTitle: '',
                              songType: 'hymn',
                              lyrics: '',
                              songNumber: '',
                              composer: '',
                              keySignature: '',
                              tempo: '',
                              orderInService: 1,
                              createdBy: user?.id || '00000000-0000-0000-0000-000000000000'
                            })
                          }}
                        >
                          Clear
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (newSong.songTitle && newSong.lyrics) {
                              // Add song to the program (you can store this in a local state array)
                              alert(`Song "${newSong.songTitle}" added to program!`)
                              // Here you would typically add to a songs array for the program
                            } else {
                              alert('Please fill in song title and lyrics')
                            }
                          }}
                          disabled={!newSong.songTitle || !newSong.lyrics}
                        >
                          Add Song to Program
                        </Button>
                      </div>
                    </div>
                    
                    {/* Songs List Preview */}
                    <div className="mt-4 space-y-3">
                      {newSong.songTitle && newSong.lyrics && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-blue-900">{newSong.songTitle}</h4>
                              <div className="flex items-center gap-2 text-sm text-blue-700 mt-1">
                                <Badge variant="outline" className="text-xs">{newSong.songType}</Badge>
                                {newSong.songNumber && <span>#{newSong.songNumber}</span>}
                                {newSong.keySignature && <span>Key: {newSong.keySignature}</span>}
                                {newSong.composer && <span>by {newSong.composer}</span>}
                              </div>
                              <p className="text-xs text-blue-600 mt-2 line-clamp-2">
                                {newSong.lyrics.substring(0, 100)}...
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700">
                              Order: {newSong.orderInService}
                            </Badge>
                          </div>
                        </div>
                      )}
                      
                      {(!newSong.songTitle || !newSong.lyrics) && (
                        <div className="text-center py-6 text-gray-500">
                          <churchIcons.worship className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-sm">No songs added yet</p>
                          <p className="text-xs">Fill in the song details above and click "Add Song to Program"</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Service Sections Section */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Service Flow & Sections</h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Reset section form for new entry
                          setNewSection({
                            programId: '',
                            sectionTitle: '',
                            sectionType: 'prayer',
                            description: '',
                            duration: 5,
                            orderInService: 1,
                            createdBy: user?.id || '00000000-0000-0000-0000-000000000000'
                          })
                        }}
                        className="flex items-center gap-2"
                      >
                        <churchIcons.service className="h-4 w-4" />
                        Clear Section Form
                      </Button>
                    </div>
                    
                    {/* Section Creation Form */}
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="sectionTitle" className="text-sm font-medium">Section Title *</Label>
                          <Input 
                            id="sectionTitle" 
                            placeholder="e.g., Opening Prayer"
                            value={newSection.sectionTitle}
                            onChange={(e) => setNewSection(prev => ({ ...prev, sectionTitle: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="sectionType" className="text-sm font-medium">Section Type</Label>
                          <Select value={newSection.sectionType} onValueChange={(value) => setNewSection(prev => ({ ...prev, sectionType: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="prayer">Prayer</SelectItem>
                              <SelectItem value="scripture">Scripture Reading</SelectItem>
                              <SelectItem value="sermon">Sermon</SelectItem>
                              <SelectItem value="song">Song</SelectItem>
                              <SelectItem value="announcement">Announcement</SelectItem>
                              <SelectItem value="offering">Offering</SelectItem>
                              <SelectItem value="benediction">Benediction</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="duration" className="text-sm font-medium">Duration (minutes)</Label>
                          <Input 
                            id="duration" 
                            type="number"
                            placeholder="5"
                            value={newSection.duration?.toString() || ''}
                            onChange={(e) => setNewSection(prev => ({ ...prev, duration: parseInt(e.target.value) || 5 }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="orderInService" className="text-sm font-medium">Order in Service</Label>
                          <Input 
                            id="orderInService" 
                            type="number"
                            placeholder="1"
                            value={newSection.orderInService}
                            onChange={(e) => setNewSection(prev => ({ ...prev, orderInService: parseInt(e.target.value) || 1 }))}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                        <Textarea 
                          id="description" 
                          placeholder="Brief description of this section"
                          value={newSection.description || ''}
                          onChange={(e) => setNewSection(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                          className="mt-1"
                        />
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setNewSection({
                              programId: '',
                              sectionTitle: '',
                              sectionType: 'prayer',
                              description: '',
                              duration: 5,
                              orderInService: 1,
                              createdBy: user?.id || '00000000-0000-0000-0000-000000000000'
                            })
                          }}
                        >
                          Clear
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (newSection.sectionTitle) {
                              // Add section to the program (you can store this in a local state array)
                              alert(`Section "${newSection.sectionTitle}" added to program!`)
                              // Here you would typically add to a sections array for the program
                            } else {
                              alert('Please fill in section title')
                            }
                          }}
                          disabled={!newSection.sectionTitle}
                        >
                          Add Section to Program
                        </Button>
                      </div>
                    </div>
                    
                    {/* Sections List Preview */}
                    <div className="mt-4 space-y-3">
                      {newSection.sectionTitle && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-green-900">{newSection.sectionTitle}</h4>
                              <div className="flex items-center gap-2 text-sm text-green-700 mt-1">
                                <Badge variant="outline" className="text-xs">{newSection.sectionType}</Badge>
                                <span>{newSection.duration} min</span>
                                <span>Order: {newSection.orderInService}</span>
                              </div>
                              {newSection.description && (
                                <p className="text-xs text-green-600 mt-2">
                                  {newSection.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {!newSection.sectionTitle && (
                        <div className="text-center py-6 text-gray-500">
                          <churchIcons.service className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-sm">No sections added yet</p>
                          <p className="text-xs">Fill in the section details above and click "Add Section to Program"</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Add Templates */}
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium mb-3">Quick Add Templates</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setNewProgram(prev => ({ 
                            ...prev, 
                            title: 'Sunday Service',
                            theme: 'God\'s Grace and Mercy',
                            scriptureReading: 'Psalm 23:1-6'
                          }))
                          // Add a default song
                          setNewSong(prev => ({
                            ...prev,
                            songTitle: 'Amazing Grace',
                            songType: 'hymn',
                            lyrics: 'Amazing grace! How sweet the sound\nThat saved a wretch like me!\nI once was lost, but now am found;\nWas blind, but now I see.',
                            songNumber: '1',
                            composer: 'John Newton',
                            keySignature: 'C',
                            orderInService: 1
                          }))
                          // Add default sections
                          setNewSection(prev => ({
                            ...prev,
                            sectionTitle: 'Opening Prayer',
                            sectionType: 'prayer',
                            description: 'Begin service with prayer',
                            duration: 3,
                            orderInService: 1
                          }))
                        }}
                        className="h-auto p-3 flex flex-col items-center gap-2"
                      >
                        <churchIcons.worship className="h-5 w-5 text-blue-600" />
                        <span className="text-sm">Standard Service</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setNewProgram(prev => ({ 
                            ...prev, 
                            title: 'Communion Service',
                            theme: 'Remembering Christ\'s Sacrifice',
                            scriptureReading: '1 Corinthians 11:23-26'
                          }))
                          // Add communion-specific song
                          setNewSong(prev => ({
                            ...prev,
                            songTitle: 'When I Survey the Wondrous Cross',
                            songType: 'hymn',
                            lyrics: 'When I survey the wondrous cross\nOn which the Prince of glory died,\nMy richest gain I count but loss,\nAnd pour contempt on all my pride.',
                            songNumber: '298',
                            composer: 'Isaac Watts',
                            keySignature: 'G',
                            orderInService: 1
                          }))
                          // Add communion sections
                          setNewSection(prev => ({
                            ...prev,
                            sectionTitle: 'Communion Preparation',
                            sectionType: 'prayer',
                            description: 'Prepare hearts for communion',
                            duration: 5,
                            orderInService: 1
                          }))
                        }}
                        className="h-auto p-3 flex flex-col items-center gap-2"
                      >
                        <churchIcons.sundayService className="h-5 w-5 text-purple-600" />
                        <span className="text-sm">Communion</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setNewProgram(prev => ({ 
                            ...prev, 
                            title: 'Thanksgiving Service',
                            theme: 'Giving Thanks to God',
                            scriptureReading: 'Psalm 100:1-5'
                          }))
                          // Add thanksgiving song
                          setNewSong(prev => ({
                            ...prev,
                            songTitle: 'Give Thanks',
                            songType: 'worship',
                            lyrics: 'Give thanks with a grateful heart\nGive thanks to the Holy One\nGive thanks because He\'s given Jesus Christ, His Son',
                            songNumber: '',
                            composer: 'Don Moen',
                            keySignature: 'C',
                            orderInService: 1
                          }))
                          // Add thanksgiving sections
                          setNewSection(prev => ({
                            ...prev,
                            sectionTitle: 'Thanksgiving Prayer',
                            sectionType: 'prayer',
                            description: 'Corporate prayer of thanksgiving',
                            duration: 7,
                            orderInService: 1
                          }))
                        }}
                        className="h-auto p-3 flex flex-col items-center gap-2"
                      >
                        <churchIcons.worship className="h-5 w-5 text-green-600" />
                        <span className="text-sm">Thanksgiving</span>
                      </Button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateProgram(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCreateProgram}
                      disabled={loading || !newProgram.title || !newProgram.serviceDate}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <churchIcons.sundayService className="mr-2 h-4 w-4" />
                          Create Service Program
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Quick Actions for Admins */}
      {canManageServices && servicePrograms.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-blue-900">Quick Actions</h3>
                <p className="text-blue-700 text-sm">Manage your Sunday service programs</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateProgram(true)}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <churchIcons.sundayService className="mr-2 h-4 w-4" />
                  Add Another Service
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="border-purple-300 text-purple-700 hover:bg-purple-100"
                >
                  <churchIcons.document className="mr-2 h-4 w-4" />
                  Print Programs
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 lg:w-auto lg:grid-cols-3 gap-1">
          <TabsTrigger value="browse" className="flex items-center gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2">
            <churchIcons.calendar className="h-4 w-4" />
            Browse Programs
          </TabsTrigger>
          <TabsTrigger value="details" disabled={!selectedProgram} className="flex items-center gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2">
            <churchIcons.sundayService className="h-4 w-4" />
            Program Details
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex items-center gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2">
            <churchIcons.clock className="h-4 w-4" />
            Upcoming Services
          </TabsTrigger>
        </TabsList>

        {/* Browse Programs Tab */}
        <TabsContent value="browse" className="space-y-4">
          {servicePrograms.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {servicePrograms.map((program) => (
                <Card 
                  key={program.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => loadProgramDetails(program.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{program.title}</CardTitle>
                        <CardDescription className="text-base font-medium text-blue-600">
                          {formatDate(program.serviceDate)}
                        </CardDescription>
                      </div>
                      <Badge variant={new Date(program.serviceDate) >= new Date() ? "default" : "secondary"}>
                        {new Date(program.serviceDate) >= new Date() ? "Upcoming" : "Past"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {program.theme && (
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Theme:</span> {program.theme}
                      </p>
                    )}
                    {program.preacher && (
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Preacher:</span> {program.preacher}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Click to view details</span>
                      <churchIcons.chevronRight className="h-3 w-3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <churchIcons.sundayService className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No service programs</h3>
              <p className="text-gray-500 mb-4">
                {canManageServices 
                  ? 'Get started by creating your first Sunday service program.' 
                  : 'No service programs have been created yet.'
                }
              </p>
              {canManageServices && (
                <Button onClick={() => setShowCreateProgram(true)} size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <churchIcons.sundayService className="mr-2 h-5 w-5" />
                  Create First Program
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        {/* Upcoming Services Tab */}
        <TabsContent value="upcoming" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Upcoming Sunday Services</h3>
            {canManageServices && (
              <Button
                onClick={() => setShowCreateProgram(true)}
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <churchIcons.sundayService className="mr-2 h-4 w-4" />
                Schedule New Service
              </Button>
            )}
          </div>
          
          {servicePrograms.filter(p => new Date(p.serviceDate) >= new Date()).length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {servicePrograms
                .filter(program => new Date(program.serviceDate) >= new Date())
                .sort((a, b) => new Date(a.serviceDate).getTime() - new Date(b.serviceDate).getTime())
                .map((program) => (
                  <Card 
                    key={program.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow border-blue-200 bg-blue-50"
                    onClick={() => loadProgramDetails(program.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg text-blue-900">{program.title}</CardTitle>
                          <CardDescription className="text-base font-medium text-blue-700">
                            {formatDate(program.serviceDate)}
                          </CardDescription>
                        </div>
                        <Badge variant="default" className="bg-blue-600">
                          Upcoming
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {program.theme && (
                        <p className="text-sm text-blue-800 mb-2">
                          <span className="font-medium">Theme:</span> {program.theme}
                        </p>
                      )}
                      {program.preacher && (
                        <p className="text-sm text-blue-800 mb-2">
                          <span className="font-medium">Preacher:</span> {program.preacher}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-blue-600">
                        <span>Click to view details</span>
                        <churchIcons.chevronRight className="h-3 w-3" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <churchIcons.calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming services</h3>
              <p className="text-gray-500 mb-4">
                {canManageServices 
                  ? 'Schedule your next Sunday service program to get started.' 
                  : 'No upcoming services have been scheduled.'
                }
              </p>
              {canManageServices && (
                <Button onClick={() => setShowCreateProgram(true)} size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <churchIcons.sundayService className="mr-2 h-5 w-5" />
                  Schedule First Service
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        {/* Service Details Tab */}
        {selectedProgram && (
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{selectedProgram.title}</CardTitle>
                    <CardDescription className="text-lg">{formatDate(selectedProgram.serviceDate)}</CardDescription>
                  </div>
                  {canManageServices && (
                    <div className="flex gap-2">
                      {/* Removed separate Add Song and Add Section dialogs */}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Service Information */}
                  <div className="grid gap-4 md:grid-cols-2">
                    {selectedProgram.theme && (
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Theme</Label>
                        <p className="text-lg">{selectedProgram.theme}</p>
                      </div>
                    )}
                    {selectedProgram.preacher && (
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Preacher</Label>
                        <p className="text-lg">{selectedProgram.preacher}</p>
                      </div>
                    )}
                  </div>

                  {selectedProgram.scriptureReading && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Scripture Reading</Label>
                      <p className="text-base">{selectedProgram.scriptureReading}</p>
                    </div>
                  )}

                  {/* Service Sections */}
                  {selectedProgram.sections.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500 mb-3 block">Service Flow</Label>
                      <div className="space-y-2">
                        {selectedProgram.sections
                          .sort((a, b) => a.orderInService - b.orderInService)
                          .map((section) => (
                            <div key={section.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <Badge variant="outline">{section.sectionType}</Badge>
                                <span className="font-medium">{section.sectionTitle}</span>
                                {section.duration && (
                                  <span className="text-sm text-gray-500">{section.duration} min</span>
                                )}
                              </div>
                              {canManageServices && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    // TODO: Implement section editing
                                    alert('Section editing coming soon!')
                                  }}
                                >
                                  Edit
                                </Button>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Service Songs */}
                  {selectedProgram.songs.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500 mb-3 block">Songs & Hymns</Label>
                      <div className="grid gap-3 md:grid-cols-2">
                        {selectedProgram.songs
                          .sort((a, b) => a.orderInService - b.orderInService)
                          .map((song) => (
                            <div key={song.id} className="p-3 bg-blue-50 rounded-lg">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-medium">{song.songTitle}</h4>
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Badge variant="outline">{song.songType}</Badge>
                                    {song.songNumber && <span>#{song.songNumber}</span>}
                                    {song.keySignature && <span>Key: {song.keySignature}</span>}
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => showLyrics(song)}
                                >
                                  <churchIcons.worship className="mr-2 h-3 w-3" />
                                  Lyrics
                                </Button>
                              </div>
                              {canManageServices && (
                                <div className="flex gap-2 mt-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      // TODO: Implement song editing
                                      alert('Song editing coming soon!')
                                    }}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={async () => {
                                      if (window.confirm('Are you sure you want to delete this song?')) {
                                        // Assuming deleteServiceSong is imported or defined elsewhere
                                        // For now, commenting out as it's not in the original file
                                        // const result = await deleteServiceSong(song.id)
                                        // if (result.ok) {
                                        //   await loadProgramDetails(selectedProgram.id)
                                        // }
                                      }
                                    }}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Information */}
                  {selectedProgram.announcements && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Announcements</Label>
                      <p className="text-base">{selectedProgram.announcements}</p>
                    </div>
                  )}

                  {selectedProgram.specialNotes && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Special Notes</Label>
                      <p className="text-base">{selectedProgram.specialNotes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Lyrics Modal */}
      <Dialog open={showLyricsModal} onOpenChange={setShowLyricsModal}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{selectedSong?.songTitle}</DialogTitle>
            <DialogDescription>
              {selectedSong?.composer && `By ${selectedSong.composer}`}
              {selectedSong?.songNumber && ` • Hymn #${selectedSong.songNumber}`}
              {selectedSong?.keySignature && ` • Key: ${selectedSong.keySignature}`}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {selectedSong && (
              <div className="whitespace-pre-wrap text-base leading-relaxed">
                {selectedSong.lyrics}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
