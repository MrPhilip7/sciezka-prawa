import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail, generateTestEmail, generateDigestEmail } from '@/lib/email/resend'

export const dynamic = 'force-dynamic'

/**
 * POST /api/notifications/test - Send a test email
 * Can be called by admins to test email functionality
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email, role')
      .eq('id', user.id)
      .single()

    const body = await request.json().catch(() => ({}))
    const { to, type = 'test' } = body

    // Check if admin for sending to others
    const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin'
    
    // Determine recipient
    let recipient = user.email!
    if (to && isAdmin) {
      recipient = to
    }

    let emailHtml: string
    let subject: string

    if (type === 'digest') {
      // Send sample digest
      emailHtml = generateDigestEmail({
        userName: profile?.full_name || 'Użytkownik',
        period: 'daily',
        changes: [
          {
            billTitle: 'Ustawa o zmianie ustawy o podatku dochodowym',
            billId: 'example-1',
            oldStatus: 'committee',
            newStatus: 'second_reading',
            changeDescription: 'Projekt przeszedł z etapu prac w komisji do II czytania w Sejmie.',
            changeDate: new Date(),
          },
          {
            billTitle: 'Ustawa o ochronie danych osobowych w sektorze publicznym',
            billId: 'example-2',
            newStatus: 'consultation',
            changeDescription: 'Rozpoczęły się konsultacje społeczne projektu.',
            changeDate: new Date(Date.now() - 86400000), // Yesterday
          },
        ],
        newConsultations: [
          {
            title: 'Konsultacje projektu ustawy o cyberbezpieczeństwie',
            ministry: 'Ministerstwo Cyfryzacji',
            endDate: new Date(Date.now() + 14 * 86400000), // 14 days from now
            url: 'https://example.com/consultation',
          },
        ],
      })
      subject = '📅 Raport dzienny - Ścieżka Prawa (TEST)'
    } else {
      // Default test email
      emailHtml = generateTestEmail(profile?.full_name || 'Użytkownik')
      subject = '✅ Test powiadomień - Ścieżka Prawa'
    }

    // Send the email
    console.log(`[Test Email] Sending ${type} email to ${recipient}`)
    
    const result = await sendEmail({
      to: recipient,
      subject,
      html: emailHtml,
    })

    if (!result.success) {
      console.error('[Test Email] Failed:', result.error)
      return NextResponse.json(
        { 
          error: result.error || 'Failed to send email',
          details: 'Check RESEND_API_KEY environment variable'
        },
        { status: 500 }
      )
    }

    // Log the email
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('email_logs')
      .insert({
        user_id: user.id,
        recipient_email: recipient,
        subject,
        email_type: type,
        resend_id: result.id,
        status: 'sent',
        metadata: { test: true },
      })
      .catch(() => {
        // Ignore if table doesn't exist yet
        console.log('[Test Email] email_logs table not available')
      })

    return NextResponse.json({
      success: true,
      message: `Testowy email wysłany na ${recipient}`,
      emailId: result.id,
    })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to send test email'
    console.error('[Test Email] Error:', error)
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
