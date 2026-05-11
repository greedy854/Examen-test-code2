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
export const SVG_H = 520

// Y-coordinate of the main horizontal corridor on each floor (used by the routing algorithm)
export const CORRIDOR_Y = { 0: 315, 1: 260, 2: 370, 3: 315 }

// X-coordinate of the elevator shaft (shared across all floors)
export const ELEVATOR_X = 400

// Room rectangle definitions per floor.
// Each room has: id, type ('room' | 'corridor' | 'stairs' | 'elevator'), x/y position, w/h size, and a label.
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
    { id: '3e-gang-ns', type: 'corridor', x: 248, y: 0,   w: 60,  h: 300, label: '' },
    { id: '3e-nw1', type: 'room', x: 160, y: 0,   w: 88, h: 77,  label: 'Studio' },
    { id: '3e-nw2', type: 'room', x: 160, y: 77,  w: 88, h: 77,  label: 'Studio' },
    { id: '3e-nw3', type: 'room', x: 160, y: 154, w: 88, h: 77,  label: 'Studio' },
    { id: '3e-ne1', type: 'room', x: 308, y: 0,   w: 87, h: 77,  label: 'Studio' },
    { id: '3e-ne2', type: 'room', x: 308, y: 77,  w: 87, h: 77,  label: 'Studio' },
    { id: '3e-ne3', type: 'room', x: 308, y: 154, w: 87, h: 77,  label: 'Studio' },
    { id: '3e-lw-o1', type: 'room', x: 0, y: 155, w: 60, h: 90,  label: 'Lokaal' },
    { id: '3e-lw-o2', type: 'room', x: 0, y: 245, w: 60, h: 90,  label: 'Lokaal' },
    { id: '3e-lw-o3', type: 'room', x: 0, y: 335, w: 60, h: 90,  label: 'Lokaal' },
    { id: '3e-lw-o4', type: 'room', x: 0, y: 425, w: 60, h: 90,  label: 'Lokaal' },
    { id: '3e-lw-i1', type: 'room', x: 60, y: 155, w: 100, h: 180, label: 'Lokaal' },
    { id: '3e-lw-i2', type: 'room', x: 60, y: 335, w: 100, h: 180, label: 'Lokaal' },
    { id: '3e-wc',     type: 'room',     x: 160, y: 295, w: 60,  h: 40,  label: 'WC' },
    { id: '3e-trap-l', type: 'stairs',   x: 220, y: 287, w: 56,  h: 56,  label: 'Trap' },
    { id: '3e-lift',   type: 'elevator', x: 372, y: 287, w: 56,  h: 56,  label: 'Lift' },
    { id: '3e-trap-r', type: 'stairs',   x: 730, y: 287, w: 56,  h: 56,  label: 'Trap' },
    { id: '3e-gang',   type: 'corridor', x: 40,  y: 295, w: 755, h: 40,  label: '' },
    { id: '3e-rn1', type: 'room', x: 395, y: 155, w: 80, h: 140, label: 'Studio' },
    { id: '3e-rn2', type: 'room', x: 475, y: 155, w: 80, h: 140, label: 'Studio' },
    { id: '3e-rn3', type: 'room', x: 555, y: 155, w: 80, h: 140, label: 'Studio' },
    { id: '3e-rn4', type: 'room', x: 635, y: 155, w: 80, h: 140, label: 'Studio' },
    { id: '3e-rn5', type: 'room', x: 715, y: 155, w: 80, h: 140, label: 'Studio' },
    { id: '3e-rs1', type: 'room', x: 160, y: 335, w: 140, h: 180, label: 'Studio' },
    { id: '3e-rs2', type: 'room', x: 300, y: 335, w: 140, h: 180, label: 'Studio' },
    { id: '3e-rs3', type: 'room', x: 440, y: 335, w: 140, h: 180, label: 'Studio' },
    { id: '3e-rs4', type: 'room', x: 580, y: 335, w: 140, h: 180, label: 'Studio' },
  ],
}

// Door gap positions per floor.
// Each entry { x, y, w } describes a small white rectangle drawn over a wall line
// to visually represent a doorway opening.
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
  3: [
    { x: 435, y: 295, w: 30 }, { x: 515, y: 295, w: 30 }, { x: 595, y: 295, w: 30 },
    { x: 675, y: 295, w: 30 }, { x: 755, y: 295, w: 30 },
    { x: 278, y: 295, w: 40 }, { x: 110, y: 295, w: 30 },
    { x: 230, y: 335, w: 30 }, { x: 370, y: 335, w: 30 },
    { x: 510, y: 335, w: 30 }, { x: 650, y: 335, w: 30 },
  ],
}

// All Points of Interest (POIs) in the building.
// Fields: id, label, icon, floor, x/y (map position), jx (corridor junction x),
// roomId (which FLOOR_ROOMS entry this belongs to), category, desc, status.
// status: 'vrij' | 'bezet' | 'gesloten'
export const ALL_POIS = [
  { id:'poi-portier',  label:'Portier',          icon:'🛡️', floor:0, x:110, y:425, jx:110, roomId:'bg-lw-i2',      category:'faciliteiten', desc:'Toegangscontrole & beveiliging',        status:'vrij'     },
  { id:'poi-receptie', label:'Receptie',         icon:'ℹ️',  floor:0, x:204, y:38,  jx:278, roomId:'bg-nw1',        category:'faciliteiten', desc:'Ontvangst, info & loketdiensten',       status:'vrij'     },
  { id:'poi-kantine',  label:'Kantine',          icon:'🍽️', floor:0, x:595, y:225, jx:595, roomId:'bg-rn3',        category:'eten',         desc:'Kantine & foodcourt 08:00–17:00',       status:'vrij'     },
  { id:'poi-wc-bg',   label:'Toiletten BG',     icon:'🚻',  floor:0, x:190, y:315, jx:190, roomId:'bg-wc',         category:'faciliteiten', desc:'Toiletten begane grond',                status:'vrij'     },
  { id:'poi-aula',    label:'Aula',             icon:'🎭',  floor:0, x:370, y:425, jx:370, roomId:'bg-rs2',        category:'onderwijs',    desc:'Grote aula, evenementen & presentaties', status:'bezet'    },
  { id:'poi-info',    label:'Informatiedesk',   icon:'📋',  floor:0, x:510, y:425, jx:510, roomId:'bg-rs3',        category:'faciliteiten', desc:'Open dag informatiepunt',               status:'vrij'     },
  { id:'poi-lift-0',  label:'Lift',             icon:'🛗',  floor:0, x:400, y:315, jx:400, roomId:'bg-lift',       category:'transport',    desc:'Lift naar alle verdiepingen'                              },
  { id:'poi-trap-0l', label:'Trap West',        icon:'🪜',  floor:0, x:248, y:315, jx:248, roomId:'bg-trap-l',     category:'transport',    desc:'Trappenhuis west'                                         },
  { id:'poi-trap-0r', label:'Trap Oost',        icon:'🪜',  floor:0, x:758, y:315, jx:758, roomId:'bg-trap-r',     category:'transport',    desc:'Trappenhuis oost'                                         },
  { id:'poi-sd',      label:'Software Dev',     icon:'💻',  floor:1, x:180, y:95,  jx:180, roomId:'1e-sd',         category:'onderwijs',    desc:'Software Development, lokaal 1.02',     status:'vrij'     },
  { id:'poi-av',      label:'Audio Visueel',    icon:'🎬',  floor:1, x:460, y:52,  jx:460, roomId:'1e-av',         category:'onderwijs',    desc:'Audio Visueel Design, lokaal 1.03',     status:'bezet'    },
  { id:'poi-ga',      label:'Game Artist',      icon:'🎮',  floor:1, x:460, y:147, jx:460, roomId:'1e-ga',         category:'onderwijs',    desc:'Game Artist, lokaal 1.04',              status:'vrij'     },
  { id:'poi-mv',      label:'Media Vormgever',  icon:'🎨',  floor:1, x:680, y:95,  jx:680, roomId:'1e-mv',         category:'onderwijs',    desc:'Media Vormgever, lokaal 1.05',          status:'gesloten' },
  { id:'poi-lokaal',  label:'Lokaal 1.01',      icon:'🚪',  floor:1, x:92,  y:420, jx:92,  roomId:'1e-lokaal',     category:'onderwijs',    desc:'Algemeen leslokaal',                    status:'gesloten' },
  { id:'poi-pet',     label:'Podium & Event',   icon:'🎤',  floor:1, x:307, y:420, jx:307, roomId:'1e-pet',        category:'onderwijs',    desc:'Podium & Evenementen Techniek',         status:'vrij'     },
  { id:'poi-ss',      label:'Sign Specialist',  icon:'🖼️', floor:1, x:615, y:420, jx:615, roomId:'1e-ss',         category:'onderwijs',    desc:'Sign Specialist, printlokaal',          status:'bezet'    },
  { id:'poi-lift-1',  label:'Lift',             icon:'🛗',  floor:1, x:400, y:260, jx:400, roomId:'1e-lift',       category:'transport',    desc:'Lift naar alle verdiepingen'                              },
  { id:'poi-trap-1l', label:'Trap West',        icon:'🪜',  floor:1, x:45,  y:260, jx:45,  roomId:'1e-trap-l',     category:'transport',    desc:'Trappenhuis west'                                         },
  { id:'poi-trap-1r', label:'Trap Oost',        icon:'🪜',  floor:1, x:755, y:260, jx:755, roomId:'1e-trap-r',     category:'transport',    desc:'Trappenhuis oost'                                         },
  { id:'poi-mr',      label:'Media Redactie',   icon:'📰',  floor:2, x:225, y:95,  jx:225, roomId:'2e-mr',         category:'onderwijs',    desc:'Media Redactie, lokaal 2.01',           status:'vrij'     },
  { id:'poi-cp',      label:'Creatieve Prod.',  icon:'🎞️', floor:2, x:620, y:162, jx:620, roomId:'2e-cp',         category:'onderwijs',    desc:'Creatieve Productie, studio',           status:'bezet'    },
  { id:'poi-id',      label:'Immersive Design', icon:'🥽',  floor:2, x:225, y:260, jx:225, roomId:'2e-id',         category:'onderwijs',    desc:'Immersive Designer, XR lab',            status:'vrij'     },
  { id:'poi-wc-2',   label:'Toiletten 2e',     icon:'🚻',  floor:2, x:102, y:460, jx:102, roomId:'2e-toiletten',  category:'faciliteiten', desc:'Toiletten tweede verdieping',           status:'vrij'     },
  { id:'poi-rv',      label:'Ruimtelijk VMG',   icon:'🏗️', floor:2, x:322, y:460, jx:322, roomId:'2e-rv',         category:'onderwijs',    desc:'Ruimtelijk Visueel Merchandiser',       status:'gesloten' },
  { id:'poi-aam',     label:'All Around Media', icon:'📡',  floor:2, x:620, y:460, jx:620, roomId:'2e-aam',        category:'onderwijs',    desc:'All Around Mediamaker, lokaal 2.05',    status:'vrij'     },
  { id:'poi-lift-2',  label:'Lift',             icon:'🛗',  floor:2, x:400, y:370, jx:400, roomId:'2e-lift',       category:'transport',    desc:'Lift naar alle verdiepingen'                              },
  { id:'poi-trap-2l', label:'Trap West',        icon:'🪜',  floor:2, x:45,  y:370, jx:45,  roomId:'2e-trap-l',     category:'transport',    desc:'Trappenhuis west'                                         },
  { id:'poi-trap-2r', label:'Trap Oost',        icon:'🪜',  floor:2, x:755, y:370, jx:755, roomId:'2e-trap-r',     category:'transport',    desc:'Trappenhuis oost'                                         },
  // ── 3e Verdieping ─────────────────────────────────────────────────────────
  { id:'poi-radio',   label:'Radio Studio',     icon:'🎙️', floor:3, x:204, y:38,  jx:278, roomId:'3e-nw1',   category:'onderwijs',    desc:'Radio productie studio',               status:'vrij'     },
  { id:'poi-tv',      label:'TV Studio',        icon:'📺',  floor:3, x:450, y:225, jx:450, roomId:'3e-rn2',   category:'onderwijs',    desc:'Televisie productiestudio',             status:'bezet'    },
  { id:'poi-post',    label:'Post-productie',   icon:'🎞️', floor:3, x:595, y:225, jx:595, roomId:'3e-rn3',   category:'onderwijs',    desc:'Video editing & color grading',        status:'vrij'     },
  { id:'poi-xr',      label:'XR Lab',           icon:'🥽',  floor:3, x:650, y:425, jx:650, roomId:'3e-rs4',   category:'onderwijs',    desc:'Extended reality lab (VR/AR)',          status:'gesloten' },
  { id:'poi-pod',     label:'Podcaststudio',    icon:'🎧',  floor:3, x:370, y:425, jx:370, roomId:'3e-rs2',   category:'onderwijs',    desc:'Podcast opnamestudio',                 status:'vrij'     },
  { id:'poi-wc-3',    label:'Toiletten 3e',     icon:'🚻',  floor:3, x:190, y:315, jx:190, roomId:'3e-wc',    category:'faciliteiten', desc:'Toiletten derde verdieping',           status:'vrij'     },
  { id:'poi-lift-3',  label:'Lift',             icon:'🛗',  floor:3, x:400, y:315, jx:400, roomId:'3e-lift',  category:'transport',    desc:'Lift naar alle verdiepingen'                              },
  { id:'poi-trap-3l', label:'Trap West',        icon:'🪜',  floor:3, x:248, y:315, jx:248, roomId:'3e-trap-l', category:'transport',   desc:'Trappenhuis west'                                         },
  { id:'poi-trap-3r', label:'Trap Oost',        icon:'🪜',  floor:3, x:758, y:315, jx:758, roomId:'3e-trap-r', category:'transport',   desc:'Trappenhuis oost'                                         },
]

// Category definitions used to build the filter tab strip (excludes transport).
// Each has an id, a display label, and an emoji icon.
export const CATEGORIES = [
  { id: 'all',          label: 'Alles',        icon: '🔍' },
  { id: 'onderwijs',    label: 'Opleidingen',  icon: '🎓' },
  { id: 'eten',         label: 'Eten',         icon: '🍽️' },
  { id: 'faciliteiten', label: 'Faciliteiten', icon: '🛠️' },
  { id: 'transport',    label: 'Transport',    icon: '🚶' },
]
