import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * POST /api/notifications/preview - Preview email without sending
 * For testing email templates
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, type = 'test' } = body

    const emailHtml = type === 'digest' ? generateDigestPreview() : generateTestPreview()

    return NextResponse.json({
      success: true,
      preview: {
        to,
        subject: type === 'digest' ? '📅 Raport dzienny - Ścieżka Prawa' : '✅ Test powiadomień - Ścieżka Prawa',
        html: emailHtml,
      },
      instructions: {
        resend: 'Aby wysyłać prawdziwe emaile, zarejestruj się na https://resend.com i dodaj RESEND_API_KEY do .env.local',
        test: 'Użyj Resend test API key (re_...) lub własnej domeny',
      }
    })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

function generateTestPreview(): string {
  return `
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <title>Test - Ścieżka Prawa</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0;">✅ Test Powiadomień</h1>
      <p style="color: #a7f3d0; margin: 10px 0 0;">Ścieżka Prawa - System Alertów</p>
    </div>
    <div style="padding: 30px; text-align: center;">
      <div style="font-size: 64px; margin-bottom: 20px;">🎉</div>
      <h2 style="color: #1f2937;">Gratulacje!</h2>
      <p style="color: #4b5563; line-height: 1.6;">
        System powiadomień email działa poprawnie.<br>
        Będziesz otrzymywać alerty o zmianach w śledzonych projektach ustaw.
      </p>
      <div style="background: #ecfdf5; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: left;">
        <h3 style="color: #065f46; margin: 0 0 10px;">📬 Co będziesz otrzymywać?</h3>
        <ul style="color: #047857; margin: 0; padding-left: 20px;">
          <li>Natychmiastowe powiadomienia o zmianach statusu ustaw</li>
          <li>Informacje o nowych konsultacjach społecznych</li>
          <li>Raporty dzienne/tygodniowe (opcjonalnie)</li>
        </ul>
      </div>
      <a href="/alerts" style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;">
        Ustaw alerty dla ustaw →
      </a>
    </div>
    <div style="padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #9ca3af; font-size: 11px; margin: 0;">
        Wysłano z 🏛️ Ścieżka Prawa • ${new Date().toLocaleDateString('pl-PL')}
      </p>
    </div>
  </div>
</body>
</html>
  `
}

function generateDigestPreview(): string {
  const date = new Date().toLocaleDateString('pl-PL')
  return `
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <title>Raport dzienny - Ścieżka Prawa</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0;">🏛️ Ścieżka Prawa</h1>
      <p style="color: #bfdbfe; margin: 10px 0 0;">📅 Raport dzienny • ${date}</p>
    </div>
    <div style="padding: 30px;">
      <p style="color: #4b5563; font-size: 16px; margin-bottom: 25px;">
        Cześć <strong>Użytkowniku</strong>! 👋<br>
        Oto podsumowanie zmian legislacyjnych.
      </p>
      
      <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
        📊 Zmiany w śledzonych projektach (2)
      </h3>
      
      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
        <h4 style="margin: 0 0 8px; color: #1f2937;">Ustawa o zmianie ustawy o podatku dochodowym</h4>
        <p style="margin: 0; color: #6b7280; font-size: 13px;">
          Status: <strong style="color: #3b82f6;">II Czytanie</strong>
        </p>
        <p style="margin: 5px 0 0; color: #9ca3af; font-size: 12px;">
          Projekt przeszedł do II czytania w Sejmie.
        </p>
      </div>
      
      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
        <h4 style="margin: 0 0 8px; color: #1f2937;">Ustawa o ochronie danych w sektorze publicznym</h4>
        <p style="margin: 0; color: #6b7280; font-size: 13px;">
          Status: <strong style="color: #3b82f6;">Konsultacje</strong>
        </p>
        <p style="margin: 5px 0 0; color: #9ca3af; font-size: 12px;">
          Rozpoczęły się konsultacje społeczne projektu.
        </p>
      </div>
      
      <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-top: 30px;">
        🗣️ Nowe konsultacje społeczne (1)
      </h3>
      
      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
        <h4 style="margin: 0 0 8px; color: #1f2937;">📋 Konsultacje projektu ustawy o cyberbezpieczeństwie</h4>
        <p style="margin: 0; color: #6b7280; font-size: 13px;">
          Ministerstwo Cyfryzacji • Do: 20.12.2024
        </p>
        <a href="#" style="color: #3b82f6; font-size: 12px; text-decoration: none;">Weź udział →</a>
      </div>
      
      <div style="text-align: center; margin-top: 30px;">
        <a href="/dashboard" style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;">
          Przejdź do panelu →
        </a>
      </div>
    </div>
    <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; color: #6b7280; font-size: 12px;">
        Raport wygenerowany automatycznie przez Ścieżka Prawa.
      </p>
      <p style="margin: 10px 0 0; color: #9ca3af; font-size: 11px;">
        <a href="/settings" style="color: #3b82f6;">Zmień częstotliwość raportów</a> |
        <a href="/alerts" style="color: #3b82f6;">Zarządzaj alertami</a>
      </p>
    </div>
  </div>
</body>
</html>
  `
}

/**
 * GET /api/notifications/preview - Get test email preview as HTML
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'test'
  
  const html = type === 'digest' ? generateDigestPreview() : generateTestPreview()
  
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
}
