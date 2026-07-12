import type { Metadata } from 'next'
import KontaktContent from './KontaktContent'

export const metadata: Metadata = {
  title: 'Kontakt | Momentum – Personal Training in Zürich',
  description: 'Kontaktiere deinen Personal Trainer in Zürich. Adresse: Oberer Heuelsteig 30-34, 8032 Zürich. Kostenloses Probetraining buchen oder Frage stellen.',
  alternates: { canonical: 'https://momentum-zurich.vercel.app/kontakt' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://momentum-zurich.vercel.app' },
    { '@type': 'ListItem', position: 2, name: 'Kontakt', item: 'https://momentum-zurich.vercel.app/kontakt' },
  ],
}

export default function KontaktPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <KontaktContent />
    </>
  )
}
