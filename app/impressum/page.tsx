import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export default function ImpressumPage() {
  return (
    <>
      <Navigation />
      <main className="pt-20 section-padding">
        <div className="container-max max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight mb-8">Impressum</h1>
          <div className="prose text-muted-foreground space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Angaben gemäss Art. 3 UWG</h2>
            <p>Personal Training Zurich – by Martin<br />Martin Wiederhold<br />Oberer Heuelsteig 30-34<br />8032 Zürich, Schweiz</p>
            <p>E-Mail: personaltrainingbymartin@gmail.com</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
