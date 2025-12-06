import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data?.user) {
      // Check if this is a new user (created within last minute)
      const createdAt = new Date(data.user.created_at)
      const now = new Date()
      const isNewUser = (now.getTime() - createdAt.getTime()) < 60000 // 1 minute

      if (isNewUser) {
        // Create welcome notification for new user
        try {
          await createWelcomeNotification(supabase, data.user.id)
        } catch (e) {
          console.error('[Auth Callback] Failed to create welcome notification:', e)
        }
      }
      
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}

// Helper function to create welcome notification
async function createWelcomeNotification(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const welcomeNotification = {
    user_id: userId,
    type: 'welcome',
    title: 'Witaj w Ścieżce Prawa! 👋',
    message: 'Dziękujemy za rejestrację! Zapoznaj się z przewodnikiem, aby dowiedzieć się jak korzystać z aplikacji.',
    data: { 
      link: '/help',
      action: 'view_help'
    },
    is_read: false,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('notifications')
    .insert(welcomeNotification)

  if (error && error.code !== '42P01') {
    console.error('[Auth Callback] Notification insert error:', error)
  }
}
