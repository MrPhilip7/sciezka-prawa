// ELI (European Legislation Identifier) API Integration
// For Polish legislation: https://eli.gov.pl/

const ELI_API_BASE = 'https://api.eli.gov.pl'

export interface ELIDocument {
  eli: string
  title: string
  type: string
  date: string
  publisher: string
  journalTitle?: string
  journalYear?: number
  journalNumber?: number
  position?: number
  status?: string
  language?: string
  url?: string
}

export interface ELISearchResult {
  total: number
  items: ELIDocument[]
}

/**
 * Search for legislation documents in ELI
 */
export async function searchELIDocuments(
  query: string,
  options: {
    type?: string
    year?: number
    limit?: number
    offset?: number
  } = {}
): Promise<ELISearchResult> {
  try {
    const params = new URLSearchParams({
      q: query,
      limit: String(options.limit || 20),
      offset: String(options.offset || 0),
    })

    if (options.type) {
      params.append('type', options.type)
    }
    if (options.year) {
      params.append('year', String(options.year))
    }

    const response = await fetch(`${ELI_API_BASE}/search?${params}`, {
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      throw new Error(`ELI API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error searching ELI documents:', error)
    return { total: 0, items: [] }
  }
}

/**
 * Get document by ELI identifier
 */
export async function getELIDocument(eli: string): Promise<ELIDocument | null> {
  try {
    const response = await fetch(`${ELI_API_BASE}/eli/${encodeURIComponent(eli)}`, {
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching ELI document:', error)
    return null
  }
}

/**
 * Get recent acts (ustawy)
 */
export async function getRecentActs(limit: number = 20): Promise<ELIDocument[]> {
  try {
    const response = await fetch(`${ELI_API_BASE}/acts/recent?limit=${limit}`, {
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      throw new Error(`ELI API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching recent acts:', error)
    return []
  }
}

/**
 * Build ELI identifier for Polish legislation
 */
export function buildELI(
  type: 'ustawa' | 'rozporzadzenie' | 'obwieszczenie',
  year: number,
  position: number
): string {
  return `eli/pol/${type}/${year}/${position}/text`
}

/**
 * Parse ELI identifier
 */
export function parseELI(eli: string): {
  country: string
  type: string
  year: number
  position: number
} | null {
  const match = eli.match(/eli\/(\w+)\/(\w+)\/(\d+)\/(\d+)/)
  
  if (!match) {
    return null
  }

  return {
    country: match[1],
    type: match[2],
    year: parseInt(match[3]),
    position: parseInt(match[4]),
  }
}
