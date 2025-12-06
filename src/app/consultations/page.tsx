import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ConsultationsContent } from './consultations-content'

export const metadata = {
  title: 'Konsultacje i Prekonsultacje | Ścieżka Prawa',
  description: 'Aktualne konsultacje społeczne i prekonsultacje projektów ustaw',
}

export default async function ConsultationsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login?redirect=/consultations')
  }

  // Fetch bills with active consultations or preconsultations
  const { data: consultationBills } = await supabase
    .from('bills')
    .select('*')
    .or('status.eq.preconsultation,status.eq.consultation,status.eq.co_creation')
    .order('consultation_start_date', { ascending: false, nullsFirst: false })

  // Fetch bills with upcoming consultations
  const { data: upcomingBills } = await supabase
    .from('bills')
    .select('*')
    .not('consultation_start_date', 'is', null)
    .gte('consultation_start_date', new Date().toISOString())
    .order('consultation_start_date', { ascending: true })

  // Fetch recent consultation events
  const { data: consultationEvents } = await supabase
    .from('bill_events')
    .select(`
      *,
      bills:bill_id (
        id,
        sejm_id,
        title,
        status,
        ministry
      )
    `)
    .in('event_type', ['consultation_started', 'preconsultation_started', 'consultation_ended'])
    .order('event_date', { ascending: false })
    .limit(50)

  return (
    <DashboardLayout user={user}>
      <ConsultationsContent 
        consultationBills={consultationBills || []}
        upcomingBills={upcomingBills || []}
        consultationEvents={consultationEvents || []}
      />
    </DashboardLayout>
  )
}
