import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// Note: The 'notifications' table needs to be created first using migration 006
// TypeScript types will be updated after running the migration

/**
 * GET /api/notifications - Get user's notifications
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unread') === 'true'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    const { data: notifications, error, count } = await query

    if (error) {
      // If table doesn't exist, return sample notifications
      if (error.code === '42P01' || error.message?.includes('notifications')) {
        console.log('[Notifications API] Table not found, returning sample data')
        const sampleNotifications = [
          {
            id: 'sample-1',
            type: 'welcome',
            title: 'Witaj w Ścieżce Prawa! 👋',
            message: 'Dziękujemy za rejestrację! Zapoznaj się z przewodnikiem, aby dowiedzieć się jak korzystać z aplikacji.',
            data: { link: '/help' },
            is_read: false,
            created_at: new Date().toISOString(),
          },
          {
            id: 'sample-2',
            type: 'system',
            title: '📧 System powiadomień aktywny',
            message: 'Będziesz otrzymywać powiadomienia o zmianach w śledzonych projektach ustaw.',
            data: { link: '/settings' },
            is_read: false,
            created_at: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: 'sample-3',
            type: 'consultation_start',
            title: '🗣️ Nowe konsultacje społeczne',
            message: 'Sprawdź aktywne konsultacje i weź udział w procesie legislacyjnym.',
            data: { link: '/consultations' },
            is_read: true,
            created_at: new Date(Date.now() - 86400000).toISOString(),
          },
        ]
        return NextResponse.json({
          notifications: sampleNotifications,
          total: 3,
          unreadCount: 2,
          _note: 'Sample data - run migration 006 to enable full functionality'
        })
      }
      throw error
    }

    // Get unread count
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count: unreadCount } = await (supabase as any)
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    return NextResponse.json({
      notifications: notifications || [],
      total: count || 0,
      unreadCount: unreadCount || 0,
    })

  } catch (error: any) {
    console.error('[Notifications API] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/notifications - Mark notifications as read
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { notificationId, markAllRead } = body

    if (markAllRead) {
      // Mark all as read
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (error) throw error

      return NextResponse.json({ success: true, message: 'All notifications marked as read' })
    }

    if (notificationId) {
      // Mark single notification as read
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', user.id)

      if (error) throw error

      return NextResponse.json({ success: true, message: 'Notification marked as read' })
    }

    return NextResponse.json({ error: 'notificationId or markAllRead required' }, { status: 400 })

  } catch (error: any) {
    console.error('[Notifications API] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update notifications' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/notifications - Delete notification
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const notificationId = searchParams.get('id')
    const deleteAll = searchParams.get('all') === 'true'

    if (deleteAll) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('notifications')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error

      return NextResponse.json({ success: true, message: 'All notifications deleted' })
    }

    if (!notificationId) {
      return NextResponse.json({ error: 'Notification ID required' }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true, message: 'Notification deleted' })

  } catch (error: any) {
    console.error('[Notifications API] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete notification' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/notifications - Create notification (admin/system only)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin'

    const body = await request.json()
    const { userId, type, title, message, data } = body

    // Non-admins can only create notifications for themselves
    const targetUserId = isAdmin ? (userId || user.id) : user.id

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: notification, error } = await (supabase as any)
      .from('notifications')
      .insert({
        user_id: targetUserId,
        type: type || 'system',
        title,
        message,
        data: data || {},
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, notification })

  } catch (error: any) {
    console.error('[Notifications API] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create notification' },
      { status: 500 }
    )
  }
}
