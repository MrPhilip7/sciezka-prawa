import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/layout'
import { SearchContent } from './search-content-new'

interface SearchPageProps {
  searchParams: Promise<{
    q?: string
  }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const supabase = await createClient()
  const params = await searchParams
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  return (
    <DashboardLayout user={user}>
      <SearchContent
        results={[]}
        totalCount={0}
        filters={{
          submitterTypes: [],
          categories: [],
          years: [],
          terms: [],
        }}
        currentFilters={params}
      />
    </DashboardLayout>
  )
}
