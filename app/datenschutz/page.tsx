import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export default function DatenschutzPage() {
  return (
    <>
      <Navigation />
      <main className="pt-20 section-padding">
        <div className="container-max max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight mb-8">Datenschutzerklärung</h1>
          <div className="prose text-muted-foreground space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Datenschutz</h2>
            <p>Der Schutz deiner persönlichen Daten ist uns wichtig. Diese Datenschutzerklärung beschreibt, wie wir mit deinen Daten umgehen.</p>
            <h2 className="text-xl font-semibold text-foreground">Verantwortliche Stelle</h2>
            <p>Personal Training Zurich – by Martin<br />Martin Wiederhold<br />Oberer Heuelsteig 30, 8032 Zürich</p>
            <h2 className="text-xl font-semibold text-foreground">Erhebung von Daten</h2>
            <p>Wir erheben nur die Daten, die für die Buchung von Trainingsterminen und die Kommunikation mit dir notwendig sind. Deine Daten werden nicht an Dritte weitergegeben.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
