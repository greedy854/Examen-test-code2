import { ALL_POIS, CORRIDOR_Y, ELEVATOR_X, FLOORS } from '../data/building'

// ── L-shaped path helpers ─────────────────────────────────────────────────────
// Instead of drawing a diagonal straight line from a POI to the main corridor,
// we route via the actual corridor spine: horizontal first to align with jx,
// then vertical along the corridor to the main corridor level (or vice-versa).

/**
 * Waypoints walking FROM a POI INTO the main corridor junction.
 * Returns an array of intermediate waypoints (not including the POI start).
 */
function toJunction(poi, corridorY) {
  const wps = []
  const atCorridor = Math.abs(poi.y - corridorY) < 2

  if (atCorridor) {
    // Already on the corridor — just move horizontally if needed
    if (poi.x !== poi.jx) wps.push({ x: poi.jx, y: corridorY, floor: poi.floor })
  } else if (poi.y < corridorY) {
    // Room is NORTH of main corridor (e.g. north wing, east rooms above corridor)
    // Step 1 — move horizontally inside the room to align with the corridor spine (jx)
    if (poi.x !== poi.jx) wps.push({ x: poi.jx, y: poi.y, floor: poi.floor })
    // Step 2 — walk south along the spine down to the main corridor
    wps.push({ x: poi.jx, y: corridorY, floor: poi.floor })
  } else {
    // Room is SOUTH of main corridor (south rooms, left-wing lower rooms)
    // Step 1 — walk north along the room's axis up to the corridor
    if (poi.x !== poi.jx) wps.push({ x: poi.x, y: corridorY, floor: poi.floor })
    // Step 2 — slide along corridor to junction x (usually a no-op since jx == poi.x for south rooms)
    wps.push({ x: poi.jx, y: corridorY, floor: poi.floor })
  }
  return wps
}

/**
 * Waypoints walking FROM the main corridor junction INTO a destination POI.
 * Mirror image of toJunction — corridor first, then into the room.
 */
function fromJunction(poi, corridorY) {
  const wps = []
  const atCorridor = Math.abs(poi.y - corridorY) < 2

  if (atCorridor) {
    if (poi.x !== poi.jx) wps.push({ x: poi.x, y: corridorY, floor: poi.floor })
  } else if (poi.y < corridorY) {
    // Room is NORTH — walk up the spine to the room's y level, then into the room
    if (poi.y !== corridorY) wps.push({ x: poi.jx, y: poi.y, floor: poi.floor })
    if (poi.x !== poi.jx)   wps.push({ x: poi.x,  y: poi.y, floor: poi.floor })
  } else {
    // Room is SOUTH — walk south from corridor into the room
    wps.push({ x: poi.jx, y: poi.y, floor: poi.floor })
    if (poi.x !== poi.jx) wps.push({ x: poi.x, y: poi.y, floor: poi.floor })
  }
  return wps
}

// Returns true when a POI sits exactly on the main corridor spine (no detour needed)
const onCorridor = (poi) =>
  poi.x === poi.jx && Math.abs(poi.y - CORRIDOR_Y[poi.floor]) < 2

// Converts a cardinal direction string to its Dutch equivalent for step text
const dutchDir = (dir) => dir === 'east' ? 'oostwaarts' : 'westwaarts'

// Converts a cardinal direction string to its English equivalent for step text
const englishDir = (dir) => dir === 'east' ? 'east' : 'west'

// ── Main routing function ─────────────────────────────────────────────────────
// Computes a full route between two POI ids, including waypoints and human-readable steps.
// Returns null if either POI is not found or origin equals destination.
// options.lang: 'nl' (default) | 'en' — controls step text language
export function computeRoute(originId, destinationId, options = {}) {
  const lang = options.lang === 'en' ? 'en' : 'nl'
  const origin      = ALL_POIS.find(p => p.id === originId)
  const destination = ALL_POIS.find(p => p.id === destinationId)
  if (!origin || !destination || origin.id === destination.id) return null

  // Ordered list of { x, y, floor } coordinates that form the walking path
  const waypoints = []  // [{ x, y, floor }]
  // Ordered list of human-readable instruction steps for the sidebar
  const steps     = []  // [{ icon, text, type }]

  // Corridor Y level for the origin and destination floors
  const oCY = CORRIDOR_Y[origin.floor]
  const dCY = CORRIDOR_Y[destination.floor]

  // ── Localised step text helpers ────────────────────────────────────────────
  const t = {
    start:     lang === 'en' ? `Start at ${origin.label}`            : `Start bij ${origin.label}`,
    toGang:    lang === 'en' ? 'Walk to the corridor'                 : 'Loop naar de gang',
    enter:     lang === 'en' ? `Enter ${destination.label}`           : `Ga ${destination.label} binnen`,
    arrive:    lang === 'en' ? `Arrived at ${destination.label}`      : `Aangekomen bij ${destination.label}`,
    elevator:  lang === 'en'
      ? `Take the elevator to ${FLOORS[destination.floor].name}`
      : `Neem de lift naar ${FLOORS[destination.floor].name}`,
    walkGang:  (dir, dist) => lang === 'en'
      ? `Walk ${englishDir(dir)} through the corridor (~${dist} m)`
      : `Loop ${dutchDir(dir)} door de gang (~${dist} m)`,
    walkLift:  (dir, dist) => lang === 'en'
      ? `Walk ${englishDir(dir)} to the elevator (~${dist} m)`
      : `Loop ${dutchDir(dir)} naar de lift (~${dist} m)`,
  }

  // ── Start ──────────────────────────────────────────────────────────────────
  waypoints.push({ x: origin.x, y: origin.y, floor: origin.floor })
  steps.push({ icon: 'start', text: t.start, type: 'start' })

  // ── Walk from origin to main corridor junction ─────────────────────────────
  if (!onCorridor(origin)) {
    const jWps = toJunction(origin, oCY)
    jWps.forEach(wp => waypoints.push(wp))
    steps.push({ icon: 'walk', text: t.toGang, type: 'walk' })
  }

  // ── Same floor ─────────────────────────────────────────────────────────────
  if (origin.floor === destination.floor) {
    if (origin.jx !== destination.jx) {
      // Walk along the main corridor to the destination's junction
      waypoints.push({ x: destination.jx, y: oCY, floor: origin.floor })
      const dir  = destination.jx > origin.jx ? 'east' : 'west'
      const dist = Math.max(1, Math.round(Math.abs(destination.jx - origin.jx) * 0.08))
      steps.push({
        icon: 'walk',
        text: t.walkGang(dir, dist),
        type: 'walk',
      })
    }

  // ── Different floors — via elevator ────────────────────────────────────────
  } else {
    if (origin.jx !== ELEVATOR_X) {
      waypoints.push({ x: ELEVATOR_X, y: oCY, floor: origin.floor })
      const dir  = ELEVATOR_X > origin.jx ? 'east' : 'west'
      const dist = Math.max(1, Math.round(Math.abs(ELEVATOR_X - origin.jx) * 0.08))
      steps.push({
        icon: 'walk',
        text: t.walkLift(dir, dist),
        type: 'walk',
      })
    }

    // The elevator jump: a single waypoint switches from the origin floor to the destination floor
    waypoints.push({ x: ELEVATOR_X, y: dCY, floor: destination.floor })
    steps.push({
      icon: 'elevator',
      text: t.elevator,
      type: 'elevator',
    })

    if (ELEVATOR_X !== destination.jx) {
      waypoints.push({ x: destination.jx, y: dCY, floor: destination.floor })
      const dir  = destination.jx > ELEVATOR_X ? 'east' : 'west'
      const dist = Math.max(1, Math.round(Math.abs(destination.jx - ELEVATOR_X) * 0.08))
      steps.push({
        icon: 'walk',
        text: t.walkGang(dir, dist),
        type: 'walk',
      })
    }
  }

  // ── Walk from main corridor junction into destination ──────────────────────
  if (!onCorridor(destination)) {
    const jWps = fromJunction(destination, dCY)
    jWps.forEach(wp => waypoints.push(wp))
    steps.push({ icon: 'enter', text: t.enter, type: 'enter' })
  }

  steps.push({ icon: 'arrive', text: t.arrive, type: 'arrive' })

  // ── Distance / time ────────────────────────────────────────────────────────
  // Sum the Euclidean distance of each same-floor segment (cross-floor jumps are excluded)
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
    // Scale from SVG units to metres (factor 0.08) and clamp to at least 1
    totalDistance:    Math.max(1, Math.round(totalDist * 0.08)),
    // Assume average walking speed of 60 m/min
    totalMinutes:     Math.max(1, Math.round((totalDist * 0.08) / 60)),
    multiFloor:       origin.floor !== destination.floor,
    originFloor:      origin.floor,
    destinationFloor: destination.floor,
  }
}

// ── SVG helpers ───────────────────────────────────────────────────────────────
// Return only waypoints visible on a given floor
export function floorWaypoints(waypoints, floor) {
  return waypoints.filter(wp => wp.floor === floor)
}

// Convert waypoints to an SVG path string (M/L commands)
export function waypointsToPath(waypoints) {
  if (waypoints.length < 2) return ''
  return waypoints.map((wp, i) => `${i === 0 ? 'M' : 'L'}${wp.x},${wp.y}`).join(' ')
}

/**
 * Interpolate a position along the full waypoint path at progress 0–1.
 * Returns { x, y, floor } with floor switching at the midpoint of each segment.
 */
export function getPositionAtProgress(waypoints, progress) {
  if (!waypoints || waypoints.length < 2) return null
  if (progress <= 0) return { ...waypoints[0] }
  if (progress >= 1) return { ...waypoints[waypoints.length - 1] }

  // Build segment list with lengths
  let totalLen = 0
  const segs = []
  for (let i = 1; i < waypoints.length; i++) {
    const a = waypoints[i - 1], b = waypoints[i]
    // Use at least length 1 to avoid division by zero on zero-length segments
    const len = Math.max(Math.hypot(b.x - a.x, b.y - a.y), 1)
    segs.push({ a, b, len })
    totalLen += len
  }

  // Walk through segments until we find the one that contains the requested progress point
  let remaining = progress * totalLen
  for (const seg of segs) {
    if (remaining <= seg.len) {
      // t is the fraction along this segment (0 = start, 1 = end)
      const t = remaining / seg.len
      return {
        x:     seg.a.x + (seg.b.x - seg.a.x) * t,
        y:     seg.a.y + (seg.b.y - seg.a.y) * t,
        // Switch to the destination floor in the second half of the segment
        floor: t < 0.5 ? seg.a.floor : seg.b.floor,
      }
    }
    remaining -= seg.len
  }
  return { ...waypoints[waypoints.length - 1] }
}
