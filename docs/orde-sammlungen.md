# 📄 PRD — STILL Plattform Core

## Orte & Sammlungen (für Coding Agent)

### Version 1.0 — Production Build Spec

Dies ist ein **reines Build-PRD für Coding Agenten**.
Keine Marketingtexte. Nur umsetzbare Spezifikation.

Stack ist bereits definiert:
Next.js + PayloadCMS + Tailwind + Vercel.

---

# 1. 🎯 Ziel dieses PRDs

Implementiere die Kernplattform:

* Orte Index
* Ort Detailseite
* Sammlungen Index
* Sammlungs Detailseite
* Payload Datenstruktur
* Navigation zwischen allem

Ziel:

> Plattform wirkt wie ruhiges Premium-Editorial, nicht wie Booking.

---

# 2. Routing-Struktur (fix)

```id="routes"
/
→ Landingpage

/orte
→ Orte Index

/orte/[slug]
→ Ort Detailseite

/sammlungen
→ Collections Index

/sammlungen/[slug]
→ Collection Detail
```

Optional später:

```
/region/[slug]
```

---

# 3. Payload CMS Schema (verbindlich)

## Collection: Places

```id="payload_places"
name: text (required)
slug: text (unique)
region: text (required)
country: select (AT, DE, IT, CH)
heroImage: upload (required)
gallery: upload (multiple)
shortDescription: textarea
whyQuiet: textarea
priceRange: select (€ €€ €€€)
tags: array (text)
featured: boolean
collections: relationship → collections
status: draft/published
```

---

## Collection: Collections

```id="payload_collections"
title: text
slug: text
heroImage: upload
description: textarea
places: relationship → places (many)
featured: boolean
```

---

# 4. Orte Index Page `/orte`

## Ziel

Editorial Übersicht aller Orte.

NICHT:

* Filter-heavy
* Map-first
* Booking-like

## Data

Fetch:

* all places where status=published

Sort:

* featured first
* then manual order later
* fallback alphabetical

## Layout

### Desktop

3-column grid

### Tablet

2 columns

### Mobile

1 column

## Card Design

Each card contains:

* hero image
* name
* region
* no buttons
* no price mandatory
* click → detail

Hover:

* slight zoom
* subtle overlay fade

## Component

`<PlaceCard />`

---

# 5. Ort Detailseite `/orte/[slug]`

## Ziel

Ruhige Editorial Detailseite.

## Fetch

By slug.

404 if not found.

---

## Layout Reihenfolge

1. Hero image
2. Title + region
3. Short intro
4. Why quiet
5. Gallery
6. Related collections
7. Back link

---

## 5.1 Hero Section

Fullscreen width image.

Height:
70vh desktop
50vh mobile

Overlay gradient subtle.

---

## 5.2 Title Block

Contains:

* Name
* Region
* Country optional

Max width:
720px centered.

---

## 5.3 Short Description

From CMS:
`shortDescription`

Max:
500 chars recommended.

Typography:
serif headline feel.

---

## 5.4 Why Quiet Section

CMS field:
`whyQuiet`

Render as:
paragraph or bullet block.

Optional title:
"Warum hier abschalten"

---

## 5.5 Image Gallery

Source:
gallery[]

Layout:

* editorial stacked
* or 2-column masonry

No lightbox required V1.

Lazy load images.

---

## 5.6 Tags (optional small row)

Example:
Berge · Sauna · Alleinlage

Muted style.

---

## 5.7 Related Collections

If place belongs to collections:
show max 3.

Card small.

---

## 5.8 Navigation

Bottom:
"Zurück zu allen Orten"

---

# 6. Sammlungen Index `/sammlungen`

## Ziel

Editorial Einstieg in Themen.

Fetch:
all collections where featured=true
fallback all

## Layout

Grid:
2–3 columns desktop
1 mobile

Each:

* hero image
* title
* short description

Click:
→ collection detail

---

# 7. Collection Detail `/sammlungen/[slug]`

## Fetch

Collection by slug

* all related places

404 if not found.

---

## Layout Reihenfolge

1. Hero image
2. Title + intro
3. Places grid

---

## 7.1 Hero

Height:
60vh

Text overlay bottom left.

---

## 7.2 Intro Text

From CMS description.

Max width:
680px.

---

## 7.3 Places Grid

Use same PlaceCard component.

Max:
unlimited.

Sort:
manual order from CMS.

---

# 8. Components Liste

```id="components"
PlaceCard.tsx
PlacesGrid.tsx
CollectionCard.tsx
CollectionsGrid.tsx
Gallery.tsx
HeroImage.tsx
Section.tsx
Container.tsx
```

---


# 10. Performance

Must:

* next/image
* responsive sizes
* lazy loading
* static generation (ISR ok)

Targets:
Lighthouse >90.

---

# 11. SEO

Each place page:

* title = place name
* meta description from shortDescription
* og:image = hero

Each collection:

* title + description
* og:image

Generate:

* sitemap
* robots

---

# 12. Error States

If no places:
show empty calm state:
"Neue Orte folgen."

If image missing:
fallback neutral image.

404 page:
minimal.

---

# 13. Definition of Done

Platform core done when:

* Orte index works
* Ort pages render from CMS
* Collections work
* mobile perfect
* loads fast
* design feels premium
* deployed on Vercel

---

# 14. Important Implementation Notes

DO:

* keep components small
* use server components where possible
* minimal JS
* static-first

DO NOT:

* add heavy filters
* add maps
* add accounts
* add reviews
* overanimate

---


