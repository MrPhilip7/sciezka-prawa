// Enhanced RCL (Rządowe Centrum Legislacji) Integration
// Zgodnie z wymaganiami projektu - połączenie RCL, Sejm, konsultacje i prekonsultacje

import * as cheerio from 'cheerio'

const RCL_BASE = 'https://legislacja.rcl.gov.pl'
const RCL_PROJECTS_URL = `${RCL_BASE}/projects.html`
const RCL_CONSULTATIONS_URL = `${RCL_BASE}/lista-konsultacji-projekt-aktow-prawnych`

export interface EnhancedRCLProject {
  id: string
  title: string
  status: 'co_creation' | 'preconsultation' | 'draft' | 'consultation' | 'completed'
  ministry?: string
  description?: string
  documentType?: string
  
  // Consultation info
  consultationStartDate?: string
  consultationEndDate?: string
  consultationUrl?: string
  isConsultationActive?: boolean
  
  // Preconsultation info
  preconsultationStartDate?: string
  preconsultationEndDate?: string
  preconsultationUrl?: string
  isPreconsultationActive?: boolean
  
  // Impact Assessment (OSR)
  impactAssessmentUrl?: string
  impactAssessmentSummary?: string
  
  // Links
  rclUrl?: string
  documentUrl?: string
  
  // Metadata
  lastUpdate?: string
  submittedBy?: string
  legislativeStage?: string
}

export interface ConsultationDetails {
  id: string
  projectId: string
  title: string
  type: 'preconsultation' | 'consultation'
  startDate: string
  endDate: string
  status: 'upcoming' | 'active' | 'completed'
  url: string
  
  // Participation metrics
  commentsCount?: number
  participantsCount?: number
  documentsCount?: number
  
  // How to participate
  participationMethods?: string[]
  contactEmail?: string
  
  // Results
  resultsPublished?: boolean
  resultsUrl?: string
}

export interface ImpactAssessmentDetailed {
  projectId: string
  url: string
  documentDate?: string
  
  // Financial Impact
  financialImpact?: {
    publicBudget?: {
      amount: number
      currency: string
      timeframe: string
      description: string
    }
    citizensImpact?: {
      amount: number
      description: string
      affectedCount?: number
    }
    businessesImpact?: {
      amount: number
      description: string
      affectedSectors?: string[]
    }
    total?: number
  }
  
  // Social Impact
  socialImpact?: {
    affectedGroups: string[]
    positiveEffects?: string[]
    negativeEffects?: string[]
    description: string
    equityAssessment?: string
  }
  
  // Economic Impact
  economicImpact?: {
    gdpEffect?: string
    employmentEffect?: string
    competitivenessEffect?: string
    description: string
  }
  
  // Environmental Impact
  environmentalImpact?: {
    climateEffect?: string
    biodiversityEffect?: string
    resourceUsage?: string
    description?: string
  }
  
  // Legal/Administrative Impact
  legalImpact?: {
    conflictingRegulations?: string[]
    harmonizationNeeded?: boolean
    administrativeBurden?: string
    simplificationPotential?: string
  }
  
  // Summary
  summary?: string
  recommendations?: string[]
}

/**
 * Enhanced RCL project scraper with better parsing
 */
export async function scrapeEnhancedRCLProjects(): Promise<EnhancedRCLProject[]> {
  try {
    console.log('[RCL Enhanced] Fetching projects from RCL...')
    
    const response = await fetch(RCL_PROJECTS_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pl,en-US;q=0.7,en;q=0.3',
      },
      next: { revalidate: 1800 } // Cache for 30 minutes
    })
    
    if (!response.ok) {
      throw new Error(`RCL HTTP error: ${response.status}`)
    }
    
    const html = await response.text()
    const $ = cheerio.load(html)
    const projects: EnhancedRCLProject[] = []
    
    // Parse project list - adjust selectors based on actual RCL HTML structure
    $('.project-item, .legislation-item, tr.project-row').each((_, element) => {
      try {
        const $el = $(element)
        
        // Extract basic info
        const title = $el.find('.project-title, .title, td.title').text().trim()
        const id = $el.attr('data-project-id') || 
                   $el.find('a').attr('href')?.match(/\/(\d+)\/?$/)?.[1] || 
                   generateIdFromTitle(title)
        
        if (!title || !id) return
        
        const ministry = $el.find('.ministry, .department, td.ministry').text().trim()
        const status = parseRCLStatus($el.find('.status, .stage, td.status').text().trim())
        const description = $el.find('.description, .summary').text().trim()
        
        // Extract dates
        const consultationStart = $el.find('.consultation-start, [data-consultation-start]').text().trim()
        const consultationEnd = $el.find('.consultation-end, [data-consultation-end]').text().trim()
        
        // Extract URLs
        const projectUrl = $el.find('a.project-link, a.title-link').attr('href')
        const rclUrl = projectUrl ? normalizeRCLUrl(projectUrl) : undefined
        
        projects.push({
          id,
          title,
          status,
          ministry: ministry || undefined,
          description: description || undefined,
          consultationStartDate: consultationStart || undefined,
          consultationEndDate: consultationEnd || undefined,
          isConsultationActive: isDateRangeActive(consultationStart, consultationEnd),
          rclUrl,
          lastUpdate: new Date().toISOString(),
        })
      } catch (err) {
        console.error('[RCL Enhanced] Error parsing project element:', err)
      }
    })
    
    console.log(`[RCL Enhanced] Parsed ${projects.length} projects`)
    return projects
    
  } catch (error) {
    console.error('[RCL Enhanced] Error scraping projects:', error)
    return []
  }
}

/**
 * Get detailed consultation information
 */
export async function getEnhancedConsultations(): Promise<ConsultationDetails[]> {
  try {
    console.log('[RCL Enhanced] Fetching consultations...')
    
    const response = await fetch(RCL_CONSULTATIONS_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      next: { revalidate: 900 } // Cache for 15 minutes
    })
    
    if (!response.ok) {
      throw new Error(`RCL consultations HTTP error: ${response.status}`)
    }
    
    const html = await response.text()
    const $ = cheerio.load(html)
    const consultations: ConsultationDetails[] = []
    
    $('.consultation-item, .konsultacja-item, tr.consultation-row').each((_, element) => {
      try {
        const $el = $(element)
        
        const title = $el.find('.title, .consultation-title, td.title').text().trim()
        const id = $el.attr('data-consultation-id') || generateIdFromTitle(title)
        
        if (!title) return
        
        const startDate = $el.find('.start-date, [data-start]').text().trim()
        const endDate = $el.find('.end-date, [data-end]').text().trim()
        const url = normalizeRCLUrl($el.find('a').attr('href') || '')
        
        const type = title.toLowerCase().includes('prekonsultacje') 
          ? 'preconsultation' 
          : 'consultation'
        
        const status = determineConsultationStatus(startDate, endDate)
        
        consultations.push({
          id,
          projectId: extractProjectIdFromUrl(url),
          title,
          type,
          startDate: startDate || new Date().toISOString(),
          endDate: endDate || new Date().toISOString(),
          status,
          url,
          commentsCount: parseInt($el.find('.comments-count').text()) || undefined,
        })
      } catch (err) {
        console.error('[RCL Enhanced] Error parsing consultation:', err)
      }
    })
    
    console.log(`[RCL Enhanced] Parsed ${consultations.length} consultations`)
    return consultations
    
  } catch (error) {
    console.error('[RCL Enhanced] Error fetching consultations:', error)
    return []
  }
}

/**
 * Enhanced Impact Assessment parser with detailed extraction
 */
export async function parseEnhancedImpactAssessment(url: string): Promise<ImpactAssessmentDetailed | null> {
  try {
    console.log(`[RCL Enhanced] Parsing impact assessment: ${url}`)
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    })
    
    if (!response.ok) {
      throw new Error(`OSR fetch failed: ${response.status}`)
    }
    
    const contentType = response.headers.get('content-type') || ''
    
    if (contentType.includes('pdf')) {
      return await parsePDFImpactAssessment(url)
    } else if (contentType.includes('html')) {
      const html = await response.text()
      return parseHTMLImpactAssessment(html, url)
    } else {
      console.warn(`[RCL Enhanced] Unsupported content type: ${contentType}`)
      return null
    }
    
  } catch (error) {
    console.error('[RCL Enhanced] Error parsing impact assessment:', error)
    return null
  }
}

/**
 * Parse HTML-based Impact Assessment
 */
async function parseHTMLImpactAssessment(html: string, url: string): Promise<ImpactAssessmentDetailed | null> {
  try {
    const $ = cheerio.load(html)
    
    // Extract structured data from OSR document
    const assessment: ImpactAssessmentDetailed = {
      projectId: extractProjectIdFromUrl(url),
      url,
      summary: $('.osr-summary, .summary, .streszczenie').text().trim() || undefined,
    }
    
    // Financial impact
    const budgetText = $('.financial-impact, .wplyw-finansowy, .budzet').text()
    if (budgetText) {
      assessment.financialImpact = {
        publicBudget: extractFinancialData(budgetText, 'budżet'),
        citizensImpact: extractFinancialData(budgetText, 'obywatel'),
        businessesImpact: extractFinancialData(budgetText, 'przedsiębiorc'),
      }
    }
    
    // Social impact
    const socialText = $('.social-impact, .wplyw-spoleczny').text()
    if (socialText) {
      assessment.socialImpact = {
        affectedGroups: extractAffectedGroups(socialText),
        description: socialText.trim(),
      }
    }
    
    // Economic impact
    const economicText = $('.economic-impact, .wplyw-gospodarczy').text()
    if (economicText) {
      assessment.economicImpact = {
        description: economicText.trim(),
      }
    }
    
    return assessment
    
  } catch (error) {
    console.error('[RCL Enhanced] Error parsing HTML OSR:', error)
    return null
  }
}

/**
 * Parse PDF-based Impact Assessment (placeholder - requires pdf-parse)
 */
async function parsePDFImpactAssessment(url: string): Promise<ImpactAssessmentDetailed | null> {
  // TODO: Implement PDF parsing with pdf-parse library
  console.log('[RCL Enhanced] PDF parsing not yet implemented:', url)
  return {
    projectId: extractProjectIdFromUrl(url),
    url,
    summary: 'Dokument OSR dostępny w formacie PDF - szczegóły wymagają parsowania',
  }
}

// Helper functions

function parseRCLStatus(statusText: string): EnhancedRCLProject['status'] {
  const lower = statusText.toLowerCase()
  if (lower.includes('współtworz') || lower.includes('co-creation')) return 'co_creation'
  if (lower.includes('prekonsultac')) return 'preconsultation'
  if (lower.includes('konsultac')) return 'consultation'
  if (lower.includes('projekt') || lower.includes('draft')) return 'draft'
  return 'draft'
}

function isDateRangeActive(startDate?: string, endDate?: string): boolean {
  if (!startDate || !endDate) return false
  const now = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)
  return now >= start && now <= end
}

function determineConsultationStatus(startDate: string, endDate: string): ConsultationDetails['status'] {
  if (!startDate || !endDate) return 'active'
  const now = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  if (now < start) return 'upcoming'
  if (now > end) return 'completed'
  return 'active'
}

function normalizeRCLUrl(url: string): string {
  if (!url) return ''
  if (url.startsWith('http')) return url
  if (url.startsWith('/')) return `${RCL_BASE}${url}`
  return `${RCL_BASE}/${url}`
}

function extractProjectIdFromUrl(url: string): string {
  const match = url.match(/\/(\d+)\/?$/)
  return match?.[1] || ''
}

function generateIdFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50)
}

function extractFinancialData(text: string, keyword: string) {
  // Simple extraction - can be enhanced with regex patterns
  const match = text.match(new RegExp(`${keyword}[^0-9]*([0-9,. ]+)\\s*(zł|PLN|mln|tys)`, 'i'))
  if (match) {
    return {
      amount: parseFloat(match[1].replace(/[,\s]/g, '').replace('.', ',')),
      currency: 'PLN',
      timeframe: 'rocznie',
      description: text.substring(Math.max(0, match.index! - 100), match.index! + 100),
    }
  }
  return undefined
}

function extractAffectedGroups(text: string): string[] {
  const groups = []
  const keywords = ['obywatele', 'przedsiębiorcy', 'samorządy', 'organizacje', 'pracownicy', 'konsumenci']
  
  for (const keyword of keywords) {
    if (text.toLowerCase().includes(keyword)) {
      groups.push(keyword)
    }
  }
  
  return groups
}
