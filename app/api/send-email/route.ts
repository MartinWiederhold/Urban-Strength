import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, to, name, service, date, time } = body

    const apiKey = process.env.SENDGRID_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'E-Mail-Service nicht konfiguriert.' }, { status: 500 })
    }

    let subject = ''
    let html = ''

    if (type === 'booking_confirmation') {
      subject = `Buchungsbestätigung – Personal Training Zürich`
      html = `
        <div style="font-family: 'Outfit', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #f7f6f3;">
          <div style="background: #1c1c1c; border-radius: 16px; padding: 40px; text-align: center; margin-bottom: 24px;">
            <h1 style="color: white; font-size: 24px; margin: 0 0 8px; font-weight: 700;">Personal Training Zurich</h1>
            <p style="color: rgba(255,255,255,0.6); margin: 0; font-size: 14px;">by Martin</p>
          </div>
          <div style="background: white; border-radius: 16px; padding: 32px;">
            <h2 style="color: #1c1c1c; font-size: 22px; font-weight: 700; margin: 0 0 8px;">✓ Deine Buchung ist bestätigt!</h2>
            <p style="color: #666; margin: 0 0 24px;">Hallo ${name},<br/>dein Termin für das Personal Training ist gebucht.</p>
            <div style="background: #f7f6f3; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="color: #999; font-size: 12px; text-transform: uppercase; padding-bottom: 4px;">Angebot</td><td style="font-weight: 600; color: #1c1c1c; text-align: right;">${service}</td></tr>
                <tr><td style="color: #999; font-size: 12px; text-transform: uppercase; padding: 8px 0 4px;">Datum</td><td style="font-weight: 600; color: #1c1c1c; text-align: right;">${date}</td></tr>
                <tr><td style="color: #999; font-size: 12px; text-transform: uppercase; padding-top: 8px;">Uhrzeit</td><td style="font-weight: 600; color: #1c1c1c; text-align: right;">${time?.slice(0, 5)} Uhr</td></tr>
              </table>
            </div>
            <div style="background: #f0f7f3; border: 1px solid #c5dfd0; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
              <p style="color: #4a7c59; font-weight: 600; margin: 0 0 4px;">📍 Trainingsstandort</p>
              <p style="color: #666; margin: 0; font-size: 14px;">Oberer Heuelsteig 30, 8032 Zürich</p>
            </div>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: block; background: #4a7c59; color: white; text-align: center; padding: 14px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px;">
              Zum Dashboard
            </a>
          </div>
          <p style="text-align: center; color: #999; font-size: 12px; margin-top: 24px;">Personal Training Zurich – by Martin · Oberer Heuelsteig 30, 8032 Zürich</p>
        </div>
      `
    } else if (type === 'new_booking_admin') {
      subject = `Neue Buchung von ${name}`
      html = `<p>Neue Buchung von <strong>${name}</strong> (${to}) für <strong>${service}</strong> am ${date} um ${time?.slice(0, 5)} Uhr.</p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/bookings">Im Admin ansehen</a>`
    } else if (type === 'booking_cancelled') {
      subject = `Buchung storniert – Personal Training Zürich`
      html = `<p>Hallo ${name}, deine Buchung für <strong>${service}</strong> am ${date} wurde storniert.</p>`
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: 'noreply@personaltraining-zurich.ch', name: 'Personal Training Zurich' },
        subject,
        content: [{ type: 'text/html', value: html }],
      }),
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'E-Mail konnte nicht gesendet werden.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Interner Fehler.' }, { status: 500 })
  }
}
