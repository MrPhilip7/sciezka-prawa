import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  
  console.log(`[DEBUG] Looking for bill: ${id}`)
  
  // Try to find by UUID or sejm_id
  let bill = null
  let events = null
  
  // First try UUID
  const { data: billById } = await supabase
    .from('bills')
    .select('*')
    .eq('id', id)
    .single()
  
  if (billById) {
    bill = billById
  } else {
    // Try by sejm_id
    const { data: billBySejmId } = await supabase
      .from('bills')
      .select('*')
      .eq('sejm_id', id)
      .single()
    bill = billBySejmId
  }
  
  if (!bill) {
    // Try searching by print number
    const { data: billByNumber } = await supabase
      .from('bills')
      .select('*')
      .ilike('sejm_id', `%-${id}`)
      .single()
    bill = billByNumber
  }
  
  if (bill) {
    console.log(`[DEBUG] Found bill: ${bill.id} (sejm_id: ${bill.sejm_id})`)
    const { data: eventsData } = await supabase
      .from('bill_events')
      .select('*')
      .eq('bill_id', bill.id)
      .order('event_date', { ascending: true })
    events = eventsData
    console.log(`[DEBUG] Found ${events?.length || 0} events:`, JSON.stringify(events, null, 2))
  } else {
    console.log(`[DEBUG] Bill not found for id: ${id}`)
  }
  
  return NextResponse.json({
    searchedId: id,
    bill: bill ? {
      id: bill.id,
      sejm_id: bill.sejm_id,
      title: bill.title,
      status: bill.status,
    } : null,
    events: events || [],
    eventsCount: events?.length || 0,
  })
}
