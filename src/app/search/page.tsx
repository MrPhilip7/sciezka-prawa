import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/layout'
import { SearchContent } from './search-content-new'
import { LoginRequired } from '@/components/auth'

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
    return (
      <DashboardLayout user={null}>
        <LoginRequired 
          title="Wyszukiwarka AI"
          description="Zaloguj się, aby uzyskać dostęp do wyszukiwarki z asystentem AI"
        />
      </DashboardLayout>
    )
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
