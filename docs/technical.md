# Technical Requirements

## 1. System Overview

**Project:** STILL — curated premium collection of quiet places in the Alpine region (DACH + Northern Italy).
**Mode:** Side project (low-ops), design-first, minimal feature set.

**Core user-facing experiences (V1):**

* Editorial discovery via **Collections** + **minimal filters** (no full search).
* Place detail pages with story, images, 3–5 “disconnect” attributes, price range, outbound link.
* Minimal newsletter signup (email capture).

**Core internal experiences (V1):**

* Content management via **Payload CMS** (admin UI + content workflow).
* Image upload/storage via managed object storage.

**Out of scope (explicit):**

* Partner tiers / entitlements / paid hotel portal (no “free vs paid listing” logic in V1).
* Full-text search or complex filter system.
* Complex backend services beyond Payload + Next.js app.

---

## 2. Relationship to ARCHITECTURE.md

* **ARCHITECTURE.md** is not created yet (chosen: “TECH first”).
* This document defines **binding** technical decisions (stack, NFRs, infra, security, observability, constraints).
* If/when **ARCHITECTURE.md** is introduced later:

    * It must reflect the same ownership boundaries and runtime flows described here.
    * Any change to stack, hosting, data ownership, auth, or environment strategy requires updating both docs (see Doc-Sync Rules).

---

## 3. Non-Functional Requirements (NFRs)

### Performance

* Static-first approach: **SSG + ISR** for public pages.
* Target: fast LCP via optimized images and minimal client JS.
* Caching: leverage platform CDN + ISR revalidation.

### Reliability

* Low operational overhead, managed services preferred.
* Graceful degradation: site remains usable even if newsletter provider is down (signup queue/failure message).

### Security & Privacy

* Minimal PII collection (newsletter + optional contact); GDPR-friendly defaults.
* Prefer cookie-less analytics.

### Maintainability

* Small codebase; minimize custom infrastructure.
* Prefer built-in features of Next.js + Payload over bespoke systems.

### SEO

* Clean URL structure; canonical tags; sitemap generation; metadata per page.
* Editorial pages (Collections + Region landings) must be indexable and fast.

---

## 4. Tech Stack (verbindlich)

### Frontend

* **Next.js** (App Router recommended)
* TypeScript
* Tailwind CSS
* next/image for image optimization

### CMS / Backend

* **Payload CMS** as primary content source of truth

    * Admin UI for Places, Collections, Regions/Tags
    * Draft/publish workflow (Payload native)
    * Media management (uploads)

### Data

* **Payload-managed database** (implementation depends on hosting pattern; use Payload’s supported DB adapter)
* Migrations: Payload migrations + controlled schema changes

### Email / Newsletter

* Minimal newsletter signup flow
* Provider: **TBD** (but “minimal” required; can start with a simple provider integration)

### Hosting / Deployment

* **Vercel** for Next.js
* Payload hosting:

    * Recommended: Payload co-hosted with Next.js if feasible (single deployment pattern), otherwise separate managed runtime.

### Analytics / Observability

* Analytics: **Plausible** (cookie-less preferred)
* Error tracking: **Vercel logs only** (no Sentry in V1)

---

## 5. Environments & Deployment

### Environments

* **Production only** (chosen)

    * No dedicated staging environment.
    * Optional: local dev environment.

### Deployment

* CI/CD via Vercel.
* Payload deployment:

    * If co-hosted: deploy together with Next.js app.
    * If separate: deploy Payload to a managed runtime (TBD) and connect via secure API.

### Configuration

* Environment variables managed via Vercel (and Payload host if separate).
* Secrets stored only in platform secret managers (no repo secrets).

---

## 6. Data & Migrations

### Source of Truth

* **Payload CMS** is the system of record for all editorial content:

    * Places
    * Collections
    * Regions
    * Tags/Attributes
    * Media assets

### Required content entities (initial)

* `Place`

    * `title`, `slug`
    * `region` (relation)
    * `shortStory` (rich text or markdown)
    * `whyDisconnect` (structured bullets)
    * `attributes` (3–5 tags)
    * `priceRange` (enum or min/max)
    * `heroImage`, `gallery`
    * `outboundUrl` (official hotel/booking link)
    * `status` (draft/published)
* `Collection`

    * `title`, `slug`
    * `intro` (short)
    * `heroImage`
    * `places` (curated ordering)
* `Region`

    * `title`, `slug`
    * `intro`
    * optional: `bounds` / `mapMeta` (only if later needed)

### Migrations / Schema evolution

* Use Payload migration tooling.
* Backward-compatible changes preferred (additive fields) to avoid broken builds.
* Content revisions: **Payload revisions enabled**.

### Media Storage

* Images uploaded and stored in managed object storage (**S3-compatible**), served via CDN.
* No hotlink-only strategy in V1.

---

## 7. API & Contracts

### API Surface

* **Internal API routes only** (Next.js route handlers) for:

    * Newsletter signup
    * Contact form (if enabled)

### CMS Access Pattern

* Public site reads content from Payload:

    * Prefer server-side fetching at build time / ISR revalidation.
    * Avoid exposing Payload admin endpoints publicly.
* Contracts:

    * Define stable DTO shape for `Place` and `Collection` used by frontend.
    * All rendering should tolerate missing optional fields.

### URL Strategy (SEO)

* Places: `/orte/{slug}`
* Collections: `/sammlungen/{slug}`
* Regions: `/region/{slug}`

### Sitemap

* Auto-generate sitemap.xml from Payload content (published only).

---

## 8. Security & Permissions

### Authentication

* Payload Admin:

    * Email/password (or SSO later; not required in V1)
    * Limit admin access to trusted users only.

### Authorization

* Simple role model (V1):

    * `admin` only (single role) or Payload default admin users.

### Public Access

* Public pages read only **published** content.
* Draft preview:

    * Payload preview mode enabled for editorial review (chosen: CMS preview mode).

### GDPR / Privacy

* Collect PII for:

    * Newsletter signup (email)
    * Contact form (name/email/message) if enabled
* Data retention policy (V1):

    * Newsletter: retained until unsubscribe
    * Contact inquiries: retained for up to 12 months (TBD) then deleted/manual purge

### Consent / Cookies

* Use Plausible (cookie-less).
* Provide a simple privacy notice (not a full CMP) if no additional trackers are used.

---

## 9. Integrations

### Required (V1)

* **Plausible** analytics
* Newsletter provider (TBD; minimal integration)
* Object storage for media (S3-compatible)

### Optional (later)

* Map provider (Mapbox) if map UI becomes necessary (not required in V1 based on minimal product direction)

---

## 10. Observability

### Logging

* Rely on **Vercel logs** for:

    * Request errors
    * API route failures
    * Build/deploy issues

### Metrics

* Plausible for traffic analytics.

### Alerting

* None required in V1 (side project constraint).
* Manual monitoring via Vercel dashboard.

---

## 11. Testing & Quality Gates

### Minimum gates (V1)

* ESLint
* TypeScript typecheck
* Build must pass on Vercel

### Testing strategy

* No mandatory unit/e2e tests in V1 (chosen: minimal).
* Recommendation (non-binding): add a single smoke test later for critical routes.

### Content QA

* Use **Payload preview mode** for editorial review before publishing.

---

## 12. Constraints

* **Low operations**: managed services only, minimal maintenance.
* **Budget**: target **< €50/month** initially.
* **Single environment**: production only, avoid staging complexity.
* **No entitlements**: no paid-vs-free listing logic in V1.
* **Minimal data capture**: only what is needed for newsletter/contact.

---

## 13. Doc-Sync Rules

1. **Source of truth**

    * TECH decisions live here until ARCHITECTURE.md exists.
    * When ARCHITECTURE.md is added, it must not contradict this document.

2. **Change control**

    * Any changes affecting: stack, hosting, data ownership, auth/permissions, environments, or caching strategy require updating:

        * TECHNICAL_REQUIREMENTS.md
        * ARCHITECTURE.md (once it exists)

3. **Decision logging**

    * Each major technical decision should be recorded with:

        * Date
        * Decision
        * Rationale
        * Alternatives considered

4. **Minimalism principle**

    * Prefer removing complexity over adding features.
    * If a feature introduces persistent ops burden, it must be justified with a clear user/business benefit aligned to “side project” constraint.

---
