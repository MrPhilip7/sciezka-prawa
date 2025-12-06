import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/layout'
import { BillDetailContent } from './bill-detail-content'

interface BillDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function BillDetailPage({ params }: BillDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch bill details with all new fields
  const { data: bill, error } = await supabase
    .from('bills')
    .select(`
      *,
      rcl_id,
      consultation_start_date,
      consultation_end_date,
      consultation_url,
      impact_assessment_url,
      simple_language_summary
    `)
    .eq('id', id)
    .single()

  if (error || !bill) {
    notFound()
  }

  // Fetch bill events for timeline (including OSR data)
  const { data: events } = await supabase
    .from('bill_events')
    .select('*')
    .eq('bill_id', id)
    .order('event_date', { ascending: true })
  
  // Extract impact assessment from events if available
  const impactEvent = events?.find(e => e.event_type === 'impact_assessment')
  const impactData = impactEvent?.details || null

  // Check if user has an alert for this bill
  let hasAlert = false
  if (user) {
    const { data: alert } = await supabase
      .from('user_alerts')
      .select('id')
      .eq('user_id', user.id)
      .eq('bill_id', id)
      .single()
    
    hasAlert = !!alert
  }

  return (
    <DashboardLayout user={user}>
      <BillDetailContent 
        bill={bill} 
        events={events || []} 
        hasAlert={hasAlert}
        isLoggedIn={!!user}
        impactAssessment={impactData}
      />
    </DashboardLayout>
  )
}