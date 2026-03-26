import type { Metadata } from 'next'
import KontaktContent from './KontaktContent'

export const metadata: Metadata = {
  title: 'Kontakt | Personal Training Zürich – Oberer Heuelsteig 30-34',
  description: 'Kontaktiere deinen Personal Trainer in Zürich. Adresse: Oberer Heuelsteig 30-34, 8032 Zürich. Kostenloses Probetraining buchen oder Frage stellen.',
  alternates: { canonical: 'https://personaltrainingbymartin.netlify.app/kontakt' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://personaltrainingbymartin.netlify.app' },
    { '@type': 'ListItem', position: 2, name: 'Kontakt', item: 'https://personaltrainingbymartin.netlify.app/kontakt' },
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
