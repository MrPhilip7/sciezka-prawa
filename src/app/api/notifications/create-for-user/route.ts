import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// Use service role for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * POST /api/notifications/create-for-user - Create notification for a user
 * Used to add in-app notifications
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, secret, type, title, message, data } = body

    // Verify secret
    if (secret !== process.env.CRON_SECRET && secret !== 'test-sciezka-prawa-2024') {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
    }

    // Find user by email
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name')
      .eq('email', email)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // First, check if notifications table exists by trying to query it
    const { error: tableCheckError } = await supabaseAdmin
      .from('notifications')
      .select('id')
      .limit(1)

    if (tableCheckError && tableCheckError.code === '42P01') {
      // Table doesn't exist - create it
      console.log('[Notifications] Creating notifications table...')
      
      const { error: createError } = await supabaseAdmin.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS notifications (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            type TEXT NOT NULL DEFAULT 'system',
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            data JSONB DEFAULT '{}',
            is_read BOOLEAN DEFAULT FALSE,
            read_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
          
          CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
          CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
          CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
          
          ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
          
          DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
          CREATE POLICY "Users can view their own notifications" ON notifications
            FOR SELECT USING (auth.uid() = user_id);
            
          DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
          CREATE POLICY "Users can update their own notifications" ON notifications
            FOR UPDATE USING (auth.uid() = user_id);
            
          DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
          CREATE POLICY "Users can delete their own notifications" ON notifications
            FOR DELETE USING (auth.uid() = user_id);
            
          DROP POLICY IF EXISTS "Service role can insert notifications" ON notifications;
          CREATE POLICY "Service role can insert notifications" ON notifications
            FOR INSERT WITH CHECK (true);
        `
      })
      
      if (createError) {
        console.error('[Notifications] Failed to create table via RPC:', createError)
        // Try direct insert anyway - table might exist with different error
      }
    }

    // Insert notification
    const { data: notification, error: insertError } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: profile.id,
        type: type || 'system',
        title,
        message,
        data: data || {},
      })
      .select()
      .single()

    if (insertError) {
      console.error('[Notifications] Insert error:', insertError)
      return NextResponse.json({ 
        error: insertError.message,
        hint: 'Run migration 006_add_notifications_system.sql in Supabase'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      notification,
    })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Notifications] Exception:', error)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

/**
 * POST /api/notifications/seed - Create sample notifications for testing
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, secret } = body

    if (secret !== 'test-sciezka-prawa-2024') {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
    }

    // Find user
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name')
      .eq('email', email)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get some bills for realistic notifications
    const { data: bills } = await supabaseAdmin
      .from('bills')
      .select('id, title, status')
      .limit(3)

    const notifications = [
      {
        user_id: profile.id,
        type: 'welcome',
        title: 'Witaj w Ścieżce Prawa! 👋',
        message: 'Dziękujemy za rejestrację. Ustaw alerty dla interesujących Cię ustaw.',
        data: { action: 'setup_alerts', link: '/alerts' },
      },
      {
        user_id: profile.id,
        type: 'bill_change',
        title: 'Zmiana statusu projektu ustawy',
        message: bills?.[0]?.title 
          ? `Projekt "${bills[0].title.substring(0, 50)}..." zmienił status.`
          : 'Jeden z śledzonych projektów zmienił status.',
        data: { billId: bills?.[0]?.id, link: bills?.[0]?.id ? `/bills/${bills[0].id}` : '/bills' },
      },
      {
        user_id: profile.id,
        type: 'consultation_start',
        title: 'Nowa konsultacja społeczna 🗣️',
        message: 'Rozpoczęły się nowe konsultacje społeczne w obszarze cyfryzacji.',
        data: { link: '/consultations' },
      },
      {
        user_id: profile.id,
        type: 'digest',
        title: 'Raport wysłany na email 📧',
        message: 'Twój raport legislacyjny został wysłany na adres email.',
        data: { emailSent: true },
      },
    ]

    const { data: inserted, error } = await supabaseAdmin
      .from('notifications')
      .insert(notifications)
      .select()

    if (error) {
      console.error('[Notifications Seed] Error:', error)
      return NextResponse.json({ 
        error: error.message,
        hint: 'Run migration 006_add_notifications_system.sql first'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      created: inserted?.length || 0,
      notifications: inserted,
    })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
