// Human-readable building name shown in the UI
export const BUILDING_NAME = 'Mediacollege Amsterdam'

// All floors in the building; id matches the floor number used throughout the app
export const FLOORS = [
  { id: 0, label: 'BG', name: 'Begane grond' },
  { id: 1, label: '1e', name: '1e Verdieping' },
  { id: 2, label: '2e', name: '2e Verdieping' },
  { id: 3, label: '3e', name: 'Derde verdieping' },
]

// Width and height of the SVG canvas in user-space units
export const SVG_W = 800
export const SVG_H = 686

// Y-coordinate of the main horizontal corridor on each floor (routing anchor).
// Floor 3 uses a diagonal corridor — CORRIDOR_Y[3] is the Y of the stair entry
// at the top of that diagonal (used for cross-floor stair connections).
// Measured from actual floor-plan images: corridor centres sit ~26 px above the
// old values (404/485) which landed on the SOUTH WALL of the corridor, making
// routes trace the room-boundary line instead of going through open hallway.
export const CORRIDOR_Y = { 0: 378, 1: 378, 2: 475, 3: 165 }

// X-coordinate of the elevator shaft (floors 0–2 only; floor 3 has its own lift)
export const ELEVATOR_X = 400

// X-coordinate of the west and east stairwells per floor.
// Values are chosen so they sit on the actual visible corridor in each floor image.
// Floor 3 has ONE staircase on its diagonal corridor; both west & east point to it.
// Each floor's west stairwell x must represent the SAME physical shaft across floors.
// The centre staircase (≈x=248–300) runs through floors 0–3; the far-left arm
// (x≈100/130) is a separate corridor arm, not a stairwell that connects all floors.
// West stair x adjusted for floor 2 (285 matches stair icon in floor-2.png).
// East stair x corrected for floors 0/1: images show stair at ~595/605, not 640/632.
export const STAIR_WEST = { 0: 248, 1: 265, 2: 285, 3: 349 }
export const STAIR_EAST = { 0: 595, 1: 605, 2: 590, 3: 349 }

// ── Floor 3 diagonal corridor ─────────────────────────────────────────────────
// Floor 3 is an angled building whose corridor runs diagonally (top-left → bottom-right).
// This polyline describes the corridor centerline in SVG coordinates.
// Used by routing.js to build diagonal waypoints instead of L-shaped axis-aligned paths.
export const FLOOR3_DIAG = [
  { x: 341, y: 150 },
  { x: 354, y: 200 },
  { x: 372, y: 265 },
  { x: 390, y: 330 },
  { x: 409, y: 390 },
  { x: 427, y: 445 },
]

// Helper: corridor X at a given Y on floor 3 (linear interpolation along the diagonal)
// diag start: (341, 150), diag end: (427, 445) → slope dx/dy = (427-341)/(445-150)
const DIAG3_X0 = 341, DIAG3_Y0 = 150
const DIAG3_SLOPE = (427 - 341) / (445 - 150)    // ≈ 0.291 — dx per dy
export function diag3X(y) {
  return Math.round(DIAG3_X0 + DIAG3_SLOPE * (y - DIAG3_Y0))
}

// Room rectangle definitions per floor (for SVG overlay / minimap, NOT used for routing)
export const FLOOR_ROOMS = {
  0: [
    { id: 'bg-gang-ns', type: 'corridor', x: 248, y: 0,   w: 60,  h: 300, label: '' },
    { id: 'bg-nw1', type: 'room', x: 160, y: 0,   w: 88, h: 77,  label: 'Lokaal' },
    { id: 'bg-nw2', type: 'room', x: 160, y: 77,  w: 88, h: 77,  label: 'Lokaal' },
    { id: 'bg-nw3', type: 'room', x: 160, y: 154, w: 88, h: 77,  label: 'Lokaal' },
    { id: 'bg-ne1', type: 'room', x: 308, y: 0,   w: 87, h: 77,  label: 'Lokaal' },
    { id: 'bg-ne2', type: 'room', x: 308, y: 77,  w: 87, h: 77,  label: 'Lokaal' },
    { id: 'bg-ne3', type: 'room', x: 308, y: 154, w: 87, h: 77,  label: 'Lokaal' },
    { id: 'bg-lw-o1', type: 'room', x: 0, y: 155, w: 60, h: 90,  label: 'Lokaal' },
    { id: 'bg-lw-o2', type: 'room', x: 0, y: 245, w: 60, h: 90,  label: 'Lokaal' },
    { id: 'bg-lw-o3', type: 'room', x: 0, y: 335, w: 60, h: 90,  label: 'Lokaal' },
    { id: 'bg-lw-o4', type: 'room', x: 0, y: 425, w: 60, h: 90,  label: 'Lokaal' },
    { id: 'bg-lw-i1', type: 'room', x: 60, y: 155, w: 100, h: 180, label: 'Lokaal' },
    { id: 'bg-lw-i2', type: 'room', x: 60, y: 335, w: 100, h: 180, label: 'Lokaal' },
    { id: 'bg-wc',     type: 'room',     x: 160, y: 295, w: 60,  h: 40,  label: 'WC' },
    { id: 'bg-trap-l', type: 'stairs',   x: 220, y: 287, w: 56,  h: 56,  label: 'Trap' },
    { id: 'bg-lift',   type: 'elevator', x: 372, y: 287, w: 56,  h: 56,  label: 'Lift' },
    { id: 'bg-trap-r', type: 'stairs',   x: 730, y: 287, w: 56,  h: 56,  label: 'Trap' },
    { id: 'bg-gang',   type: 'corridor', x: 40,  y: 295, w: 755, h: 40,  label: '' },
    { id: 'bg-rn1', type: 'room', x: 395, y: 155, w: 80, h: 140, label: 'Lokaal' },
    { id: 'bg-rn2', type: 'room', x: 475, y: 155, w: 80, h: 140, label: 'Lokaal' },
    { id: 'bg-rn3', type: 'room', x: 555, y: 155, w: 80, h: 140, label: 'Lokaal' },
    { id: 'bg-rn4', type: 'room', x: 635, y: 155, w: 80, h: 140, label: 'Lokaal' },
    { id: 'bg-rn5', type: 'room', x: 715, y: 155, w: 80, h: 140, label: 'Lokaal' },
    { id: 'bg-rs1', type: 'room', x: 160, y: 335, w: 140, h: 180, label: 'Lokaal' },
    { id: 'bg-rs2', type: 'room', x: 300, y: 335, w: 140, h: 180, label: 'Lokaal' },
    { id: 'bg-rs3', type: 'room', x: 440, y: 335, w: 140, h: 180, label: 'Lokaal' },
    { id: 'bg-rs4', type: 'room', x: 580, y: 335, w: 140, h: 180, label: 'Lokaal' },
  ],
  1: [
    { id: '1e-sd',     label: 'Software Dev',    x: 5,   y: 5,   w: 350, h: 190, type: 'room' },
    { id: '1e-av',     label: 'Audio Visueel',   x: 355, y: 5,   w: 210, h: 95,  type: 'room' },
    { id: '1e-ga',     label: 'Game Artist',     x: 355, y: 100, w: 210, h: 95,  type: 'room' },
    { id: '1e-mv',     label: 'Media Vormgever', x: 565, y: 5,   w: 230, h: 190, type: 'room' },
    { id: '1e-gang',   label: '',                x: 5,   y: 195, w: 790, h: 130, type: 'corridor' },
    { id: '1e-trap-l', label: 'Trap',            x: 5,   y: 195, w: 80,  h: 130, type: 'stairs' },
    { id: '1e-lift',   label: 'Lift',            x: 360, y: 195, w: 80,  h: 130, type: 'elevator' },
    { id: '1e-trap-r', label: 'Trap',            x: 715, y: 195, w: 80,  h: 130, type: 'stairs' },
    { id: '1e-lokaal', label: 'Lokaal 1.01',     x: 5,   y: 325, w: 175, h: 190, type: 'room' },
    { id: '1e-pet',    label: 'Podium & Event',  x: 180, y: 325, w: 255, h: 190, type: 'room' },
    { id: '1e-ss',     label: 'Sign Specialist', x: 435, y: 325, w: 360, h: 190, type: 'room' },
  ],
  2: [
    { id: '2e-mr',        label: 'Media Redactie',   x: 5,   y: 5,   w: 440, h: 190, type: 'room' },
    { id: '2e-cp',        label: 'Creatieve Prod.',  x: 445, y: 5,   w: 350, h: 320, type: 'room' },
    { id: '2e-id',        label: 'Immersive Design', x: 5,   y: 195, w: 440, h: 130, type: 'room' },
    { id: '2e-gang',      label: '',                 x: 5,   y: 325, w: 790, h: 90,  type: 'corridor' },
    { id: '2e-trap-l',    label: 'Trap',             x: 5,   y: 325, w: 80,  h: 90,  type: 'stairs' },
    { id: '2e-lift',      label: 'Lift',             x: 360, y: 325, w: 80,  h: 90,  type: 'elevator' },
    { id: '2e-trap-r',    label: 'Trap',             x: 715, y: 325, w: 80,  h: 90,  type: 'stairs' },
    { id: '2e-toiletten', label: 'Toiletten',        x: 5,   y: 415, w: 195, h: 100, type: 'room' },
    { id: '2e-rv',        label: 'Ruimtelijk VMG',   x: 200, y: 415, w: 245, h: 100, type: 'room' },
    { id: '2e-aam',       label: 'All Around Media', x: 445, y: 415, w: 350, h: 100, type: 'room' },
  ],
  3: [
    { id: '3e-diag-gang', type: 'corridor', x: 310, y: 140, w: 80, h: 310, label: '' },
    { id: '3e-left-top',  type: 'room',     x: 225, y: 155, w: 85, h: 155, label: 'Studio' },
    { id: '3e-left-mid',  type: 'room',     x: 245, y: 310, w: 95, h: 135, label: 'Studio' },
    { id: '3e-right-top', type: 'room',     x: 390, y: 155, w: 85, h: 155, label: 'Studio' },
    { id: '3e-right-mid', type: 'room',     x: 410, y: 310, w: 90, h: 135, label: 'Studio' },
    { id: '3e-right-bot', type: 'room',     x: 430, y: 395, w: 90, h: 105, label: 'Studio' },
  ],
}

// Door gap positions (for future visual overlay)
export const ROOM_DOORS = {
  0: [
    { x: 435, y: 295, w: 30 }, { x: 515, y: 295, w: 30 }, { x: 595, y: 295, w: 30 },
    { x: 675, y: 295, w: 30 }, { x: 755, y: 295, w: 30 },
    { x: 278, y: 295, w: 40 }, { x: 110, y: 295, w: 30 },
    { x: 230, y: 335, w: 30 }, { x: 370, y: 335, w: 30 },
    { x: 510, y: 335, w: 30 }, { x: 650, y: 335, w: 30 },
  ],
  1: [
    { x: 180, y: 195, w: 38 }, { x: 460, y: 195, w: 28 }, { x: 680, y: 195, w: 34 },
    { x: 92,  y: 325, w: 24 }, { x: 307, y: 325, w: 34 }, { x: 615, y: 325, w: 38 },
  ],
  2: [
    { x: 225, y: 195, w: 38 }, { x: 225, y: 325, w: 38 }, { x: 620, y: 325, w: 38 },
    { x: 102, y: 415, w: 24 }, { x: 322, y: 415, w: 28 }, { x: 620, y: 415, w: 34 },
  ],
  3: [],
}

// ── Points of Interest ────────────────────────────────────────────────────────
// Fields: id, label, icon, floor, x/y (map marker position),
//         jx (corridor junction x — the x where the POI's path meets the
//             horizontal corridor; on floor 3 this is the diagonal-corridor x
//             at the POI's y level),
//         roomId, category, desc, status.
//
// Corridor Y reference:  floor 0/1 = 378 | floor 2 = 475 | floor 3 = diagonal
export const ALL_POIS = [

  // ── Begane Grond (0) — main corridor at y=378 ─────────────────────────────
  { id:'poi-portier',  label:'Portier',          icon:'🛡️', floor:0, x:110, y:451, jx:110, roomId:'bg-lw-i2',      category:'faciliteiten', desc:'Toegangscontrole & beveiliging',        status:'vrij'     },
  { id:'poi-receptie', label:'Receptie',         icon:'ℹ️',  floor:0, x:350, y:432, jx:350, roomId:'bg-nw1',        category:'faciliteiten', desc:'Ontvangst, info & loketdiensten',       status:'vrij'     },
  { id:'poi-kantine',  label:'Kantine',          icon:'🍽️', floor:0, x:595, y:289, jx:595, roomId:'bg-rn3',        category:'eten',         desc:'Kantine & foodcourt 08:00–17:00',       status:'vrij'     },
  { id:'poi-wc-bg',    label:'Toiletten BG',     icon:'🚻',  floor:0, x:190, y:378, jx:190, roomId:'bg-wc',         category:'faciliteiten', desc:'Toiletten begane grond',                status:'vrij'     },
  { id:'poi-aula',     label:'Aula',             icon:'🎭',  floor:0, x:370, y:451, jx:370, roomId:'bg-rs2',        category:'onderwijs',    desc:'Grote aula, evenementen & presentaties', status:'bezet'   },
  { id:'poi-info',     label:'Informatiedesk',   icon:'📋',  floor:0, x:510, y:451, jx:510, roomId:'bg-rs3',        category:'faciliteiten', desc:'Open dag informatiepunt',               status:'vrij'     },
  { id:'poi-lift-0',   label:'Lift',             icon:'🛗',  floor:0, x:400, y:378, jx:400, roomId:'bg-lift',       category:'transport',    desc:'Lift naar alle verdiepingen'                              },
  { id:'poi-trap-0l',  label:'Trap West',        icon:'🪜',  floor:0, x:248, y:378, jx:248, roomId:'bg-trap-l',     category:'transport',    desc:'Trappenhuis west'                                         },
  { id:'poi-trap-0r',  label:'Trap Oost',        icon:'🪜',  floor:0, x:595, y:378, jx:595, roomId:'bg-trap-r',     category:'transport',    desc:'Trappenhuis oost'                                         },

  // ── 1e Verdieping (1) — main corridor at y=378 ─────────────────────────────
  // jx changed 280→248: NS-corridor centre is at x≈248 (not 280 which routes through GA room interior)
  // jy=195 added to av+ga so the route goes DOWN inside the room to the corridor-opening at y=195,
  //  then LEFT to the NS corridor, instead of cutting horizontally through room walls.
  { id:'poi-sd',       label:'Software Dev',     icon:'💻',  floor:1, x:215, y:95,  jx:248, jy:195, roomId:'1e-sd',         category:'onderwijs',    desc:'Software Development, lokaal 1.02',     status:'vrij'     },
  { id:'poi-av',       label:'Audio Visueel',    icon:'🎬',  floor:1, x:337, y:80,  jx:248, jy:195, roomId:'1e-av',         category:'onderwijs',    desc:'Audio Visueel Design, lokaal 1.03',     status:'bezet'    },
  { id:'poi-ga',       label:'Game Artist',      icon:'🎮',  floor:1, x:337, y:148, jx:248, jy:195, roomId:'1e-ga',         category:'onderwijs',    desc:'Game Artist, lokaal 1.04',              status:'vrij'     },
  { id:'poi-mv',       label:'Media Vormgever',  icon:'🎨',  floor:1, x:620, y:148, jx:605, eastWing:{ entryX:632, entryY:148, exitX:605, exitY:378 }, roomId:'1e-mv', category:'onderwijs', desc:'Media Vormgever, lokaal 1.05', status:'gesloten' },
  { id:'poi-lokaal',   label:'Lokaal 1.01',      icon:'🚪',  floor:1, x:92,  y:458, jx:100, roomId:'1e-lokaal',     category:'onderwijs',    desc:'Algemeen leslokaal',                    status:'gesloten' },
  { id:'poi-pet',      label:'Podium & Event',   icon:'🎤',  floor:1, x:307, y:458, jx:307, roomId:'1e-pet',        category:'onderwijs',    desc:'Podium & Evenementen Techniek',         status:'vrij'     },
  { id:'poi-ss',       label:'Sign Specialist',  icon:'🖼️', floor:1, x:550, y:458, jx:550, roomId:'1e-ss',         category:'onderwijs',    desc:'Sign Specialist, printlokaal',          status:'bezet'    },
  { id:'poi-lift-1',   label:'Lift',             icon:'🛗',  floor:1, x:400, y:378, jx:400, roomId:'1e-lift',       category:'transport',    desc:'Lift naar alle verdiepingen'                              },
  { id:'poi-trap-1l',  label:'Trap West',        icon:'🪜',  floor:1, x:265, y:378, jx:265, roomId:'1e-trap-l',     category:'transport',    desc:'Trappenhuis west'                                         },
  { id:'poi-trap-1r',  label:'Trap Oost',        icon:'🪜',  floor:1, x:605, y:378, jx:605, roomId:'1e-trap-r',     category:'transport',    desc:'Trappenhuis oost'                                         },

  // ── 2e Verdieping (2) — main corridor at y=475 ────────────────────────────
  { id:'poi-mr',       label:'Media Redactie',   icon:'📰',  floor:2, x:90,  y:355, jx:160, roomId:'2e-mr',         category:'onderwijs',    desc:'Media Redactie, lokaal 2.01',           status:'vrij'     },
  { id:'poi-cp',       label:'Creatieve Prod.',  icon:'🎞️', floor:2, x:620, y:213, jx:653, eastWing:{ entryX:653, entryY:213, exitX:590, exitY:475 }, roomId:'2e-cp',  category:'onderwijs',    desc:'Creatieve Productie, studio',           status:'bezet'    },
  { id:'poi-id',       label:'Immersive Design', icon:'🥽',  floor:2, x:90,  y:430, jx:160, roomId:'2e-id',         category:'onderwijs',    desc:'Immersive Designer, XR lab',            status:'vrij'     },
  { id:'poi-wc-2',     label:'Toiletten 2e',     icon:'🚻',  floor:2, x:100, y:528, jx:130, roomId:'2e-toiletten',  category:'faciliteiten', desc:'Toiletten tweede verdieping',           status:'vrij'     },
  { id:'poi-rv',       label:'Ruimtelijk VMG',   icon:'🏗️', floor:2, x:322, y:528, jx:322, roomId:'2e-rv',         category:'onderwijs',    desc:'Ruimtelijk Visueel Merchandiser',       status:'gesloten' },
  { id:'poi-aam',      label:'All Around Media', icon:'📡',  floor:2, x:530, y:528, jx:530, roomId:'2e-aam',        category:'onderwijs',    desc:'All Around Mediamaker, lokaal 2.05',    status:'vrij'     },
  { id:'poi-lift-2',   label:'Lift',             icon:'🛗',  floor:2, x:400, y:475, jx:400, roomId:'2e-lift',       category:'transport',    desc:'Lift naar alle verdiepingen'                              },
  { id:'poi-trap-2l',  label:'Trap West',        icon:'🪜',  floor:2, x:285, y:475, jx:285, roomId:'2e-trap-l',     category:'transport',    desc:'Trappenhuis west'                                         },
  { id:'poi-trap-2r',  label:'Trap Oost',        icon:'🪜',  floor:2, x:590, y:475, jx:590, roomId:'2e-trap-r',     category:'transport',    desc:'Trappenhuis oost'                                         },

  // ── 3e Verdieping (3) — diagonal corridor (see FLOOR3_DIAG) ───────────────
  // The building is a rotated rectangle whose corridor runs diagonally top-left → bottom-right.
  // POI positions are placed relative to the diagonal corridor at each POI's y level.
  // jx = diag3X(poi.y) — the corridor x at that y (calculated from the formula above).
  //
  // doorX: the corridor-wall boundary for this room at poi.y.
  //   Left  rooms (poi.x < corridor centre): doorX = diag3X(poi.y) - 38  (left  corridor wall)
  //   Right rooms (poi.x > corridor centre): doorX = diag3X(poi.y) + 38  (right corridor wall)
  // Routing goes POI → doorX (within room) → corridor centre (within corridor),
  // which prevents the path from drawing through the diagonal corridor walls.
  { id:'poi-radio',    label:'Radio Studio',     icon:'🎙️', floor:3, x:295, y:200, jx:354, doorX:318, roomId:'3e-left-top',   category:'onderwijs',    desc:'Radio productie studio',               status:'vrij'      },
  { id:'poi-tv',       label:'TV Studio',        icon:'📺',  floor:3, x:462, y:305, jx:403, doorX:424, roomId:'3e-right-mid',  category:'onderwijs',    desc:'Televisie productiestudio',             status:'bezet'     },
  { id:'poi-post',     label:'Post-productie',   icon:'🎞️', floor:3, x:470, y:355, jx:422, doorX:439, roomId:'3e-right-mid',  category:'onderwijs',    desc:'Video editing & color grading',        status:'vrij'      },
  { id:'poi-xr',       label:'XR Lab',           icon:'🥽',  floor:3, x:478, y:415, jx:440, doorX:456, roomId:'3e-right-bot',  category:'onderwijs',    desc:'Extended reality lab (VR/AR)',          status:'gesloten'  },
  { id:'poi-pod',      label:'Podcaststudio',    icon:'🎧',  floor:3, x:362, y:415, jx:440, doorX:380, roomId:'3e-left-mid',   category:'onderwijs',    desc:'Podcast opnamestudio',                 status:'vrij'      },
  { id:'poi-wc-3',     label:'Toiletten 3e',     icon:'🚻',  floor:3, x:360, y:345, jx:419, doorX:360, roomId:'3e-left-mid',   category:'faciliteiten', desc:'Toiletten derde verdieping',           status:'vrij'      },
  { id:'poi-lift-3',   label:'Lift',             icon:'🛗',  floor:3, x:421, y:385, jx:421,            roomId:'3e-diag-gang',  category:'transport',    desc:'Lift naar alle verdiepingen'                               },
  { id:'poi-trap-3l',  label:'Trap',             icon:'🪜',  floor:3, x:349, y:165, jx:349,            roomId:'3e-diag-gang',  category:'transport',    desc:'Trappenhuis'                                               },
  { id:'poi-trap-3r',  label:'Trap Zuid',        icon:'🪜',  floor:3, x:427, y:445, jx:427,            roomId:'3e-diag-gang',  category:'transport',    desc:'Trappenhuis south exit'                                    },
]

// ── East-wing connection (floor 2) ───────────────────────────────────────────
// The Creatieve Prod room sits in a physically separate rotated wing.
// Routing enters/exits the east wing at (entryX, entryY) — the bottom of the
// east wing — and jumps (without drawing a line) to/from STAIR_EAST[2] in the
// main building.  See routing.js for how this gap is handled.
export const EAST_WING_2 = { entryX: 653, entryY: 410 }

// Category definitions for the filter tab strip
export const CATEGORIES = [
  { id: 'all',          label: 'Alles',        icon: '🔍' },
  { id: 'onderwijs',    label: 'Opleidingen',  icon: '🎓' },
  { id: 'eten',         label: 'Eten',         icon: '🍽️' },
  { id: 'faciliteiten', label: 'Faciliteiten', icon: '🛠️' },
  { id: 'transport',    label: 'Transport',    icon: '🚶' },
]
