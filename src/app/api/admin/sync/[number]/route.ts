import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { flattenStages, getStatusFromStages, SejmProcessStage } from '@/lib/api/sejm'
import type { Database } from '@/types/supabase'

const SEJM_API_BASE = 'https://api.sejm.gov.pl'
const TERM = 10

// Create admin client that bypasses RLS
function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  // Try service_role key first, fallback to anon key
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  return createClient<Database>(supabaseUrl, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

async function syncProcess(number: string) {
  const supabase = createAdminClient()
  
  // Fetch single process details
  const response = await fetch(
    `${SEJM_API_BASE}/sejm/term${TERM}/processes/${number}`,
    { headers: { 'Accept': 'application/json' } }
  )

  if (!response.ok) {
    return { success: false, message: `Process ${number} not found`, status: 404 }
  }

  const process = await response.json()
  console.log(`[SYNC-SINGLE] Process ${number}:`, JSON.stringify(process.stages, null, 2))

  const sejmId = `${TERM}-${process.number}`
  const stages = process.stages || []
  const stageEvents = flattenStages(stages as SejmProcessStage[])
  const statusFromStages = stages.length > 0 ? getStatusFromStages(stages as SejmProcessStage[]) : 'submitted'

  console.log(`[SYNC-SINGLE] Found ${stages.length} stages, ${stageEvents.length} events`)
  console.log(`[SYNC-SINGLE] Events:`, JSON.stringify(stageEvents, null, 2))

  // Find bill in database
  const { data: bill } = await supabase
    .from('bills')
    .select('id')
    .eq('sejm_id', sejmId)
    .single()

  if (!bill) {
    return { success: false, message: `Bill ${sejmId} not found in database`, status: 404 }
  }

  // Update bill status
  await supabase
    .from('bills')
    .update({ status: statusFromStages, last_updated: new Date().toISOString() })
    .eq('id', bill.id)

  // Delete existing events
  await supabase
    .from('bill_events')
    .delete()
    .eq('bill_id', bill.id)

  // Insert new events
  if (stageEvents.length > 0) {
    const eventsToInsert = stageEvents.map(event => ({
      bill_id: bill.id,
      event_type: event.event_type,
      event_date: event.event_date,
      description: event.description,
    }))

    const { error: eventsError } = await supabase
      .from('bill_events')
      .insert(eventsToInsert)

    if (eventsError) {
      console.error(`[SYNC-SINGLE] Error inserting events:`, eventsError)
      return { success: false, message: `Error inserting events: ${eventsError.message}`, status: 500 }
    }
  }

  return {
    success: true,
    billId: bill.id,
    sejmId,
    status: statusFromStages,
    stagesCount: stages.length,
    eventsInserted: stageEvents.length,
    events: stageEvents,
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ number: string }> }
) {
  const { number } = await params
  
  try {
    const result = await syncProcess(number)
    if (!result.success) {
      return NextResponse.json(result, { status: result.status || 500 })
    }
    return NextResponse.json(result)
  } catch (error) {
    console.error('[SYNC-SINGLE] Error:', error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ number: string }> }
) {
  const { number } = await params
  
  try {
    const result = await syncProcess(number)
    if (!result.success) {
      return NextResponse.json(result, { status: result.status || 500 })
    }
    return NextResponse.json(result)
  } catch (error) {
    console.error('[SYNC-SINGLE] Error:', error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
