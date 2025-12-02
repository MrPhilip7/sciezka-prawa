import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/layout'
import { BillsManagementContent } from './bills-management-content'

interface AdminBillsPageProps {
  searchParams: Promise<{
    q?: string
    hidden?: string
    page?: string
  }>
}

export default async function AdminBillsPage({ searchParams }: AdminBillsPageProps) {
  const supabase = await createClient()
  const params = await searchParams
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Check if user is moderator or above
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (!profile || !['moderator', 'admin', 'super_admin'].includes(profile.role)) {
    redirect('/dashboard')
  }
  
  // Build query
  let query = supabase
    .from('bills')
    .select('*', { count: 'exact' })
    .order('last_updated', { ascending: false })
  
  // Apply search filter
  if (params.q) {
    query = query.or(`title.ilike.%${params.q}%,sejm_id.ilike.%${params.q}%`)
  }
  
  // Filter hidden/visible
  if (params.hidden === 'true') {
    query = query.eq('is_hidden', true)
  } else if (params.hidden === 'false') {
    query = query.eq('is_hidden', false)
  }
  
  // Pagination
  const page = parseInt(params.page || '1')
  const limit = 20
  const offset = (page - 1) * limit
  
  const { data: bills, count } = await query.range(offset, offset + limit - 1)
  
  return (
    <DashboardLayout user={user}>
      <BillsManagementContent 
        bills={bills || []}
        totalCount={count || 0}
        currentPage={page}
        userRole={profile.role}
        filters={{
          query: params.q || '',
          hidden: params.hidden || 'all',
        }}
      />
    </DashboardLayout>
  )
}
