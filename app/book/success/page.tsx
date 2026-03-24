'use client'

import Link from 'next/link'
import { CheckCircle, Calendar, MapPin, MessageCircle } from 'lucide-react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'

export default function BookingSuccessPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background pt-20 flex items-center">
        <div className="container-max px-4 md:px-10 py-16 w-full">
          <div
            className="max-w-lg mx-auto text-center"
          >
            <div
              className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>

            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
              Buchung bestätigt!
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Dein Termin ist gebucht. Du erhältst eine Bestätigungs-E-Mail. Wir freuen uns auf dich!
            </p>

            <div className="space-y-3 mb-8 text-left">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <p className="font-medium text-sm">Trainingsstandort</p>
                  <p className="text-sm text-muted-foreground">Oberer Heuelsteig 30, 8032 Zürich</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary">
                <Calendar className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <p className="font-medium text-sm">Buchungsdetails</p>
                  <p className="text-sm text-muted-foreground">Findest du in deinem Dashboard</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary">
                <MessageCircle className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <p className="font-medium text-sm">Fragen?</p>
                  <p className="text-sm text-muted-foreground">Schreib mir direkt im Chat</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/dashboard">
                <Button variant="hero" size="lg">
                  Zum Dashboard
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" size="lg">
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
