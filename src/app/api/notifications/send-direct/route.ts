import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

/**
 * POST /api/notifications/send-direct - Send email directly (for testing)
 * This bypasses normal auth for initial testing
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, secret } = body

    // Simple secret verification for testing
    if (secret !== process.env.CRON_SECRET && secret !== 'test-sciezka-prawa-2024') {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
    }

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'RESEND_API_KEY not configured',
        instructions: 'Add RESEND_API_KEY to your .env.local file. Get one free at https://resend.com'
      }, { status: 500 })
    }

    const resend = new Resend(apiKey)

    const emailHtml = `
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test - Ścieżka Prawa</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">✅ Test Powiadomień</h1>
      <p style="color: #a7f3d0; margin: 10px 0 0 0; font-size: 14px;">Ścieżka Prawa - System Alertów</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 30px; text-align: center;">
      <div style="font-size: 64px; margin-bottom: 20px;">🎉</div>
      
      <h2 style="color: #1f2937; font-size: 20px; margin-bottom: 15px;">
        Gratulacje!
      </h2>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
        System powiadomień email działa poprawnie.<br>
        Będziesz otrzymywać alerty o zmianach w śledzonych projektach ustaw.
      </p>
      
      <div style="background-color: #ecfdf5; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
        <h3 style="color: #065f46; margin: 0 0 10px 0; font-size: 14px;">📬 Co będziesz otrzymywać?</h3>
        <ul style="color: #047857; font-size: 13px; text-align: left; margin: 0; padding-left: 20px;">
          <li>Natychmiastowe powiadomienia o zmianach statusu ustaw</li>
          <li>Informacje o nowych konsultacjach społecznych</li>
          <li>Raporty dzienne/tygodniowe (opcjonalnie)</li>
          <li>Przypomnienia o kończących się konsultacjach</li>
        </ul>
      </div>
      
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/alerts" 
         style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">
        Ustaw alerty dla ustaw →
      </a>
    </div>
    
    <!-- Stats -->
    <div style="background-color: #f9fafb; padding: 20px; display: flex; justify-content: space-around; text-align: center;">
      <div>
        <p style="margin: 0; font-size: 24px; color: #3b82f6; font-weight: bold;">500+</p>
        <p style="margin: 5px 0 0 0; font-size: 12px; color: #6b7280;">Projektów ustaw</p>
      </div>
      <div>
        <p style="margin: 0; font-size: 24px; color: #10b981; font-weight: bold;">12</p>
        <p style="margin: 5px 0 0 0; font-size: 12px; color: #6b7280;">Aktywnych konsultacji</p>
      </div>
      <div>
        <p style="margin: 0; font-size: 24px; color: #8b5cf6; font-weight: bold;">24/7</p>
        <p style="margin: 5px 0 0 0; font-size: 12px; color: #6b7280;">Monitoring</p>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; color: #9ca3af; font-size: 11px;">
        Wysłano z 🏛️ Ścieżka Prawa • ${new Date().toLocaleDateString('pl-PL')}
      </p>
    </div>
  </div>
</body>
</html>
    `

    console.log(`[Direct Email] Sending test email to ${to}`)

    const { data, error } = await resend.emails.send({
      from: 'Ścieżka Prawa <onboarding@resend.dev>', // Use Resend's test domain
      to: [to],
      subject: '✅ Test powiadomień - Ścieżka Prawa',
      html: emailHtml,
    })

    if (error) {
      console.error('[Direct Email] Error:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        details: error
      }, { status: 500 })
    }

    console.log('[Direct Email] Success:', data)

    return NextResponse.json({
      success: true,
      message: `Email wysłany na ${to}`,
      emailId: data?.id,
    })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Direct Email] Exception:', error)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
