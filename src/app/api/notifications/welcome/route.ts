import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * POST /api/notifications/welcome - Create welcome notification for user
 * Called after user registration/first login
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user already has a welcome notification
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingNotification } = await (supabase as any)
      .from('notifications')
      .select('id')
      .eq('user_id', user.id)
      .eq('type', 'welcome')
      .single()

    if (existingNotification) {
      return NextResponse.json({ 
        message: 'Welcome notification already exists',
        notificationId: existingNotification.id 
      })
    }

    // Create welcome notification with link to help page
    const welcomeNotification = {
      user_id: user.id,
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
    const { data: notification, error } = await (supabase as any)
      .from('notifications')
      .insert(welcomeNotification)
      .select()
      .single()

    if (error) {
      // If table doesn't exist, just log and return success
      if (error.code === '42P01') {
        console.log('[Welcome Notification] Table not found, skipping creation')
        return NextResponse.json({ 
          message: 'Notification system not configured yet',
          _note: 'Run migration 006 to enable notifications'
        })
      }
      throw error
    }

    return NextResponse.json({ 
      success: true,
      message: 'Welcome notification created',
      notificationId: notification.id 
    })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create welcome notification'
    console.error('[Welcome Notification] Error:', error)
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

/**
 * POST /api/notifications/welcome?admin=true - Create welcome notification for admin (test)
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if current user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Create test welcome notification for admin
    const welcomeNotification = {
      user_id: user.id,
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
    const { data: notification, error } = await (supabase as any)
      .from('notifications')
      .insert(welcomeNotification)
      .select()
      .single()

    if (error) {
      if (error.code === '42P01') {
        console.log('[Welcome Notification] Table not found')
        return NextResponse.json({ 
          error: 'Notifications table not found. Run migration 006 first.',
          _note: 'Execute supabase/migrations/006_add_notifications_system.sql'
        }, { status: 500 })
      }
      throw error
    }

    return NextResponse.json({ 
      success: true,
      message: 'Test welcome notification created for admin',
      notificationId: notification.id 
    })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create test notification'
    console.error('[Welcome Notification] Error:', error)
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
