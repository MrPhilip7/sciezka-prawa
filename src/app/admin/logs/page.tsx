import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/layout'
import { LogsContent } from './logs-content'

interface AdminLogsPageProps {
  searchParams: Promise<{
    action?: string
    target_type?: string
    page?: string
  }>
}

export default async function AdminLogsPage({ searchParams }: AdminLogsPageProps) {
  const supabase = await createClient()
  const params = await searchParams
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
  
  // Pagination
  const page = parseInt(params.page || '1')
  const limit = 50
  const offset = (page - 1) * limit
  
  // Build query
  let query = supabase
    .from('admin_logs')
    .select('*, profiles!admin_logs_admin_id_fkey(email, full_name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  
  if (params.action) {
    query = query.eq('action', params.action)
  }
  
  if (params.target_type) {
    query = query.eq('target_type', params.target_type)
  }
  
  const { data: logs, count } = await query
  
  return (
    <DashboardLayout user={user}>
      <LogsContent 
        logs={logs || []}
        totalCount={count || 0}
        currentPage={page}
        filters={{
          action: params.action || 'all',
          targetType: params.target_type || 'all',
        }}
      />
    </DashboardLayout>
  )
}
