import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/layout'
import { SettingsContent } from './settings-content'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <DashboardLayout user={user}>
      <SettingsContent />
    </DashboardLayout>
  )
}
