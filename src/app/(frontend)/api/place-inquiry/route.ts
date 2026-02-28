import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { Resend } from 'resend'

function formatDateDE(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}

export async function POST(request: NextRequest) {
  let body: { name?: string; email?: string; message?: string; placeId?: string; checkIn?: string; checkOut?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Ungültige Anfrage' }, { status: 400 })
  }

  const { name, email, message, placeId, checkIn, checkOut } = body

  // Validation
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return NextResponse.json({ error: 'Name muss mindestens 2 Zeichen lang sein.' }, { status: 400 })
  }
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Bitte eine gültige E-Mail-Adresse angeben.' }, { status: 400 })
  }
  if (!message || typeof message !== 'string' || message.trim().length < 10) {
    return NextResponse.json({ error: 'Nachricht muss mindestens 10 Zeichen lang sein.' }, { status: 400 })
  }
  if (message.length > 5000) {
    return NextResponse.json({ error: 'Nachricht darf maximal 5000 Zeichen lang sein.' }, { status: 400 })
  }
  if (!placeId || typeof placeId !== 'string') {
    return NextResponse.json({ error: 'Ort fehlt.' }, { status: 400 })
  }

  // Date validation
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (checkIn && !isoDateRegex.test(checkIn)) {
    return NextResponse.json({ error: 'Ungültiges Anreisedatum.' }, { status: 400 })
  }
  if (checkOut && !isoDateRegex.test(checkOut)) {
    return NextResponse.json({ error: 'Ungültiges Abreisedatum.' }, { status: 400 })
  }
  if (checkIn && checkOut && checkIn >= checkOut) {
    return NextResponse.json({ error: 'Das Abreisedatum muss nach dem Anreisedatum liegen.' }, { status: 400 })
  }
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayISO = yesterday.toISOString().split('T')[0]
  if (checkIn && checkIn < yesterdayISO) {
    return NextResponse.json({ error: 'Das Anreisedatum darf nicht in der Vergangenheit liegen.' }, { status: 400 })
  }
  if (checkOut && checkOut < yesterdayISO) {
    return NextResponse.json({ error: 'Das Abreisedatum darf nicht in der Vergangenheit liegen.' }, { status: 400 })
  }

  const payload = await getPayload({ config: configPromise })

  // Load place to get contactEmail + title
  let placeTitle: string
  let contactEmail: string | null | undefined
  try {
    const place = await payload.findByID({ collection: 'places', id: placeId })
    placeTitle = place.title
    contactEmail = place.contactEmail
  } catch {
    return NextResponse.json({ error: 'Ort nicht gefunden.' }, { status: 404 })
  }

  // Send email via Resend
  let emailSent = false
  const resendApiKey = process.env.RESEND_API_KEY
  const teamEmail = process.env.CONTACT_EMAIL

  if (resendApiKey && (contactEmail || teamEmail)) {
    try {
      const resend = new Resend(resendApiKey)

      const to: string[] = []
      const bcc: string[] = []

      if (contactEmail) {
        to.push(contactEmail)
      }
      if (teamEmail) {
        if (to.length === 0) {
          to.push(teamEmail)
        } else {
          bcc.push(teamEmail)
        }
      }

      await resend.emails.send({
        from: 'Stille Orte <anfragen@still.place>',
        to,
        ...(bcc.length > 0 ? { bcc } : {}),
        replyTo: email.trim(),
        subject: `Anfrage für ${placeTitle}`,
        text: [
          `Neue Anfrage über Stille Orte`,
          ``,
          `Ort: ${placeTitle}`,
          `Name: ${name.trim()}`,
          `E-Mail: ${email.trim()}`,
          ...(checkIn ? [`Anreise: ${formatDateDE(checkIn)}`] : []),
          ...(checkOut ? [`Abreise: ${formatDateDE(checkOut)}`] : []),
          ``,
          `Nachricht:`,
          message.trim(),
        ].join('\n'),
      })
      emailSent = true
    } catch (err) {
      console.error('Resend email failed:', err)
    }
  }

  // Save to Payload
  try {
    await payload.create({
      collection: 'booking-inquiries',
      data: {
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        ...(checkIn ? { checkIn } : {}),
        ...(checkOut ? { checkOut } : {}),
        place: placeId,
        placeTitle,
        emailSent,
      },
    })
  } catch (err) {
    console.error('Failed to save booking inquiry:', err)
    return NextResponse.json({ error: 'Anfrage konnte nicht gespeichert werden.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
