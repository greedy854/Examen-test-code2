# Handleiding — Kaart aanpassen

> **Voor wie?** Iedereen die iconen wil wisselen, lokalen wil verplaatsen of begrijpt hoe de routing werkt.

---

## Inhoudsopgave

1. [Icoon van een lokaal wisselen](#1-icoon-van-een-lokaal-wisselen)
2. [Foto of SVG als icoon instellen](#2-foto-of-svg-als-icoon-instellen)
3. [De 10 lokalen met iconen — overzicht](#3-de-10-lokalen-met-iconen--overzicht)
4. [Routing-coördinaten aanpassen (jx / jy)](#4-routing-coördinaten-aanpassen-jx--jy)
5. [Lokaal verplaatsen of toevoegen](#5-lokaal-verplaatsen-of-toevoegen)
6. [Walkability — hoe de route door de gang gaat](#6-walkability--hoe-de-route-door-de-gang-gaat)
7. [CSS-klassen — badges per kamer stijlen](#7-css-klassen--badges-per-kamer-stijlen)

---

## 1. Icoon van een lokaal wisselen

**Bestand:** `src/components/IndoorMap/data/building.js`

Zoek het lokaal in `FLOOR_ROOMS` en pas het veld `iconSrc` aan.

```js
// Voorbeeld: Kantine-icoon wisselen
{ id: 'bg-rn3', label: 'Kantine', type: 'room', x: 555, y: 155, w: 80, h: 140,
  iconSrc: '/icons/kantine.svg'   // ← verander dit pad naar je eigen bestand
},
```

**Stappen:**

1. Zet je foto of SVG in de map `public/icons/`  
   (bijv. `public/icons/mijn-kantine.jpg`)
2. Verander het pad in `building.js`:  
   `iconSrc: '/icons/mijn-kantine.jpg'`
3. Sla op → de browser laadt de nieuwe afbeelding direct.

> **Bestandsformaten:** SVG, PNG, JPG, GIF en WebP werken allemaal.  
> SVG is het beste — het schaalt scherp op elk zoomniveau.

---

## 2. Foto of SVG als icoon instellen

### Structuur van de `public/icons/` map

```
indoor-map/
└── public/
    └── icons/
        ├── kantine.svg          ← huidig placeholder
        ├── aula.svg
        ├── software-dev.svg
        ├── audio-visueel.svg
        ├── game-artist.svg
        ├── media-vormgever.svg
        ├── podium-event.svg
        ├── media-redactie.svg
        ├── immersive-design.svg
        └── radio-studio.svg
```

Vervang een SVG-bestand door je eigen foto — zelfde bestandsnaam, geen code-aanpassing nodig.

**Of** verander het pad in `building.js` als je een ander bestandsnaam gebruikt:

```js
// Van:
iconSrc: '/icons/kantine.svg'

// Naar:
iconSrc: '/icons/mijn-foto.jpg'
```

### Emoji als icoon (alternatief)

Je kunt ook een emoji gebruiken in plaats van een afbeelding:

```js
{ id: 'bg-rn3', label: 'Kantine', type: 'room', ..., icon: '🍽️' }
```

Als zowel `iconSrc` als `icon` aanwezig zijn, wint `iconSrc`.

---

## 3. De 10 lokalen met iconen — overzicht

Dit zijn de enige lokalen die momenteel een badge tonen op de kaart.  
Alle andere lokalen hebben geen badge (geen `iconSrc` of `icon` ingesteld).

| Kamer-ID       | Lokaal           | Verdieping    | Huidig bestand             |
|----------------|------------------|---------------|----------------------------|
| `bg-rn3`       | Kantine          | Begane grond  | `/icons/kantine.svg`       |
| `bg-rs2`       | Aula             | Begane grond  | `/icons/aula.svg`          |
| `1e-sd`        | Software Dev     | 1e verdieping | `/icons/software-dev.svg`  |
| `1e-av`        | Audio Visueel    | 1e verdieping | `/icons/audio-visueel.svg` |
| `1e-ga`        | Game Artist      | 1e verdieping | `/icons/game-artist.svg`   |
| `1e-mv`        | Media Vormgever  | 1e verdieping | `/icons/media-vormgever.svg`|
| `1e-pet`       | Podium & Event   | 1e verdieping | `/icons/podium-event.svg`  |
| `2e-mr`        | Media Redactie   | 2e verdieping | `/icons/media-redactie.svg`|
| `2e-id`        | Immersive Design | 2e verdieping | `/icons/immersive-design.svg`|
| `3e-left-top`  | Radio Studio     | 3e verdieping | `/icons/radio-studio.svg`  |

**Nieuw lokaal toevoegen aan de kaart:**  
Voeg `iconSrc: '/icons/jouw-bestand.svg'` toe aan het kamer-object in `FLOOR_ROOMS` én voeg het lokaal toe aan `ALL_POIS` (zie sectie 4).

---

## 4. Routing-coördinaten aanpassen (jx / jy)

De routing werkt via **POI-objecten** in `ALL_POIS` (in `building.js`).  
Elk lokaal dat klikbaar moet zijn voor navigatie heeft een POI-object.

```js
{ id:'poi-sd', label:'Software Dev', icon:'💻', floor:1,
  x:215, y:95,       // ← positie van de badge/markering op de kaart
  jx:248, jy:195,    // ← route-ankerpunt: via welke punt gaat de route de gang in?
  roomId:'1e-sd',    // ← koppeling met het kamer-object in FLOOR_ROOMS
  category:'onderwijs', desc:'Software Development, lokaal 1.02', status:'vrij'
},
```

### Velden uitgelegd

| Veld     | Betekenis                                                              |
|----------|------------------------------------------------------------------------|
| `x`, `y` | Positie van de badge op de kaart (SVG-coördinaten 0–800, 0–686)        |
| `jx`     | X-coördinaat van het **gang-ankerpunt** — waar de route de gang instapt |
| `jy`     | *(optioneel)* Tussenpunt als de kamer een NS-gang gebruikt (Z-route)   |
| `doorX`  | *(floor 3 only)* X-positie van de kamerdeur bij de diagonale gang      |
| `roomId` | ID van het bijbehorende kamer-object in `FLOOR_ROOMS`                  |
| `floor`  | Verdiepingsnummer (0 = begane grond, 1, 2, 3)                          |

### Wanneer aanpassen?

- **Route gaat door een muur** → pas `jx` aan zodat het gang-ankerpunt in de gang ligt.
- **Lokaal staat op de verkeerde plek** → pas `x` en `y` aan.
- **Route gaat via een Noord-Zuid-gang** → voeg `jy` toe (zie voorbeeld hieronder).

### Voorbeeld: standaard L-route (kamer onder de gang)

```
Kamer (x,y)
    │  ← stap 1: horizontaal naar jx
    └──────►  (jx, y)
              │  ← stap 2: omhoog naar de gang
              ▼
           (jx, corridorY)   ← dit is het gang-ankerpunt
```

### Voorbeeld: Z-route met `jy` (kamer boven een NS-gang, floor 1)

```
Kamer (x=215, y=95)
    │  ← stap 1: omlaag naar jy=195 (onderkant van het kamerdeel)
    ▼
(215, 195)
    │  ← stap 2: links naar jx=248 (NS-gang)
    └────►  (248, 195)
               │  ← stap 3: omlaag naar de main corridor
               ▼
           (248, 378)  ← corridorY voor floor 1
```

### Gang-Y per verdieping (niet aanpassen)

| Verdieping | `CORRIDOR_Y` |
|------------|-------------|
| 0 — Begane grond | 378 |
| 1 — 1e Verdieping | 378 |
| 2 — 2e Verdieping | 475 |
| 3 — 3e Verdieping | diagonaal (zie `FLOOR3_DIAG`) |

---

## 5. Lokaal verplaatsen of toevoegen

**Bestand:** `src/components/IndoorMap/data/building.js` → `FLOOR_ROOMS`

### Het SVG-coördinatenstelsel

```
(0, 0) ───────────────── (800, 0)
  │   x → (horizontaal)       │
  │   y ↓ (verticaal)         │
(0, 686) ──────────── (800, 686)
```

### Kamer-object velden

| Veld      | Betekenis                              | Voorbeeld           |
|-----------|----------------------------------------|---------------------|
| `id`      | Unieke naam (prefix per verdieping)    | `'1e-nieuw'`        |
| `type`    | `'room'` / `'corridor'` / `'stairs'` / `'elevator'` | `'room'` |
| `label`   | Naam op de badge                       | `'Lokaal 1.06'`     |
| `x`       | Linkerrand van het blok                | `200`               |
| `y`       | Bovenrand van het blok                 | `100`               |
| `w`       | Breedte                                | `120`               |
| `h`       | Hoogte                                 | `90`                |
| `iconSrc` | *(optioneel)* Afbeeldingspad           | `'/icons/naam.svg'` |
| `icon`    | *(optioneel)* Emoji-fallback           | `'🚪'`              |

### Nieuwe kamer toevoegen

```js
// In FLOOR_ROOMS, verdieping 1:
1: [
  // ... bestaande kamers ...
  {
    id: '1e-nieuw',
    type: 'room',
    x: 500, y: 200, w: 100, h: 80,
    label: 'Nieuw lokaal',
    iconSrc: '/icons/nieuw.svg',   // optioneel
  },
],
```

Voeg daarna ook een POI toe aan `ALL_POIS` als het lokaal navigeerbaar moet zijn:

```js
{ id:'poi-nieuw', label:'Nieuw lokaal', icon:'🚪', floor:1,
  x:550, y:240,    // centrum van de kamer
  jx:550,          // gang-ankerpunt (pas aan zodat het in de gang ligt)
  roomId:'1e-nieuw', category:'onderwijs', desc:'Beschrijving', status:'vrij'
},
```

---

## 6. Walkability — hoe de route door de gang gaat

De routeplanner gebruikt twee systemen die samenwerken:

### Systeem 1 — L-vormige ankerpunten (altijd actief)

Op basis van de `jx`/`jy`-waarden in `ALL_POIS` berekent de router een vaste L-vormige route:  
kamer → gang-ankerpunt → horizontaal door de gang → gang-ankerpunt bestemming → kamer.

Dit is de basisroute. Als er geen vloerkaart geladen is, wordt altijd deze route gebruikt.

### Systeem 2 — A\* walkability (geladen bij opstarten)

Bij het laden van de pagina worden de vloerplanafbeeldingen (`/maps/floor-0.png` t/m `floor-3.png`) pixel voor pixel geanalyseerd. Elke pixel wordt geclassificeerd als:

- **Loopbaar** (lichte pixels, gang/open ruimte) → A\* mag hier doorheen
- **Geblokkeerd** (donkere pixels, kamerwanden) → A\* mijdt dit

De A\*-router verfijnt vervolgens de L-vormige route door tussenpunten in te voegen die de werkelijke ganggrenzen volgen.

### Instellingen aanpassen

**Bestand:** `src/components/IndoorMap/utils/walkability.js`

```js
export const CELL = 8         // rastergrootte in SVG-pixels (kleiner = nauwkeuriger, trager)
const WALKABLE_MIN = 160      // drempelwaarde: pixels met gemiddelde RGB > 160 zijn loopbaar
```

| Instelling     | Standaard | Effect van verhogen | Effect van verlagen |
|----------------|-----------|---------------------|---------------------|
| `CELL`         | `8`       | Sneller, minder nauwkeurig | Nauwkeuriger, trager |
| `WALKABLE_MIN` | `160`     | Alleen heldere gangen loopbaar (routes mijden donkere zones) | Meer ruimte loopbaar (routes kunnen door kamers snijden) |

### Troubleshooting

| Probleem | Oplossing |
|----------|-----------|
| Route gaat door een kamer | Verhoog `WALKABLE_MIN` (bijv. naar 175) |
| Route vindt geen pad, gebruikt rechte lijn | Verlaag `WALKABLE_MIN` (bijv. naar 145) of controleer `jx`/`jy` van het POI |
| Route in smalle gangetjes geblokkeerd | Verlaag `CELL` van 8 naar 6 voor fijner raster |
| Route is erg hoekig | Dit is normaal — de A\* volgt het rastergrid exact om muren te vermijden |

### Vloerkaartafbeeldingen

De walkability wordt gebouwd uit de afbeeldingen in `public/maps/`:

```
public/maps/
├── floor-0.png   ← begane grond
├── floor-1.png   ← 1e verdieping
├── floor-2.png   ← 2e verdieping
└── floor-3.png   ← 3e verdieping
```

Deze afbeeldingen worden bij elke paginalading opnieuw geanalyseerd. Je hoeft niets te herstarten na aanpassingen.

---

## 7. CSS-klassen — badges per kamer stijlen

Elke badge krijgt automatisch klassen voor eigen CSS-styling.

```
.room-slot   .slot-1e-sd   .floor-1
    ↑              ↑            ↑
 alle badges  dit lokaal   deze verdieping
```

| Klasse        | Selecteert                            |
|---------------|---------------------------------------|
| `.room-slot`  | Alle badges                           |
| `.slot-{id}`  | Één specifiek lokaal (bijv. `.slot-1e-sd`) |
| `.floor-{n}`  | Alle badges op één verdieping         |
| `.slot-rect`  | De achtergrondrechthoek van de badge  |
| `.slot-icon`  | Het icoon (afbeelding of emoji)       |
| `.slot-label` | De tekst onder het icoon              |

### Eigen CSS toevoegen

Maak `src/room-stijlen.css` en importeer het in `src/main.jsx`:

```css
/* src/room-stijlen.css */

/* Kantine: gele badge */
.slot-bg-rn3 .slot-rect {
  fill: rgba(202, 138, 4, 0.85);
  stroke: #fde68a;
}

/* Alle badges 1e verdieping: blauwe tint */
.floor-1 .slot-rect {
  fill: rgba(30, 64, 175, 0.85);
}
```

```js
// src/main.jsx
import './room-stijlen.css'
```

---

## Snel overzicht

| Wat wil je doen?                       | Bestand            | Wat aanpassen                              |
|----------------------------------------|--------------------|--------------------------------------------|
| Icoon-foto wisselen                    | `public/icons/`    | Bestand vervangen (zelfde naam)            |
| Icoon-pad wijzigen                     | `building.js`      | `iconSrc` in `FLOOR_ROOMS`                 |
| Emoji als icoon instellen              | `building.js`      | `icon` in `FLOOR_ROOMS`                    |
| Lokaal verplaatsen                     | `building.js`      | `x`, `y` in `FLOOR_ROOMS`                 |
| Nieuw navigeerbaar lokaal toevoegen    | `building.js`      | Object in `FLOOR_ROOMS` + entry in `ALL_POIS` |
| Route gaat door verkeerde gang         | `building.js`      | `jx` / `jy` in `ALL_POIS`                 |
| Route gaat door muren                  | `walkability.js`   | `WALKABLE_MIN` verhogen                    |
| Route vindt geen pad                   | `walkability.js`   | `WALKABLE_MIN` verlagen of `CELL` verkleinen |
| Badge-kleur aanpassen                  | `room-stijlen.css` | `.slot-{id} .slot-rect { fill: ... }`      |
