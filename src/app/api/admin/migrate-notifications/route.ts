import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * POST /api/admin/migrate-notifications - Create notifications table
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { secret } = body

    if (secret !== 'test-sciezka-prawa-2024') {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
    }

    // Create notifications table using raw SQL via the REST API
    const sql = `
      -- Create notifications table
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
      
      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
      CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
    `

    // Execute via Supabase's postgrest
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ query: sql }),
      }
    )

    // Alternative: Try direct table creation by inserting and catching error
    const { error: testError } = await supabaseAdmin
      .from('notifications')
      .select('id')
      .limit(1)

    if (testError?.code === '42P01') {
      // Table doesn't exist - need to run migration manually
      return NextResponse.json({
        success: false,
        message: 'Table does not exist. Please run the migration in Supabase SQL Editor.',
        sql: sql,
        instructions: [
          '1. Go to Supabase Dashboard',
          '2. Open SQL Editor',
          '3. Paste the SQL above and run it',
          '4. Enable RLS policies'
        ]
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Notifications table exists or was created',
    })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
