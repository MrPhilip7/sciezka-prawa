import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/layout'
import { SearchContent } from './search-content'
import type { BillStatus } from '@/types/supabase'

interface SearchPageProps {
  searchParams: Promise<{
    q?: string
    submitter?: string
    category?: string
    year?: string
    term?: string
    status?: string
  }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const supabase = await createClient()
  const params = await searchParams
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Get filter options
  const [
    { data: submitterTypes },
    { data: categories },
    { data: years },
    { data: terms },
  ] = await Promise.all([
    supabase.from('bills').select('submitter_type').not('submitter_type', 'is', null),
    supabase.from('bills').select('category').not('category', 'is', null),
    supabase.from('bills').select('submission_year').not('submission_year', 'is', null),
    supabase.from('bills').select('term').not('term', 'is', null),
  ])

  // Extract unique values
  const uniqueSubmitters = [...new Set(submitterTypes?.map(b => b.submitter_type).filter(Boolean))] as string[]
  const uniqueCategories = [...new Set(categories?.map(b => b.category).filter(Boolean))] as string[]
  const uniqueYears = [...new Set(years?.map(b => b.submission_year).filter(Boolean))].sort((a, b) => (b as number) - (a as number)) as number[]
  const uniqueTerms = [...new Set(terms?.map(b => b.term).filter(Boolean))].sort((a, b) => (b as number) - (a as number)) as number[]

  // Build search query
  let query = supabase
    .from('bills')
    .select('*', { count: 'exact' })
    .order('last_updated', { ascending: false })
    .limit(50)

  if (params.q) {
    query = query.or(`title.ilike.%${params.q}%,description.ilike.%${params.q}%,sejm_id.ilike.%${params.q}%`)
  }

  if (params.submitter) {
    query = query.eq('submitter_type', params.submitter)
  }

  if (params.category) {
    query = query.eq('category', params.category)
  }

  if (params.year) {
    query = query.eq('submission_year', parseInt(params.year))
  }

  if (params.term) {
    query = query.eq('term', parseInt(params.term))
  }

  if (params.status) {
    query = query.eq('status', params.status as BillStatus)
  }

  const { data: results, count } = await query

  return (
    <DashboardLayout user={user}>
      <SearchContent
        results={results || []}
        totalCount={count || 0}
        filters={{
          submitterTypes: uniqueSubmitters,
          categories: uniqueCategories,
          years: uniqueYears,
          terms: uniqueTerms,
        }}
        currentFilters={params}
      />
    </DashboardLayout>
  )
}
