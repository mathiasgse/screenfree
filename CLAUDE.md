# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**STILL** is a curated editorial collection of quiet, disconnection-focused places in the Alpine region (DACH + Northern Italy). It is intentionally minimal — not a booking portal, hotel comparison, or wellness platform. Think digital magazine (Kinfolk/Monocle style) for 30–80 hand-picked boutique accommodations.

Product requirements: `docs/prd.md` (German). Technical requirements: `docs/technical.md`.

## Tech Stack

- **Next.js** (App Router) with TypeScript
- **Tailwind CSS** for styling
- **Payload CMS** as content source of truth (admin UI, draft/publish workflow, media management)
- **Vercel** for hosting/deployment (CI/CD via Vercel, production-only — no staging)
- **Plausible** for cookie-less analytics
- S3-compatible object storage for media
- Newsletter provider TBD

Payload CMS is co-hosted with Next.js (single deployment).

**Infrastructure:**
- **Database**: MongoDB Atlas via `@payloadcms/db-mongodb`
- **Media Storage**: Vercel Blob via `@payloadcms/storage-vercel-blob`
- **Package Manager**: pnpm

## Project Structure

```
src/
  app/
    (frontend)/     — Public pages (layout, homepage, orte, sammlungen, region, sitemap)
    (payload)/      — Payload admin UI + API routes
  collections/      — Payload collection configs (Places, StillCollections, Regions, Media, Users)
  payload.config.ts — Central Payload configuration
  payload-types.ts  — Auto-generated types (do not edit)
docs/               — PRD and technical requirements
```

## Commands

- `pnpm dev` — Start dev server (Next.js + Payload admin at `/admin`)
- `pnpm build` — Production build
- `pnpm lint` — ESLint
- `pnpm generate:types` — Regenerate Payload types (`src/payload-types.ts`)
- `pnpm generate:importmap` — Regenerate Payload import map

## Build & Quality Gates

- ESLint + TypeScript typecheck must pass
- Build must pass on Vercel
- No mandatory unit/e2e tests in V1

## Content Model (Payload CMS)

Three core collections:

- **Place** — `title`, `slug`, `region` (relation), `shortStory` (rich text), `whyDisconnect` (structured bullets), `attributes` (3–5 tags), `priceRange`, `heroImage`, `gallery`, `outboundUrl`, `status` (draft/published)
- **Collection** — `title`, `slug`, `intro`, `heroImage`, `places` (curated ordered relation)
- **Region** — `title`, `slug`, `intro`

All editorial content is managed exclusively through Payload. Frontend reads via server-side fetching (SSG + ISR).

## URL Structure

- Places: `/orte/{slug}`
- Collections: `/sammlungen/{slug}`
- Regions: `/region/{slug}`
- Auto-generated `sitemap.xml` from published Payload content

## Architecture Principles

- **Static-first**: SSG + ISR for all public pages. Minimal client JS.
- **Editorial, not transactional**: No user accounts, no booking engine, no payments in V1. Visitors browse and click outbound links to hotel websites.
- **Design-first**: Large images, whitespace, calm colors, magazine aesthetic. Every feature decision: "Does this feel calm, premium, and reduced? If not, don't build it."
- **Low-ops side project**: Managed services only, budget < €50/month, minimize custom infrastructure. Prefer built-in Next.js + Payload features over bespoke systems.

## API Surface

- Internal Next.js route handlers only (newsletter signup, optional contact form)
- Payload admin endpoints must not be exposed publicly
- Frontend uses stable DTO shapes for Place and Collection; rendering must tolerate missing optional fields

## Key Constraints

- V1 scope: Homepage, Place detail pages, Collections, CMS, image management, newsletter signup, SEO basics
- No user accounts, ratings, complex search, payments, or partner logins in V1
- No partner tier/entitlement logic
- Austrian/DACH market; GDPR-friendly defaults, minimal PII collection

## UI / Design System Contract (Warm Editorial / Calm Minimal)

**Source of truth:** `docs/ui_style_guide.md`
When building UI, you MUST follow the tokens, components, and acceptance criteria from the guide.

### Non-negotiables
- Default page background is warm off-white (`stone-50`). Avoid pure white.
- Primary text uses warm stone tones (`stone-700` body, `stone-900` headings). Avoid pure black.
- Accent color: `--color-accent` (#8b7355). Use sparingly for interactive elements and hover states.
- Use strict 12-col grid alignment. Asymmetric layouts are intentional.
- Minimal component set: outline buttons, pill chips, border-first cards.
- No glossy shadows, no neon accents, no "default SaaS" look.

### Workflow (always)
1. **Plan layout first**: define the grid split (e.g. text 5 cols, image 7 cols).
2. **Apply tokens**: use Tailwind `stone-*` and `accent` classes only (no ad-hoc hex values).
3. **Build with approved components**: reuse existing Button/Chip/Card patterns.
4. **Self-review (mandatory)**: after each screen, run the checklist below.

### Forbidden
- Introducing new colors outside the palette without updating `docs/ui_style_guide.md`.
- Using default blue links / default shadcn theme styles.
- Heavy drop shadows, gradients, glassmorphism, neon accents.
- Centered "startup hero" layouts unless explicitly requested.

### Self-review checklist (must include in output)
- [ ] Background uses `stone-50` (not pure white).
- [ ] Text uses stone tokens (not pure black).
- [ ] H1/H2 are editorial scale (big & tight); whitespace is generous.
- [ ] Alignment matches grid columns (no random offsets).
- [ ] Buttons/chips/cards follow outline/border language.
- [ ] No new colors or shadows were introduced.

### If the requested UI conflicts with the guide
- Default to the guide.
- If truly impossible, propose the smallest guide-compliant adaptation and explain briefly.
