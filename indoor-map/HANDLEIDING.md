# Handleiding — Kaart aanpassen

> **Voor wie?** Iedereen die lokalen een naam of icoon wil geven, kamers wil verplaatsen, of de badges visueel wil stijlen.

---

## Inhoudsopgave

1. [Icoon en naam instellen via de kaart (geen code nodig)](#1-icoon-en-naam-instellen-via-de-kaart-geen-code-nodig)
2. [Icoon instellen in de code](#2-icoon-instellen-in-de-code)
3. [Eigen afbeelding of SVG instellen in de code](#3-eigen-afbeelding-of-svg-instellen-in-de-code)
4. [Prioriteitsvolgorde — wat wint er?](#4-prioriteitsvolgorde--wat-wint-er)
5. [Emoji-palet uitbreiden (UI-kiezer)](#5-emoji-palet-uitbreiden-ui-kiezer)
6. [Kamers verplaatsen of toevoegen (coördinaten)](#6-kamers-verplaatsen-of-toevoegen-coördinaten)
7. [CSS-klassen — badges per kamer stijlen](#7-css-klassen--badges-per-kamer-stijlen)
8. [Bestaande POI-labels en iconen wijzigen](#8-bestaande-poi-labels-en-iconen-wijzigen)

---

## 1. Icoon en naam instellen via de kaart (geen code nodig)

Dit werkt rechtstreeks in de browser — je hoeft niets te programmeren.

**Stappen:**

1. Open de kaart in de browser.
2. Zoom in op de verdieping met het lokaal dat je wilt bewerken.
3. Klik op het kleine **✏️-vakje** dat in het midden van elk lokaalblok staat.
4. Er verschijnt een popup met twee tabbladen:
   - **Emoji** — klik op een emoji uit het palet om die als icoon te kiezen.  
     Klik op **✕** (eerste knop) om het icoon te verwijderen.
   - **Eigen icoon** — klik op **📁 Afbeelding kiezen…** om een PNG, JPG, GIF of SVG van je computer te uploaden. Je ziet meteen een voorbeeld. Klik **✕ Verwijderen** om te wisselen.
   - Het **tekstvak** onderaan — type hier de naam van het lokaal, bijv. `3.01 — Media`.
5. Druk op **✓** of op **Enter** om op te slaan. Druk op **Escape** om te annuleren.
6. Klik op 🗑 om alles (icoon én naam) in één keer te wissen.

> **Let op:** alles wordt opgeslagen in `localStorage` van de browser. De instellingen blijven bewaard zolang je dezelfde browser gebruikt, maar worden **niet** automatisch gesynchroniseerd naar andere apparaten. Wil je dat iconen altijd voor iedereen zichtbaar zijn? Stel ze dan in via de code (zie hieronder).

---

## 2. Icoon instellen in de code

**Bestand:** `src/components/IndoorMap/data/building.js`  
**Object:** `FLOOR_ROOMS`

Voeg het veld `icon` toe aan een kamer-object. De waarde is een emoji.

```js
// Voorbeeld: 1e verdieping
1: [
  { id: '1e-sd',  label: 'Software Dev',  type: 'room', x: 5,   y: 5,   w: 350, h: 190, icon: '💻' },
  { id: '1e-av',  label: 'Audio Visueel', type: 'room', x: 355, y: 5,   w: 210, h: 95,  icon: '🎬' },
  { id: '1e-ga',  label: 'Game Artist',   type: 'room', x: 355, y: 100, w: 210, h: 95,  icon: '🎮' },
  { id: '1e-pet', label: 'Podium & Event',type: 'room', x: 180, y: 325, w: 255, h: 190, icon: '🎤' },
  // ...
],
```

Het `icon`-veld is **optioneel**. Laat je het weg, dan toont de badge het ✏️-potlood (klikbaar via de UI).

---

## 3. Eigen afbeelding of SVG instellen in de code

Wil je een eigen logo, icoon of SVG-bestand gebruiken in plaats van een emoji? Gebruik dan het veld `iconSrc`.

### Stap 1 — Zet je bestand in de `public`-map

Maak de map `public/icons/` aan en zet daar je bestanden in:

```
indoor-map/
└── public/
    └── icons/
        ├── software.svg
        ├── camera.png
        └── aula.svg
```

Ondersteunde bestandstypen: **SVG, PNG, JPG, GIF, WebP**

### Stap 2 — Verwijs ernaar in `building.js`

Gebruik het pad vanaf de `public`-map (dus zonder `public/` ervoor):

```js
// Voorbeeld: afbeeldingspad instellen
{ id: '1e-sd',  label: 'Software Dev',  type: 'room', ..., iconSrc: '/icons/software.svg' },
{ id: '1e-av',  label: 'Audio Visueel', type: 'room', ..., iconSrc: '/icons/camera.png'  },
{ id: 'bg-rs2', label: 'Aula',          type: 'room', ..., iconSrc: '/icons/aula.svg'    },
```

> **Tip SVG:** SVG-bestanden schalen perfect op elk zoomniveau en hebben geen kwaliteitsverlies. Gebruik ze bij voorkeur boven PNG/JPG.

### Combineren met een tekst-label

Je kunt `iconSrc` én `label` tegelijk gebruiken. De badge toont dan het icoon bovenaan en de tekst eronder:

```js
{ id: '1e-sd', label: 'Lokaal 1.02', type: 'room', ..., iconSrc: '/icons/software.svg' },
```

---

## 4. Prioriteitsvolgorde — wat wint er?

Er zijn meerdere manieren om een icoon in te stellen. Als er meerdere tegelijk actief zijn, wint altijd de hoogste in deze lijst:

| Prioriteit | Bron | Hoe ingesteld |
|---|---|---|
| **1** (hoogste) | Eigen afbeelding via de UI-editor | Geüpload in de browser, opgeslagen in localStorage |
| **2** | Emoji via de UI-editor | Gekozen in de browser, opgeslagen in localStorage |
| **3** | `iconSrc` in `building.js` | Afbeeldingspad in de code |
| **4** | `icon` in `building.js` | Emoji in de code |
| **5** (laagste) | ✏️ potlood-fallback | Niets ingesteld |

**Praktisch voorbeeld:**  
Je hebt in `building.js` `icon: '💻'` staan voor een lokaal. Daarna klikt iemand op de kaart en uploadt via de UI een eigen logo. De UI-instelling wint dan — de emoji uit de code is niet meer zichtbaar. Wis je het via 🗑 in de editor, dan komt de emoji uit de code weer terug.

---

## 5. Emoji-palet uitbreiden (UI-kiezer)

Het emoji-palet in de popup staat in één constante in `IndoorMap.jsx`.

**Bestand:** `src/components/IndoorMap/IndoorMap.jsx`

Zoek naar:

```js
const ROOM_ICONS = [
  '🏫','📚','🎨','💻','🎵','🎬','🎙️','🎮',
  '🔬','📝','📐','🎤','🎭','⚽','🍽️','📺',
  // ...
]
```

**Emoji toevoegen:** voeg hem toe aan de array:

```js
const ROOM_ICONS = [
  '🏫','📚','🎨','💻',
  // ... rest ...
  '🧑‍💻','🪗','🛖',   // <-- hier toegevoegd
]
```

**Emoji verwijderen:** haal hem gewoon uit de array.

> Tip: gebruik emoji's die duidelijk zijn op klein formaat (~14 px).

---

## 6. Kamers verplaatsen of toevoegen (coördinaten)

**Bestand:** `src/components/IndoorMap/data/building.js`  
**Object:** `FLOOR_ROOMS`

### Het SVG-coördinatenstelsel

De kaart is `800 × 686` SVG-eenheden groot.

```
(0, 0) ─────────────────── (800, 0)
  │                              │
  │   x → (horizontaal)         │
  │   y ↓ (verticaal)           │
  │                              │
(0, 686) ──────────────── (800, 686)
```

Elk kamer-object heeft de volgende velden:

| Veld      | Betekenis                                        | Voorbeeld |
|-----------|--------------------------------------------------|-----------|
| `id`      | Unieke naam (gebruik prefix per verdieping)      | `'1e-sd'` |
| `type`    | Soort ruimte (zie tabel hieronder)               | `'room'`  |
| `label`   | Naam die op de badge staat                       | `'Software Dev'` |
| `x`       | Linkerrand van het blok                          | `5`       |
| `y`       | Bovenrand van het blok                           | `5`       |
| `w`       | Breedte (width)                                  | `350`     |
| `h`       | Hoogte (height)                                  | `190`     |
| `icon`    | *(optioneel)* Emoji als icoon                    | `'💻'`    |
| `iconSrc` | *(optioneel)* Pad naar afbeelding in `/public`   | `'/icons/software.svg'` |

Het badge-icoon verschijnt automatisch op het middelpunt van het blok:
- midden-x = `x + w / 2`
- midden-y = `y + h / 2`

### Kamer verplaatsen

Pas `x` en `y` aan:

```js
// Origineel:
{ id: 'bg-nw1', type: 'room', x: 160, y: 0, w: 88, h: 77, label: 'Lokaal' },

// 10 px naar rechts, 5 px naar beneden:
{ id: 'bg-nw1', type: 'room', x: 170, y: 5, w: 88, h: 77, label: 'Lokaal' },
```

### Kamer groter of kleiner maken

Pas `w` en/of `h` aan:

```js
{ id: 'bg-nw1', type: 'room', x: 160, y: 0, w: 100, h: 90, label: 'Lokaal' },
```

### Nieuwe kamer toevoegen

Voeg een nieuw object toe aan de array van de juiste verdieping:

```js
1: [
  // bestaande kamers...
  { id: '1e-nieuw', type: 'room', x: 500, y: 200, w: 80, h: 60, label: 'Nieuw lokaal', icon: '🚪' },
],
```

> **Belangrijk:** het `id` moet **uniek** zijn over alle verdiepingen. Gebruik een duidelijke prefix.

### Overzicht van verdiepingen en hun ID-prefixen

| Verdieping    | `id` in code | Prefix |
|---------------|--------------|--------|
| Begane grond  | `0`          | `bg-`  |
| 1e Verdieping | `1`          | `1e-`  |
| 2e Verdieping | `2`          | `2e-`  |
| 3e Verdieping | `3`          | `3e-`  |

### Kamertypes

| `type`       | Wat het doet                                        |
|--------------|-----------------------------------------------------|
| `'room'`     | Krijgt een badge (✏️-icoon). Verschijnt in de lijst. |
| `'corridor'` | Geen badge. Alleen voor routing.                    |
| `'stairs'`   | Geen badge. Routering herkent dit als trap.         |
| `'elevator'` | Geen badge. Routering herkent dit als lift.         |

### Alle beschikbare kamer-ID's

#### Begane grond (floor 0) — prefix `bg-`

| Kamer-ID    | Lokaal / positie             | Huidig icoon |
|-------------|------------------------------|--------------|
| `bg-nw1`    | Noordwest blok 1             |              |
| `bg-nw2`    | Noordwest blok 2             |              |
| `bg-nw3`    | Noordwest blok 3             |              |
| `bg-ne1`    | Noordoost blok 1             |              |
| `bg-ne2`    | Noordoost blok 2             |              |
| `bg-ne3`    | Noordoost blok 3             |              |
| `bg-lw-o1`  | Links west buiten 1          |              |
| `bg-lw-o2`  | Links west buiten 2          |              |
| `bg-lw-o3`  | Links west buiten 3          |              |
| `bg-lw-o4`  | Links west buiten 4          |              |
| `bg-lw-i1`  | Links west binnen 1          |              |
| `bg-lw-i2`  | Links west binnen 2          |              |
| `bg-wc`     | Toiletten                    | 🚻           |
| `bg-rn1`    | Rechterkant noord 1          |              |
| `bg-rn2`    | Rechterkant noord 2          |              |
| `bg-rn3`    | Kantine                      | 🍽️           |
| `bg-rn4`    | Rechterkant noord 4          |              |
| `bg-rn5`    | Rechterkant noord 5          |              |
| `bg-rs1`    | Rechterkant zuid 1           |              |
| `bg-rs2`    | Aula                         | 🎭           |
| `bg-rs3`    | Rechterkant zuid 3           |              |
| `bg-rs4`    | Rechterkant zuid 4           |              |

#### 1e Verdieping (floor 1) — prefix `1e-`

| Kamer-ID    | Lokaal          | Huidig icoon |
|-------------|-----------------|--------------|
| `1e-sd`     | Software Dev    | 💻           |
| `1e-av`     | Audio Visueel   | 🎬           |
| `1e-ga`     | Game Artist     | 🎮           |
| `1e-mv`     | Media Vormgever | 🎨           |
| `1e-lokaal` | Lokaal 1.01     | 🚪           |
| `1e-pet`    | Podium & Event  | 🎤           |
| `1e-ss`     | Sign Specialist | 🖼️           |

#### 2e Verdieping (floor 2) — prefix `2e-`

| Kamer-ID       | Lokaal            | Huidig icoon |
|----------------|-------------------|--------------|
| `2e-mr`        | Media Redactie    | 📰           |
| `2e-cp`        | Creatieve Prod.   | 🎞️           |
| `2e-id`        | Immersive Design  | 🥽           |
| `2e-toiletten` | Toiletten         | 🚻           |
| `2e-rv`        | Ruimtelijk VMG    | 🏗️           |
| `2e-aam`       | All Around Media  | 📡           |

#### 3e Verdieping (floor 3) — prefix `3e-`

| Kamer-ID       | Lokaal          | Huidig icoon |
|----------------|-----------------|--------------|
| `3e-left-top`  | Radio Studio    | 🎙️           |
| `3e-left-mid`  | Podcaststudio   | 🎧           |
| `3e-right-top` | TV Studio       | 📺           |
| `3e-right-mid` | Post-productie  | 🎞️           |
| `3e-right-bot` | XR Lab          | 🥽           |

---

## 7. CSS-klassen — badges per kamer stijlen

Elke badge in de SVG krijgt automatisch klassen die je kunt gebruiken om specifieke kamers visueel aan te passen.

### Welke klassen heeft een badge?

```
.room-slot   .slot-bg-nw1   .floor-0
    ↑               ↑            ↑
 alle badges   dit lokaal   deze verdieping
```

| Klasse        | Selecteert                           | Voorbeeld                                  |
|---------------|--------------------------------------|--------------------------------------------|
| `.room-slot`  | Alle badges op alle verdiepingen     | `.room-slot { ... }`                       |
| `.slot-{id}`  | Eén specifiek lokaal                 | `.slot-1e-sd { ... }`                      |
| `.floor-{n}`  | Alle badges op één verdieping        | `.floor-1 { ... }`                         |
| `.slot-rect`  | De achtergrondrechthoek van de badge | `.slot-1e-sd .slot-rect { fill: red; }`    |
| `.slot-icon`  | Het icoon (emoji of afbeelding)      | `.slot-1e-sd .slot-icon { opacity: 0.8; }` |
| `.slot-label` | De tekst in de badge                 | `.slot-1e-sd .slot-label { fill: yellow; }`|

### Hoe voeg je stijlen toe?

**Optie A — globaal CSS-bestand**

Maak `src/room-stijlen.css` en importeer het in `main.jsx`:

```css
/* src/room-stijlen.css */

/* Alle badges: iets dikkere rand */
.room-slot .slot-rect {
  stroke-width: 1.5;
}

/* Lokaal 1e-sd: blauwe badge */
.slot-1e-sd .slot-rect {
  fill: rgba(30, 64, 175, 0.85);
  stroke: #93c5fd;
}

/* Alle badges op de 3e verdieping: paarse tint */
.floor-3 .slot-rect {
  fill: rgba(126, 34, 206, 0.82);
  stroke: #d8b4fe;
}
```

```js
// src/main.jsx
import './room-stijlen.css'   // <-- importeer het bestand
```

**Optie B — inline in IndoorMap.module.scss**

Voeg onderaan het bestand toe:

```scss
// src/components/IndoorMap/IndoorMap.module.scss

:global(.slot-bg-rs2) {
  .slot-rect { fill: rgba(234, 179, 8, 0.82); stroke: #fde68a; }
}
```

> Let op het `:global(...)` — zonder dat werkt het niet in CSS Modules.

---

## 8. Bestaande POI-labels en iconen wijzigen

POI's (de grotere, klikbare punten op de kaart zoals "Receptie" of "Kantine") staan apart gedefinieerd.

**Bestand:** `src/components/IndoorMap/data/building.js`  
**Object:** `ALL_POIS`

```js
{ id: 'poi-kantine', label: 'Kantine', icon: '🍽️', floor: 0, ... },
//                   ^^^^^^^^^^^^^^^^         ^^^^^
//                   naam in de UI            emoji op de kaart
```

### Velden die je kunt aanpassen

| Veld     | Wat het doet                             | Voorbeeld               |
|----------|------------------------------------------|-------------------------|
| `label`  | Naam die in de UI en op de badge staat   | `'Mediakantine'`        |
| `icon`   | Emoji op de kaartmarker                  | `'🥗'`                  |
| `desc`   | Korte beschrijving in het detailkaartje  | `'Maandag–vrijdag open'`|
| `status` | Kleurindicator op de kaart               | `'vrij'` / `'bezet'` / `'gesloten'` |
| `x`, `y` | Positie van de markering op de kaart     | `x: 595, y: 289`        |

> **Tip:** verander `x` en `y` als een markering op de verkeerde plek staat. De coördinaten zijn in SVG-eenheden (0–800 horizontaal, 0–686 verticaal).

---

## Snel overzicht — welk bestand voor wat?

| Wat wil je doen?                          | Hoe                                                           |
|-------------------------------------------|---------------------------------------------------------------|
| Lokaal een naam/icoon geven               | Klik op ✏️ op de kaart (geen code nodig)                      |
| Lokaal een emoji geven via code           | `FLOOR_ROOMS` in `building.js` → `icon: '💻'`                |
| Lokaal een eigen afbeelding geven via code| `FLOOR_ROOMS` in `building.js` → `iconSrc: '/icons/naam.svg'`|
| Afbeelding uploaden via de browser        | Klik op ✏️ → tabblad "Eigen icoon" → 📁 Afbeelding kiezen…   |
| Emoji-palet uitbreiden                    | `ROOM_ICONS` in `IndoorMap.jsx`                              |
| Kamer verplaatsen / vergroten             | `FLOOR_ROOMS` in `building.js` → `x`, `y`, `w`, `h`         |
| Nieuwe kamer toevoegen                    | `FLOOR_ROOMS` in `building.js` → nieuw object toevoegen      |
| Badge-kleur of -stijl aanpassen           | Eigen CSS met `.slot-{id}` klassen                            |
| POI-naam, icoon of status wijzigen        | `ALL_POIS` in `building.js`                                   |
