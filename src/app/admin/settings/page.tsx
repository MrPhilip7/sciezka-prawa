import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/layout'
import { SettingsContent } from './settings-content'

export default async function AdminSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    redirect('/admin')
  }
  
  // Get system settings
  const { data: settings } = await supabase
    .from('system_settings')
    .select('*')
    .order('key')
  
  return (
    <DashboardLayout user={user}>
      <SettingsContent settings={settings || []} />
    </DashboardLayout>
  )
}
