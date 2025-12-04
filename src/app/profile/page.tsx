import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/layout'
import { ProfileContent } from './profile-content'
import { LoginRequired } from '@/components/auth'

export default async function ProfilePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return (
      <DashboardLayout user={null}>
        <LoginRequired 
          title="Profil"
          description="Zaloguj się, aby zobaczyć i edytować swój profil"
        />
      </DashboardLayout>
    )
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get user stats
  const { count: alertsCount } = await supabase
    .from('user_alerts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { count: savedSearchesCount } = await supabase
    .from('saved_searches')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  return (
    <DashboardLayout user={user}>
      <ProfileContent 
        user={user}
        profile={profile}
        stats={{
          alertsCount: alertsCount || 0,
          savedSearchesCount: savedSearchesCount || 0,
        }}
      />
    </DashboardLayout>
  )
}
