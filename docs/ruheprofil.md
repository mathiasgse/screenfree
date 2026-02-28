# 📄 PRD

# STILL Ruheprofil & kuratierte Einschätzung

## Ziel

Ein redaktionelles, kuratiertes Ruheprofil pro Unterkunft, das:

* schnelle Entscheidungsfindung ermöglicht
* STILL als Kurator positioniert
* kein Review-System ist
* sich in bestehende Kategorien + „für wen geeignet“ integriert
* leicht pflegbar ist

Nicht Ziel:

* Sternebewertungen
* User Reviews
* algorithmische Scores

---

# 1. 🧠 Konzept

Jede Unterkunft erhält ein:

> STILL Ruheprofil

bestehend aus:

1. Ruhe-Level (Signature Element)
2. Warum hier abschalten (kuratierte Gründe)
3. Strukturierte Ruhefaktoren
4. Perfekt für (bestehende Tags nutzen)

Alles redaktionell gepflegt.

---

# 2. 🧱 Datenmodell (Payload)

Erweiterung der bestehenden `places` Collection.

## Neue Felder

### 2.1 Ruhe-Level

```ts
ruheLevel: {
  type: 'select',
  options: [
    { label: 'Ruhig', value: 'ruhig' },
    { label: 'Sehr ruhig', value: 'sehr_ruhig' },
    { label: 'Absolute Stille', value: 'absolute_stille' }
  ],
  required: false
}
```

Keine Zahlen.
Keine Sterne.

---

### 2.2 Warum hier abschalten (Hauptcontent)

```ts
whyQuiet: {
  type: 'array',
  label: 'Warum hier abschalten',
  fields: [
    {
      name: 'point',
      type: 'text'
    }
  ],
  maxRows: 8
}
```

Beispiele:

* keine Durchgangsstraße hörbar
* nur 10 Zimmer
* Funkloch im Haus
* Adults only
* Alleinlage

---

### 2.3 Ruheprofil (strukturierte Faktoren)

```ts
ruheProfil: {
  type: 'group',
  fields: [
    {
      name: 'abgeschiedenheit',
      type: 'select',
      options: ['hoch', 'sehr hoch', 'mittel']
    },
    {
      name: 'umgebung',
      type: 'select',
      options: ['Natur pur', 'Wald', 'Berge', 'See', 'Tal']
    },
    {
      name: 'gaeste',
      type: 'text'
    },
    {
      name: 'empfang',
      type: 'select',
      options: ['kein Empfang', 'schwach', 'gut']
    }
  ]
}
```

Alles optional.
Kein Pflichtfeld.

---

### 2.4 Redaktionelle Einschätzung (optional)

Kurzer 2-Satz Text.

```ts
editorialQuietNote: {
  type: 'textarea'
}
```

Beispiel:

> Oberhalb des Tals gelegen, ohne hörbare Straße.
> Besonders geeignet für ruhige Wochenenden zu zweit.

---

# 3. 🖥 Frontend Darstellung

## Position

Auf Unterkunftsdetailseite:
direkt unter Titel / Hero.

Wichtig:

> oberhalb von Beschreibung

---

# 3.1 Ruhe-Level (Hero Element)

Beispiel:

**STILL Einschätzung**
Absolute Stille

Visuell:
minimalistische Balken oder Textbadge.

---

# 3.2 Warum hier abschalten

Titel:

> Warum hier abschalten

Bulletliste aus `whyQuiet`.

Max:
6 Punkte sichtbar.

---

# 3.3 Ruheprofil Box

Kompakte Box:

Abgeschiedenheit: sehr hoch
Umgebung: Wald & Berge
Empfang: kaum
Gäste: Paare & Solo

Nur rendern wenn Daten vorhanden.

---

# 3.4 Integration mit bestehenden Feldern

Nicht doppeln.

Mapping:

| Bestehend        | Verwendung          |
| ---------------- | ------------------- |
| Kategorien       | bleiben unverändert |
| Für wen geeignet | bleibt              |
| Tags             | bleiben             |
| Ruheprofil       | neue Dimension      |

---

# 4. 🧠 Logik & Regeln

## Pflicht?

Nichts Pflicht.

Wenn leer:
→ Block nicht anzeigen.

---

## Reihenfolge auf Seite

1. Titel
2. Bilder
3. STILL Einschätzung
4. Beschreibung
5. Für wen geeignet
6. Karte etc.

---

# 5. Admin UX in Payload

Im CMS:

Tab: **Ruheprofil**

Reihenfolge:

1. Ruhe-Level
2. Warum hier abschalten
3. Ruheprofil
4. Redaktionelle Notiz

Mit Helper-Text:

> Nur ausfüllen wenn zutreffend. Kurz & präzise.

---

# 6. Nicht Bestandteil (bewusst)

Kein:

* User Review System
* Score Berechnung
* Rating
* Kommentare

Alles kuratiert.

---

# 7. Zukunft (nicht jetzt)

Später möglich:

* Filter nach Ruhe-Level
* „absolute Stille“-Sammlung
* Matching Engine nutzt Daten

Aber:
nicht Teil von V1.

---

# 8. Acceptance Criteria

Fertig wenn:

* Ruheprofil in Payload pflegbar
* Frontend zeigt es sauber
* keine Pflichtfelder
* mobile gut lesbar
* wirkt wie Magazin, nicht Bewertung

---
