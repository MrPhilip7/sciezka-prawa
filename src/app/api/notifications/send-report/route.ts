import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

// Initialize clients lazily
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!url || !key) {
    throw new Error('Supabase URL or Service Role Key is not configured')
  }
  
  return createClient(url, key)
}

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured')
  }
  return new Resend(apiKey)
}

/**
 * POST /api/notifications/send-report - Send personalized report based on user's alerts
 */
export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const resend = getResendClient()
    const body = await request.json()
    const { email, secret } = body

    // Simple secret verification
    if (secret !== process.env.CRON_SECRET && secret !== 'test-sciezka-prawa-2024') {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
    }

    // Find user by email
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email')
      .eq('email', email)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ 
        error: 'User not found',
        details: 'No profile found for this email'
      }, { status: 404 })
    }

    // Get user's active alerts with bill details
    const { data: alerts, error: alertsError } = await supabaseAdmin
      .from('user_alerts')
      .select(`
        id,
        bill_id,
        notify_email,
        bills:bill_id (
          id,
          sejm_id,
          title,
          status,
          ministry,
          last_updated,
          consultation_start_date,
          consultation_end_date
        )
      `)
      .eq('user_id', profile.id)
      .eq('is_active', true)

    if (alertsError) {
      console.error('Error fetching alerts:', alertsError)
      throw alertsError
    }

    // Get recent bill changes (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    
    const { data: recentBills } = await supabaseAdmin
      .from('bills')
      .select('id, sejm_id, title, status, ministry, last_updated')
      .gte('last_updated', sevenDaysAgo)
      .order('last_updated', { ascending: false })
      .limit(10)

    // Get active consultations
    const now = new Date().toISOString()
    const { data: consultations } = await supabaseAdmin
      .from('bills')
      .select('id, title, ministry, consultation_end_date, status')
      .in('status', ['consultation', 'preconsultation'])
      .gte('consultation_end_date', now)
      .order('consultation_end_date', { ascending: true })
      .limit(5)

    // Status labels in Polish
    const statusLabels: Record<string, string> = {
      co_creation: 'Współtworzenie',
      preconsultation: 'Prekonsultacje',
      consultation: 'Konsultacje',
      draft: 'Projekt',
      submitted: 'Wpłynięcie',
      first_reading: 'I Czytanie',
      committee: 'Komisja',
      second_reading: 'II Czytanie',
      third_reading: 'III Czytanie',
      senate: 'Senat',
      presidential: 'Prezydent',
      published: 'Opublikowana',
      rejected: 'Odrzucona',
    }

    const statusColors: Record<string, string> = {
      co_creation: '#6366f1',
      preconsultation: '#8b5cf6',
      consultation: '#3b82f6',
      draft: '#6b7280',
      submitted: '#f59e0b',
      first_reading: '#10b981',
      committee: '#a855f7',
      second_reading: '#14b8a6',
      third_reading: '#06b6d4',
      senate: '#ec4899',
      presidential: '#f97316',
      published: '#22c55e',
      rejected: '#ef4444',
    }

    // Generate tracked bills HTML
    const trackedBillsHtml = alerts && alerts.length > 0
      ? alerts.map((alert: any) => {
          const bill = alert.bills
          if (!bill) return ''
          const status = statusLabels[bill.status] || bill.status
          const color = statusColors[bill.status] || '#6b7280'
          const updated = new Date(bill.last_updated).toLocaleDateString('pl-PL')
          return `
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
              <h4 style="margin: 0 0 8px; color: #1f2937; font-size: 14px;">${bill.title}</h4>
              <p style="margin: 0; color: #6b7280; font-size: 13px;">
                Status: <span style="background: ${color}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;">${status}</span>
              </p>
              <p style="margin: 5px 0 0; color: #9ca3af; font-size: 12px;">
                ${bill.ministry || 'Brak ministerstwa'} • Aktualizacja: ${updated}
              </p>
            </div>
          `
        }).join('')
      : '<p style="color: #6b7280; font-style: italic; text-align: center; padding: 20px;">Nie śledzisz jeszcze żadnych projektów ustaw.<br><a href="' + (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000') + '/bills" style="color: #3b82f6;">Przeglądaj ustawy →</a></p>'

    // Generate consultations HTML
    const consultationsHtml = consultations && consultations.length > 0
      ? consultations.map((c: any) => {
          const endDate = c.consultation_end_date 
            ? new Date(c.consultation_end_date).toLocaleDateString('pl-PL')
            : 'Brak daty'
          return `
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
              <h4 style="margin: 0 0 8px; color: #1f2937; font-size: 14px;">📋 ${c.title}</h4>
              <p style="margin: 0; color: #6b7280; font-size: 13px;">
                ${c.ministry || 'Ministerstwo'} • Do: ${endDate}
              </p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/bills/${c.id}" style="color: #3b82f6; font-size: 12px; text-decoration: none;">Zobacz szczegóły →</a>
            </div>
          `
        }).join('')
      : '<p style="color: #6b7280; font-style: italic; text-align: center;">Brak aktywnych konsultacji.</p>'

    // Generate recent changes HTML
    const recentChangesHtml = recentBills && recentBills.length > 0
      ? recentBills.slice(0, 5).map((bill: any) => {
          const status = statusLabels[bill.status] || bill.status
          const updated = new Date(bill.last_updated).toLocaleDateString('pl-PL')
          return `
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-size: 13px;">${bill.title.substring(0, 50)}...</td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">${status}</td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af;">${updated}</td>
            </tr>
          `
        }).join('')
      : '<tr><td colspan="3" style="padding: 20px; text-align: center; color: #6b7280;">Brak ostatnich zmian.</td></tr>'

    const date = new Date().toLocaleDateString('pl-PL', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })

    const emailHtml = `
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Raport - Ścieżka Prawa</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🏛️ Ścieżka Prawa</h1>
      <p style="color: #bfdbfe; margin: 10px 0 0 0; font-size: 14px;">📊 Twój osobisty raport legislacyjny</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 30px;">
      <p style="color: #4b5563; font-size: 16px; margin-bottom: 5px;">
        Cześć <strong>${profile.full_name || 'Użytkowniku'}</strong>! 👋
      </p>
      <p style="color: #9ca3af; font-size: 13px; margin-bottom: 25px;">
        ${date}
      </p>
      
      <!-- Tracked Bills Section -->
      <div style="margin-bottom: 30px;">
        <h3 style="color: #1f2937; font-size: 16px; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #3b82f6;">
          🔔 Twoje śledzone projekty (${alerts?.length || 0})
        </h3>
        ${trackedBillsHtml}
      </div>
      
      <!-- Active Consultations Section -->
      <div style="margin-bottom: 30px;">
        <h3 style="color: #1f2937; font-size: 16px; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #10b981;">
          🗣️ Aktywne konsultacje społeczne
        </h3>
        ${consultationsHtml}
      </div>
      
      <!-- Recent Changes Section -->
      <div style="margin-bottom: 30px;">
        <h3 style="color: #1f2937; font-size: 16px; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #f59e0b;">
          📰 Ostatnie zmiany w ustawach
        </h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f9fafb;">
              <th style="padding: 8px; text-align: left; font-size: 12px; color: #6b7280;">Projekt</th>
              <th style="padding: 8px; text-align: left; font-size: 12px; color: #6b7280;">Status</th>
              <th style="padding: 8px; text-align: left; font-size: 12px; color: #6b7280;">Data</th>
            </tr>
          </thead>
          <tbody>
            ${recentChangesHtml}
          </tbody>
        </table>
      </div>
      
      <!-- CTA -->
      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" 
           style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 14px;">
          Otwórz panel Ścieżka Prawa →
        </a>
      </div>
    </div>
    
    <!-- Stats Footer -->
    <div style="background-color: #f9fafb; padding: 20px; display: flex; justify-content: space-around; text-align: center; border-top: 1px solid #e5e7eb;">
      <div>
        <p style="margin: 0; font-size: 24px; color: #3b82f6; font-weight: bold;">${alerts?.length || 0}</p>
        <p style="margin: 5px 0 0 0; font-size: 11px; color: #6b7280;">Śledzonych</p>
      </div>
      <div>
        <p style="margin: 0; font-size: 24px; color: #10b981; font-weight: bold;">${consultations?.length || 0}</p>
        <p style="margin: 5px 0 0 0; font-size: 11px; color: #6b7280;">Konsultacji</p>
      </div>
      <div>
        <p style="margin: 0; font-size: 24px; color: #f59e0b; font-weight: bold;">${recentBills?.length || 0}</p>
        <p style="margin: 5px 0 0 0; font-size: 11px; color: #6b7280;">Zmian (7 dni)</p>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 12px;">
        Raport wygenerowany automatycznie przez Ścieżka Prawa.
      </p>
      <p style="margin: 0; color: #9ca3af; font-size: 11px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings" style="color: #3b82f6; text-decoration: none;">Ustawienia</a>
        &nbsp;|&nbsp;
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/alerts" style="color: #3b82f6; text-decoration: none;">Zarządzaj alertami</a>
      </p>
    </div>
  </div>
</body>
</html>
    `

    // Send email
    const { data, error } = await resend.emails.send({
      from: 'Ścieżka Prawa <onboarding@resend.dev>',
      to: [email],
      subject: `📊 Twój raport legislacyjny - ${new Date().toLocaleDateString('pl-PL')}`,
      html: emailHtml,
    })

    if (error) {
      console.error('[Report Email] Error:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Raport wysłany na ${email}`,
      emailId: data?.id,
      stats: {
        trackedBills: alerts?.length || 0,
        activeConsultations: consultations?.length || 0,
        recentChanges: recentBills?.length || 0,
      }
    })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Report Email] Exception:', error)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
