'use client'

import { useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import BookingRequest from '@/components/booking/BookingRequest'
import { useLanguage } from '@/contexts/LanguageContext'

export default function BookingPage() {
  const params = useParams()
  const serviceId = params.serviceId as string
  const { t } = useLanguage()

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background pt-20">
        <div className="container-max px-4 md:px-10 py-12">
          <Link
            href="/#angebote"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('book.back')}
          </Link>
          <BookingRequest serviceId={serviceId} />
        </div>
      </main>
      <Footer />
    </>
  )
}
