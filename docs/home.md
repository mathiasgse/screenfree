Alles klar — dann schreibe ich dir jetzt ein **echtes Coding-Agent PRD**.
Kein Marketingtext.
Sondern: **umsetzbare Spezifikation**.

Strukturiert so, dass dein Agent (OpenClaw/Claude/Cursor/etc.) direkt bauen kann.

---

# 📄 PRODUCT REQUIREMENTS DOCUMENT

# STILL — Landingpage

### Version: Build PRD for Coding Agent

---

# 1. Product Overview

## Goal

Build a minimal, premium landingpage for STILL — a curated platform for quiet places in the Alpine region.

The landingpage must feel like:

* editorial
* calm
* premium
* minimal

NOT:

* booking platform
* travel comparison
* SEO spam page

Primary purpose:

* present curated places
* showcase collections
* establish brand mood
* route user into places

---

# 2. Core UX Principles

1. Extremely clean layout
2. Large imagery
3. Minimal text
4. Smooth scrolling
5. No clutter
6. Fast loading
7. Mobile-first
8. No aggressive CTAs

---

# 3. Page Structure (strict)

Landingpage sections in exact order:

1. Hero
2. Intro
3. Featured Places
4. Collections
5. Atmosphere section
6. Optional newsletter
7. Footer

Each section must be modular React component.

---

# 4. Tech Stack (binding)

Frontend:

* Next.js (App Router)
* TypeScript
* Tailwind

CMS:

* PayloadCMS (places + collections)

Image:

* next/image only
* optimized loading

Deployment:

* Vercel

---

# 5. Data Requirements

## From CMS: Places

Fields required:

* id
* name
* slug
* heroImage
* region
* shortDescription (optional)
* featured (boolean)

## From CMS: Collections

Fields:

* id
* title
* slug
* heroImage
* description
* places[]

Landingpage fetches:

* featured places only
* all collections (max 6)

---

# 6. Layout Specification

## 6.1 HERO SECTION

### Requirements

* Full viewport height
* Background image (static for now)
* Centered text block
* Overlay gradient subtle

### Content

Headline:
"Orte, an denen dein Kopf leise wird."

Subline optional:
"Eine kuratierte Sammlung stiller Orte im Alpenraum."

### Behavior

* fade-in on load
* scroll indicator optional
* no buttons required

### Component

`<HeroSection />`

---

## 6.2 INTRO SECTION

Minimal editorial text.

Max width:
600px centered.

Text:
3–4 lines max.

Component:
`<IntroSection />`

---

## 6.3 FEATURED PLACES

## Data source:

PayloadCMS → places where `featured=true`

Max display:
6

### Card layout

Each card:

* image
* name
* region
* link to /orte/[slug]

No:

* price
* rating
* buttons
* badges

### Grid

Desktop:
3 columns

Tablet:
2 columns

Mobile:
1 column

Image ratio:
3:2

Hover:

* slight zoom
* fade overlay

Component:
`<FeaturedPlaces />`

---

## 6.4 COLLECTIONS SECTION

## Data:

PayloadCMS collections

Max:
6

Each item:

* image
* title
* optional short description

Link:
`/sammlungen/[slug]`

Layout:
Editorial grid

Desktop:
3 columns

Mobile:
1 column

Component:
`<CollectionsSection />`

---

## 6.5 ATMOSPHERE SECTION

Purpose:
Brand mood.

Layout:

* full width image
* centered text overlay

Text example:
"Weniger Lärm. Mehr Landschaft."

Component:
`<AtmosphereSection />`

---


# 8. Performance Requirements

Lighthouse targets:

* Performance >90
* SEO >90
* Best Practices >95

Image:

* lazy load
* next/image responsive sizes
* WebP/AVIF

---

# 9. SEO Basics

Each page:

* meta title
* description
* og:image
* canonical

Landingpage title:
"STILL — ruhige Orte im Alpenraum"

---

# 10. Accessibility

* semantic HTML
* alt tags for images
* contrast AA
* keyboard navigation

---

# 11. Folder Structure

```
app/
 ├ page.tsx
 ├ layout.tsx

components/
 ├ HeroSection.tsx
 ├ IntroSection.tsx
 ├ FeaturedPlaces.tsx
 ├ CollectionsSection.tsx
 ├ AtmosphereSection.tsx
 └ Footer.tsx

```

---

# 12. Future-ready (not in V1)

Do NOT implement yet:

* login
* payments
* filters
* search
* maps
* reviews

---

# 13. Definition of Done

Landingpage is complete when:

* loads <2s
* mobile perfect
* CMS data connected
* feels premium
* minimal & calm
* deployable on Vercel

---

# 14. Build Priority

1. Layout skeleton
2. Hero
3. CMS fetch
4. Featured places
5. Collections
6. Styling polish
7. Mobile optimization
8. SEO

---

# 15. Instruction for Coding Agent

Build minimal but high-quality.

Avoid:

* overengineering
* unnecessary libraries
* complex state
* animations overload

Focus:

> premium simplicity.
