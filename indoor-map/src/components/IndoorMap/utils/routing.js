import {
  ALL_POIS, CORRIDOR_Y, ELEVATOR_X,
  STAIR_WEST, STAIR_EAST, FLOORS,
  FLOOR3_DIAG, diag3X,
} from '../data/building'

// ── East-wing routing ─────────────────────────────────────────────────────────
// Some POIs sit in a physically separate wing that is not connected to the main
// building by a walkable pixel path. Those POIs carry an `eastWing` object:
//   { entryX, entryY }  — the point inside the wing where routing enters/exits
//   { exitX,  exitY  }  — the corresponding point on the main-building corridor
// Routing draws a segment WITHIN each section and uses a visual break (SVG "M")
// across the gap — the path never draws through dark/exterior pixels.

// ── Floor 3 diagonal corridor helpers ────────────────────────────────────────
// Floor 3 has a diagonal corridor instead of a horizontal one.
// All routing on floor 3 uses these helpers rather than the standard L-shaped logic.

/** X position on the floor-3 diagonal at a given y level */
function f3X(y) { return diag3X(y) }

/**
 * Insert intermediate FLOOR3_DIAG waypoints between fromY and toY.
 * Returns an array of {x, y, floor:3} covering the stretch of the diagonal
 * from fromY (exclusive) to toY (inclusive).
 */
function diag3Waypoints(fromY, toY) {
  const pts   = []
  const going = toY > fromY ? 1 : -1
  const diag  = going > 0 ? FLOOR3_DIAG : [...FLOOR3_DIAG].reverse()
  for (const wp of diag) {
    if (going > 0 && wp.y > fromY && wp.y < toY) pts.push({ x: wp.x, y: wp.y, floor: 3 })
    if (going < 0 && wp.y < fromY && wp.y > toY) pts.push({ x: wp.x, y: wp.y, floor: 3 })
  }
  pts.push({ x: f3X(toY), y: toY, floor: 3 })
  return pts
}

// ── L-shaped path helpers (floors 0, 1, 2) ───────────────────────────────────
/**
 * Waypoints walking FROM a POI INTO the main horizontal corridor junction.
 * Returns intermediate waypoints (not including the POI start point).
 *
 * If a POI has a `jy` field it defines an intermediate y-level where the
 * room opens into the NS corridor without crossing a wall (e.g. y=195 at
 * the bottom of the floor-1 north wing where the gang widens).  The path
 * then becomes a Z-shape:  (poi.x, poi.y) → (poi.x, jy) → (jx, jy) → (jx, corridorY)
 */
function toJunction(poi, corridorY) {
  const wps = []
  const atCorridor = Math.abs(poi.y - corridorY) < 2

  if (atCorridor) {
    if (poi.x !== poi.jx) wps.push({ x: poi.jx, y: corridorY, floor: poi.floor })
  } else if (poi.y < corridorY) {
    // Room is NORTH (above) of corridor
    if (poi.jy !== undefined) {
      // Z-shape: down to open corridor zone (jy), across to NS corridor, down to main corridor
      if (poi.y !== poi.jy)   wps.push({ x: poi.x,  y: poi.jy,   floor: poi.floor })
      if (poi.x !== poi.jx)   wps.push({ x: poi.jx, y: poi.jy,   floor: poi.floor })
                               wps.push({ x: poi.jx, y: corridorY, floor: poi.floor })
    } else {
      // Standard L-shape: horizontal to jx, then down to corridor
      if (poi.x !== poi.jx) wps.push({ x: poi.jx, y: poi.y, floor: poi.floor })
      wps.push({ x: poi.jx, y: corridorY, floor: poi.floor })
    }
  } else {
    // Room is SOUTH (below) of corridor
    if (poi.x !== poi.jx) wps.push({ x: poi.x, y: corridorY, floor: poi.floor })
    wps.push({ x: poi.jx, y: corridorY, floor: poi.floor })
  }
  return wps
}

/**
 * Waypoints walking FROM the corridor junction INTO a destination POI.
 * Mirror of toJunction — uses `jy` the same way.
 */
function fromJunction(poi, corridorY) {
  const wps = []
  const atCorridor = Math.abs(poi.y - corridorY) < 2

  if (atCorridor) {
    if (poi.x !== poi.jx) wps.push({ x: poi.x, y: corridorY, floor: poi.floor })
  } else if (poi.y < corridorY) {
    // Room is NORTH (above) of corridor
    if (poi.jy !== undefined) {
      // Z-shape: up to open corridor zone (jy), across to poi.x, then up to poi.y
      wps.push({ x: poi.jx, y: poi.jy,  floor: poi.floor })
      if (poi.x !== poi.jx) wps.push({ x: poi.x, y: poi.jy,  floor: poi.floor })
      if (poi.y !== poi.jy)  wps.push({ x: poi.x, y: poi.y,   floor: poi.floor })
    } else {
      // Standard: up to poi.y at jx, then horizontal to poi.x
      if (poi.y !== corridorY) wps.push({ x: poi.jx, y: poi.y, floor: poi.floor })
      if (poi.x !== poi.jx)   wps.push({ x: poi.x,  y: poi.y, floor: poi.floor })
    }
  } else {
    // Room is SOUTH (below) of corridor
    wps.push({ x: poi.jx, y: poi.y, floor: poi.floor })
    if (poi.x !== poi.jx) wps.push({ x: poi.x, y: poi.y, floor: poi.floor })
  }
  return wps
}

// Returns true when a POI sits exactly on the main horizontal corridor spine
const onCorridor = (poi) =>
  poi.x === poi.jx && Math.abs(poi.y - CORRIDOR_Y[poi.floor]) < 2

const dutchDir  = (dir) => dir === 'east' ? 'oostwaarts' : 'westwaarts'
const englishDir = (dir) => dir === 'east' ? 'east'       : 'west'

// ── Main routing function ─────────────────────────────────────────────────────
export function computeRoute(originId, destinationId, options = {}) {
  const lang      = options.lang      === 'en'    ? 'en'    : 'nl'
  const transport = options.transport === 'stairs' ? 'stairs': 'elevator'

  const origin      = ALL_POIS.find(p => p.id === originId)
  const destination = ALL_POIS.find(p => p.id === destinationId)
  if (!origin || !destination || origin.id === destination.id) return null

  // East-wing flags — true when a POI lives in the physically separated east wing
  const originIsEW = !!(origin.eastWing)
  const destIsEW   = !!(destination.eastWing)

  const waypoints = []
  const steps     = []

  const oCY = CORRIDOR_Y[origin.floor]
  const dCY = CORRIDOR_Y[destination.floor]

  // ── Stair shaft picker ─────────────────────────────────────────────────────
  // For floor 3, both stair positions equal the single staircase (STAIR_WEST[3]=STAIR_EAST[3]),
  // so useWestShaft is always true — that's fine, we just want stairX() to return a valid x.
  const useWestShaft =
    Math.abs(origin.jx - STAIR_WEST[origin.floor]) <=
    Math.abs(origin.jx - STAIR_EAST[origin.floor])
  const stairX = (floor) => useWestShaft ? STAIR_WEST[floor] : STAIR_EAST[floor]

  // ── Step text templates ────────────────────────────────────────────────────
  const t = {
    start:     lang === 'en' ? `Start at ${origin.label}`       : `Start bij ${origin.label}`,
    toGang:    lang === 'en' ? 'Walk to the corridor'            : 'Loop naar de gang',
    enter:     lang === 'en' ? `Enter ${destination.label}`      : `Ga ${destination.label} binnen`,
    arrive:    lang === 'en' ? `Arrived at ${destination.label}` : `Aangekomen bij ${destination.label}`,
    elevator:  lang === 'en'
      ? `Take the elevator to ${FLOORS[destination.floor].name}`
      : `Neem de lift naar ${FLOORS[destination.floor].name}`,
    stairStep: (floorName, going) => lang === 'en'
      ? `Walk ${going > 0 ? 'up' : 'down'} the stairs to ${floorName}`
      : `Neem de trap ${going > 0 ? 'omhoog' : 'omlaag'} naar ${floorName}`,
    walkGang:  (dir, dist) => lang === 'en'
      ? `Walk ${englishDir(dir)} through the corridor (~${dist} m)`
      : `Loop ${dutchDir(dir)} door de gang (~${dist} m)`,
    walkLift:  (dir, dist) => lang === 'en'
      ? `Walk ${englishDir(dir)} to the elevator (~${dist} m)`
      : `Loop ${dutchDir(dir)} naar de lift (~${dist} m)`,
    walkStair: (dir, dist) => lang === 'en'
      ? `Walk ${englishDir(dir)} to the stairs (~${dist} m)`
      : `Loop ${dutchDir(dir)} naar de trap (~${dist} m)`,
    walkDiag:  lang === 'en' ? 'Walk along the corridor' : 'Loop door de gang',
  }

  // ── Start ──────────────────────────────────────────────────────────────────
  waypoints.push({ x: origin.x, y: origin.y, floor: origin.floor })
  steps.push({ icon: 'start', text: t.start, type: 'start' })

  // ── Helper: get from any floor-3 POI to the diagonal corridor entry ────────
  // Two-step path prevents the route from drawing through the diagonal corridor walls:
  //   1. POI → doorX (horizontal, stays within the room)
  //   2. doorX → corridor centre (horizontal, stays within the corridor)
  // Transport POIs that have no doorX go directly to the corridor centre (they
  // are already sitting inside the corridor strip).
  function floor3ToCorridor(poi) {
    const cx = f3X(poi.y)
    const wps = []
    if (poi.doorX !== undefined && poi.doorX !== poi.x) {
      // Step 1: move to the room-side corridor wall (stays within the room)
      wps.push({ x: poi.doorX, y: poi.y, floor: 3 })
    }
    // Step 2: move to corridor centre (stays within the corridor)
    const lastX = poi.doorX !== undefined ? poi.doorX : poi.x
    if (cx !== lastX) {
      wps.push({ x: cx, y: poi.y, floor: 3 })
    }
    return wps
  }

  // ── Helper: get from the diagonal corridor into a floor-3 POI ──────────────
  // Mirror of floor3ToCorridor: corridor centre → doorX → POI.
  function floor3FromCorridor(poi) {
    const cx = f3X(poi.y)
    const wps = []
    if (poi.doorX !== undefined && poi.doorX !== cx) {
      // Step 1: move to the room-side corridor wall (stays within the corridor)
      wps.push({ x: poi.doorX, y: poi.y, floor: 3 })
    }
    // Step 2: move to the POI (stays within the room)
    const lastX = poi.doorX !== undefined ? poi.doorX : cx
    if (poi.x !== lastX) {
      wps.push({ x: poi.x, y: poi.y, floor: 3 })
    }
    return wps
  }

  // ── Walk from origin to main corridor ──────────────────────────────────────
  if (origin.floor === 3) {
    // Floor 3: go horizontally to the diagonal corridor at origin's y level
    floor3ToCorridor(origin).forEach(wp => waypoints.push(wp))
    if (!onCorridor(origin)) steps.push({ icon: 'walk', text: t.toGang, type: 'walk' })
  } else if (originIsEW) {
    // East-wing: short horizontal step within the wing to the entry point,
    // then a visual break (SVG M — no line drawn) to the main-building corridor.
    // entryX/Y is at the POI's own y-level so no long vertical crosses rotated walls.
    const oEW = origin.eastWing
    if (origin.x !== oEW.entryX) {
      waypoints.push({ x: oEW.entryX, y: oEW.entryY, floor: origin.floor })
    }
    waypoints.push({ x: oEW.exitX, y: oEW.exitY, floor: origin.floor, break: true })
    if (!onCorridor(origin)) steps.push({ icon: 'walk', text: t.toGang, type: 'walk' })
  } else {
    if (!onCorridor(origin)) {
      toJunction(origin, oCY).forEach(wp => waypoints.push(wp))
      steps.push({ icon: 'walk', text: t.toGang, type: 'walk' })
    }
  }

  // ── Same floor ─────────────────────────────────────────────────────────────
  if (origin.floor === destination.floor) {

    if (origin.floor === 3) {
      // ── Floor 3 same-floor: route along the diagonal corridor ──────────────
      // We are currently at (f3X(origin.y), origin.y); walk diagonal to dest y
      const destCorrY = destination.y
      if (Math.abs(origin.y - destCorrY) > 2) {
        diag3Waypoints(origin.y, destCorrY).forEach(wp => waypoints.push(wp))
        steps.push({ icon: 'walk', text: t.walkDiag, type: 'walk' })
      }
      // fromJunction on floor 3: horizontal into destination room
      floor3FromCorridor(destination).forEach(wp => waypoints.push(wp))

    } else {
      // ── Normal same-floor: horizontal movement along corridor ──────────────
      // East-wing POIs are effectively at their exitX on the main-building corridor.
      const effOriginJx = originIsEW ? origin.eastWing.exitX      : origin.jx
      const effDestJx   = destIsEW   ? destination.eastWing.exitX : destination.jx
      if (effOriginJx !== effDestJx) {
        waypoints.push({ x: effDestJx, y: oCY, floor: origin.floor })
        const dir  = effDestJx > effOriginJx ? 'east' : 'west'
        const dist = Math.max(1, Math.round(Math.abs(effDestJx - effOriginJx) * 0.08))
        steps.push({ icon: 'walk', text: t.walkGang(dir, dist), type: 'walk' })
      }
    }

  // ── Different floors — via STAIRS ──────────────────────────────────────────
  } else if (transport === 'stairs') {

    // ── Origin-floor: walk to the stairwell ───────────────────────────────────
    if (origin.floor === 3) {
      // On floor 3, stairX(3) = STAIR_WEST[3] = 349 (top of diagonal)
      const sy = CORRIDOR_Y[3]   // stair Y = 165 (where the stair sits on the diagonal)
      const sx = stairX(3)       // stair X = 349
      // Already at diagonal; walk along diagonal from origin.y up to stair y
      if (Math.abs(origin.y - sy) > 2) {
        diag3Waypoints(origin.y, sy).forEach(wp => waypoints.push(wp))
        steps.push({ icon: 'walk', text: t.walkDiag, type: 'walk' })
      }
    } else {
      // Normal floors 0-2: walk along horizontal corridor to stair x
      // East-wing origins are already at exitX on the corridor after the break waypoint.
      const sx0 = stairX(origin.floor)
      const effOriginJx0 = originIsEW ? origin.eastWing.exitX : origin.jx
      if (effOriginJx0 !== sx0) {
        waypoints.push({ x: sx0, y: oCY, floor: origin.floor })
        const dir  = sx0 > effOriginJx0 ? 'east' : 'west'
        const dist = Math.max(1, Math.round(Math.abs(sx0 - effOriginJx0) * 0.08))
        steps.push({ icon: 'walk', text: t.walkStair(dir, dist), type: 'walk' })
      }
    }

    // ── Walk floor by floor up/down the staircase ─────────────────────────────
    const floorDir  = destination.floor > origin.floor ? 1 : -1
    const dwellDist = useWestShaft ? 80 : -80  // short corridor dwell on intermediate floors

    for (let f = origin.floor + floorDir; ; f += floorDir) {
      const sx = stairX(f)

      if (f === 3) {
        // ── Arriving at floor 3 ─────────────────────────────────────────────
        // Land at the stair entry point on the floor-3 diagonal
        const sy = CORRIDOR_Y[3]   // = 165, stair Y on the diagonal
        waypoints.push({ x: sx, y: sy, floor: 3 })
        steps.push({ icon: 'stairs', text: t.stairStep(FLOORS[3].name, floorDir), type: 'stairs' })

        if (f !== destination.floor) {
          // Intermediate floor-3 dwell: walk a bit along the diagonal then return
          diag3Waypoints(sy, sy + dwellDist * 2).forEach(wp => waypoints.push(wp))
          diag3Waypoints(sy + dwellDist * 2, sy).forEach(wp => waypoints.push(wp))
        } else {
          // Final destination is floor 3: route along diagonal to dest
          if (Math.abs(sy - destination.y) > 2) {
            diag3Waypoints(sy, destination.y).forEach(wp => waypoints.push(wp))
          }
          floor3FromCorridor(destination).forEach(wp => waypoints.push(wp))
        }

      } else if (origin.floor === 3 && f === origin.floor + floorDir) {
        // ── Leaving floor 3 (transition from diagonal to horizontal corridor) ─
        const cy = CORRIDOR_Y[f]
        waypoints.push({ x: sx, y: cy, floor: f })
        steps.push({ icon: 'stairs', text: t.stairStep(FLOORS[f].name, floorDir), type: 'stairs' })

        if (f !== destination.floor) {
          waypoints.push({ x: sx + dwellDist, y: cy, floor: f })
          waypoints.push({ x: sx,             y: cy, floor: f })
        }

      } else {
        // ── Normal floor (0, 1, or 2) ──────────────────────────────────────────
        const cy = CORRIDOR_Y[f]
        waypoints.push({ x: sx, y: cy, floor: f })
        steps.push({ icon: 'stairs', text: t.stairStep(FLOORS[f].name, floorDir), type: 'stairs' })

        if (f !== destination.floor) {
          waypoints.push({ x: sx + dwellDist, y: cy, floor: f })
          waypoints.push({ x: sx,             y: cy, floor: f })
        }
      }

      if (f === destination.floor) break
    }

    // ── Walk from stair landing to destination (non-floor-3 destinations) ────
    if (destination.floor !== 3) {
      if (destIsEW) {
        // East-wing destination: walk corridor from stair landing to exitX,
        // then the break + east-wing path is added below.
        const dEW    = destination.eastWing
        const sxDest = stairX(destination.floor)
        if (sxDest !== dEW.exitX) {
          waypoints.push({ x: dEW.exitX, y: dCY, floor: destination.floor })
          const dir  = dEW.exitX > sxDest ? 'east' : 'west'
          const dist = Math.max(1, Math.round(Math.abs(dEW.exitX - sxDest) * 0.08))
          steps.push({ icon: 'walk', text: t.walkGang(dir, dist), type: 'walk' })
        }
      } else {
        const sxDest = stairX(destination.floor)
        if (sxDest !== destination.jx) {
          waypoints.push({ x: destination.jx, y: dCY, floor: destination.floor })
          const dir  = destination.jx > sxDest ? 'east' : 'west'
          const dist = Math.max(1, Math.round(Math.abs(destination.jx - sxDest) * 0.08))
          steps.push({ icon: 'walk', text: t.walkGang(dir, dist), type: 'walk' })
        }
      }
    }
    // (floor-3 destination already handled inside the loop above)

  // ── Different floors — via ELEVATOR ──────────────────────────────────────
  } else {
    if (origin.floor !== 3) {
      // East-wing origins are already at exitX on the corridor after the break waypoint.
      const effOriginJxElev = originIsEW ? origin.eastWing.exitX : origin.jx
      if (ELEVATOR_X !== effOriginJxElev) {
        waypoints.push({ x: ELEVATOR_X, y: oCY, floor: origin.floor })
        const dir  = ELEVATOR_X > effOriginJxElev ? 'east' : 'west'
        const dist = Math.max(1, Math.round(Math.abs(ELEVATOR_X - effOriginJxElev) * 0.08))
        steps.push({ icon: 'walk', text: t.walkLift(dir, dist), type: 'walk' })
      }
    }

    // Elevator jump (teleport between floors)
    if (destination.floor !== 3) {
      waypoints.push({ x: ELEVATOR_X, y: dCY, floor: destination.floor })
    } else {
      // Arriving at floor 3 via elevator: land at lift POI position
      const lift3 = ALL_POIS.find(p => p.id === 'poi-lift-3')
      const lx = lift3 ? lift3.x : f3X(385)
      const ly = lift3 ? lift3.y : 385
      waypoints.push({ x: lx, y: ly, floor: 3 })
    }
    steps.push({ icon: 'elevator', text: t.elevator, type: 'elevator' })

    if (destination.floor !== 3 && !destIsEW && ELEVATOR_X !== destination.jx) {
      waypoints.push({ x: destination.jx, y: dCY, floor: destination.floor })
      const dir  = destination.jx > ELEVATOR_X ? 'east' : 'west'
      const dist = Math.max(1, Math.round(Math.abs(destination.jx - ELEVATOR_X) * 0.08))
      steps.push({ icon: 'walk', text: t.walkGang(dir, dist), type: 'walk' })
    } else if (destIsEW) {
      // East-wing via elevator: walk from elevator to exitX first
      const dEWElev = destination.eastWing
      if (ELEVATOR_X !== dEWElev.exitX) {
        waypoints.push({ x: dEWElev.exitX, y: dCY, floor: destination.floor })
        const dir  = dEWElev.exitX > ELEVATOR_X ? 'east' : 'west'
        const dist = Math.max(1, Math.round(Math.abs(dEWElev.exitX - ELEVATOR_X) * 0.08))
        steps.push({ icon: 'walk', text: t.walkGang(dir, dist), type: 'walk' })
      }
    } else if (destination.floor === 3) {
      // Route from lift to destination along the diagonal
      const lift3 = ALL_POIS.find(p => p.id === 'poi-lift-3')
      const liftY = lift3 ? lift3.y : 385
      if (Math.abs(liftY - destination.y) > 2) {
        diag3Waypoints(liftY, destination.y).forEach(wp => waypoints.push(wp))
      }
    }
  }

  // ── Walk from corridor junction into destination (floors 0, 1, 2) ─────────
  if (destination.floor !== 3) {
    if (destIsEW) {
      // East-wing destination: visual break to the entry point (at POI y-level),
      // then a short horizontal step to the POI — never a long vertical through rotated walls.
      const dEWFin = destination.eastWing
      waypoints.push({ x: dEWFin.entryX, y: dEWFin.entryY, floor: destination.floor, break: true })
      if (destination.x !== dEWFin.entryX) {
        waypoints.push({ x: destination.x, y: destination.y, floor: destination.floor })
      }
      steps.push({ icon: 'enter', text: t.enter, type: 'enter' })
    } else if (!onCorridor(destination)) {
      fromJunction(destination, dCY).forEach(wp => waypoints.push(wp))
      steps.push({ icon: 'enter', text: t.enter, type: 'enter' })
    }
  }

  steps.push({ icon: 'arrive', text: t.arrive, type: 'arrive' })

  // ── Distance / time ────────────────────────────────────────────────────────
  let totalDist = 0
  for (let i = 1; i < waypoints.length; i++) {
    if (waypoints[i].floor === waypoints[i - 1].floor) {
      const dx = waypoints[i].x - waypoints[i - 1].x
      const dy = waypoints[i].y - waypoints[i - 1].y
      totalDist += Math.sqrt(dx * dx + dy * dy)
    }
  }

  return {
    waypoints,
    steps,
    totalDistance:    Math.max(1, Math.round(totalDist * 0.08)),
    totalMinutes:     Math.max(1, Math.round((totalDist * 0.08) / 60)),
    multiFloor:       origin.floor !== destination.floor,
    originFloor:      origin.floor,
    destinationFloor: destination.floor,
  }
}

// ── SVG helpers ───────────────────────────────────────────────────────────────

export function floorWaypoints(waypoints, floor) {
  return waypoints.filter(wp => wp.floor === floor)
}

export function waypointsToPath(waypoints) {
  if (waypoints.length < 2) return ''
  // wp.break === true inserts a Move (M) instead of a Line (L), creating a visual
  // gap in the path without drawing a segment through walls or exterior pixels.
  return waypoints.map((wp, i) => `${(i === 0 || wp.break) ? 'M' : 'L'}${wp.x},${wp.y}`).join(' ')
}

/**
 * Interpolate a position along the full waypoint path at progress 0–1.
 * Returns { x, y, floor }.
 */
export function getPositionAtProgress(waypoints, progress) {
  if (!waypoints || waypoints.length < 2) return null
  if (progress <= 0) return { ...waypoints[0] }
  if (progress >= 1) return { ...waypoints[waypoints.length - 1] }

  let totalLen = 0
  const segs = []
  for (let i = 1; i < waypoints.length; i++) {
    const a = waypoints[i - 1], b = waypoints[i]
    const len = Math.max(Math.hypot(b.x - a.x, b.y - a.y), 1)
    segs.push({ a, b, len })
    totalLen += len
  }

  let remaining = progress * totalLen
  for (const seg of segs) {
    if (remaining <= seg.len) {
      const t = remaining / seg.len
      return {
        x:     seg.a.x + (seg.b.x - seg.a.x) * t,
        y:     seg.a.y + (seg.b.y - seg.a.y) * t,
        floor: t < 0.5 ? seg.a.floor : seg.b.floor,
      }
    }
    remaining -= seg.len
  }
  return { ...waypoints[waypoints.length - 1] }
}
