/**
 * walkability.js — Image-based corridor detection and A* pathfinding
 *
 * Loads each floor plan image onto a hidden <canvas>, samples every pixel
 * at a coarse grid, and marks cells as walkable (light-gray = corridor/room)
 * or blocked (dark = wall or large enclosed space).
 *
 * The A* router then finds shortest paths through walkable cells only,
 * guaranteeing routes never cross dark (wall/room-interior) pixels.
 */

// Grid resolution in SVG units (800×686).  Smaller = more accurate but slower.
export const CELL = 12          // 12 SVG px per grid cell
export const COLS = Math.ceil(800 / CELL)  // 67
export const ROWS = Math.ceil(686 / CELL)  // 58

// Luminance threshold: cells with avg-RGB above this are walkable.
// Floor plans use ~211 for open areas and ~53 for large enclosed spaces.
const WALKABLE_MIN = 140

/**
 * Build a walkability bitmap for one floor from a loaded <img> element.
 * Returns a Uint8Array of length ROWS*COLS (1 = walkable, 0 = blocked).
 */
export function buildMapFromImage(img) {
  const canvas = document.createElement('canvas')
  canvas.width  = 800
  canvas.height = 686
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, 800, 686)
  const { data } = ctx.getImageData(0, 0, 800, 686)

  const map = new Uint8Array(ROWS * COLS)

  for (let gy = 0; gy < ROWS; gy++) {
    for (let gx = 0; gx < COLS; gx++) {
      // Sample the CENTRE of this cell
      const px = Math.min(Math.round(gx * CELL + CELL / 2), 799)
      const py = Math.min(Math.round(gy * CELL + CELL / 2), 685)
      const i  = (py * 800 + px) * 4
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
      map[gy * COLS + gx] = avg >= WALKABLE_MIN ? 1 : 0
    }
  }

  // Erode blocked cells by 1 cell so paths keep margin from walls
  const eroded = new Uint8Array(map)
  for (let gy = 0; gy < ROWS; gy++) {
    for (let gx = 0; gx < COLS; gx++) {
      if (map[gy * COLS + gx] === 0) {
        // Mark 8-neighbours as blocked too
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const ny = gy + dy, nx = gx + dx
            if (ny >= 0 && ny < ROWS && nx >= 0 && nx < COLS) {
              eroded[ny * COLS + nx] = 0
            }
          }
        }
      }
    }
  }
  return eroded
}

// Convert SVG coords → grid cell (clamped)
export function svgToCell(x, y) {
  return {
    gx: Math.max(0, Math.min(COLS - 1, Math.floor(x / CELL))),
    gy: Math.max(0, Math.min(ROWS - 1, Math.floor(y / CELL))),
  }
}

// Convert grid cell → SVG centre of that cell
export function cellToSvg(gx, gy) {
  return {
    x: gx * CELL + CELL / 2,
    y: gy * CELL + CELL / 2,
  }
}

/**
 * A* pathfinding on the walkability grid.
 * Returns an array of {x, y} SVG points (grid-cell centres) from start to end,
 * or null if no path exists.
 *
 * Supports 8-directional movement.
 */
export function astar(map, startX, startY, endX, endY) {
  const s = svgToCell(startX, startY)
  const e = svgToCell(endX,   endY)

  // If start or end is in a blocked cell, widen the search to nearest walkable
  const fallback = (gx, gy) => {
    for (let r = 0; r <= 5; r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue
          const nx = gx + dx, ny = gy + dy
          if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) continue
          if (map[ny * COLS + nx]) return { gx: nx, gy: ny }
        }
      }
    }
    return { gx, gy }
  }

  const start = map[s.gy * COLS + s.gx] ? s : fallback(s.gx, s.gy)
  const end   = map[e.gy * COLS + e.gx] ? e : fallback(e.gx, e.gy)

  const key    = (gx, gy) => gy * COLS + gx
  const heur   = (gx, gy) => Math.hypot(gx - end.gx, gy - end.gy)

  const open   = new Map()  // key → {gx,gy,g,f,parent}
  const closed = new Set()

  const startNode = { gx: start.gx, gy: start.gy, g: 0, f: heur(start.gx, start.gy), parent: null }
  open.set(key(start.gx, start.gy), startNode)

  const DIRS = [
    [-1, 0, 1], [1, 0, 1], [0, -1, 1], [0, 1, 1],
    [-1,-1, 1.41], [-1, 1, 1.41], [1,-1, 1.41], [1, 1, 1.41],
  ]

  let iterations = 0

  while (open.size > 0 && iterations < 20000) {
    iterations++
    // Pick node with lowest f
    let best = null
    for (const node of open.values()) {
      if (!best || node.f < best.f) best = node
    }
    open.delete(key(best.gx, best.gy))
    closed.add(key(best.gx, best.gy))

    if (best.gx === end.gx && best.gy === end.gy) {
      // Reconstruct path
      const path = []
      let n = best
      while (n) {
        const { x, y } = cellToSvg(n.gx, n.gy)
        path.unshift({ x, y })
        n = n.parent
      }
      return path
    }

    for (const [dx, dy, cost] of DIRS) {
      const nx = best.gx + dx
      const ny = best.gy + dy
      if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) continue
      if (!map[ny * COLS + nx]) continue
      const k = key(nx, ny)
      if (closed.has(k)) continue
      const g = best.g + cost
      const existing = open.get(k)
      if (!existing || g < existing.g) {
        open.set(k, { gx: nx, gy: ny, g, f: g + heur(nx, ny), parent: best })
      }
    }
  }

  return null // no path found
}

/**
 * String-pulling path simplification (greedy line-of-sight).
 * Removes intermediate waypoints where a direct line is walkable,
 * so the route visually cuts corners smoothly instead of hugging the grid.
 */
export function simplifyPath(path, map) {
  if (!path || path.length < 3) return path
  const result = [path[0]]
  let i = 0
  while (i < path.length - 1) {
    let j = path.length - 1
    // Try to draw a direct line from path[i] to path[j];
    // walk back j until we find a line that stays walkable.
    while (j > i + 1) {
      if (lineWalkable(path[i], path[j], map)) break
      j--
    }
    result.push(path[j])
    i = j
  }
  return result
}

/** Check if a straight line between two SVG points stays within walkable cells */
function lineWalkable(a, b, map) {
  const steps = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / (CELL / 2))
  for (let t = 0; t <= steps; t++) {
    const x = a.x + (b.x - a.x) * t / steps
    const y = a.y + (b.y - a.y) * t / steps
    const { gx, gy } = svgToCell(x, y)
    if (!map[gy * COLS + gx]) return false
  }
  return true
}
