import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { booking_id, type } = body

    if (!booking_id || !type) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: booking } = await supabase
      .from('bookings')
      .select('*, profiles(email, full_name), services(title, price)')
      .eq('id', booking_id)
      .single()

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Notify admin
    const adminEmail = process.env.ADMIN_EMAIL
    if (adminEmail && type === 'new_booking') {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'new_booking_admin',
          to: adminEmail,
          name: booking.profiles?.full_name ?? 'Kunde',
          service: booking.services?.title ?? 'Training',
          date: booking.booking_date,
          time: booking.start_time,
        }),
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
