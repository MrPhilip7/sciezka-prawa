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
  sittingNum?: number
  voting?: {
    yes: number
    no: number
    abstain: number
    notParticipating: number
    date: string
    title: string
  }
}

// Rozszerzony interfejs procesu z etapami i polami statusu
export interface SejmProcessWithStages extends SejmProcess {
  stages?: SejmProcessStage[]
  ELI?: string           // European Legislation Identifier - jeśli obecny, ustawa opublikowana
  passed?: boolean       // true jeśli ustawa/uchwała została uchwalona
  closureDate?: string   // data zamknięcia procesu
  address?: string       // adres publikacyjny w ISAP
  displayAddress?: string // wyświetlany adres publikacyjny (np. "Dz.U. 2024 poz. 123")
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
  
  // Remove redundant entries - if there's a more specific event on the same day, remove the generic one
  const filteredEvents = events.filter((event, index) => {
    const eventName = event.event_type.toLowerCase()
    
    // Check if there's a more specific event on the same day
    const sameDay = events.filter(e => e.event_date === event.event_date)
    if (sameDay.length > 1) {
      // Generic names that should be removed if there's a more specific one
      const isGeneric = eventName === 'skierowanie' || 
                        eventName === 'czytanie' ||
                        eventName === 'głosowanie' ||
                        eventName === 'komisja' ||
                        eventName === 'przekazanie'
      
      if (isGeneric) {
        // Check if there's a more specific event on the same day
        const hasMoreSpecific = sameDay.some(e => {
          const otherName = e.event_type.toLowerCase()
          return otherName !== eventName && 
                 (otherName.includes(eventName) || 
                  otherName.includes('skierowano') ||
                  otherName.includes('czytania') ||
                  otherName.length > eventName.length + 5)
        })
        if (hasMoreSpecific) return false
      }
    }
    
    return true
  })
  
  return filteredEvents
}

/**
 * Get current status from stages - analyzes all stages to determine the most recent/relevant status
 */
export function getStatusFromStages(stages: SejmProcessStage[]): string {
  if (!stages || stages.length === 0) return 'submitted'
  
  // Flatten all stages including children to analyze
  const allStages: Array<{ stageName: string; stageType?: string; date: string; decision?: string }> = []
  
  function collectStages(stageList: SejmProcessStage[]) {
    for (const stage of stageList) {
      allStages.push({
        stageName: stage.stageName || '',
        stageType: stage.stageType,
        date: stage.date || '',
        decision: stage.decision
      })
      if (stage.children && stage.children.length > 0) {
        collectStages(stage.children)
      }
    }
  }
  
  collectStages(stages)
  
  // Sort by date (most recent last)
  allStages.sort((a, b) => {
    if (!a.date) return -1
    if (!b.date) return 1
    return new Date(a.date).getTime() - new Date(b.date).getTime()
  })
  
  // Check for definitive outcomes first (from any stage, prioritize these)
  for (const stage of allStages) {
    const name = (stage.stageName || '').toLowerCase()
    const decision = (stage.decision || '').toLowerCase()
    const stageType = (stage.stageType || '').toLowerCase()
    
    // Publikacja / ogłoszenie - ustawa weszła w życie
    if (name.includes('ogłoszenie') || name.includes('publikacja') || 
        name.includes('dziennik ustaw') || stageType === 'publication') {
      return 'published'
    }
    
    // Odrzucenie / wycofanie
    if (name.includes('odrzucon') || name.includes('wycofan') || 
        decision.includes('odrzucono') || decision.includes('wycofano')) {
      return 'rejected'
    }
  }
  
  // Get the last (most recent) stage for current status
  const lastStage = allStages[allStages.length - 1]
  if (!lastStage) return 'submitted'
  
  const name = (lastStage.stageName || '').toLowerCase()
  const stageType = (lastStage.stageType || '').toLowerCase()
  const decision = (lastStage.decision || '').toLowerCase()
  
  // Etapy prezydenckie
  if (name.includes('prezydent') || name.includes('podpis') || 
      name.includes('przekazano prezydentowi') || stageType.includes('president')) {
    return 'presidential'
  }
  
  // Etapy senackie
  if (name.includes('stanowisko senatu') || name.includes('przekazano do senatu') ||
      name.includes('senat') || stageType.includes('senate')) {
    return 'senate'
  }
  
  // III czytanie
  if (name.includes('iii czytanie') || name.includes('trzecie czytanie') ||
      (stageType.includes('reading') && name.includes('trzeci'))) {
    return 'third_reading'
  }
  
  // Praca w komisjach po II czytaniu - oznacza że II czytanie było, czekamy na III
  if (name.includes('komisjach po ii czytaniu') || name.includes('po ii czytaniu') ||
      name.includes('po drugim czytaniu')) {
    return 'second_reading' // II czytanie ukończone
  }
  
  // II czytanie  
  if (name.includes('ii czytanie') || name.includes('drugie czytanie') ||
      (stageType.includes('reading') && name.includes('drugi'))) {
    return 'second_reading'
  }
  
  // Prace komisji (po I czytaniu)
  if (name.includes('komisj') || name.includes('sprawozdanie') || 
      name.includes('prac') && name.includes('komisj') ||
      stageType.includes('committee')) {
    return 'committee'
  }
  
  // I czytanie
  if (name.includes('i czytanie') || name.includes('pierwsze czytanie') ||
      name.includes('skierowano do') || name.includes('skierowanie') ||
      (stageType.includes('reading') && (name.includes('pierwszy') || name.includes('i ')))) {
    return 'first_reading'
  }
  
  // Projekt wpłynął
  if (name.includes('wpłynął') || name.includes('złożon') || 
      stageType === 'start' || stageType.includes('submitted')) {
    return 'submitted'
  }
  
  return 'submitted'
}
