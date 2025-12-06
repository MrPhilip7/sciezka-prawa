import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/alerts - Pobierz alerty użytkownika
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data: alerts, error } = await supabase
      .from('user_alerts')
      .select(`
        *,
        bills:bill_id (
          id,
          sejm_id,
          title,
          status,
          ministry,
          consultation_start_date,
          consultation_end_date,
          last_updated
        )
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return NextResponse.json({ alerts })
    
  } catch (error: any) {
    console.error('[Alerts API] Error fetching alerts:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/alerts - Utwórz nowy alert
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { billId, notifyEmail = true, notifyPush = false } = body
    
    if (!billId) {
      return NextResponse.json({ error: 'Bill ID is required' }, { status: 400 })
    }
    
    // Check if alert already exists
    const { data: existing } = await supabase
      .from('user_alerts')
      .select('id, is_active')
      .eq('user_id', user.id)
      .eq('bill_id', billId)
      .maybeSingle()
    
    if (existing) {
      if (existing.is_active) {
        return NextResponse.json(
          { error: 'Alert already exists for this bill' },
          { status: 409 }
        )
      } else {
        // Reactivate existing alert
        const { data: updated, error } = await supabase
          .from('user_alerts')
          .update({
            is_active: true,
            notify_email: notifyEmail,
            notify_push: notifyPush,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single()
        
        if (error) throw error
        return NextResponse.json({ alert: updated })
      }
    }
    
    // Create new alert
    const { data: alert, error } = await supabase
      .from('user_alerts')
      .insert({
        user_id: user.id,
        bill_id: billId,
        is_active: true,
        notify_email: notifyEmail,
        notify_push: notifyPush,
      })
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ alert }, { status: 201 })
    
  } catch (error: any) {
    console.error('[Alerts API] Error creating alert:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create alert' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/alerts?billId={billId} - Usuń alert
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const billId = searchParams.get('billId')
    
    if (!billId) {
      return NextResponse.json({ error: 'Bill ID is required' }, { status: 400 })
    }
    
    // Soft delete - set is_active to false
    const { error } = await supabase
      .from('user_alerts')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('bill_id', billId)
    
    if (error) throw error
    
    return NextResponse.json({ success: true })
    
  } catch (error: any) {
    console.error('[Alerts API] Error deleting alert:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete alert' },
      { status: 500 }
    )
  }
}
