import { Resend } from 'resend'

// Initialize Resend client lazily
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured')
  }
  return new Resend(apiKey)
}

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
}

export interface BillChangeNotification {
  billTitle: string
  billId: string
  oldStatus?: string
  newStatus: string
  changeDescription: string
  changeDate: Date
}

export interface DigestReport {
  userName: string
  period: 'daily' | 'weekly'
  changes: BillChangeNotification[]
  newConsultations: Array<{
    title: string
    ministry: string
    endDate: Date
    url: string
  }>
}

/**
 * Send an email using Resend
 */
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const resend = getResendClient()
    const { data, error } = await resend.emails.send({
      from: options.from || 'Ścieżka Prawa <noreply@sciezkaprawa.pl>',
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
    })

    if (error) {
      console.error('[Email] Send error:', error)
      return { success: false, error: error.message }
    }

    console.log('[Email] Sent successfully:', data?.id)
    return { success: true, id: data?.id }
  } catch (error: any) {
    console.error('[Email] Exception:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Generate HTML for bill status change notification
 */
export function generateBillChangeEmail(notification: BillChangeNotification): string {
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

  const newStatusLabel = statusLabels[notification.newStatus] || notification.newStatus
  const oldStatusLabel = notification.oldStatus ? statusLabels[notification.oldStatus] || notification.oldStatus : null
  const statusColor = statusColors[notification.newStatus] || '#3b82f6'

  return `
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Zmiana statusu ustawy</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🏛️ Ścieżka Prawa</h1>
      <p style="color: #bfdbfe; margin: 10px 0 0 0; font-size: 14px;">System monitoringu legislacyjnego</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 30px;">
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 20px; border-radius: 0 8px 8px 0;">
        <p style="margin: 0; color: #92400e; font-weight: 600;">
          ⚡ Zmiana w śledzonym projekcie ustawy
        </p>
      </div>
      
      <h2 style="color: #1f2937; font-size: 18px; margin-bottom: 15px; line-height: 1.4;">
        ${notification.billTitle}
      </h2>
      
      <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Status zmienił się:</p>
        <div style="display: flex; align-items: center; gap: 10px;">
          ${oldStatusLabel ? `
          <span style="background-color: #e5e7eb; color: #374151; padding: 6px 12px; border-radius: 20px; font-size: 14px; text-decoration: line-through;">
            ${oldStatusLabel}
          </span>
          <span style="color: #9ca3af;">→</span>
          ` : ''}
          <span style="background-color: ${statusColor}; color: #ffffff; padding: 6px 12px; border-radius: 20px; font-size: 14px; font-weight: 600;">
            ${newStatusLabel}
          </span>
        </div>
      </div>
      
      <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
        ${notification.changeDescription}
      </p>
      
      <p style="color: #9ca3af; font-size: 12px; margin-bottom: 20px;">
        📅 Data zmiany: ${notification.changeDate.toLocaleDateString('pl-PL', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </p>
      
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/bills/${notification.billId}" 
         style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">
        Zobacz szczegóły projektu →
      </a>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 12px;">
        Otrzymujesz tę wiadomość, ponieważ ustawiłeś alert dla tego projektu ustawy.
      </p>
      <p style="margin: 0; color: #9ca3af; font-size: 11px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/alerts" style="color: #3b82f6; text-decoration: none;">Zarządzaj alertami</a>
        &nbsp;|&nbsp;
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings" style="color: #3b82f6; text-decoration: none;">Ustawienia powiadomień</a>
      </p>
    </div>
  </div>
</body>
</html>
  `
}

/**
 * Generate HTML for digest report email
 */
export function generateDigestEmail(report: DigestReport): string {
  const periodLabel = report.period === 'daily' ? 'Raport dzienny' : 'Raport tygodniowy'
  const periodEmoji = report.period === 'daily' ? '📅' : '📆'
  
  const changesHtml = report.changes.length > 0 
    ? report.changes.map(change => `
      <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
        <h4 style="margin: 0 0 8px 0; color: #1f2937; font-size: 14px;">${change.billTitle}</h4>
        <p style="margin: 0; color: #6b7280; font-size: 13px;">
          Status: <strong style="color: #3b82f6;">${change.newStatus}</strong>
        </p>
        <p style="margin: 5px 0 0 0; color: #9ca3af; font-size: 12px;">${change.changeDescription}</p>
      </div>
    `).join('')
    : '<p style="color: #6b7280; font-style: italic;">Brak zmian w śledzonych projektach.</p>'

  const consultationsHtml = report.newConsultations.length > 0
    ? report.newConsultations.map(c => `
      <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
        <h4 style="margin: 0 0 8px 0; color: #1f2937; font-size: 14px;">📋 ${c.title}</h4>
        <p style="margin: 0; color: #6b7280; font-size: 13px;">
          ${c.ministry} • Do: ${c.endDate.toLocaleDateString('pl-PL')}
        </p>
        <a href="${c.url}" style="color: #3b82f6; font-size: 12px; text-decoration: none;">Weź udział →</a>
      </div>
    `).join('')
    : '<p style="color: #6b7280; font-style: italic;">Brak nowych konsultacji.</p>'

  return `
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${periodLabel} - Ścieżka Prawa</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🏛️ Ścieżka Prawa</h1>
      <p style="color: #bfdbfe; margin: 10px 0 0 0; font-size: 14px;">${periodEmoji} ${periodLabel}</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 30px;">
      <p style="color: #4b5563; font-size: 16px; margin-bottom: 25px;">
        Cześć <strong>${report.userName || 'Użytkowniku'}</strong>! 👋<br>
        Oto podsumowanie zmian legislacyjnych.
      </p>
      
      <!-- Changes Section -->
      <div style="margin-bottom: 30px;">
        <h3 style="color: #1f2937; font-size: 16px; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb;">
          📊 Zmiany w śledzonych projektach (${report.changes.length})
        </h3>
        ${changesHtml}
      </div>
      
      <!-- Consultations Section -->
      <div style="margin-bottom: 30px;">
        <h3 style="color: #1f2937; font-size: 16px; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb;">
          🗣️ Nowe konsultacje społeczne (${report.newConsultations.length})
        </h3>
        ${consultationsHtml}
      </div>
      
      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" 
           style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">
          Przejdź do panelu →
        </a>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 12px;">
        Raport wygenerowany automatycznie przez Ścieżka Prawa.
      </p>
      <p style="margin: 0; color: #9ca3af; font-size: 11px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings" style="color: #3b82f6; text-decoration: none;">Zmień częstotliwość raportów</a>
        &nbsp;|&nbsp;
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/alerts" style="color: #3b82f6; text-decoration: none;">Zarządzaj alertami</a>
      </p>
    </div>
  </div>
</body>
</html>
  `
}

/**
 * Generate test email for verification
 */
export function generateTestEmail(userName: string): string {
  return `
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test powiadomień - Ścieżka Prawa</title>
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
        Gratulacje, ${userName || 'Użytkowniku'}!
      </h2>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
        Twoje powiadomienia email działają poprawnie.<br>
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
}

export { getResendClient }
