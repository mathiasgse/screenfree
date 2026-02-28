Hier ist ein **konkreter Plan für deinen Coding Agent** (phasenweise, mit Tasks, Deliverables, Acceptance Criteria), abgestimmt auf:

* Regionen: **AT/DE/CH + Norditalien**
* Qualitätsschwerpunkt: **offgrid / alleinlage / ruhig**
* Extra Signal: **Bewertungen**, wenn vorhanden
* UI: **Dashboard im Payload Admin**, nur für Admin-User
* Daten: **in Payload gespeichert**, aber strikt getrennt von Public Site

---

# Coding-Agent Plan: STILL Discovery Engine

## Phase 0 — Repo & Baseline (0.5–1 Tag)

**Ziel:** Grundgerüst + klare Trennung Public vs Admin/Discovery.

### Tasks

1. **Create module boundary**

* `/apps/web` (STILL Public Website + Payload Admin)
* `/apps/worker` (Discovery Worker, separater Service)
* `/packages/shared` (types, scoring rubric, utilities)

2. **Env setup**

* `.env.example` für web + worker
* Secrets: Payload URL, Payload API key, SERP provider key, OpenAI key (falls genutzt)

### Deliverables

* Monorepo structure (pnpm) oder 2 Packages (falls ihr so arbeitet)
* Basic README: local run instructions

### Acceptance Criteria

* `web` startet, Payload Admin erreichbar
* `worker` kann lokal laufen (dry-run)

---

## Phase 1 — Payload Datenmodell & Access Control (1 Tag)

**Ziel:** Saubere Trennung “Candidates” vs “Places” + Admin-only Zugriff.

### Tasks

1. **Payload Collections anlegen**

* `candidate_places` (privat)
* `discovery_runs` (privat)
* (existiert schon) `places`, `collections`, `regions`, `tags`

2. **Access Control**

* `candidate_places`: read/create/update/delete nur Admin
* `discovery_runs`: nur Admin
* Ensure public API cannot fetch candidates

3. **Indexes / uniqueness**

* `dedupeKey` unique index
* optional: `websiteDomain` index, `coordinates` index

### Deliverables

* Payload schema code + migrations
* Admin sidebar grouping “Discovery”

### Acceptance Criteria

* Admin kann Candidates sehen
* Public Frontend kann Candidates nicht lesen (403 / not exposed)
* Unique dedupeKey verhindert Dubletten

---

## Phase 2 — Discovery Inbox im Payload Admin (1–2 Tage)

**Ziel:** Integriertes Dashboard: Review Queue + Actions.

### Tasks

1. **Custom Admin View: “Discovery Inbox”**

* Tabelle/Listenansicht: thumbnail, name, region_guess, score, top reasons, source, status
* Filter: status=new/maybe, minScore, region, source, hasReviews, riskFlags
* Sort: score desc, discoveredAt desc

2. **Candidate Detail Panel**

* Evidence: links (website, maps), snippet, images, signals/risk flags, rating info
* Actions:

    * ✅ Accept → creates Draft Place
    * ❌ Reject (+ reason)
    * ⭐ Maybe

3. **Accept Flow**

* On accept:

    * create `places` draft with mapped fields
    * set `candidate_places.status=accepted`
    * link candidate → place

### Deliverables

* Admin UI integrated into Payload (custom route/component)
* Action endpoints (Payload custom endpoints / hooks)

### Acceptance Criteria

* Review 50 candidates in <10 min möglich
* Accept erzeugt Draft Place korrekt
* Reject/Maybe persistiert

---

## Phase 3 — Worker v1: Candidate Generation (2–4 Tage)

**Ziel:** Automatisch Kandidaten finden + score + in Payload upserten.

### Preferred “Low-risk” Source Strategy

Weil direkte Google Maps Scrapes oft blocken:
**SERP Provider** (Google Search results) + optional “Places”-enrichment über Provider.

### Tasks

1. **Run Presets**

* Regionenliste (AT/DE/CH + Norditalien) als JSON:

    * microregions + keywords pack
* Query templates:

    * `alleinlage hütte {region}`
    * `chalet alleinlage {region}`
    * `berghütte abgelegen {region}`
    * `eco lodge abgelegen {region}`
    * `retreat abgelegen {region}`
    * `adults only ruhig {region}` (nur als Zusatzsignal)

2. **Fetch SERP results**

* Collect candidate URLs + titles + snippets
* Dedupe by domain/url early

3. **Website Enrichment**

* Fetch website homepage + 1–2 key pages (About / Rooms / Location)
* Extract:

    * Offgrid cues: “alleinlage”, “abgelegen”, “nur zu fuß”, “kein empfang”, “funkloch”, “keine straße”, “wald”, “hütte”
    * Resort penalties: “familienhotel”, “animation”, “après ski”, “rutschen”, “kids club”
    * Rooms size hints (“Zimmer”, “Suiten”, “Chalets”, numeric patterns)
* Extract coordinates if present (structured data / embedded maps) — best-effort

4. **Rating signal (wenn vorhanden)**

* If SERP provides rating/Reviews snippet → store `ratingValue` + `reviewCount`
* If not available → null (don’t scrape platforms aggressively)

5. **AI/Heuristic Scoring**

* Hybrid:

    * deterministic scoring first (keyword + penalties + heuristics)
    * optional AI pass only for top 30% to save cost
* Output:

    * qualityScore 0–100
    * reasons[] (max 5)
    * riskFlags[] (max 5)
    * confidence

6. **Upsert into Payload**

* Create `discovery_runs` record with stats
* Upsert `candidate_places` by dedupeKey
* Set status=new

### Deliverables

* `worker` CLI:

    * `discover run --preset "south-tyrol" --limit 100`
    * `discover run --country AT --limit 200`
* Logs + run stats in Payload

### Acceptance Criteria

* One run produces 50–200 candidates
* <30% obvious junk in “new” queue (target; refine iteratively)
* No duplicates beyond 5%

---

## Phase 4 — Quality Hardening (2–5 Tage, iterativ)

**Ziel:** “Wirklich hochwertig” durch strenge Filter + Calibration.

### Tasks

1. **Dedupe improvements**

* Fuzzy name matching + domain
* coordinate proximity if available

2. **Quality Gates**

* Auto-reject if:

    * resort keywords strong
    * chain indicators
    * reviewCount very high + resort pattern (optional heuristic)
* Auto-promote if:

    * alone/offgrid cues strong + small size hint

3. **Calibration loop**

* In Inbox: add “Why accepted?” quick label
* Export accepted/rejected dataset
* Adjust weights / AI prompt using your decisions

4. **Re-check & freshness**

* Re-run enrichment for “maybe” after 30 days
* Avoid re-crawling too often (rate limits)

### Deliverables

* Scoring rubric file (`/packages/shared/scoring-rubric.ts`)
* Calibration doc (how to tweak weights)

### Acceptance Criteria

* “High quality” bucket (>85) contains mostly real matches
* Review time per candidate < 20–30 seconds

---

## Phase 5 — Payload Import Polish (1–2 Tage)

**Ziel:** Accept → Draft Place ist fast fertig.

### Tasks

* Auto-generate:

    * `whyDisconnect` bullets from reasons (clean editorial style)
    * suggested tags (Wald, Berge, Funkloch, Alleinlage)
    * region mapping to your `regions` collection
* Optional: image download to Payload media (only if legally safe and from hotel website)
* Add “needs_manual_check” flag

### Deliverables

* Better mapping + editorial placeholders

### Acceptance Criteria

* Accepted draft needs only minimal polishing (5–10 min max)

---

# Definition of “hochwertig” (Scoring spec für Agent)

**Offgrid/Alleinlage Score Drivers**

* “alleinlage”, “abgelegen”, “nur zu fuß”, “kein empfang/funkloch”, “waldhütte”, “berghütte”, “private cabin”
* “keine durchgangsstraße”, “am ende des tales”
* small scale cues: “wenige zimmer”, “familiengeführt”, “chalet(s)”

**Bewertungs-Signal**

* if present:

    * reviewCount >= 50 and ratingValue >= 4.6 → bonus
    * reviewCount very high + resort cues → penalty (resort likelihood)

**Hard penalties**

* “resort”, “familienhotel”, “kids club”, “animation”, “après ski”, “wasserpark”, “rutschen”

---

# Agent Operating Instructions (für deinen Coding Agent)

Gib deinem Agent diese Regeln mit:

1. **Never expose candidate_places publicly**

* Double-check all routes/queries.

2. **Deterministic-first**

* Scraping/enrichment deterministic; AI only for summarizing/scoring top candidates.

3. **Idempotent**

* Worker runs can be re-run safely (upsert by dedupeKey).

4. **Evidence-first UI**

* Show why candidate scored high, with source links.

5. **Side-project constraint**

* Minimal infra, minimal dependencies, simple run presets.
