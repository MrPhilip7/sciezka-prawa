import { NextResponse } from 'next/server'

const SEJM_API_BASE = 'https://api.sejm.gov.pl'
const SENAT_BASE = 'https://www.senat.gov.pl'
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

interface SejmProceeding {
  number: number
  title: string
  dates: string[]
  agenda?: string
  current?: boolean
}

interface SejmVideo {
  unid: string
  title: string
  startDateTime: string
  room?: string
  type: string
  playerLink: string
  playerLinkIFrame?: string
  videoLink?: string
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

// Fetch Sejm proceedings (plenary sessions)
async function fetchSejmProceedings(): Promise<SejmProceeding[]> {
  try {
    const response = await fetch(`${SEJM_API_BASE}/sejm/term${TERM}/proceedings`, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 3600 } // Cache for 1 hour
    })
    
    if (!response.ok) return []
    return response.json()
  } catch (error) {
    console.error('Error fetching Sejm proceedings:', error)
    return []
  }
}

// Fetch Sejm video recordings (transmisje)
async function fetchSejmVideos(): Promise<SejmVideo[]> {
  try {
    const response = await fetch(`${SEJM_API_BASE}/sejm/term${TERM}/videos`, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 1800 } // Cache for 30 minutes
    })
    
    if (!response.ok) return []
    return response.json()
  } catch (error) {
    console.error('Error fetching Sejm videos:', error)
    return []
  }
}

// Fetch Senat sittings by scraping the Senat website
async function fetchSenatSittings(): Promise<Array<{ number: number; title: string; dates: string[] }>> {
  try {
    const response = await fetch(`${SENAT_BASE}/prace/posiedzenia/`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    })
    
    if (!response.ok) return []
    const html = await response.text()
    
    const sittings: Array<{ number: number; title: string; dates: string[] }> = []
    
    // Parse sitting blocks from the HTML
    // Pattern: sitting number from anchor text, date from date-container
    const blockPattern = /headline-anchor">\s*(\d+)\.\s*posiedzenie\s+Senatu\s+RP.*?<\/a>[\s\S]*?<div class="date-container">[\s\S]*?<span[^>]*>\s*([\s\S]*?)<\/span>/gi
    let match
    
    while ((match = blockPattern.exec(html)) !== null) {
      const sittingNum = parseInt(match[1])
      const dateText = match[2].trim().replace(/\s+/g, ' ')
      
      if (!sittingNum || !dateText) continue
      
      const parsedDates = parsePolishDateRange(dateText)
      if (parsedDates.length > 0) {
        sittings.push({
          number: sittingNum,
          title: `${sittingNum}. Posiedzenie Senatu RP`,
          dates: parsedDates,
        })
      }
    }
    
    return sittings
  } catch (error) {
    console.error('Error fetching Senat sittings:', error)
    return []
  }
}

// Parse Polish date text like "4 i 5 marca 2026 r." or "18 i 19 lutego 2026 r." into ISO date strings
function parsePolishDateRange(text: string): string[] {
  const monthMap: Record<string, string> = {
    'stycznia': '01', 'lutego': '02', 'marca': '03', 'kwietnia': '04',
    'maja': '05', 'czerwca': '06', 'lipca': '07', 'sierpnia': '08',
    'września': '09', 'października': '10', 'listopada': '11', 'grudnia': '12',
  }
  
  // Clean up the text
  const cleaned = text.replace(/\s*r\.?\s*,?\s*$/, '').trim()
  
  // Extract year
  const yearMatch = cleaned.match(/(\d{4})/)
  if (!yearMatch) return []
  const year = yearMatch[1]
  
  // Extract month
  let month = ''
  for (const [name, num] of Object.entries(monthMap)) {
    if (cleaned.toLowerCase().includes(name)) {
      month = num
      break
    }
  }
  if (!month) return []
  
  // Extract day numbers (e.g., "4 i 5" or "18, 19 i 20" or "28")
  const daysText = cleaned.replace(/\d{4}/, '').replace(/r\.?\s*,?\s*$/, '')
  const dayNumbers: number[] = []
  const dayMatches = daysText.match(/\d+/g)
  
  if (dayMatches) {
    for (const d of dayMatches) {
      const num = parseInt(d)
      if (num >= 1 && num <= 31) {
        dayNumbers.push(num)
      }
    }
  }
  
  if (dayNumbers.length === 0) return []
  
  // If we have a range like "4 i 5", also fill in between if there are gaps
  // But typically it's explicit days, so just use what we have
  // Handle case like "4, 5 i 6" - fill consecutive days between min and max
  const minDay = Math.min(...dayNumbers)
  const maxDay = Math.max(...dayNumbers)
  
  const dates: string[] = []
  for (let d = minDay; d <= maxDay; d++) {
    dates.push(`${year}-${month}-${String(d).padStart(2, '0')}`)
  }
  
  return dates
}

// Get events for a date range
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const startDate = searchParams.get('start') || new Date().toISOString().split('T')[0]
  const endDate = searchParams.get('end') || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const type = searchParams.get('type') // 'all', 'sejm', 'senat', 'committee'
  
  try {
    const events: CalendarEvent[] = []
    const today = new Date().toISOString().split('T')[0]
    
    // Fetch all data sources in parallel
    const [committees, sejmProceedings, sejmVideos, senatSittings] = await Promise.all([
      fetchCommittees(),
      fetchSejmProceedings(),
      fetchSejmVideos(),
      fetchSenatSittings(),
    ])
    
    // Build a map of date -> video playerLink for Sejm plenary sessions
    const sejmVideoByDate = new Map<string, SejmVideo>()
    for (const video of sejmVideos) {
      if (video.type === 'posiedzenie' && video.startDateTime) {
        const videoDate = video.startDateTime.split('T')[0]
        // Keep the one with earliest startDateTime per date (main session)
        if (!sejmVideoByDate.has(videoDate)) {
          sejmVideoByDate.set(videoDate, video)
        }
      }
    }
    
    // === SEJM PROCEEDINGS ===
    for (const proceeding of sejmProceedings) {
      const procDates = proceeding.dates?.filter(d => d >= startDate && d <= endDate) || []
      for (const date of procDates) {
        // Determine status: if all dates are past -> finished, if current -> live, else scheduled
        const lastDate = proceeding.dates[proceeding.dates.length - 1]
        const firstDate = proceeding.dates[0]
        let status: 'scheduled' | 'live' | 'finished' = 'scheduled'
        if (lastDate < today) {
          status = 'finished'
        } else if (firstDate <= today && lastDate >= today) {
          status = proceeding.current ? 'live' : 'scheduled'
        }
        
        // Clean agenda from HTML
        const cleanAgenda = proceeding.agenda
          ?.replace(/<[^>]*>/g, ' ')
          .replace(/&[a-z]+;/g, '')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 500)
        
        // Find matching video for this specific date
        const matchedVideo = sejmVideoByDate.get(date)
        const videoUrl = matchedVideo?.playerLink 
          || (status === 'live' ? 'https://www.youtube.com/@SejmRP_PL/live' : undefined)
        const startTimeFromVideo = matchedVideo?.startDateTime?.split('T')[1]?.substring(0, 5)
        
        events.push({
          id: `sejm-${proceeding.number}-${date}`,
          title: proceeding.number > 0 
            ? `${proceeding.number}. Posiedzenie Sejmu RP`
            : proceeding.title,
          date,
          startTime: startTimeFromVideo || (date === firstDate ? '10:00' : '09:00'),
          type: 'sejm',
          description: cleanAgenda || `Posiedzenie Sejmu RP X kadencji`,
          location: matchedVideo?.room || 'Sala posiedzeń Sejmu, ul. Wiejska 4/6/8, Warszawa',
          videoUrl,
          archiveUrl: matchedVideo?.playerLink,
          status,
          agenda: cleanAgenda,
        })
      }
    }
    
    // === SENAT SITTINGS ===
    for (const sitting of senatSittings) {
      const sitDates = sitting.dates?.filter(d => d >= startDate && d <= endDate) || []
      for (const date of sitDates) {
        const lastDate = sitting.dates[sitting.dates.length - 1]
        const firstDate = sitting.dates[0]
        let status: 'scheduled' | 'live' | 'finished' = 'scheduled'
        if (lastDate < today) {
          status = 'finished'
        } else if (firstDate <= today && lastDate >= today) {
          status = 'live'
        }
        
        events.push({
          id: `senat-${sitting.number}-${date}`,
          title: sitting.title,
          date,
          startTime: '10:00',
          type: 'senat',
          description: `${sitting.title} - XI kadencja`,
          location: 'Sala posiedzeń Senatu, ul. Wiejska 6, Warszawa',
          status,
        })
      }
    }
    
    // === COMMITTEE SITTINGS ===
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
      // Sejm/Senat plenary first, then committees
      const typeOrder = { sejm: 0, senat: 1, committee: 2, bill: 3 }
      const typeCompare = typeOrder[a.type] - typeOrder[b.type]
      if (typeCompare !== 0) return typeCompare
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
