'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths, parseISO } from 'date-fns'
import { pl } from 'date-fns/locale'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Video, 
  Building2, 
  Users, 
  ExternalLink,
  Clock,
  MapPin,
  PlayCircle,
  Loader2,
  Youtube,
  Radio,
  Tv,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CalendarEvent {
  id: string
  title: string
  date: string
  startTime?: string
  endTime?: string
  type: 'sejm' | 'senat' | 'committee' | 'bill'
  description?: string
  location?: string
  videoUrl?: string
  archiveUrl?: string
  status: 'scheduled' | 'live' | 'finished'
  committeeCode?: string
  committeeName?: string
  agenda?: string
}

interface YouTubeLiveData {
  isLive: boolean
  videoId: string | null
  title: string | null
  channelUrl: string
}

const typeConfig = {
  sejm: { label: 'Sejm', color: 'bg-red-500', icon: Building2 },
  senat: { label: 'Senat', color: 'bg-blue-500', icon: Building2 },
  committee: { label: 'Komisja', color: 'bg-purple-500', icon: Users },
  bill: { label: 'Ustawa', color: 'bg-green-500', icon: CalendarIcon },
}

const statusConfig = {
  scheduled: { label: 'Zaplanowane', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
  live: { label: 'Na żywo', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  finished: { label: 'Zakończone', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
}

export function CalendarContent() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'month' | 'list'>('month')
  
  // YouTube Live state
  const [youtubeLive, setYoutubeLive] = useState<YouTubeLiveData | null>(null)
  const [loadingLive, setLoadingLive] = useState(true)
  
  // Calculate date range for current month view
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  
  // Check for live events from API
  const liveEvents = useMemo(() => {
    return events.filter(e => e.status === 'live')
  }, [events])
  
  // Show live section if YouTube is live OR API reports live events
  const hasLiveEvent = youtubeLive?.isLive || liveEvents.length > 0
  
  // Fetch YouTube live status
  useEffect(() => {
    async function fetchYouTubeLive() {
      setLoadingLive(true)
      try {
        const response = await fetch('/api/youtube-live')
        const data = await response.json()
        setYoutubeLive(data)
      } catch (error) {
        console.error('Failed to fetch YouTube live status:', error)
        setYoutubeLive({ isLive: false, videoId: null, title: null, channelUrl: 'https://www.youtube.com/@SejmRP_PL' })
      } finally {
        setLoadingLive(false)
      }
    }
    
    fetchYouTubeLive()
    // Refresh every 2 minutes
    const interval = setInterval(fetchYouTubeLive, 2 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])
  
  // Fetch events for current month
  useEffect(() => {
    async function fetchEvents() {
      setLoading(true)
      try {
        // Extend range to include previous and next month for smoother navigation
        const start = format(subMonths(monthStart, 1), 'yyyy-MM-dd')
        const end = format(addMonths(monthEnd, 1), 'yyyy-MM-dd')
        
        const response = await fetch(`/api/calendar?start=${start}&end=${end}`)
        const data = await response.json()
        
        if (data.success) {
          setEvents(data.events)
        }
      } catch (error) {
        console.error('Failed to fetch calendar events:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchEvents()
  }, [currentDate])
  
  // Get days for calendar grid
  const calendarDays = useMemo(() => {
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
    
    // Add padding days from previous month
    const firstDayOfWeek = monthStart.getDay()
    const paddingDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1
    
    for (let i = paddingDays; i > 0; i--) {
      days.unshift(new Date(monthStart.getTime() - i * 24 * 60 * 60 * 1000))
    }
    
    // Add padding days for next month to complete the grid
    while (days.length % 7 !== 0) {
      days.push(new Date(days[days.length - 1].getTime() + 24 * 60 * 60 * 1000))
    }
    
    return days
  }, [monthStart, monthEnd])
  
  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return events.filter(e => e.date === dateStr)
  }
  
  // Get selected date events
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : []
  
  // Get today's events
  const todayEvents = getEventsForDate(new Date())
  
  // Get upcoming events (next 7 days)
  const upcomingEvents = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const weekFromNow = format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
    return events.filter(e => e.date >= today && e.date <= weekFromNow).slice(0, 10)
  }, [events])
  
  // Get events for current month, grouped by day
  const monthEvents = useMemo(() => {
    const startStr = format(monthStart, 'yyyy-MM-dd')
    const endStr = format(monthEnd, 'yyyy-MM-dd')
    const filtered = events.filter(e => e.date >= startStr && e.date <= endStr)
    
    // Group by date
    const grouped: Record<string, typeof events> = {}
    filtered.forEach(event => {
      if (!grouped[event.date]) {
        grouped[event.date] = []
      }
      grouped[event.date].push(event)
    })
    
    // Sort by date and return as array of [date, events]
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b))
  }, [events, monthStart, monthEnd])
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1))
    setSelectedDate(null)
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Kalendarz Legislacyjny</h1>
          <p className="text-muted-foreground">
            Posiedzenia Sejmu, Senatu i komisji z linkami do transmisji
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Live indicator if there's a live event */}
          {hasLiveEvent && (
            <Badge variant="destructive" className="animate-pulse flex items-center gap-1.5 px-3 py-1">
              <Radio className="h-3 w-3" />
              <span>NA ŻYWO</span>
            </Badge>
          )}
          
          <Tabs value={view} onValueChange={(v) => setView(v as 'month' | 'list')}>
            <TabsList>
              <TabsTrigger value="month">Miesiąc</TabsTrigger>
              <TabsTrigger value="list">Lista</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar Grid */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <CardTitle className="text-lg">
                {format(currentDate, 'LLLL yyyy', { locale: pl })}
              </CardTitle>
              
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : view === 'month' ? (
              <div className="grid grid-cols-7 gap-1">
                {/* Day headers */}
                {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {calendarDays.map((day, index) => {
                  const dayEvents = getEventsForDate(day)
                  const isCurrentMonth = isSameMonth(day, currentDate)
                  const isSelected = selectedDate && isSameDay(day, selectedDate)
                  const dayHasLiveEvent = dayEvents.some(e => e.status === 'live')
                  // Show LIVE badge on today if YouTube is streaming
                  const hasLive = dayHasLiveEvent || (isToday(day) && youtubeLive?.isLive)
                  
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        'relative p-2 h-20 text-sm rounded-lg border transition-colors',
                        'hover:bg-accent hover:border-primary/50',
                        !isCurrentMonth && 'text-muted-foreground bg-muted/30',
                        isToday(day) && 'border-primary bg-primary/5',
                        isSelected && 'border-primary bg-primary/10',
                        dayEvents.length > 0 && 'font-medium',
                        hasLive && 'ring-2 ring-red-500 ring-offset-1 border-red-400'
                      )}
                    >
                      <span className={cn(
                        'absolute top-1 left-2',
                        isToday(day) && 'text-primary font-bold'
                      )}>
                        {format(day, 'd')}
                      </span>
                      
                      {/* LIVE badge on day */}
                      {hasLive && (
                        <span className="absolute top-0.5 right-0.5 flex items-center gap-0.5 bg-red-500 text-white text-[9px] font-bold px-1 py-0.5 rounded animate-pulse">
                          <Radio className="h-2 w-2" />
                          LIVE
                        </span>
                      )}
                      
                      {/* Event indicators */}
                      <div className="absolute bottom-1 left-1 right-1 flex flex-wrap gap-0.5">
                        {dayEvents.slice(0, 4).map((event, i) => (
                          <div
                            key={i}
                            className={cn(
                              'h-1.5 w-1.5 rounded-full',
                              event.status === 'live' ? 'bg-red-500 animate-pulse' : typeConfig[event.type].color
                            )}
                            title={event.title}
                          />
                        ))}
                        {dayEvents.length > 4 && (
                          <span className="text-[10px] text-muted-foreground">
                            +{dayEvents.length - 4}
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              /* List view - events grouped by day for current month */
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {monthEvents.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Brak wydarzeń w tym miesiącu
                    </p>
                  ) : (
                    monthEvents.map(([dateStr, dayEvents]) => (
                      <div key={dateStr} className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground border-b pb-1 sticky top-0 bg-background">
                          {format(new Date(dateStr), 'EEEE, d MMMM', { locale: pl })}
                        </h4>
                        {dayEvents.map(event => (
                          <EventCard key={event.id} event={event} compact />
                        ))}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            )}
            
            {/* Live Stream Embed - inside calendar card */}
            {hasLiveEvent && youtubeLive?.videoId && (
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    Transmisja na żywo
                  </h3>
                  <Badge variant="destructive" className="animate-pulse">
                    <Radio className="h-3 w-3 mr-1" />
                    LIVE
                  </Badge>
                </div>
                
                {youtubeLive.title && (
                  <p className="text-sm text-muted-foreground mb-3">{youtubeLive.title}</p>
                )}
                
                {/* YouTube Embed */}
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-2xl ring-1 ring-red-500/20">
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeLive.videoId}?autoplay=0`}
                    title="Transmisja na żywo - Sejm RP"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
                
                {/* Direct link to YouTube */}
                <div className="flex items-center justify-between mt-4 p-3 rounded-lg bg-gradient-to-r from-red-500/10 to-transparent border border-red-500/20">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20">
                      <Youtube className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Sejm RP - YouTube</div>
                      <div className="text-xs text-muted-foreground">Oficjalna transmisja</div>
                    </div>
                  </div>
                  <Link href={`https://www.youtube.com/watch?v=${youtubeLive.videoId}`} target="_blank">
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Otwórz na YouTube
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Sidebar - Selected Date or Upcoming */}
        <div className="space-y-4">
          {/* Selected date events */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {selectedDate 
                  ? format(selectedDate, 'd MMMM yyyy', { locale: pl })
                  : 'Dzisiaj'
                }
              </CardTitle>
              <CardDescription>
                {(selectedDate ? selectedDateEvents : todayEvents).length} wydarzeń
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {(selectedDate ? selectedDateEvents : todayEvents).length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Brak wydarzeń
                    </p>
                  ) : (
                    (selectedDate ? selectedDateEvents : todayEvents).map(event => (
                      <EventCard key={event.id} event={event} />
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
          
          {/* Legend */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Legenda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(typeConfig).map(([key, config]) => (
                  <div key={key} className="flex items-center gap-2 text-sm">
                    <div className={cn('h-3 w-3 rounded-full', config.color)} />
                    <span>{config.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Quick links */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Tv className="h-4 w-4" />
                Transmisje online
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* YouTube Button - Premium look */}
              <Link href="https://www.youtube.com/@SejmRP_PL" target="_blank" className="block group">
                <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-red-600 to-red-500 p-3 text-white shadow-lg transition-all duration-300 hover:shadow-red-500/25 hover:shadow-xl hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-600 opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="relative flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                      <Youtube className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">Sejm RP na YouTube</div>
                      <div className="text-xs text-red-100">Oficjalny kanał transmisji</div>
                    </div>
                    <ExternalLink className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </Link>
              
              {/* Sejm.gov.pl Button */}
              <Link href="https://sejm.gov.pl/Sejm10.nsf/transmisje.xsp" target="_blank" className="block group">
                <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-slate-700 to-slate-600 p-3 text-white shadow-lg transition-all duration-300 hover:shadow-slate-500/25 hover:shadow-xl hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-700 opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="relative flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">Portal Sejmu RP</div>
                      <div className="text-xs text-slate-300">sejm.gov.pl/transmisje</div>
                    </div>
                    <ExternalLink className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Event Card Component
function EventCard({ event, compact = false }: { event: CalendarEvent; compact?: boolean }) {
  const config = typeConfig[event.type]
  const statusCfg = statusConfig[event.status]
  const Icon = config.icon
  
  return (
    <div className={cn(
      'p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors',
      compact && 'p-2'
    )}>
      <div className="flex items-start gap-3">
        <div className={cn('p-1.5 rounded', config.color, 'bg-opacity-20')}>
          <Icon className={cn('h-4 w-4', config.color.replace('bg-', 'text-'))} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-medium text-sm truncate">{event.title}</h4>
            {event.status === 'live' && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                <span className="animate-pulse mr-1">●</span> Na żywo
              </Badge>
            )}
          </div>
          
          {!compact && event.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {event.description}
            </p>
          )}
          
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            {event.startTime && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {event.startTime}
                {event.endTime && ` - ${event.endTime}`}
              </span>
            )}
            
            {compact && (
              <span>{format(parseISO(event.date), 'd MMM', { locale: pl })}</span>
            )}
            
            {event.location && !compact && (
              <span className="flex items-center gap-1 truncate">
                <MapPin className="h-3 w-3" />
                {event.location}
              </span>
            )}
          </div>
          
          {/* Video link */}
          {event.videoUrl && (
            <Link 
              href={event.videoUrl} 
              target="_blank"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
            >
              <PlayCircle className="h-3 w-3" />
              {event.status === 'finished' ? 'Obejrzyj nagranie' : 'Oglądaj transmisję'}
              <ExternalLink className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
