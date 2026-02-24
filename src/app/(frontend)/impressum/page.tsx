import type { Metadata } from 'next'
import { Container } from '@/components/Container'

export const metadata: Metadata = {
  title: 'Impressum',
}

export default function ImpressumPage() {
  return (
    <main className="pt-28 pb-20">
      <Container>
        <h1 className="font-serif text-4xl">Impressum</h1>

        <div className="prose prose-stone mt-12 max-w-2xl">
          <h2>Angaben gem. &sect; 5 TMG / &sect; 25 MedienG</h2>
          <p>
            [Name / Firma]<br />
            [Stra&szlig;e, Hausnummer]<br />
            [PLZ Ort]<br />
            [Land]
          </p>

          <h2>Kontakt</h2>
          <p>
            E-Mail: [email@example.com]
          </p>

          <h2>Verantwortlich f&uuml;r den Inhalt</h2>
          <p>
            [Name]<br />
            [Adresse]
          </p>

          <h2>Haftungshinweis</h2>
          <p>
            Trotz sorgf&auml;ltiger inhaltlicher Kontrolle &uuml;bernehmen wir keine Haftung f&uuml;r
            die Inhalte externer Links. F&uuml;r den Inhalt der verlinkten Seiten sind
            ausschlie&szlig;lich deren Betreiber verantwortlich.
          </p>
        </div>
      </Container>
    </main>
  )
}
