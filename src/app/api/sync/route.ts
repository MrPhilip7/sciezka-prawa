import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchSejmPrints, mapSejmStatusToInternal } from '@/lib/api/sejm'

export const dynamic = 'force-dynamic'

/**
 * Sync legislative data from Sejm API to Supabase
 * This endpoint can be called by a cron job
 */
export async function POST(request: Request) {
  try {
    // Verify authorization (you should add proper API key verification)
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    
    // Fetch prints from Sejm API
    const prints = await fetchSejmPrints(10) // Term 10

    let synced = 0
    let errors = 0

    for (const print of prints.slice(0, 50)) { // Limit to 50 for safety
      try {
        // Check if bill already exists
        const { data: existing } = await supabase
          .from('bills')
          .select('id')
          .eq('sejm_id', `DRUK-${print.number}`)
          .single()

        if (existing) {
          // Update existing bill
          await supabase
            .from('bills')
            .update({
              title: print.title,
              last_updated: new Date().toISOString(),
            })
            .eq('id', existing.id)
        } else {
          // Insert new bill
          await supabase
            .from('bills')
            .insert({
              sejm_id: `DRUK-${print.number}`,
              title: print.title,
              submission_date: print.documentDate,
              status: 'submitted',
              external_url: `https://www.sejm.gov.pl/sejm10.nsf/druk.xsp?nr=${print.number}`,
              document_type: 'projekt_ustawy',
            })
        }
        synced++
      } catch (err) {
        console.error(`Error syncing print ${print.number}:`, err)
        errors++
      }
    }

    return NextResponse.json({
      success: true,
      synced,
      errors,
      message: `Synced ${synced} bills with ${errors} errors`,
    })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to sync data',
    endpoints: {
      'POST /api/sync': 'Sync legislative data from Sejm API',
    },
  })
}
