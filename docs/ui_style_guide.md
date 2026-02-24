# UI Style Guide — Warm Editorial / Calm Minimal

This guide is the single source of truth for the UI look & feel.
Goal: warm editorial minimalism with strict grid alignment, warm stone typography, lots of whitespace, and restrained components.

---

## 0) Design Pillars (non-negotiable)

1. **Warm Neutrals, no stark white**
   - Default background is warm off-white (`stone-50`).
2. **Warm stone typography, not black**
   - Text uses warm stone/brown shades, never pure #000.
3. **Editorial scale**
   - Headlines are big and tight, body is calm and readable.
4. **Strict grid discipline**
   - Layout aligns to a 12-column grid; asymmetry is intentional.
5. **Minimal components**
   - Few patterns, reused everywhere. No "SaaS kit" look.

---

## 1) Design Tokens

### 1.1 Color Palette (base)
- Background: `#faf9f7` (`stone-50`, warm off-white)
- Surface: `#f3f1ed` (`stone-100`, cards/panels; slightly darker than bg)
- Text (headings): `#1a1714` (`stone-900`)
- Text (primary/body): `#4a443c` (`stone-700`)
- Text (muted): `#8d8475` (`stone-500`)
- Border / Grid lines: `#e8e4dd` (`stone-200`)
- Dark panel (nav overlay): `#2d2924` (`stone-800`)
- Accent (optional, minimal): `#8b7355` (warm brown, only when needed)
- Accent light: `#a3845a`
- Accent dark: `#705c42`

**Rules**
- Default page background must be `stone-50`.
- Avoid pure white `#fff` except for small elements (e.g., subtle highlights).
- Avoid saturated accent colors (no blues/neons).

### 1.2 CSS Variables (from `globals.css` `@theme` block)
```css
@theme {
  --font-serif: 'DM Serif Display', serif;
  --font-sans: 'DM Sans', sans-serif;

  --color-stone-50: #faf9f7;
  --color-stone-100: #f3f1ed;
  --color-stone-200: #e8e4dd;
  --color-stone-300: #d4cfc5;
  --color-stone-400: #b0a898;
  --color-stone-500: #8d8475;
  --color-stone-600: #6b6358;
  --color-stone-700: #4a443c;
  --color-stone-800: #2d2924;
  --color-stone-900: #1a1714;

  --color-accent: #8b7355;
  --color-accent-light: #a3845a;
  --color-accent-dark: #705c42;
}
```

---

## 2) Typography

### 2.1 Font

* Body: **DM Sans** (clean, quiet editorial sans-serif).
* Headings (H1–H4): **DM Serif Display** (elegant serif for editorial contrast).
* Avoid playful fonts, avoid techy grotesks with harsh contrast.

### 2.2 Type Scale (recommended)

* H1: `clamp(48px, 5vw, 88px)` / line-height `0.95`
* H2: `clamp(32px, 3.5vw, 64px)` / line-height `1.0`
* H3: `clamp(24px, 2.4vw, 40px)` / line-height `1.1`
* Body: `16–18px` / line-height `1.5–1.65`
* Small: `12–14px` / line-height `1.4`

### 2.3 Editorial micro-style

* Eyebrow / Label: uppercase + tracking

   * `12px uppercase tracking-[0.18em]`
* Body copy: avoid long paragraphs; prefer 2–4 lines per block.
* Max line length: ~65–75 characters for body.

---

## 3) Layout & Grid

### 3.1 Container

* Desktop max width: `1280–1440px`
* Horizontal padding: `px-6` (mobile), `px-10` (desktop)

### 3.2 Sections (whitespace)

* Standard section padding: `py-20` (desktop)
* Hero padding: `py-24` to `py-32`
* Never compress sections to "fit more content".

### 3.3 12-Column Grid (default)

* Use asymmetry:

   * Text: 5–6 columns (left)
   * Visual: 6–7 columns (right)
* Align edges to grid columns, not random margins.

### 3.4 Optional visible grid overlay (dev-only)

* Thin 1px lines using `border-stone-200` at low opacity.
* Toggle via query param (e.g. `?grid=1`) or dev flag.

---

## 4) Imagery

* Prefer large, calm photography.
* Avoid busy collage looks.
* Cropping: close-ups and hands/material textures work well.
* Images should feel "grounded" and not over-saturated.

---

## 5) Components (strict set)

### 5.1 Buttons (pill, outline-first)

**Primary**

* Pill
* Outline or subtle fill (never glossy)
* Height: 44–48px
* Text: small caps or semi-bold, restrained

**Tailwind example**

```tsx
<button className="h-12 rounded-full border border-stone-200 px-6 text-sm font-medium text-stone-700 hover:bg-stone-100">
  Learn more
</button>
```

### 5.2 Chips / Tags

* Pill, surface background, thin border, small label

```tsx
<span className="inline-flex items-center rounded-full border border-stone-200 bg-stone-100 px-3 py-1 text-xs uppercase tracking-[0.14em] text-stone-500">
  Farming
</span>
```

### 5.3 Cards

* No heavy shadows.
* Use border + subtle background difference.
* Radius: 16–24px (calm, modern).

```tsx
<div className="rounded-2xl border border-stone-200 bg-stone-100 p-6">
  ...
</div>
```

### 5.4 Navigation Overlay (signature pattern)

* Full-height left panel in dark stone (`stone-800`)
* Large, stacked nav items with generous spacing
* Background page can remain visible behind with dim/blur (subtle)

### 5.5 Section Header Pattern

* Eyebrow (optional)
* H2 large + tight
* Supporting text in muted stone, short lines

---

## 6) Interaction & Motion

* Minimal motion, slow and subtle.
* Use opacity/translate transitions (150–250ms).
* Avoid bouncy/overshoot animations.

---

## 7) Accessibility

* Contrast: warm stone on off-white bg must remain readable (test!).
* Buttons: 44px min height, clear focus states.
* Links: underline on hover/focus; avoid bright link colors.

---

## 8) Content & Tone (copy)

* Calm, confident, direct.
* Short sentences.
* Avoid hypey SaaS language ("revolutionary", "10x", "disrupt").

---

## 9) Acceptance Criteria (design QA)

A screen is "on-style" if:

* 80% of visible area is warm neutral (`stone-50` / `stone-100`).
* Headlines feel editorial (big, tight, lots of air).
* Alignment is strict (grid columns are obvious).
* No random colors, no default blue links, no heavy shadows.
* Buttons/chips/cards match the same pill/outline/border language.

---

## 10) Self-Review Checklist (must do after implementing a page)

* [ ] Background uses `stone-50` (not white).
* [ ] Text uses stone tokens (not black).
* [ ] H1/H2 are large enough; whitespace is generous.
* [ ] All edges align to the grid.
* [ ] Only approved components used.
* [ ] No new colors introduced.
