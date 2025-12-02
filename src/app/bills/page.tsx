import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/layout'
import { BillsContent } from './bills-content'
import type { Database } from '@/types/supabase'

type BillStatus = Database['public']['Enums']['bill_status']

interface BillsPageProps {
  searchParams: Promise<{
    q?: string
    status?: string
    submitter?: string
    category?: string
    year?: string
    term?: string
    tag?: string
    page?: string
    sort?: string
    order?: string
  }>
}

export default async function BillsPage({ searchParams }: BillsPageProps) {
  const supabase = await createClient()
  const params = await searchParams
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // Build query with sorting
  const sortField = params.sort || 'last_updated'
  const sortOrder = params.order === 'asc'
  
  let query = supabase
    .from('bills')
    .select('*', { count: 'exact' })
    .order(sortField, { ascending: sortOrder })

  // Apply search filter
  if (params.q) {
    query = query.or(`title.ilike.%${params.q}%,sejm_id.ilike.%${params.q}%,description.ilike.%${params.q}%`)
  }

  // Apply status filter
  if (params.status && params.status !== 'all') {
    query = query.eq('status', params.status as BillStatus)
  }

  // Apply submitter type filter
  if (params.submitter && params.submitter !== 'all') {
    query = query.eq('submitter_type', params.submitter)
  }

  // Apply category filter
  if (params.category && params.category !== 'all') {
    query = query.eq('category', params.category)
  }

  // Apply year filter
  if (params.year && params.year !== 'all') {
    query = query.eq('submission_year', parseInt(params.year))
  }

  // Apply term filter
  if (params.term && params.term !== 'all') {
    query = query.eq('term', parseInt(params.term))
  }

  // Apply tag filter
  if (params.tag && params.tag !== 'all') {
    query = query.contains('tags', [params.tag])
  }

  // Pagination
  const page = parseInt(params.page || '1')
  const limit = 10
  const offset = (page - 1) * limit

  const { data: bills, count } = await query
    .range(offset, offset + limit - 1)

  // Get unique years for filter
  const { data: yearsData } = await supabase
    .from('bills')
    .select('submission_year')
    .not('submission_year', 'is', null)
    .order('submission_year', { ascending: false })

  const years = [...new Set(yearsData?.map(b => b.submission_year).filter(Boolean))]

  // Get unique tags for filter
  const { data: tagsData } = await supabase
    .from('bills')
    .select('tags')
    .not('tags', 'is', null)

  const allTags = tagsData?.flatMap(b => b.tags || []) || []
  const tags = [...new Set(allTags)].sort()

  return (
    <DashboardLayout user={user}>
      <BillsContent 
        bills={bills || []}
        totalCount={count || 0}
        currentPage={page}
        years={years as number[]}
        tags={tags}
        filters={{
          query: params.q || '',
          status: params.status || 'all',
          submitter: params.submitter || 'all',
          category: params.category || 'all',
          year: params.year || 'all',
          term: params.term || 'all',
          tag: params.tag || 'all',
        }}
        sorting={{
          field: params.sort || 'last_updated',
          order: params.order || 'desc',
        }}
      />
    </DashboardLayout>
  )
}
