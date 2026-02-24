import type { Metadata } from 'next'
import { Container } from '@/components/Container'

export const metadata: Metadata = {
  title: 'Datenschutz',
}

export default function DatenschutzPage() {
  return (
    <main className="pt-28 pb-20">
      <Container>
        <h1 className="font-serif text-4xl">Datenschutzerkl&auml;rung</h1>

        <div className="prose prose-stone mt-12 max-w-2xl">
          <h2>1. Verantwortlicher</h2>
          <p>
            [Name / Firma]<br />
            [Adresse]<br />
            E-Mail: [email@example.com]
          </p>

          <h2>2. Erhebung und Verarbeitung personenbezogener Daten</h2>
          <p>
            Diese Website erhebt so wenig personenbezogene Daten wie m&ouml;glich.
            Wir verwenden keine Cookies und setzen kein Tracking ein, das eine
            Einwilligung erfordert.
          </p>

          <h2>3. Web-Analyse</h2>
          <p>
            Wir verwenden Plausible Analytics, ein datenschutzfreundliches
            Analyse-Tool, das ohne Cookies arbeitet und keine personenbezogenen
            Daten speichert. Es werden keine individuellen Besucher identifiziert.
          </p>

          <h2>4. Hosting</h2>
          <p>
            Diese Website wird bei Vercel Inc. gehostet. Bei jedem Zugriff werden
            Server-Logfiles gespeichert (IP-Adresse, Zeitpunkt, angeforderte Datei).
            Diese Daten werden ausschlie&szlig;lich zur Sicherstellung des Betriebs verwendet.
          </p>

          <h2>5. Externe Links</h2>
          <p>
            Diese Website enth&auml;lt Links zu externen Webseiten Dritter. Beim Anklicken
            dieser Links werden Sie zu deren Seiten weitergeleitet. Wir haben keinen
            Einfluss auf die dort erhobenen Daten.
          </p>

          <h2>6. Ihre Rechte</h2>
          <p>
            Sie haben das Recht auf Auskunft, Berichtigung, L&ouml;schung und
            Einschr&auml;nkung der Verarbeitung Ihrer Daten sowie das Recht auf
            Daten&uuml;bertragbarkeit. Bei Fragen wenden Sie sich an die oben
            genannte E-Mail-Adresse.
          </p>

          <h2>7. Beschwerderecht</h2>
          <p>
            Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbeh&ouml;rde
            &uuml;ber die Verarbeitung Ihrer personenbezogenen Daten zu beschweren.
          </p>
        </div>
      </Container>
    </main>
  )
}
