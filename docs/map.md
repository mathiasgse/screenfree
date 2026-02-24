Yes — wenn du **Option 2** willst, dann gehört die Map **fix in V1**. Aber: **nicht als “Such-Map”**, sondern als **editoriale Karte** (sonst killt’s den Premium-Vibe).

Hier ist die saubere V1-Definition, die du 1:1 ins PRD übernehmen kannst.

---

# V1: Map ist drin (Editoriale Map)

## Ziel der Map

Nicht “Hotel finden”, sondern:

> **Orte zum Verschwinden räumlich spüren.**

Map ist ein **Mood-Entry**, kein Utility-Feature.

---

# IA / Navigation

Top-Navigation:

* **Entdecken**
* **Karte**
* **Sammlungen**
* **Über**

Die Map ist eine **eigene Seite** (keine Toggle-Ansicht), damit sie bewusst wirkt.

---

# Map UX Spezifikation

## Map Page Layout

* Vollflächige Map
* Links oben: kleine, ruhige Filterleiste
* Rechts unten: dezenter Counter (z. B. “48 Orte”)
* Bottom Sheet / Side Panel (je nach Desktop/Mobile) für Ort-Card

## Interaktion

* Pins sind **groß, minimal, ohne Text**
* Hover (Desktop): Name + Region (mini tooltip)
* Click: **Place Preview Card** (Bild + 2 Zeilen Text + “Öffnen”)
* Click auf “Öffnen”: führt zur Place-Detailseite

## Kein Clutter

* Keine Kategorien-Wolke
* Keine Preisfilter in V1 (optional später)
* Keine “in der Nähe” Logik
* Keine Route/Navigation

---

# Map Filter (V1 minimal, aber nützlich)

**Pflichtfilter:**

* Region (DE/AT/CH / Norditalien bzw. Mikroregionen)
* 4–6 Tags maximal:

    * **Berge**
    * **Wald**
    * **See**
    * **Winter**
    * **Funkloch**
    * **Adults only** (optional)

**Optional (wenn du willst, aber vorsichtig):**

* Preisrange (nur 3 Stufen)

---

# Place Data Requirements für Map

Für jeden Place muss es geben:

* `coordinates` (lat/lng) **(pflicht)**
* `region`
* `tags`
* `heroImage` (für Preview Card)
* `title`, `slug`

Wenn Koordinaten fehlen → Place wird nicht auf Map angezeigt (oder “TBD”).

---

# Map Visual Style (Brand-kompatibel)

* Entsättigte Basemap (kein bunter Google-Look)
* Ruhige Pins (einfarbig)
* Wenig Labels
* Keine POI-Overlays (Restaurants etc.)

---

# Mobile Verhalten

* Map fullscreen
* Tap Pin → Bottom Sheet mit Preview
* Sheet swipebar, 1–2 weitere Empfehlungen darunter (optional)
* “Öffnen” führt zur Detailseite

---

# Tech (pragmatisch)

**Mapbox GL JS** ist am passendsten für Styling + Premium Look.

* Minimaler Setup
* Custom map style
* Client-side rendering der Pins

Alternative (wenn super-billig):

* Leaflet + OpenStreetMap + custom tiles
  (aber wirkt oft weniger premium)

---

# Performance/SEO Hinweise

* Map Page ist nicht SEO-kritisch, aber:

    * Place/Collection Pages sind SSG/ISR
    * Map lädt client-side
* Pins als JSON payload (nur published places)
* Cluster optional (nur wenn >150 Pins), sonst weglassen

---

# PRD-Änderung (kurz)

**V1 Scope** ergänzt um:

* Seite “Karte”
* `coordinates` Pflichtfeld im Place Schema
* minimaler Tag-Filter auf Map
