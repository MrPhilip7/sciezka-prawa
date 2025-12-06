import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail, generateBillChangeEmail, generateDigestEmail, BillChangeNotification } from '@/lib/email/resend'

export const dynamic = 'force-dynamic'

// Use service role for cron jobs
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface UserAlert {
  id: string
  user_id: string
  bill_id: string
  notify_email: boolean
  notify_push: boolean
  bills: {
    id: string
    sejm_id: string
    title: string
    status: string
    last_updated: string
  }
  profiles: {
    email: string
    full_name: string
  }
}

interface BillChange {
  billId: string
  billTitle: string
  oldStatus: string
  newStatus: string
  changeDate: Date
}

/**
 * POST /api/notifications/process - Process pending alerts and send notifications
 * This endpoint should be called by a cron job (e.g., Vercel Cron, GitHub Actions)
 * 
 * Authentication: Bearer token in Authorization header
 * Set CRON_SECRET in environment variables
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const { mode = 'instant' } = body // 'instant' | 'digest'

    console.log(`[Alert Processor] Starting ${mode} notification processing...`)

    // Get bills that have been updated in the last hour (for instant) or day (for digest)
    const timeWindow = mode === 'instant' 
      ? new Date(Date.now() - 60 * 60 * 1000) // 1 hour
      : new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours

    // Get all bills updated recently
    const { data: updatedBills, error: billsError } = await supabaseAdmin
      .from('bills')
      .select('id, sejm_id, title, status, last_updated')
      .gte('last_updated', timeWindow.toISOString())

    if (billsError) {
      console.error('[Alert Processor] Error fetching bills:', billsError)
      throw billsError
    }

    if (!updatedBills || updatedBills.length === 0) {
      console.log('[Alert Processor] No updated bills found')
      return NextResponse.json({ 
        success: true, 
        message: 'No updates to process',
        stats: { billsChecked: 0, alertsSent: 0 }
      })
    }

    console.log(`[Alert Processor] Found ${updatedBills.length} updated bills`)

    // Get all active alerts for these bills
    const billIds = updatedBills.map(b => b.id)
    
    const { data: alerts, error: alertsError } = await supabaseAdmin
      .from('user_alerts')
      .select(`
        id,
        user_id,
        bill_id,
        notify_email,
        notify_push,
        bills:bill_id (id, sejm_id, title, status, last_updated),
        profiles:user_id (email, full_name)
      `)
      .in('bill_id', billIds)
      .eq('is_active', true)
      .eq('notify_email', true)

    if (alertsError) {
      console.error('[Alert Processor] Error fetching alerts:', alertsError)
      throw alertsError
    }

    if (!alerts || alerts.length === 0) {
      console.log('[Alert Processor] No active alerts for updated bills')
      return NextResponse.json({
        success: true,
        message: 'No alerts to send',
        stats: { billsChecked: updatedBills.length, alertsSent: 0 }
      })
    }

    console.log(`[Alert Processor] Found ${alerts.length} alerts to process`)

    // Group alerts by user for digest mode
    const alertsByUser = new Map<string, UserAlert[]>()
    
    for (const alert of alerts as unknown as UserAlert[]) {
      if (!alert.profiles?.email) continue
      
      const userId = alert.user_id
      if (!alertsByUser.has(userId)) {
        alertsByUser.set(userId, [])
      }
      alertsByUser.get(userId)!.push(alert)
    }

    let emailsSent = 0
    let notificationsCreated = 0
    const errors: string[] = []

    if (mode === 'digest') {
      // Send digest emails
      for (const [userId, userAlerts] of alertsByUser) {
        const userEmail = userAlerts[0].profiles?.email
        const userName = userAlerts[0].profiles?.full_name || 'Użytkownik'

        if (!userEmail) continue

        const changes: BillChangeNotification[] = userAlerts.map(alert => ({
          billTitle: alert.bills?.title || 'Nieznana ustawa',
          billId: alert.bill_id,
          newStatus: alert.bills?.status || 'unknown',
          changeDescription: `Status projektu został zaktualizowany.`,
          changeDate: new Date(alert.bills?.last_updated || new Date()),
        }))

        const emailHtml = generateDigestEmail({
          userName,
          period: 'daily',
          changes,
          newConsultations: [], // TODO: Add consultation detection
        })

        const result = await sendEmail({
          to: userEmail,
          subject: '📅 Raport dzienny - Ścieżka Prawa',
          html: emailHtml,
        })

        if (result.success) {
          emailsSent++
          
          // Create in-app notification
          await supabaseAdmin
            .from('notifications')
            .insert({
              user_id: userId,
              type: 'digest',
              title: 'Raport dzienny wysłany',
              message: `Wysłano raport z ${changes.length} zmianami na Twój email.`,
              data: { emailId: result.id },
            })
            .then(() => {})
          
          notificationsCreated++
        } else {
          errors.push(`Failed to send to ${userEmail}: ${result.error}`)
        }
      }
    } else {
      // Send instant notifications
      for (const [userId, userAlerts] of alertsByUser) {
        for (const alert of userAlerts) {
          const userEmail = alert.profiles?.email
          if (!userEmail) continue

          const bill = alert.bills
          if (!bill) continue

          const notification: BillChangeNotification = {
            billTitle: bill.title,
            billId: alert.bill_id,
            newStatus: bill.status,
            changeDescription: `Status projektu "${bill.title}" został zaktualizowany.`,
            changeDate: new Date(bill.last_updated),
          }

          const emailHtml = generateBillChangeEmail(notification)

          const result = await sendEmail({
            to: userEmail,
            subject: `🔔 Zmiana: ${bill.title.substring(0, 50)}...`,
            html: emailHtml,
          })

          if (result.success) {
            emailsSent++
            
            // Create in-app notification
            await supabaseAdmin
              .from('notifications')
              .insert({
                user_id: userId,
                type: 'bill_change',
                title: `Zmiana statusu: ${bill.title.substring(0, 50)}...`,
                message: `Status projektu zmienił się na: ${bill.status}`,
                data: { 
                  billId: alert.bill_id,
                  emailId: result.id,
                  link: `/bills/${alert.bill_id}`
                },
              })
              .then(() => {})
            
            notificationsCreated++
          } else {
            errors.push(`Failed to send to ${userEmail}: ${result.error}`)
          }

          // Rate limiting - wait between emails
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
    }

    console.log(`[Alert Processor] Completed: ${emailsSent} emails sent, ${notificationsCreated} notifications created`)

    return NextResponse.json({
      success: true,
      message: `Processed ${alertsByUser.size} users`,
      stats: {
        billsChecked: updatedBills.length,
        usersNotified: alertsByUser.size,
        emailsSent,
        notificationsCreated,
        errors: errors.length,
      },
      errors: errors.length > 0 ? errors : undefined,
    })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to process alerts'
    console.error('[Alert Processor] Error:', error)
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

/**
 * GET /api/notifications/process - Get processing status
 */
export async function GET() {
  return NextResponse.json({
    status: 'ready',
    description: 'Alert processor endpoint',
    endpoints: {
      'POST /api/notifications/process': {
        description: 'Process pending alerts and send notifications',
        body: {
          mode: "'instant' | 'digest' (default: instant)"
        },
        headers: {
          'Authorization': 'Bearer {CRON_SECRET}'
        }
      }
    }
  })
}
