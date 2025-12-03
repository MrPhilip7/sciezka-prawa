import { DashboardLayout } from '@/components/layout'
import { createClient } from '@/lib/supabase/server'
import { CalendarContent } from './calendar-content'

export const metadata = {
  title: 'Kalendarz Legislacyjny | Ścieżka Prawa',
  description: 'Posiedzenia Sejmu, Senatu i komisji parlamentarnych z linkami do transmisji na żywo',
}

export default async function CalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  return (
    <DashboardLayout user={user}>
      <CalendarContent />
    </DashboardLayout>
  )
}
