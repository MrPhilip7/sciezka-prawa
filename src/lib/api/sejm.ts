// Sejm API Integration
// Documentation: https://api.sejm.gov.pl/

const SEJM_API_BASE = 'https://api.sejm.gov.pl'

export interface SejmProcess {
  number: string
  term: number
  title: string
  description?: string
  documentDate?: string
  processStartDate?: string
  documentType?: string
  createdBy?: string
  principlesOfLaw?: string
  legislativeCommittee?: string
  web?: string
}

export interface SejmPrint {
  number: string
  term: number
  title: string
  documentDate: string
  deliveryDate?: string
  changeDate?: string
  processPrint?: string[]
  attachments?: Array<{
    name: string
    URL: string
  }>
}

export interface SejmVoting {
  date: string
  title: string
  description?: string
  topic?: string
  yes: number
  no: number
  abstain: number
  notParticipating: number
}

/**
 * Fetch legislative processes from Sejm API
 */
export async function fetchSejmProcesses(term: number = 10): Promise<SejmProcess[]> {
  try {
    const response = await fetch(`${SEJM_API_BASE}/sejm/term${term}/processes`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!response.ok) {
      throw new Error(`Sejm API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching Sejm processes:', error)
    return []
  }
}

/**
 * Fetch single process details
 */
export async function fetchSejmProcess(term: number, processNumber: string): Promise<SejmProcess | null> {
  try {
    const response = await fetch(`${SEJM_API_BASE}/sejm/term${term}/processes/${processNumber}`, {
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching Sejm process:', error)
    return null
  }
}

/**
 * Fetch prints (druki) from Sejm API
 */
export async function fetchSejmPrints(term: number = 10): Promise<SejmPrint[]> {
  try {
    const response = await fetch(`${SEJM_API_BASE}/sejm/term${term}/prints`, {
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      throw new Error(`Sejm API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching Sejm prints:', error)
    return []
  }
}

/**
 * Fetch single print details
 */
export async function fetchSejmPrint(term: number, printNumber: string): Promise<SejmPrint | null> {
  try {
    const response = await fetch(`${SEJM_API_BASE}/sejm/term${term}/prints/${printNumber}`, {
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching Sejm print:', error)
    return null
  }
}

/**
 * Search prints by title or content
 */
export async function searchSejmPrints(
  term: number,
  query: string,
  limit: number = 20
): Promise<SejmPrint[]> {
  try {
    const allPrints = await fetchSejmPrints(term)
    
    const searchLower = query.toLowerCase()
    const filtered = allPrints.filter(
      (print) =>
        print.title.toLowerCase().includes(searchLower) ||
        print.number.toLowerCase().includes(searchLower)
    )

    return filtered.slice(0, limit)
  } catch (error) {
    console.error('Error searching Sejm prints:', error)
    return []
  }
}

/**
 * Map Sejm process status to our internal status
 */
export function mapSejmStatusToInternal(process: SejmProcess): string {
  // This is a simplified mapping - actual implementation would need
  // to analyze the process stages from Sejm API
  const title = process.title?.toLowerCase() || ''
  
  if (title.includes('odrzucony') || title.includes('odrzucona')) {
    return 'rejected'
  }
  if (title.includes('publikacja') || title.includes('dziennik ustaw')) {
    return 'published'
  }
  if (title.includes('prezydent')) {
    return 'presidential'
  }
  if (title.includes('senat')) {
    return 'senate'
  }
  if (title.includes('komisj')) {
    return 'committee'
  }
  if (title.includes('czytanie')) {
    if (title.includes('trzeci') || title.includes('iii')) {
      return 'third_reading'
    }
    if (title.includes('drugi') || title.includes('ii')) {
      return 'second_reading'
    }
    return 'first_reading'
  }
  
  return 'submitted'
}

// Interfejs dla etapu procesu legislacyjnego
export interface SejmProcessStage {
  stageName: string
  date: string
  children?: SejmProcessStage[]
  stageType?: string
  committeeCode?: string
  printNumber?: string
  comment?: string
  decision?: string
}

// Rozszerzony interfejs procesu z etapami
export interface SejmProcessWithStages extends SejmProcess {
  stages?: SejmProcessStage[]
}

/**
 * Fetch process with stages from Sejm API
 */
export async function fetchProcessWithStages(term: number, processNumber: string): Promise<SejmProcessWithStages | null> {
  try {
    const response = await fetch(`${SEJM_API_BASE}/sejm/term${term}/processes/${processNumber}`, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 3600 }, // Cache for 1 hour
    })
    
    if (!response.ok) {
      return null
    }
    
    const process = await response.json()
    return process
  } catch (error) {
    console.error(`Error fetching process ${processNumber}:`, error)
    return null
  }
}

/**
 * Flatten nested stages into a list of events
 */
export function flattenStages(stages: SejmProcessStage[]): Array<{ event_type: string; event_date: string; description: string | null }> {
  const events: Array<{ event_type: string; event_date: string; description: string | null }> = []
  
  function processStage(stage: SejmProcessStage) {
    if (stage.date && stage.stageName) {
      events.push({
        event_type: stage.stageName,
        event_date: stage.date,
        description: stage.comment || stage.decision || null,
      })
    }
    
    // Użyj 'children' zamiast 'childStages'
    if (stage.children) {
      stage.children.forEach(processStage)
    }
  }
  
  stages.forEach(processStage)
  
  // Sort by date ascending
  events.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
  
  return events
}

/**
 * Get current status from stages
 */
export function getStatusFromStages(stages: SejmProcessStage[]): string {
  const events = flattenStages(stages)
  if (events.length === 0) return 'submitted'
  
  // Check last event
  const lastEvent = events[events.length - 1]
  const eventName = lastEvent.event_type.toLowerCase()
  
  if (eventName.includes('odrzuc') || eventName.includes('wycof')) return 'rejected'
  if (eventName.includes('publikacja') || eventName.includes('dziennik ustaw') || eventName.includes('ogłosz')) return 'published'
  if (eventName.includes('prezydent') || eventName.includes('podpis')) return 'presidential'
  if (eventName.includes('stanowisko senatu') || (eventName.includes('przekazan') && eventName.includes('senat'))) return 'senate'
  if (eventName.includes('iii czytanie') || eventName.includes('trzecie czytanie') || eventName.includes('głosowanie')) return 'third_reading'
  if (eventName.includes('ii czytanie') || eventName.includes('drugie czytanie')) return 'second_reading'
  if (eventName.includes('komisj') || eventName.includes('sprawozdanie')) return 'committee'
  if (eventName.includes('i czytanie') || eventName.includes('pierwsze czytanie') || eventName.includes('skierowano do')) return 'first_reading'
  
  return 'submitted'
}
