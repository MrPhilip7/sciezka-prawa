import { createClient } from '@/lib/supabase/server'
import { AIAssistant } from './ai-assistant'

export async function AIAssistantWrapper() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }
  
  return <AIAssistant />
}
