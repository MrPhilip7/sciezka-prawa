import { NextRequest, NextResponse } from 'next/server'
import { 
  scrapeEnhancedRCLProjects, 
  getEnhancedConsultations, 
  parseEnhancedImpactAssessment 
} from '@/lib/api/rcl-enhanced'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes for comprehensive sync

/**
 * Enhanced RCL Sync - zgodnie z wymaganiami projektu
 * POST /api/admin/sync-rcl-enhanced
 * 
 * Integruje:
 * - Rządowe Centrum Legislacji (RCL)
 * - Konsultacje społeczne
 * - Prekonsultacje
 * - Oceny Skutków Regulacji (OSR)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Authorization check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    console.log('[RCL Enhanced Sync] Starting comprehensive RCL sync...')

    const results = {
      rclProjects: 0,
      consultations: 0,
      impactAssessments: 0,
      billsUpdated: 0,
      billsCreated: 0,
      errors: [] as string[],
    }

    // 1. Fetch RCL Projects
    const rclProjects = await scrapeEnhancedRCLProjects()
    results.rclProjects = rclProjects.length
    console.log(`[RCL Enhanced Sync] Found ${rclProjects.length} RCL projects`)

    // 2. Fetch Consultations
    const consultations = await getEnhancedConsultations()
    results.consultations = consultations.length
    console.log(`[RCL Enhanced Sync] Found ${consultations.length} consultations`)

    // 3. Process each RCL project
    for (const project of rclProjects) {
      try {
        // Try to find matching bill by rcl_id or title
        const { data: existingBills } = await supabase
          .from('bills')
          .select('id, title, sejm_id, rcl_id, status')
          .or(`rcl_id.eq.${project.id},title.ilike.%${project.title.substring(0, 50)}%`)
          .limit(5)

        let billId: string | null = null

        if (existingBills && existingBills.length > 0) {
          // Update existing bill
          const bill = existingBills[0]
          billId = bill.id

          const updateData: any = {
            rcl_id: project.id,
            ministry: project.ministry || (bill as any).ministry,
            last_updated: new Date().toISOString(),
          }

          // Update status if in earlier stage
          if (project.status && shouldUpdateStatus(bill.status, project.status)) {
            updateData.status = project.status
          }

          // Update consultation dates
          if (project.consultationStartDate) {
            updateData.consultation_start_date = project.consultationStartDate
          }
          if (project.consultationEndDate) {
            updateData.consultation_end_date = project.consultationEndDate
          }
          if (project.consultationUrl) {
            updateData.consultation_url = project.consultationUrl
          }

          // Update preconsultation dates (new fields would need to be added to schema)
          if (project.impactAssessmentUrl) {
            updateData.impact_assessment_url = project.impactAssessmentUrl
          }

          const { error } = await supabase
            .from('bills')
            .update(updateData)
            .eq('id', billId)

          if (error) {
            results.errors.push(`Error updating bill ${bill.sejm_id}: ${error.message}`)
          } else {
            results.billsUpdated++
            console.log(`[RCL Enhanced Sync] Updated bill: ${bill.sejm_id}`)
          }

        } else {
          // Create new bill from RCL data (if it's not yet in Sejm)
          // Map project status to valid bill status
          const validStatus = mapProjectStatusToBillStatus(project.status)
          
          const { data: newBill, error } = await supabase
            .from('bills')
            .insert({
              sejm_id: project.id, // Use RCL ID as temporary sejm_id
              rcl_id: project.id,
              title: project.title,
              description: project.description,
              status: validStatus,
              ministry: project.ministry,
              consultation_start_date: project.consultationStartDate,
              consultation_end_date: project.consultationEndDate,
              consultation_url: project.consultationUrl,
              impact_assessment_url: project.impactAssessmentUrl,
              external_url: project.rclUrl,
              document_type: project.documentType,
              last_updated: new Date().toISOString(),
            })
            .select()
            .single()

          if (error) {
            results.errors.push(`Error creating bill from RCL ${project.id}: ${error.message}`)
          } else {
            billId = newBill.id
            results.billsCreated++
            console.log(`[RCL Enhanced Sync] Created new bill from RCL: ${project.id}`)
          }
        }

        // 4. Parse Impact Assessment if available
        if (billId && project.impactAssessmentUrl) {
          try {
            const impact = await parseEnhancedImpactAssessment(project.impactAssessmentUrl)
            
            if (impact) {
              // Store impact assessment as bill event
              await supabase
                .from('bill_events')
                .upsert({
                  bill_id: billId,
                  event_type: 'impact_assessment',
                  event_date: new Date().toISOString(),
                  description: impact.summary || 'Ocena Skutków Regulacji (OSR)',
                  details: impact as unknown as Record<string, any>,
                })

              results.impactAssessments++
            }
          } catch (err: any) {
            results.errors.push(`Error parsing impact assessment for ${project.id}: ${err.message}`)
          }
        }

        // 5. Create consultation events
        const relatedConsultations = consultations.filter(
          c => c.projectId === project.id || c.title.includes(project.title.substring(0, 30))
        )

        for (const consultation of relatedConsultations) {
          if (billId) {
            try {
              await supabase
                .from('bill_events')
                .upsert({
                  bill_id: billId,
                  event_type: consultation.type === 'preconsultation' ? 'preconsultation_started' : 'consultation_started',
                  event_date: consultation.startDate,
                  description: `${consultation.type === 'preconsultation' ? 'Prekonsultacje' : 'Konsultacje'}: ${consultation.title}`,
                  details: {
                    consultationId: consultation.id,
                    endDate: consultation.endDate,
                    url: consultation.url,
                    status: consultation.status,
                  },
                })
            } catch (err) {
              console.error(`[RCL Enhanced Sync] Error creating consultation event:`, err)
            }
          }
        }

      } catch (err: any) {
        results.errors.push(`Error processing project ${project.id}: ${err.message}`)
        console.error(`[RCL Enhanced Sync] Error processing project:`, err)
      }
    }

    console.log('[RCL Enhanced Sync] Sync completed:', results)

    return NextResponse.json({
      success: true,
      message: 'RCL Enhanced sync completed',
      results,
    })

  } catch (error: any) {
    console.error('[RCL Enhanced Sync] Fatal error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to sync RCL data',
      },
      { status: 500 }
    )
  }
}

/**
 * Helper: Map RCL project status to valid bill status
 */
function mapProjectStatusToBillStatus(projectStatus: string): 'co_creation' | 'preconsultation' | 'draft' | 'submitted' | 'first_reading' | 'committee' | 'second_reading' | 'third_reading' | 'senate' | 'presidential' | 'published' | 'rejected' {
  switch (projectStatus) {
    case 'co_creation':
      return 'co_creation'
    case 'preconsultation':
      return 'preconsultation'
    case 'consultation':
      return 'draft' // Consultation is treated as draft stage
    case 'completed':
      return 'draft' // Completed projects that haven't entered Sejm
    default:
      return 'draft'
  }
}

/**
 * Helper: Determine if status should be updated
 */
function shouldUpdateStatus(currentStatus: string, newStatus: string): boolean {
  const statusOrder = [
    'co_creation',
    'preconsultation',
    'draft',
    'consultation',
    'submitted',
    'first_reading',
    'committee',
    'second_reading',
    'third_reading',
    'senate',
    'presidential',
    'published',
    'rejected',
  ]

  const currentIndex = statusOrder.indexOf(currentStatus)
  const newIndex = statusOrder.indexOf(newStatus)

  // Update if new status is earlier or if current status is not found
  return currentIndex === -1 || (newIndex !== -1 && newIndex < currentIndex)
}
