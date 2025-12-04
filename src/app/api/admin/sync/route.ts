import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchProcessWithStages, flattenStages, getStatusFromStages, type SejmProcessStage } from '@/lib/api/sejm'
import type { BillStatus } from '@/types/supabase'

const SEJM_API_BASE = 'https://api.sejm.gov.pl'
const TERM = 10
const PAGE_SIZE = 100 // Max items per request

interface SejmProcessStageInternal {
  stageName: string
  date: string
  children?: SejmProcessStageInternal[]
  stageType?: string
  committeeCode?: string
  printNumber?: string
  comment?: string
  decision?: string
}

interface SejmProcess {
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
  UE?: string
  stages?: SejmProcessStageInternal[]
  // Publication fields
  ELI?: string  // European Legislation Identifier - if present, means published
  passed?: boolean  // true if the bill/resolution was adopted
  closureDate?: string  // date when process was closed/completed
  address?: string  // ISAP publication address
  displayAddress?: string  // Display address like "Dz.U. 2024 poz. 123"
  titleFinal?: string  // Final title of the act after publication
}

interface SejmPrint {
  number: string
  term: number
  title: string
  documentDate: string
  deliveryDate?: string
  changeDate?: string
  processPrint?: string[]
}

// Map Sejm process state to our status
function mapStatus(process: SejmProcess, prints: SejmPrint[]): BillStatus {
  // CRITICAL: Check ELI and passed fields first - these are the authoritative 
  // indicators of publication from Sejm API
  if (process.ELI || process.passed === true) {
    return 'published'
  }
  
  // Check for keywords in title that indicate status
  const title = process.title.toLowerCase()
  
  if (title.includes('odrzucon') || title.includes('wycofan')) {
    return 'rejected'
  }
  
  // Analyze stages if available
  if (process.stages && process.stages.length > 0) {
    // Find the most recent stage
    const sortedStages = [...process.stages].sort((a, b) => 
      new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
    )
    
    const lastStage = sortedStages[0]
    const stageName = (lastStage?.stageName || '').toLowerCase()
    const stageType = (lastStage?.stageType || '').toLowerCase()
    
    // Check stage type from API
    if (stageType === 'publication' || stageName.includes('ogłoszenie')) {
      return 'published'
    }
    if (stageName.includes('prezydent') || stageType.includes('president')) {
      return 'presidential'
    }
    if (stageName.includes('senat') || stageType.includes('senate')) {
      return 'senate'
    }
    if (stageName.includes('iii czytanie') || stageName.includes('trzecie czytanie')) {
      return 'third_reading'
    }
    if (stageName.includes('ii czytanie') || stageName.includes('drugie czytanie')) {
      return 'second_reading'
    }
    if (stageName.includes('komisj') || stageType.includes('committee')) {
      return 'committee'
    }
    if (stageName.includes('i czytanie') || stageName.includes('pierwsze czytanie') || stageName.includes('skierowano')) {
      return 'first_reading'
    }
  }
  
  // Default to draft if just submitted
  const print = prints.find(p => p.processPrint?.includes(process.number))
  if (!print) {
    return 'draft'
  }
  
  return 'submitted'
}

// Extract ministry from createdBy field
function extractMinistry(createdBy?: string): string | null {
  if (!createdBy) return null
  
  const ministryPatterns = [
    /Rada Ministrów/i,
    /Ministerstwo[\w\s]+/i,
    /Minister[\w\s]+/i,
    /Prezes Rady Ministrów/i,
  ]
  
  for (const pattern of ministryPatterns) {
    const match = createdBy.match(pattern)
    if (match) return match[0]
  }
  
  return null
}

// Extract submitter type from documentType, createdBy, and title
function extractSubmitterType(docType?: string, createdBy?: string, title?: string): string {
  const type = (docType || '').toLowerCase()
  const by = (createdBy || '').toLowerCase()
  const t = (title || '').toLowerCase()
  
  // First check title - most reliable source
  if (t.includes('rządowy projekt') || t.includes('rzadowy projekt')) {
    return 'rządowy'
  }
  if (t.includes('poselski projekt')) {
    return 'poselski'
  }
  if (t.includes('senacki projekt') || t.includes('projekt senatu')) {
    return 'senacki'
  }
  if (t.includes('obywatelski projekt')) {
    return 'obywatelski'
  }
  if (t.includes('prezydencki projekt') || t.includes('projekt prezydenta')) {
    return 'prezydencki'
  }
  if (t.includes('komisyjny projekt') || t.includes('projekt komisji')) {
    return 'komisyjny'
  }
  
  // Then check documentType
  if (type.includes('rządow') || by.includes('rada ministrów') || by.includes('prezes rady ministrów')) {
    return 'rządowy'
  }
  if (type.includes('poselski') || by.includes('posł')) {
    return 'poselski'
  }
  if (type.includes('senat') || by.includes('senat')) {
    return 'senacki'
  }
  if (type.includes('obywatel')) {
    return 'obywatelski'
  }
  if (type.includes('prezydent') || by.includes('prezydent')) {
    return 'prezydencki'
  }
  if (type.includes('komisj')) {
    return 'komisyjny'
  }
  
  // Default based on createdBy patterns
  if (by.includes('minister') || by.includes('rząd')) return 'rządowy'
  if (by.includes('grupa posłów') || by.includes('klub')) return 'poselski'
  
  return 'inny'
}

// Extract category based on title keywords
function extractCategory(title: string): string {
  const t = title.toLowerCase()
  
  // Finanse i podatki
  if (t.includes('podatk') || t.includes('podatkow') || t.includes('vat') || 
      t.includes('akcyz') || t.includes('budżet') || t.includes('finansow') ||
      t.includes('skarbow') || t.includes('rachunkow')) {
    return 'finanse'
  }
  
  // Prawo karne
  if (t.includes('karn') || t.includes('przestęp') || t.includes('wykrocze') ||
      t.includes('więzie') || t.includes('prokurat') || t.includes('policj')) {
    return 'prawo_karne'
  }
  
  // Prawo cywilne
  if (t.includes('cywil') || t.includes('rodzin') || t.includes('spadk') ||
      t.includes('małżeń') || t.includes('własnoś')) {
    return 'prawo_cywilne'
  }
  
  // Zdrowie
  if (t.includes('zdrow') || t.includes('lecznic') || t.includes('szpital') ||
      t.includes('medycz') || t.includes('lekar') || t.includes('farmac') ||
      t.includes('ubezpiecz') && t.includes('zdrow')) {
    return 'zdrowie'
  }
  
  // Edukacja
  if (t.includes('edukac') || t.includes('szkoł') || t.includes('naucz') ||
      t.includes('student') || t.includes('uczelni') || t.includes('oświat')) {
    return 'edukacja'
  }
  
  // Środowisko
  if (t.includes('środowisk') || t.includes('klimat') || t.includes('ekolog') ||
      t.includes('odpad') || t.includes('emisj') || t.includes('ochrony przyrody')) {
    return 'środowisko'
  }
  
  // Obronność i bezpieczeństwo (narodowe/państwa, nie ubezpieczenia)
  const isMilitary = t.includes('obronnoś') || t.includes('obronno') || t.includes('obrony narodowej') ||
                     t.includes('wojsk') || t.includes('żołnier') || t.includes('sił zbrojnych') ||
                     t.includes('armii') || t.includes('granicz') || t.includes('straż') ||
                     t.includes('policj') || t.includes('służb specjaln') ||
                     (t.includes('bezpieczeńst') && !t.includes('ubezpiecz') && 
                      (t.includes('narodow') || t.includes('państw') || t.includes('publiczn') || t.includes('wewnętrzn')))
  if (isMilitary) {
    return 'obronność'
  }
  
  // Cyfryzacja
  if (t.includes('cyfrow') || t.includes('elektron') || t.includes('internet') ||
      t.includes('danych osobow') || t.includes('informaty')) {
    return 'cyfryzacja'
  }
  
  // Praca i polityka społeczna
  if (t.includes('prac') && (t.includes('kodeks') || t.includes('zatrudn')) ||
      t.includes('emeryt') || t.includes('rent') || t.includes('zasiłk') ||
      t.includes('społeczn') || t.includes('socjaln')) {
    return 'praca_społeczna'
  }
  
  // Transport
  if (t.includes('transport') || t.includes('drogo') || t.includes('kolej') ||
      t.includes('lotnisk') || t.includes('ruchu drogowym')) {
    return 'transport'
  }
  
  // Rolnictwo
  if (t.includes('rolnic') || t.includes('rolnik') || t.includes('żywnoś') ||
      t.includes('weterynar')) {
    return 'rolnictwo'
  }
  
  // Samorząd
  if (t.includes('samorząd') || t.includes('gminn') || t.includes('powiat') ||
      t.includes('wojewód') || t.includes('lokaln')) {
    return 'samorząd'
  }
  
  return 'inne'
}

// Extract tags from title
function extractTags(title: string): string[] {
  const tags: string[] = []
  const t = title.toLowerCase()
  
  // Common keywords to tag
  const tagPatterns: [RegExp, string][] = [
    [/podatk|podatkow|vat|pit|cit/i, 'podatki'],
    [/budżet/i, 'budżet'],
    [/emerytur|rent/i, 'emerytury'],
    [/zdrow|medycz|lecznic/i, 'zdrowie'],
    [/edukac|szkoł|oświat/i, 'edukacja'],
    [/klimat|środowisk|ekolog/i, 'klimat'],
    [/wojsk|sił zbrojnych|żołnier|obronnoś|obrony narodowej/i, 'bezpieczeństwo'],
    [/cyfrow|elektron|internet/i, 'cyfryzacja'],
    [/rolnic|rolnik/i, 'rolnictwo'],
    [/transport|drogo|kolej/i, 'transport'],
    [/mieszka|budowlan/i, 'mieszkalnictwo'],
    [/sąd|sędziow|sprawiedliw/i, 'sądownictwo'],
    [/wybor|referendum|głosow/i, 'wybory'],
    [/energi|prąd|gaz/i, 'energia'],
    [/prac|zatrudni|związk/i, 'praca'],
    [/ubezpiecz/i, 'ubezpieczenia'],
  ]
  
  for (const [pattern, tag] of tagPatterns) {
    if (pattern.test(t) && !tags.includes(tag)) {
      tags.push(tag)
    }
  }
  
  return tags
}

// Map document type
function mapDocumentType(docType?: string): string {
  if (!docType) return 'projekt_ustawy'
  
  const type = docType.toLowerCase()
  if (type.includes('budżet')) return 'ustawa_budzetowa'
  if (type.includes('uchwał')) return 'projekt_uchwaly'
  if (type.includes('ratyfikac')) return 'ratyfikacja'
  
  return 'projekt_ustawy'
}

// Fetch all processes with pagination
async function fetchAllProcesses(): Promise<SejmProcess[]> {
  const allProcesses: SejmProcess[] = []
  let offset = 0
  let hasMore = true

  while (hasMore) {
    const response = await fetch(
      `${SEJM_API_BASE}/sejm/term${TERM}/processes?offset=${offset}&limit=${PAGE_SIZE}`,
      { headers: { 'Accept': 'application/json' } }
    )

    if (!response.ok) {
      throw new Error(`Sejm API error: ${response.status}`)
    }

    const batch: SejmProcess[] = await response.json()
    allProcesses.push(...batch)

    if (batch.length < PAGE_SIZE) {
      hasMore = false
    } else {
      offset += PAGE_SIZE
    }
  }

  return allProcesses
}

// Fetch single process with full details (including stages)
async function fetchProcessDetails(processNumber: string): Promise<SejmProcess | null> {
  try {
    const response = await fetch(
      `${SEJM_API_BASE}/sejm/term${TERM}/processes/${processNumber}`,
      { headers: { 'Accept': 'application/json' } }
    )

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error(`Error fetching process ${processNumber}:`, error)
    return null
  }
}

export async function POST() {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Wymagane uwierzytelnienie' },
        { status: 401 }
      )
    }

    // Fetch ALL processes from Sejm API with pagination
    const allProcesses = await fetchAllProcesses()
    
    // Filter only actual bills (projekty ustaw, uchwały)
    const processes = allProcesses.filter(p => {
      const docType = (p.documentType || '').toLowerCase()
      return docType.includes('projekt ustawy') || 
             docType.includes('projekt uchwały') ||
             docType.includes('ustawa') ||
             docType.includes('uchwała')
    })

    console.log(`Found ${allProcesses.length} total processes, ${processes.length} are bills/resolutions`)

    // Fetch prints for cross-reference (also with pagination if needed)
    const printsResponse = await fetch(`${SEJM_API_BASE}/sejm/term${TERM}/prints?limit=1000`, {
      headers: { 'Accept': 'application/json' },
    })

    let prints: SejmPrint[] = []
    if (printsResponse.ok) {
      prints = await printsResponse.json()
    }

    let inserted = 0
    let updated = 0
    let eventsInserted = 0
    const errors: string[] = []
    let processedCount = 0

    // Process each legislative process
    for (const process of processes) {
      try {
        processedCount++
        if (processedCount % 50 === 0) {
          console.log(`Processing ${processedCount}/${processes.length}...`)
        }
        
        const sejmId = `${TERM}-${process.number}`
        const externalUrl = `https://www.sejm.gov.pl/Sejm${TERM}.nsf/PrzebiegProc.xsp?nr=${process.number}`
        const submissionDate = process.documentDate || process.processStartDate || null
        const submissionYear = submissionDate ? new Date(submissionDate).getFullYear() : null
        
        // Pobierz pełne dane procesu (w tym stages) - endpoint listy nie zwraca stages
        const fullProcess = await fetchProcessDetails(process.number)
        const stages = fullProcess?.stages || []
        const stageEvents = flattenStages(stages as SejmProcessStage[])
        
        // Determine status - check ELI/passed first (authoritative), then stages
        let status: BillStatus
        if (fullProcess?.ELI || fullProcess?.passed === true) {
          status = 'published'
        } else if (stages.length > 0) {
          status = getStatusFromStages(stages as SejmProcessStage[]) as BillStatus
        } else {
          status = mapStatus(process, prints)
        }
        
        // Check if bill already exists
        const { data: existing } = await supabase
          .from('bills')
          .select('id')
          .eq('sejm_id', sejmId)
          .single()

        // Determine last_updated from latest event date (not sync date)
        let lastUpdated: string
        if (stageEvents.length > 0) {
          // Sort events by date descending and take the most recent
          const sortedEvents = [...stageEvents].sort((a, b) => 
            new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
          )
          lastUpdated = sortedEvents[0].event_date
        } else if (submissionDate) {
          lastUpdated = submissionDate
        } else {
          lastUpdated = new Date().toISOString()
        }

        const billData = {
          sejm_id: sejmId,
          title: process.title,
          description: process.description || process.principlesOfLaw || null,
          status: status,
          ministry: extractMinistry(process.createdBy),
          submission_date: submissionDate,
          external_url: externalUrl,
          document_type: mapDocumentType(process.documentType),
          submitter_type: extractSubmitterType(process.documentType, process.createdBy, process.title),
          category: extractCategory(process.title),
          term: TERM,
          tags: extractTags(process.title),
          submission_year: submissionYear,
          last_updated: lastUpdated,
        }

        let billId: string

        if (existing) {
          // Update existing bill
          const { error } = await supabase
            .from('bills')
            .update(billData)
            .eq('id', existing.id)

          if (error) throw error
          billId = existing.id
          updated++
        } else {
          // Insert new bill
          const { data: newBill, error } = await supabase
            .from('bills')
            .insert(billData)
            .select('id')
            .single()

          if (error) throw error
          billId = newBill.id
          inserted++
        }

        // Sync events for this bill
        if (stageEvents.length > 0 && billId) {
          // Delete existing events and re-insert (to keep in sync)
          await supabase
            .from('bill_events')
            .delete()
            .eq('bill_id', billId)

          // Insert new events
          const eventsToInsert = stageEvents.map(event => ({
            bill_id: billId,
            event_type: event.event_type,
            event_date: event.event_date,
            description: event.description,
          }))

          const { error: eventsError } = await supabase
            .from('bill_events')
            .insert(eventsToInsert)

          if (eventsError) {
            console.error(`Error inserting events for ${process.number}:`, eventsError)
          } else {
            eventsInserted += eventsToInsert.length
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        console.error(`Error syncing process ${process.number}:`, err)
        errors.push(`${process.number}: ${message}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synchronizacja zakończona. Znaleziono ${processes.length} procesów.`,
      total: processes.length,
      inserted,
      updated,
      eventsInserted,
      errors: errors.length > 0 ? errors : undefined,
    })

  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Błąd synchronizacji' 
      },
      { status: 500 }
    )
  }
}
