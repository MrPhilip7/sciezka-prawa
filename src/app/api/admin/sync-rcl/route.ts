import { NextRequest, NextResponse } from 'next/server'
import { scrapeRCLProjects, getRCLConsultations, parseImpactAssessment } from '@/lib/api/rcl'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * Sync RCL (Rządowe Centrum Legislacji) projects
 * GET /api/admin/sync-rcl
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if user is admin
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
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    console.log('[RCL Sync] Starting RCL projects sync...')

    // Fetch RCL projects
    const rclProjects = await scrapeRCLProjects()
    console.log(`[RCL Sync] Found ${rclProjects.length} RCL projects`)

    // Fetch consultations
    const consultations = await getRCLConsultations()
    console.log(`[RCL Sync] Found ${consultations.length} consultations`)

    let updatedCount = 0
    let newConsultationsCount = 0

    // Match RCL projects with existing bills and update
    for (const rclProject of rclProjects) {
      // Try to find matching bill by title similarity
      const { data: bills } = await supabase
        .from('bills')
        .select('id, title, sejm_id, ministry')
        .limit(100)

      if (!bills) continue

      // Find best match
      let bestMatch = null
      let bestSimilarity = 0

      for (const bill of bills) {
        const similarity = calculateTitleSimilarity(rclProject.title, bill.title)
        if (similarity > bestSimilarity && similarity > 0.5) {
          bestSimilarity = similarity
          bestMatch = bill
        }
      }

      if (bestMatch) {
        // Update bill with RCL data
        const { error } = await supabase
          .from('bills')
          .update({
            rcl_id: rclProject.id,
            consultation_start_date: rclProject.consultationStartDate || null,
            consultation_end_date: rclProject.consultationEndDate || null,
            consultation_url: rclProject.consultationUrl || null,
            impact_assessment_url: rclProject.impactAssessmentUrl || null,
            ministry: rclProject.ministry || bestMatch.ministry,
          })
          .eq('id', bestMatch.id)

        if (!error) {
          updatedCount++
          console.log(`[RCL Sync] Updated bill ${bestMatch.sejm_id} with RCL data`)

          // Parse impact assessment if URL exists
          if (rclProject.impactAssessmentUrl) {
            const impact = await parseImpactAssessment(rclProject.impactAssessmentUrl)
            if (impact) {
              // Store impact data in bill_events or separate table
              await supabase
                .from('bill_events')
                .insert({
                  bill_id: bestMatch.id,
                  event_type: 'impact_assessment',
                  event_date: new Date().toISOString(),
                  description: impact.summary,
                  details: impact as unknown as Record<string, any>,
                })
            }
          }
        }
      }
    }

    // Store consultations data
    for (const consultation of consultations) {
      // Find matching bill
      const { data: bill } = await supabase
        .from('bills')
        .select('id')
        .eq('rcl_id', consultation.projectId)
        .single()

      if (bill) {
        await supabase
          .from('bill_events')
          .insert({
            bill_id: bill.id,
            event_type: consultation.status === 'active' ? 'consultation_open' : 'consultation_closed',
            event_date: consultation.status === 'active' ? consultation.startDate : consultation.endDate,
            description: `Konsultacje społeczne: ${consultation.title}`,
            details: {
              consultation_id: consultation.id,
              url: consultation.url,
              comments_count: consultation.commentsCount,
            },
          })
        newConsultationsCount++
      }
    }

    console.log('[RCL Sync] Sync completed')

    return NextResponse.json({
      success: true,
      message: 'RCL sync completed',
      stats: {
        rclProjectsFound: rclProjects.length,
        billsUpdated: updatedCount,
        consultationsAdded: newConsultationsCount,
      },
    })
  } catch (error) {
    console.error('[RCL Sync] Error:', error)
    return NextResponse.json(
      { error: 'Failed to sync RCL data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

function calculateTitleSimilarity(title1: string, title2: string): number {
  const normalize = (str: string) =>
    str
      .toLowerCase()
      .replace(/[^a-ząćęłńóśźż\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()

  const words1 = normalize(title1).split(' ').filter((w) => w.length > 3)
  const words2 = normalize(title2).split(' ').filter((w) => w.length > 3)

  const commonWords = words1.filter((w) => words2.includes(w))
  return commonWords.length / Math.max(words1.length, words2.length)
}
