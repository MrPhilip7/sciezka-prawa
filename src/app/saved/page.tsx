import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/layout'
import { SavedContent } from './saved-content'

export default async function SavedPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch saved searches
  const { data: savedSearches } = await supabase
    .from('saved_searches')
    .select('*')
    .eq('user_id', user?.id || '')
    .order('created_at', { ascending: false })

  // Fetch user alerts with bill details
  const { data: alerts } = await supabase
    .from('user_alerts')
    .select(`
      *,
      bills (*)
    `)
    .eq('user_id', user?.id || '')
    .order('created_at', { ascending: false })

  return (
    <DashboardLayout user={user}>
      <SavedContent 
        savedSearches={savedSearches || []}
        alerts={alerts || []}
      />
    </DashboardLayout>
  )
}
