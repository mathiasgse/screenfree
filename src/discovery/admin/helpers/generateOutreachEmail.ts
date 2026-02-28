interface CandidateData {
  name: string
  coordinates?: [number, number] | null
  contactEmail?: string | null
}

export function generateOutreachEmail(candidate: CandidateData): string {
  const name = candidate.name

  // Build dynamic list of missing info
  const missingItems: string[] = [
    '- 2–3 hochauflösende Fotos (Zimmer, Außenansicht, ein besonderes Detail)',
    '- Preisklasse bzw. ungefährer Preis pro Nacht',
    '- 2–3 Sätze: Was macht Ihr Haus besonders? Warum kommen Gäste zu Ihnen?',
    '- Zielgruppe (Paare, Familien, Solo-Reisende, …)',
  ]

  // Conditional: coordinates missing
  if (!candidate.coordinates) {
    missingItems.push('- Genaue Adresse oder Koordinaten Ihres Hauses')
  }

  const missingList = missingItems.join('\n')

  return `Betreff: Stille Orte Magazin — Ihr Haus «${name}» in unserer Sammlung

Guten Tag,

wir kuratieren mit Stille Orte (still-magazin.com) eine redaktionelle Sammlung besonderer Rückzugsorte im Alpenraum — kleine, ruhige Unterkünfte abseits des Mainstreams.

Ihr Haus «${name}» hat uns besonders angesprochen und wir würden Sie gerne in unsere Sammlung aufnehmen.

Damit wir Ihren Eintrag so ansprechend wie möglich gestalten können, würden wir uns über folgende Informationen freuen:

${missingList}

Der Eintrag ist für Sie selbstverständlich kostenlos. Wir verlinken direkt auf Ihre Website — es handelt sich um eine redaktionelle Empfehlung, kein Buchungsportal.

Herzliche Grüße
Das Stille-Orte-Team
still-magazin.com`
}
