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
  createServiceSong,
  createServiceProgramSection,
  getCompleteServiceProgram,
  updateSundayServiceProgram,
  deactivateSundayServiceProgram,
  deleteServiceSong,
  deleteServiceProgramSection
} from '@/lib/api/sundayService'
import type { 
  SundayServiceProgram,
  ServiceSong,
  ServiceProgramSection,
  NewSundayServiceProgram,
  NewServiceSong,
  NewServiceProgramSection
} from '@/lib/db/schema'

interface ServiceProgramWithDetails extends SundayServiceProgram {
  songs: ServiceSong[]
  sections: ServiceProgramSection[]
}

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
  const [showAddSong, setShowAddSong] = useState(false)
  const [showAddSection, setShowAddSection] = useState(false)
  const [showLyricsModal, setShowLyricsModal] = useState(false)
  const [selectedSong, setSelectedSong] = useState<ServiceSong | null>(null)

  // Form data
  const [newProgram, setNewProgram] = useState<NewSundayServiceProgram>({
    serviceDate: new Date(),
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
          serviceDate: new Date(),
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

  // Handle song creation
  const handleCreateSong = async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await createServiceSong(newSong)
      
      if (result.ok) {
        if (selectedProgram) {
          const completeProgram = await getCompleteServiceProgram(selectedProgram.id)
          if (completeProgram.ok) {
            setSelectedProgram(completeProgram.data)
          }
        }
        setNewSong({
          programId: selectedProgram?.id || '',
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
        setShowAddSong(false)
        alert('Song added successfully!')
      } else {
        setError(result.error || 'Failed to add song')
      }
    } catch (err) {
      console.error('Error adding song:', err)
      setError('Failed to add song')
    } finally {
      setLoading(false)
    }
  }

  // Handle section creation
  const handleCreateSection = async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await createServiceProgramSection(newSection)
      
      if (result.ok) {
        if (selectedProgram) {
          const completeProgram = await getCompleteServiceProgram(selectedProgram.id)
          if (completeProgram.ok) {
            setSelectedProgram(completeProgram.data)
          }
        }
        setNewSection({
          programId: selectedProgram?.id || '',
          sectionTitle: '',
          sectionType: 'prayer',
          description: '',
          duration: 5,
          orderInService: 1,
          createdBy: user?.id || '00000000-0000-0000-0000-000000000000'
        })
        setShowAddSection(false)
        alert('Section added successfully!')
      } else {
        setError(result.error || 'Failed to add section')
      }
    } catch (err) {
      console.error('Error adding section:', err)
      setError('Failed to add section')
    } finally {
      setLoading(false)
    }
  }

  // Load complete program details
  const loadProgramDetails = async (programId: string) => {
    try {
      setLoading(true)
      const result = await getCompleteServiceProgram(programId)
      
      if (result.ok) {
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
                <Button>
                  <churchIcons.sundayService className="mr-2 h-4 w-4" />
                  Create Program
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Sunday Service Program</DialogTitle>
                  <DialogDescription>
                    Set up the program for an upcoming Sunday service.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="serviceDate">Service Date</Label>
                      <Input 
                        id="serviceDate" 
                        type="date" 
                        value={newProgram.serviceDate ? new Date(newProgram.serviceDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => setNewProgram(prev => ({ 
                          ...prev, 
                          serviceDate: e.target.value ? new Date(e.target.value) : new Date() 
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="title">Service Title</Label>
                      <Input 
                        id="title" 
                        placeholder="e.g., Sunday Service, Communion Service"
                        value={newProgram.title}
                        onChange={(e) => setNewProgram(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="theme">Service Theme</Label>
                    <Input 
                      id="theme" 
                      placeholder="e.g., God's Love and Grace"
                      value={newProgram.theme}
                      onChange={(e) => setNewProgram(prev => ({ ...prev, theme: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="preacher">Preacher</Label>
                    <Input 
                      id="preacher" 
                      placeholder="Name of the preacher"
                      value={newProgram.preacher}
                      onChange={(e) => setNewProgram(prev => ({ ...prev, preacher: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="scriptureReading">Scripture Reading</Label>
                    <Textarea 
                      id="scriptureReading" 
                      placeholder="Bible passages for the service"
                      value={newProgram.scriptureReading || ''}
                      onChange={(e) => setNewProgram(prev => ({ ...prev, scriptureReading: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="announcements">Announcements</Label>
                    <Textarea 
                      id="announcements" 
                      placeholder="General announcements"
                      value={newProgram.announcements || ''}
                      onChange={(e) => setNewProgram(prev => ({ ...prev, announcements: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="specialNotes">Special Notes</Label>
                    <Textarea 
                      id="specialNotes" 
                      placeholder="Any special instructions or notes"
                      value={newProgram.specialNotes || ''}
                      onChange={(e) => setNewProgram(prev => ({ ...prev, specialNotes: e.target.value }))}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowCreateProgram(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateProgram}
                      disabled={!newProgram.serviceDate || !newProgram.title}
                    >
                      Create Program
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="browse">Browse Services</TabsTrigger>
          {selectedProgram && <TabsTrigger value="details">Service Details</TabsTrigger>}
        </TabsList>

        {/* Browse Services Tab */}
        <TabsContent value="browse" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {servicePrograms.map((program) => (
              <Card 
                key={program.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => loadProgramDetails(program.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{program.title}</CardTitle>
                      <CardDescription>{formatDate(program.serviceDate)}</CardDescription>
                    </div>
                    <Badge variant="outline">Active</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm">
                    {program.theme && (
                      <div className="flex items-center gap-2">
                        <churchIcons.sermon className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Theme:</span>
                        <span>{program.theme}</span>
                      </div>
                    )}
                    {program.preacher && (
                      <div className="flex items-center gap-2">
                        <churchIcons.pastor className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Preacher:</span>
                        <span>{program.preacher}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 text-center">
                    <Button variant="outline" size="sm" className="w-full">
                      View Program
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {servicePrograms.length === 0 && (
            <div className="text-center py-12">
              <churchIcons.sundayService className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No service programs</h3>
              <p className="text-gray-500 mb-4">
                {canManageServices 
                  ? 'Get started by creating your first Sunday service program.' 
                  : 'No service programs have been created yet.'
                }
              </p>
              {canManageServices && (
                <Button onClick={() => setShowCreateProgram(true)}>
                  <churchIcons.sundayService className="mr-2 h-4 w-4" />
                  Create First Program
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
                      <Dialog open={showAddSong} onOpenChange={setShowAddSong}>
                        <DialogTrigger asChild>
                          <Button variant="outline">
                            <churchIcons.worship className="mr-2 h-4 w-4" />
                            Add Song
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Add Song to Service</DialogTitle>
                            <DialogDescription>
                              Add a new song or hymn to this service program.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="songTitle">Song Title</Label>
                                <Input 
                                  id="songTitle" 
                                  placeholder="e.g., Amazing Grace"
                                  value={newSong.songTitle}
                                  onChange={(e) => setNewSong(prev => ({ ...prev, songTitle: e.target.value }))}
                                />
                              </div>
                              <div>
                                <Label htmlFor="songType">Song Type</Label>
                                <Select value={newSong.songType} onValueChange={(value) => setNewSong(prev => ({ ...prev, songType: value }))}>
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
                                <Label htmlFor="songNumber">Hymn Number</Label>
                                <Input 
                                  id="songNumber" 
                                  placeholder="e.g., 123"
                                  value={newSong.songNumber || ''}
                                  onChange={(e) => setNewSong(prev => ({ ...prev, songNumber: e.target.value }))}
                                />
                              </div>
                              <div>
                                <Label htmlFor="keySignature">Key</Label>
                                <Input 
                                  id="keySignature" 
                                  placeholder="e.g., C, G"
                                  value={newSong.keySignature || ''}
                                  onChange={(e) => setNewSong(prev => ({ ...prev, keySignature: e.target.value }))}
                                />
                              </div>
                              <div>
                                <Label htmlFor="orderInService">Order</Label>
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
                              <Label htmlFor="lyrics">Song Lyrics</Label>
                              <Textarea 
                                id="lyrics" 
                                placeholder="Enter the complete song lyrics..."
                                value={newSong.lyrics}
                                onChange={(e) => setNewSong(prev => ({ ...prev, lyrics: e.target.value }))}
                                rows={8}
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setShowAddSong(false)}>
                                Cancel
                              </Button>
                              <Button 
                                onClick={handleCreateSong}
                                disabled={!newSong.songTitle || !newSong.lyrics}
                              >
                                Add Song
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Dialog open={showAddSection} onOpenChange={setShowAddSection}>
                        <DialogTrigger asChild>
                          <Button variant="outline">
                            <churchIcons.service className="mr-2 h-4 w-4" />
                            Add Section
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Service Section</DialogTitle>
                            <DialogDescription>
                              Add a new section to the service program.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="sectionTitle">Section Title</Label>
                              <Input 
                                id="sectionTitle" 
                                placeholder="e.g., Opening Prayer"
                                value={newSection.sectionTitle}
                                onChange={(e) => setNewSection(prev => ({ ...prev, sectionTitle: e.target.value }))}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="sectionType">Section Type</Label>
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
                              <div>
                                <Label htmlFor="duration">Duration (minutes)</Label>
                                <Input 
                                  id="duration" 
                                  type="number"
                                  placeholder="5"
                                  value={newSection.duration}
                                  onChange={(e) => setNewSection(prev => ({ ...prev, duration: parseInt(e.target.value) || 5 }))}
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="description">Description</Label>
                              <Textarea 
                                id="description" 
                                placeholder="Brief description of this section"
                                value={newSection.description || ''}
                                onChange={(e) => setNewSection(prev => ({ ...prev, description: e.target.value }))}
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setShowAddSection(false)}>
                                Cancel
                              </Button>
                              <Button 
                                onClick={handleCreateSection}
                                disabled={!newSection.sectionTitle}
                              >
                                Add Section
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
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
                                        const result = await deleteServiceSong(song.id)
                                        if (result.ok) {
                                          await loadProgramDetails(selectedProgram.id)
                                        }
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
