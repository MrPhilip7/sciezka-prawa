import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/layout'
import { DashboardContent } from './dashboard-content'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch recent bills
  const { data: recentBills } = await supabase
    .from('bills')
    .select('*')
    .order('last_updated', { ascending: false })
    .limit(10)

  // Fetch user alerts count
  const { count: alertsCount } = await supabase
    .from('user_alerts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user?.id || '')

  // Get bill status counts
  const { data: statusCounts } = await supabase
    .from('bills')
    .select('status')

  const billsByStatus = statusCounts?.reduce((acc, bill) => {
    acc[bill.status] = (acc[bill.status] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  return (
    <DashboardLayout user={user}>
      <DashboardContent 
        recentBills={recentBills || []}
        alertsCount={alertsCount || 0}
        billsByStatus={billsByStatus}
      />
    </DashboardLayout>
  )
}
