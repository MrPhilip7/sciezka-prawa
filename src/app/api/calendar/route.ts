import { NextResponse } from 'next/server'

const SEJM_API_BASE = 'https://api.sejm.gov.pl'
const TERM = 10

interface CommitteeSitting {
  code: string
  num: number
  date: string
  startDateTime: string
  endDateTime?: string
  room?: string
  agenda?: string
  status: string
  closed: boolean
  remote: boolean
  video?: Array<{
    title: string
    description: string
    playerLink: string
    videoLink: string
    startDateTime: string
    endDateTime?: string
  }>
}

interface Committee {
  code: string
  name: string
  nameGenitive: string
  type: string
}

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

// Fetch all committees
async function fetchCommittees(): Promise<Committee[]> {
  const response = await fetch(`${SEJM_API_BASE}/sejm/term${TERM}/committees`, {
    headers: { 'Accept': 'application/json' },
    next: { revalidate: 3600 } // Cache for 1 hour
  })
  
  if (!response.ok) return []
  return response.json()
}

// Fetch sittings for a committee
async function fetchCommitteeSittings(code: string): Promise<CommitteeSitting[]> {
  const response = await fetch(`${SEJM_API_BASE}/sejm/term${TERM}/committees/${code}/sittings`, {
    headers: { 'Accept': 'application/json' },
    next: { revalidate: 300 } // Cache for 5 minutes
  })
  
  if (!response.ok) return []
  return response.json()
}

// Get events for a date range
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const startDate = searchParams.get('start') || new Date().toISOString().split('T')[0]
  const endDate = searchParams.get('end') || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const type = searchParams.get('type') // 'all', 'sejm', 'committee'
  
  try {
    const events: CalendarEvent[] = []
    
    // Fetch committees and their sittings
    const committees = await fetchCommittees()
    
    // Limit to main standing committees for performance
    const standingCommittees = committees.filter(c => c.type === 'STANDING').slice(0, 30)
    
    // Fetch sittings for each committee in parallel (batched)
    const sittingsPromises = standingCommittees.map(async (committee) => {
      const sittings = await fetchCommitteeSittings(committee.code)
      return sittings
        .filter(s => s.date >= startDate && s.date <= endDate)
        .map(sitting => ({
          id: `committee-${committee.code}-${sitting.num}`,
          title: `${committee.name}`,
          date: sitting.date,
          startTime: sitting.startDateTime?.split('T')[1]?.substring(0, 5),
          endTime: sitting.endDateTime?.split('T')[1]?.substring(0, 5),
          type: 'committee' as const,
          description: sitting.agenda?.replace(/<[^>]*>/g, '').substring(0, 300),
          location: sitting.room,
          videoUrl: sitting.video?.[0]?.playerLink,
          archiveUrl: sitting.video?.[0]?.playerLink,
          status: sitting.status === 'FINISHED' ? 'finished' as const : 
                  sitting.status === 'ONGOING' ? 'live' as const : 'scheduled' as const,
          committeeCode: committee.code,
          committeeName: committee.name,
          agenda: sitting.agenda?.replace(/<[^>]*>/g, ''),
        }))
    })
    
    const allSittings = await Promise.all(sittingsPromises)
    allSittings.forEach(sittings => events.push(...sittings))
    
    // Sort by date and time
    events.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date)
      if (dateCompare !== 0) return dateCompare
      return (a.startTime || '').localeCompare(b.startTime || '')
    })
    
    // Filter by type if specified
    const filteredEvents = type && type !== 'all' 
      ? events.filter(e => e.type === type)
      : events

    return NextResponse.json({
      success: true,
      events: filteredEvents,
      total: filteredEvents.length,
      dateRange: { start: startDate, end: endDate },
      youtubeChannel: 'https://www.youtube.com/@SejmRP_PL',
    })
  } catch (error) {
    console.error('Calendar API error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch calendar events' },
      { status: 500 }
    )
  }
}
