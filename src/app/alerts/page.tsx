import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/layout'
import { AlertsContent } from './alerts-content'
import { LoginRequired } from '@/components/auth'

export default async function AlertsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return (
      <DashboardLayout user={null}>
        <LoginRequired 
          title="Powiadomienia"
          description="Zaloguj się, aby śledzić ustawy i otrzymywać powiadomienia o zmianach"
        />
      </DashboardLayout>
    )
  }
  
  // Fetch user alerts with bill details
  const { data: alerts } = await supabase
    .from('user_alerts')
    .select(`
      *,
      bills (*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <DashboardLayout user={user}>
      <AlertsContent alerts={alerts || []} />
    </DashboardLayout>
  )
}
