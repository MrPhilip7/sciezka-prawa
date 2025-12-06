import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail, generateBillChangeEmail, generateDigestEmail, generateTestEmail } from '@/lib/email/resend'

export const dynamic = 'force-dynamic'

interface SendNotificationRequest {
  type: 'test' | 'bill_change' | 'digest' | 'custom'
  to?: string // Override recipient
  billChange?: {
    billTitle: string
    billId: string
    oldStatus?: string
    newStatus: string
    changeDescription: string
  }
  digest?: {
    period: 'daily' | 'weekly'
    changes: Array<{
      billTitle: string
      billId: string
      oldStatus?: string
      newStatus: string
      changeDescription: string
      changeDate: string
    }>
    newConsultations: Array<{
      title: string
      ministry: string
      endDate: string
      url: string
    }>
  }
  custom?: {
    subject: string
    html: string
    text?: string
  }
}

/**
 * POST /api/notifications/send - Send email notification
 * Requires authenticated user (admin for broadcast, user for self)
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

    const body: SendNotificationRequest = await request.json()
    const { type, to } = body

    // Determine recipient - admin can specify, users can only send to themselves
    let recipient = user.email!
    if (to) {
      const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin'
      if (!isAdmin && to !== user.email) {
        return NextResponse.json(
          { error: 'Only admins can send to other recipients' },
          { status: 403 }
        )
      }
      recipient = to
    }

    let emailHtml: string
    let subject: string

    switch (type) {
      case 'test':
        emailHtml = generateTestEmail(profile?.full_name || 'Użytkownik')
        subject = '✅ Test powiadomień - Ścieżka Prawa'
        break

      case 'bill_change':
        if (!body.billChange) {
          return NextResponse.json({ error: 'billChange data required' }, { status: 400 })
        }
        emailHtml = generateBillChangeEmail({
          ...body.billChange,
          changeDate: new Date(),
        })
        subject = `🔔 Zmiana statusu: ${body.billChange.billTitle.substring(0, 50)}...`
        break

      case 'digest':
        if (!body.digest) {
          return NextResponse.json({ error: 'digest data required' }, { status: 400 })
        }
        emailHtml = generateDigestEmail({
          userName: profile?.full_name || 'Użytkownik',
          period: body.digest.period,
          changes: body.digest.changes.map(c => ({
            ...c,
            changeDate: new Date(c.changeDate),
          })),
          newConsultations: body.digest.newConsultations.map(c => ({
            ...c,
            endDate: new Date(c.endDate),
          })),
        })
        subject = body.digest.period === 'daily' 
          ? '📅 Raport dzienny - Ścieżka Prawa'
          : '📆 Raport tygodniowy - Ścieżka Prawa'
        break

      case 'custom':
        if (!body.custom) {
          return NextResponse.json({ error: 'custom email data required' }, { status: 400 })
        }
        // Only admins can send custom emails
        const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin'
        if (!isAdmin) {
          return NextResponse.json({ error: 'Only admins can send custom emails' }, { status: 403 })
        }
        emailHtml = body.custom.html
        subject = body.custom.subject
        break

      default:
        return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 })
    }

    // Send the email
    const result = await sendEmail({
      to: recipient,
      subject,
      html: emailHtml,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      )
    }

    // Log the notification (optional: save to database)
    console.log(`[Notifications] Email sent to ${recipient}: ${subject}`)

    return NextResponse.json({
      success: true,
      message: `Email sent to ${recipient}`,
      emailId: result.id,
    })

  } catch (error: any) {
    console.error('[Notifications] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send notification' },
      { status: 500 }
    )
  }
}
