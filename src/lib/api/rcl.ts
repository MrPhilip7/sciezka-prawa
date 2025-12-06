// RCL (Rządowe Centrum Legislacji) API Integration
// https://legislacja.rcl.gov.pl/

const RCL_BASE = 'https://legislacja.rcl.gov.pl'

export interface RCLProject {
  id: string
  title: string
  status: string
  ministry?: string
  description?: string
  documentType?: string
  consultationStartDate?: string
  consultationEndDate?: string
  consultationUrl?: string
  impactAssessmentUrl?: string
  rclUrl?: string
  lastUpdate?: string
}

export interface RCLConsultation {
  id: string
  projectId: string
  title: string
  startDate: string
  endDate: string
  status: 'active' | 'completed' | 'upcoming'
  url: string
  commentsCount?: number
}

export interface ImpactAssessment {
  projectId: string
  url: string
  summary?: string
  financialImpact?: {
    publicBudget?: number
    citizens?: number
    businesses?: number
  }
  socialImpact?: {
    affectedGroups?: string[]
    description?: string
  }
  economicImpact?: {
    gdpEffect?: string
    employmentEffect?: string
    description?: string
  }
  environmentalImpact?: string
  legalImpact?: string
}

/**
 * Scrape RCL projects - since RCL doesn't have public API, we'll scrape
 */
export async function scrapeRCLProjects(): Promise<RCLProject[]> {
  try {
    // RCL URL for legislative projects list
    const url = `${RCL_BASE}/projects.html`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    if (!response.ok) {
      console.error(`RCL scraping failed: ${response.status}`)
      return []
    }
    
    const html = await response.text()
    
    // Parse HTML to extract projects
    // Note: This is a placeholder - actual implementation needs proper HTML parsing
    const projects: RCLProject[] = []
    
    // TODO: Implement HTML parsing with cheerio or similar
    // Extract: project ID, title, ministry, status, dates, URLs
    
    return projects
  } catch (error) {
    console.error('Error scraping RCL:', error)
    return []
  }
}

/**
 * Get consultations from RCL
 */
export async function getRCLConsultations(): Promise<RCLConsultation[]> {
  try {
    const url = `${RCL_BASE}/lista-konsultacji-projekt-aktow-prawnych`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    if (!response.ok) {
      console.error(`RCL consultations failed: ${response.status}`)
      return []
    }
    
    const html = await response.text()
    const consultations: RCLConsultation[] = []
    
    // TODO: Parse HTML for consultations
    // Extract: dates, status, project links
    
    return consultations
  } catch (error) {
    console.error('Error fetching RCL consultations:', error)
    return []
  }
}

/**
 * Parse Impact Assessment (OSR) document
 */
export async function parseImpactAssessment(url: string): Promise<ImpactAssessment | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    if (!response.ok) {
      console.error(`OSR fetch failed: ${response.status}`)
      return null
    }
    
    // OSR documents are usually PDF or HTML
    const contentType = response.headers.get('content-type')
    
    if (contentType?.includes('pdf')) {
      return await parsePDFImpactAssessment(url, response)
    } else {
      const html = await response.text()
      return parseHTMLImpactAssessment(html, url)
    }
  } catch (error) {
    console.error('Error parsing impact assessment:', error)
    return null
  }
}

/**
 * Parse PDF Impact Assessment document
 */
async function parsePDFImpactAssessment(url: string, response: Response): Promise<ImpactAssessment | null> {
  try {
    // Import pdf-parse dynamically (only on server)
    const pdfParse = (await import('pdf-parse/lib/pdf-parse.js')).default
    
    const buffer = await response.arrayBuffer()
    const data = await pdfParse(Buffer.from(buffer))
    const text = data.text
    
    // Extract structured data using regex and keywords
    const impact: ImpactAssessment = {
      projectId: '',
      url,
      summary: extractSection(text, ['streszczenie', 'podsumowanie', 'wprowadzenie']),
      financialImpact: extractFinancialImpact(text),
      socialImpact: extractSocialImpact(text),
      economicImpact: extractEconomicImpact(text),
      environmentalImpact: extractSection(text, ['wpływ na środowisko', 'skutki środowiskowe']),
      legalImpact: extractSection(text, ['skutki prawne', 'zmiany prawne']),
    }
    
    return impact
  } catch (error) {
    console.error('Error parsing PDF impact assessment:', error)
    return null
  }
}

/**
 * Parse HTML Impact Assessment document
 */
function parseHTMLImpactAssessment(html: string, url: string): ImpactAssessment | null {
  try {
    // Remove HTML tags and extract text
    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    
    const impact: ImpactAssessment = {
      projectId: '',
      url,
      summary: extractSection(text, ['streszczenie', 'podsumowanie']),
      financialImpact: extractFinancialImpact(text),
      socialImpact: extractSocialImpact(text),
      economicImpact: extractEconomicImpact(text),
      environmentalImpact: extractSection(text, ['wpływ na środowisko']),
      legalImpact: extractSection(text, ['skutki prawne']),
    }
    
    return impact
  } catch (error) {
    console.error('Error parsing HTML impact assessment:', error)
    return null
  }
}

/**
 * Extract specific section from OSR text
 */
function extractSection(text: string, keywords: string[]): string | undefined {
  const lowerText = text.toLowerCase()
  
  for (const keyword of keywords) {
    const index = lowerText.indexOf(keyword.toLowerCase())
    if (index !== -1) {
      // Extract ~500 characters after the keyword
      const start = index + keyword.length
      const section = text.substring(start, start + 500).trim()
      
      // Clean up: stop at next major heading or excessive whitespace
      const cleaned = section.split(/\n\n|\.(?=\s*[A-ZĆŁŃŚŹŻ])/)[0]
      return cleaned || undefined
    }
  }
  
  return undefined
}

/**
 * Extract financial impact from OSR text
 */
function extractFinancialImpact(text: string): ImpactAssessment['financialImpact'] {
  const result: NonNullable<ImpactAssessment['financialImpact']> = {}
  
  // Look for budget amounts
  const budgetRegex = /budżet[^\d]*([-+]?\d+[,.]?\d*)\s*(mln|miliard|tys\.?)/gi
  const budgetMatch = text.match(budgetRegex)
  if (budgetMatch) {
    const amount = extractAmount(budgetMatch[0])
    if (amount !== null) result.publicBudget = amount
  }
  
  // Look for citizen costs
  const citizenRegex = /obywatel[^\d]*([-+]?\d+[,.]?\d*)\s*(zł|PLN)/gi
  const citizenMatch = text.match(citizenRegex)
  if (citizenMatch) {
    const amount = extractAmount(citizenMatch[0])
    if (amount !== null) result.citizens = amount
  }
  
  // Look for business costs
  const businessRegex = /przedsiębiorstw[^\d]*([-+]?\d+[,.]?\d*)\s*(mln|miliard|tys\.?)/gi
  const businessMatch = text.match(businessRegex)
  if (businessMatch) {
    const amount = extractAmount(businessMatch[0])
    if (amount !== null) result.businesses = amount
  }
  
  return Object.keys(result).length > 0 ? result : undefined
}

/**
 * Extract social impact from OSR text
 */
function extractSocialImpact(text: string): ImpactAssessment['socialImpact'] {
  const result: NonNullable<ImpactAssessment['socialImpact']> = {}
  
  // Look for affected groups
  const groupKeywords = ['osoby niepełnosprawne', 'seniorzy', 'rodziny', 'przedsiębiorcy', 'pracownicy', 'studenci']
  const affectedGroups: string[] = []
  
  for (const group of groupKeywords) {
    if (text.toLowerCase().includes(group)) {
      affectedGroups.push(group)
    }
  }
  
  if (affectedGroups.length > 0) {
    result.affectedGroups = affectedGroups
  }
  
  // Extract description
  result.description = extractSection(text, ['skutki społeczne', 'wpływ społeczny'])
  
  return Object.keys(result).length > 0 ? result : undefined
}

/**
 * Extract economic impact from OSR text
 */
function extractEconomicImpact(text: string): ImpactAssessment['economicImpact'] {
  const result: NonNullable<ImpactAssessment['economicImpact']> = {}
  
  const lowerText = text.toLowerCase()
  
  // Check GDP effect
  if (lowerText.includes('wzrost pkb') || lowerText.includes('pozytywny wpływ na pkb')) {
    result.gdpEffect = 'positive'
  } else if (lowerText.includes('spadek pkb') || lowerText.includes('negatywny wpływ na pkb')) {
    result.gdpEffect = 'negative'
  } else if (lowerText.includes('pkb')) {
    result.gdpEffect = 'neutral'
  }
  
  // Check employment effect
  if (lowerText.includes('wzrost zatrudnienia') || lowerText.includes('nowe miejsca pracy')) {
    result.employmentEffect = 'positive'
  } else if (lowerText.includes('spadek zatrudnienia') || lowerText.includes('utrata miejsc pracy')) {
    result.employmentEffect = 'negative'
  } else if (lowerText.includes('zatrudnienie')) {
    result.employmentEffect = 'neutral'
  }
  
  result.description = extractSection(text, ['skutki gospodarcze', 'wpływ ekonomiczny', 'wpływ na gospodarkę'])
  
  return Object.keys(result).length > 0 ? result : undefined
}

/**
 * Extract numerical amount from text
 */
function extractAmount(text: string): number | null {
  const match = text.match(/([-+]?\d+[,.]?\d*)/)
  if (!match) return null
  
  let amount = parseFloat(match[1].replace(',', '.'))
  
  // Apply multiplier
  if (text.includes('mld') || text.includes('miliard')) {
    amount *= 1_000_000_000
  } else if (text.includes('mln') || text.includes('milion')) {
    amount *= 1_000_000
  } else if (text.includes('tys')) {
    amount *= 1_000
  }
  
  return amount
}

/**
 * Match RCL project with Sejm bill by title similarity
 */
export function matchRCLtoSejmBill(rclTitle: string, sejmTitle: string): boolean {
  const normalize = (str: string) => 
    str.toLowerCase()
      .replace(/[^a-ząćęłńóśźż\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  
  const rcl = normalize(rclTitle)
  const sejm = normalize(sejmTitle)
  
  // Check for significant overlap
  const words1 = rcl.split(' ').filter(w => w.length > 3)
  const words2 = sejm.split(' ').filter(w => w.length > 3)
  
  const commonWords = words1.filter(w => words2.includes(w))
  const similarity = commonWords.length / Math.max(words1.length, words2.length)
  
  return similarity > 0.5 // 50% podobieństwa
}

/**
 * Extract ministry from RCL project
 */
export function extractMinistry(text: string): string | undefined {
  const ministries = [
    'Ministerstwo Cyfryzacji',
    'Ministerstwo Sprawiedliwości',
    'Ministerstwo Finansów',
    'Ministerstwo Zdrowia',
    'Ministerstwo Edukacji',
    'Ministerstwo Klimatu',
    'Ministerstwo Kultury',
    'Ministerstwo Obrony Narodowej',
    'Ministerstwo Spraw Wewnętrznych',
    'Ministerstwo Spraw Zagranicznych',
    'Ministerstwo Rozwoju',
    'Ministerstwo Rolnictwa',
    'Kancelaria Prezesa Rady Ministrów'
  ]
  
  for (const ministry of ministries) {
    if (text.includes(ministry)) {
      return ministry
    }
  }
  
  return undefined
}
