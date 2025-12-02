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
