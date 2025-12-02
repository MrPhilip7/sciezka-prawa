import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: settings, error } = await supabase
      .from('system_settings')
      .select('*')
      .order('key')
    
    if (error) throw error
    
    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
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
    
    const body = await request.json()
    const { key, value } = body
    
    const { data, error } = await supabase
      .from('system_settings')
      .update({ 
        value, 
        updated_by: user.id,
        updated_at: new Date().toISOString()
      })
      .eq('key', key)
      .select()
      .single()
    
    if (error) throw error
    
    // Log the action
    await supabase.from('admin_logs').insert({
      admin_id: user.id,
      action: 'update_setting',
      target_type: 'setting',
      target_id: key,
      details: { old_value: null, new_value: value },
    })
    
    return NextResponse.json({ setting: data })
  } catch (error) {
    console.error('Error updating setting:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
