import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/layout'
import { AdminDashboardContent } from './admin-dashboard-content'

export default async function AdminPage() {
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
  
  if (!profile || !['moderator', 'admin', 'super_admin'].includes(profile.role)) {
    redirect('/dashboard')
  }
  
  // Get stats
  const [
    { count: totalUsers },
    { count: totalBills },
    { count: hiddenBills },
    { data: recentLogs },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('bills').select('*', { count: 'exact', head: true }),
    supabase.from('bills').select('*', { count: 'exact', head: true }).eq('is_hidden', true),
    supabase.from('admin_logs')
      .select('*, profiles!admin_logs_admin_id_fkey(email, full_name)')
      .order('created_at', { ascending: false })
      .limit(10),
  ])
  
  return (
    <DashboardLayout user={user}>
      <AdminDashboardContent
        stats={{
          totalUsers: totalUsers || 0,
          totalBills: totalBills || 0,
          hiddenBills: hiddenBills || 0,
        }}
        recentLogs={recentLogs || []}
        userRole={profile.role}
      />
    </DashboardLayout>
  )
}
