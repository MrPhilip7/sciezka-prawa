import { NextRequest, NextResponse } from 'next/server'
import { parseImpactAssessment } from '@/lib/api/rcl'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs' // Required for pdf-parse which uses native Node.js modules

/**
 * Parse Impact Assessment (OSR) document
 * POST /api/admin/parse-osr
 * Body: { url: string, billId?: string }
 */
export async function POST(request: NextRequest) {
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

    if (!profile || !['admin', 'super_admin', 'moderator'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { url, billId } = body

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    console.log(`[OSR Parser] Parsing document from: ${url}`)

    // Parse the OSR document
    const impact = await parseImpactAssessment(url)

    if (!impact) {
      return NextResponse.json({ error: 'Failed to parse OSR document' }, { status: 500 })
    }

    // If billId provided, save to database
    if (billId) {
      // Update bill with impact_assessment_url
      await supabase
        .from('bills')
        .update({ impact_assessment_url: url })
        .eq('id', billId)

      // Save impact data as event
      const { error: eventError } = await supabase
        .from('bill_events')
        .insert({
          bill_id: billId,
          event_type: 'impact_assessment',
          event_date: new Date().toISOString(),
          description: impact.summary || 'Ocena Skutków Regulacji',
          details: impact as unknown as Record<string, any>,
        })

      if (eventError) {
        console.error('[OSR Parser] Failed to save event:', eventError)
      } else {
        console.log(`[OSR Parser] Saved impact assessment for bill ${billId}`)
      }
    }

    return NextResponse.json({
      success: true,
      data: impact,
    })
  } catch (error) {
    console.error('[OSR Parser] Error:', error)
    return NextResponse.json(
      { error: 'Failed to parse OSR document', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
