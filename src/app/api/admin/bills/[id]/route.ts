import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Json } from '@/types/supabase'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const { id } = await params
    
    // Check if user is moderator or above
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (!profile || !['moderator', 'admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const body = await request.json()
    const { action, ...updates } = body
    
    let updateData: Record<string, unknown> = { ...updates }
    
    // Handle hide/unhide action
    if (action === 'hide') {
      updateData = {
        is_hidden: true,
        hidden_by: user.id,
        hidden_at: new Date().toISOString(),
        hidden_reason: updates.reason || null,
      }
    } else if (action === 'unhide') {
      updateData = {
        is_hidden: false,
        hidden_by: null,
        hidden_at: null,
        hidden_reason: null,
      }
    } else {
      // Regular edit - track who edited
      updateData.last_edited_by = user.id
    }
    
    const { data, error } = await supabase
      .from('bills')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    // Log the action
    await supabase.from('admin_logs').insert({
      admin_id: user.id,
      action: action || 'edit_bill',
      target_type: 'bill',
      target_id: id,
      details: JSON.parse(JSON.stringify({ updates: updateData })) as Json,
    })
    
    return NextResponse.json({ bill: data })
  } catch (error) {
    console.error('Error updating bill:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const { id } = await params
    
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
    
    // Get bill info before deleting
    const { data: bill } = await supabase
      .from('bills')
      .select('sejm_id, title')
      .eq('id', id)
      .single()
    
    const { error } = await supabase
      .from('bills')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    
    // Log the action
    await supabase.from('admin_logs').insert({
      admin_id: user.id,
      action: 'delete_bill',
      target_type: 'bill',
      target_id: id,
      details: JSON.parse(JSON.stringify({ bill })) as Json,
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting bill:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
