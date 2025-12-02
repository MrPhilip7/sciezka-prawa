import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/layout'
import { AlertsContent } from './alerts-content'

export default async function AlertsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch user alerts with bill details
  const { data: alerts } = await supabase
    .from('user_alerts')
    .select(`
      *,
      bills (*)
    `)
    .eq('user_id', user?.id || '')
    .order('created_at', { ascending: false })

  return (
    <DashboardLayout user={user}>
      <AlertsContent alerts={alerts || []} />
    </DashboardLayout>
  )
}
