import { NextRequest, NextResponse } from 'next/server'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'personaltrainingbymartin@gmail.com'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
const FROM_EMAIL = 'personaltrainingbymartin@gmail.com'
const FROM_NAME = 'Personal Training Zurich – by Martin'

const WA_LINK = 'https://wa.me/41774857535'
const WA_NUMBER = '+41 77 485 75 35'
const ADDRESS = 'Oberer Heuelsteig 30, 8032 Zürich'

function baseTemplate(content: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #f7f6f3;">
      <div style="background: #1c1c1c; border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 24px;">
        <h1 style="color: white; font-size: 22px; margin: 0 0 6px; font-weight: 700;">Personal Training Zurich</h1>
        <p style="color: rgba(255,255,255,0.5); margin: 0; font-size: 13px;">by Martin</p>
      </div>
      <div style="background: white; border-radius: 16px; padding: 32px;">
        ${content}
      </div>
      <p style="text-align: center; color: #aaa; font-size: 12px; margin-top: 20px;">
        Personal Training Zurich – by Martin · ${ADDRESS}
      </p>
    </div>
  `
}

function bookingTable(service: string, date: string, time: string) {
  return `
    <div style="background: #f7f6f3; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="color: #999; font-size: 12px; text-transform: uppercase; padding-bottom: 6px;">Angebot</td>
          <td style="font-weight: 600; color: #1c1c1c; text-align: right;">${service}</td>
        </tr>
        <tr>
          <td style="color: #999; font-size: 12px; text-transform: uppercase; padding: 6px 0;">Datum</td>
          <td style="font-weight: 600; color: #1c1c1c; text-align: right;">${date}</td>
        </tr>
        <tr>
          <td style="color: #999; font-size: 12px; text-transform: uppercase; padding-top: 6px;">Uhrzeit</td>
          <td style="font-weight: 600; color: #1c1c1c; text-align: right;">${time?.slice(0, 5)} Uhr</td>
        </tr>
      </table>
    </div>
  `
}

function ctaButton(href: string, label: string) {
  return `
    <a href="${href}" style="display: block; background: #4a7c59; color: white; text-align: center; padding: 14px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px; margin-top: 20px;">
      ${label}
    </a>
  `
}

function waBlock() {
  return `
    <div style="background: #f0f7f3; border: 1px solid #c5dfd0; border-radius: 12px; padding: 16px; margin-top: 20px;">
      <p style="color: #4a7c59; font-weight: 600; margin: 0 0 4px;">💬 Fragen? WhatsApp</p>
      <a href="${WA_LINK}" style="color: #4a7c59; font-size: 14px; text-decoration: none;">${WA_NUMBER}</a>
    </div>
  `
}

async function sendMail(to: string, subject: string, html: string) {
  const apiKey = process.env.SENDGRID_API_KEY
  console.log('[sendMail] to:', to, '| subject:', subject)
  console.log('[sendMail] FROM_EMAIL:', FROM_EMAIL, '| ADMIN_EMAIL:', ADMIN_EMAIL)
  console.log('[sendMail] SENDGRID_API_KEY present:', !!apiKey, apiKey ? `(starts: ${apiKey.slice(0, 8)}...)` : '(MISSING)')

  if (!apiKey) throw new Error('SENDGRID_API_KEY nicht konfiguriert.')

  const payload = {
    personalizations: [{ to: [{ email: to }] }],
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject,
    content: [{ type: 'text/html', value: html }],
  }

  console.log('[sendMail] calling SendGrid...')
  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const responseText = await res.text()
  console.log('[sendMail] SendGrid response:', res.status, responseText || '(empty)')

  if (!res.ok) {
    throw new Error(`SendGrid Fehler ${res.status}: ${responseText}`)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('[send-email] received type:', body.type, '| to:', body.to ?? body.customerEmail)
    const { type, to, name, service, date, time, message, customerEmail, phone, age, experience, goals } = body

    // ── Kunden-E-Mails (Buchungsformular) ───────────────────────────────────────

    if (type === 'booking_confirmation') {
      const html = baseTemplate(`
        <h2 style="color: #1c1c1c; font-size: 20px; font-weight: 700; margin: 0 0 8px;">Deine Buchungsanfrage ist eingegangen!</h2>
        <p style="color: #666; margin: 0 0 4px;">Hallo ${name},</p>
        <p style="color: #666; margin: 0 0 16px;">vielen Dank für deine Buchung! Ich habe deine Anfrage erhalten und melde mich in Kürze bei dir zur Terminbestätigung.</p>
        ${bookingTable(service, date, time)}
        <div style="background: #fff8e6; border: 1px solid #f0d080; border-radius: 12px; padding: 16px;">
          <p style="color: #a07800; font-weight: 600; margin: 0 0 4px;">⏳ Nächster Schritt</p>
          <p style="color: #666; margin: 0; font-size: 14px;">Sobald ich deinen Termin bestätigt habe, erhältst du eine weitere E-Mail von mir.</p>
        </div>
        ${waBlock()}
      `)
      await sendMail(to, 'Deine Buchungsanfrage ist eingegangen – Personal Training Zürich', html)
    }

    else if (type === 'booking_cancelled_customer') {
      const html = baseTemplate(`
        <h2 style="color: #1c1c1c; font-size: 20px; font-weight: 700; margin: 0 0 8px;">Buchung storniert</h2>
        <p style="color: #666; margin: 0 0 16px;">Hallo ${name}, deine Buchung wurde storniert.</p>
        ${bookingTable(service, date, time)}
        <p style="color: #666; font-size: 14px;">Du kannst jederzeit einen neuen Termin buchen.</p>
        ${ctaButton(`${APP_URL}/book/probe-training`, 'Neuen Termin buchen')}
        ${waBlock()}
      `)
      await sendMail(to, 'Buchung storniert – Personal Training Zürich', html)
    }

    // ── Status-Wechsel durch Admin → Kunden-E-Mails ─────────────────────────────

    else if (type === 'status_confirmed_customer') {
      const html = baseTemplate(`
        <h2 style="color: #1c1c1c; font-size: 20px; font-weight: 700; margin: 0 0 8px;">✓ Dein Termin ist bestätigt!</h2>
        <p style="color: #666; margin: 0 0 4px;">Hallo ${name},</p>
        <p style="color: #666; margin: 0 0 16px;">dein Termin bei Personal Training Zurich ist bestätigt. Ich freue mich auf unser Training!</p>
        ${bookingTable(service, date, time)}
        <div style="background: #f0f7f3; border: 1px solid #c5dfd0; border-radius: 12px; padding: 16px; margin-top: 0;">
          <p style="color: #4a7c59; font-weight: 600; margin: 0 0 4px;">📍 Trainingsstandort</p>
          <p style="color: #666; margin: 0; font-size: 14px;">${ADDRESS}</p>
        </div>
        ${waBlock()}
      `)
      await sendMail(to, 'Dein Termin bei Personal Training Zurich ist bestätigt ✓', html)
    }

    else if (type === 'status_completed_customer') {
      const html = baseTemplate(`
        <h2 style="color: #1c1c1c; font-size: 20px; font-weight: 700; margin: 0 0 8px;">Danke für dein Training! 💪</h2>
        <p style="color: #666; margin: 0 0 4px;">Hallo ${name},</p>
        <p style="color: #666; margin: 0 0 16px;">danke für dein heutiges Training – du hast das super gemacht! Ich hoffe, du bist zufrieden und freue mich schon auf dein nächstes Training.</p>
        <div style="background: #f7f6f3; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <p style="color: #1c1c1c; font-weight: 600; margin: 0 0 8px;">Bereit für die nächste Einheit?</p>
          <p style="color: #666; font-size: 14px; margin: 0;">Buche jetzt deinen nächsten Termin und bleib am Ball!</p>
        </div>
        ${ctaButton(`${APP_URL}/book/personal-training`, 'Nächsten Termin buchen')}
        ${waBlock()}
      `)
      await sendMail(to, 'Danke für dein Training! 💪', html)
    }

    else if (type === 'status_cancelled_customer') {
      const html = baseTemplate(`
        <h2 style="color: #1c1c1c; font-size: 20px; font-weight: 700; margin: 0 0 8px;">Dein Termin wurde abgesagt</h2>
        <p style="color: #666; margin: 0 0 4px;">Hallo ${name},</p>
        <p style="color: #666; margin: 0 0 16px;">leider muss ich deinen folgenden Termin absagen. Es tut mir leid für die Unannehmlichkeiten.</p>
        ${bookingTable(service, date, time)}
        <p style="color: #666; font-size: 14px; margin: 16px 0 0;">Du kannst gerne einen neuen Termin buchen – ich freue mich, dich bald zu sehen!</p>
        ${ctaButton(`${APP_URL}/book/probe-training`, 'Neuen Termin buchen')}
        ${waBlock()}
      `)
      await sendMail(to, 'Dein Termin wurde leider abgesagt', html)
    }

    else if (type === 'status_rescheduled_customer') {
      const html = baseTemplate(`
        <h2 style="color: #1c1c1c; font-size: 20px; font-weight: 700; margin: 0 0 8px;">Dein Termin wurde verschoben</h2>
        <p style="color: #666; margin: 0 0 4px;">Hallo ${name},</p>
        <p style="color: #666; margin: 0 0 16px;">dein folgender Termin muss leider verschoben werden:</p>
        ${bookingTable(service, date, time)}
        <p style="color: #666; font-size: 14px; margin: 16px 0 0;">Bitte buche dir einen neuen Wunschtermin – ich bin für dich da!</p>
        ${ctaButton(`${APP_URL}/book/probe-training`, 'Neuen Termin buchen')}
        ${waBlock()}
      `)
      await sendMail(to, 'Dein Termin wurde verschoben', html)
    }

    // ── Admin-Benachrichtigungen ────────────────────────────────────────────────

    else if (type === 'new_booking_admin') {
      console.log('[send-email] new_booking_admin → sending to ADMIN_EMAIL:', ADMIN_EMAIL)
      const extraRows = [
        customerEmail ? `<tr><td style="color:#999;font-size:12px;text-transform:uppercase;padding:6px 0;">E-Mail</td><td style="font-weight:600;color:#1c1c1c;text-align:right;">${customerEmail}</td></tr>` : '',
        phone ? `<tr><td style="color:#999;font-size:12px;text-transform:uppercase;padding:6px 0;">Telefon</td><td style="font-weight:600;color:#1c1c1c;text-align:right;">${phone}</td></tr>` : '',
        age ? `<tr><td style="color:#999;font-size:12px;text-transform:uppercase;padding:6px 0;">Alter</td><td style="font-weight:600;color:#1c1c1c;text-align:right;">${age}</td></tr>` : '',
        experience ? `<tr><td style="color:#999;font-size:12px;text-transform:uppercase;padding:6px 0;">Erfahrung</td><td style="font-weight:600;color:#1c1c1c;text-align:right;">${experience}</td></tr>` : '',
        goals ? `<tr><td style="color:#999;font-size:12px;text-transform:uppercase;padding:6px 0;">Ziele</td><td style="font-weight:600;color:#1c1c1c;text-align:right;">${goals}</td></tr>` : '',
      ].join('')
      const html = baseTemplate(`
        <h2 style="color: #1c1c1c; font-size: 20px; font-weight: 700; margin: 0 0 8px;">🎉 Neue Buchung eingegangen</h2>
        <p style="color: #666; margin: 0 0 16px;">
          <strong>${name}</strong> hat einen neuen Termin gebucht.
        </p>
        ${bookingTable(service, date, time)}
        <div style="background:#f7f6f3;border-radius:12px;padding:20px;margin:12px 0;">
          <table style="width:100%;border-collapse:collapse;">${extraRows}</table>
        </div>
        ${ctaButton(`${APP_URL}/admin/bookings`, 'Im Admin Dashboard ansehen')}
      `)
      await sendMail(ADMIN_EMAIL, `🎉 Neue Buchung: ${name} – ${service}`, html)
    }

    else if (type === 'booking_cancelled_admin') {
      const html = baseTemplate(`
        <h2 style="color: #c0392b; font-size: 20px; font-weight: 700; margin: 0 0 8px;">❌ Buchung storniert</h2>
        <p style="color: #666; margin: 0 0 16px;">
          <strong>${name}</strong> (${customerEmail ?? to}) hat einen Termin storniert.
        </p>
        ${bookingTable(service, date, time)}
        ${ctaButton(`${APP_URL}/admin/bookings`, 'Im Admin Dashboard ansehen')}
      `)
      await sendMail(ADMIN_EMAIL, `❌ Buchung storniert: ${name}`, html)
    }

    else if (type === 'booking_rescheduled_admin') {
      const html = baseTemplate(`
        <h2 style="color: #e67e22; font-size: 20px; font-weight: 700; margin: 0 0 8px;">🔄 Buchung verschoben</h2>
        <p style="color: #666; margin: 0 0 16px;">
          <strong>${name}</strong> (${customerEmail ?? to}) hat einen Termin verschoben.
        </p>
        ${bookingTable(service, date, time)}
        ${ctaButton(`${APP_URL}/admin/bookings`, 'Im Admin Dashboard ansehen')}
      `)
      await sendMail(ADMIN_EMAIL, `🔄 Buchung verschoben: ${name}`, html)
    }

    else if (type === 'new_chat_message_admin') {
      const html = baseTemplate(`
        <h2 style="color: #1c1c1c; font-size: 20px; font-weight: 700; margin: 0 0 8px;">💬 Neue Nachricht von Kunde</h2>
        <p style="color: #666; margin: 0 0 16px;">
          <strong>${name}</strong> (${customerEmail ?? ''}) hat dir eine Nachricht geschrieben:
        </p>
        <div style="background: #f7f6f3; border-left: 4px solid #4a7c59; border-radius: 8px; padding: 16px; margin: 16px 0; font-style: italic; color: #333;">
          "${message}"
        </div>
        ${ctaButton(`${APP_URL}/admin/chat`, 'Nachricht beantworten')}
      `)
      await sendMail(ADMIN_EMAIL, `💬 Neue Nachricht von ${name}`, html)
    }

    else {
      return NextResponse.json({ error: `Unbekannter E-Mail-Typ: ${type}` }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('send-email error:', err)
    return NextResponse.json({ error: 'E-Mail konnte nicht gesendet werden.' }, { status: 500 })
  }
}
