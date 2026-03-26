'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle, Calendar, MapPin, MessageCircle } from 'lucide-react'
import Image from 'next/image'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface BookingInfo {
  name: string
  email: string
  phone: string
  service: string
  date: string
  time: string
  experience?: string
  goals?: string
}

export default function BookingSuccessPage() {
  const [booking, setBooking] = useState<BookingInfo | null>(null)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('booking_success')
      if (raw) {
        setBooking(JSON.parse(raw))
        sessionStorage.removeItem('booking_success')
      }
    } catch {
      // ignore
    }
  }, [])

  const formattedDate = booking?.date
    ? format(new Date(booking.date), 'EEEE, dd. MMMM yyyy', { locale: de })
    : null

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background pt-20 flex items-center">
        <div className="container-max px-4 md:px-10 py-16 w-full">
          <div className="max-w-lg mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
                Deine Buchung ist bestätigt ✓
              </h1>
              <p className="text-muted-foreground text-lg">
                {booking
                  ? `Hallo ${booking.name.split(' ')[0]}, ich freue mich auf dich!`
                  : 'Dein Termin ist gebucht. Ich freue mich auf dich!'}
              </p>
            </div>

            {/* Booking summary */}
            <div className="space-y-3 mb-8">
              {booking && (
                <div className="p-4 rounded-xl bg-secondary space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Dein Termin</h3>
                  <p className="font-medium">{booking.service}</p>
                  {formattedDate && (
                    <p className="text-sm text-muted-foreground">
                      {formattedDate} · {booking.time.slice(0, 5)} Uhr
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <p className="font-medium text-sm">Trainingsstandort</p>
                  <p className="text-sm text-muted-foreground">Oberer Heuelsteig 30-34, 8032 Zürich</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary">
                <Calendar className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <p className="font-medium text-sm">Bestätigung per E-Mail</p>
                  <p className="text-sm text-muted-foreground">
                    {booking?.email ? `Gesendet an ${booking.email}` : 'Du erhältst eine Bestätigungs-E-Mail.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary">
                <MessageCircle className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <p className="font-medium text-sm">Fragen?</p>
                  <p className="text-sm text-muted-foreground">Schreib mir direkt auf WhatsApp</p>
                </div>
              </div>
            </div>

            {/* Martin profile + WhatsApp CTA */}
            <div className="bg-card border border-border rounded-2xl p-6 mb-6 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              <div className="w-20 h-20 rounded-full bg-secondary border border-border flex-shrink-0 overflow-hidden relative">
                <Image src="/assets/images/IMG_99828.jpg" alt="Martin – Personal Trainer" fill className="object-cover object-center" sizes="80px" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-base mb-0.5">Martin Wiederhold</p>
                <p className="text-sm text-muted-foreground mb-3">Dein Personal Trainer in Zürich</p>
                <a
                  href="https://wa.me/41774857535"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-[#1ebe5d] transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  +41 77 485 75 35
                </a>
              </div>
            </div>

            {/* Bottom actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Zur Startseite
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
