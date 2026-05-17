import { useRef, useState, useEffect, useCallback } from 'react'
import { SVG_W, SVG_H } from '../data/building'
import { floorWaypoints, waypointsToPath } from '../utils/routing'
import styles from './MapCanvas.module.scss'

const FLOOR_IMAGES = {
  0: '/maps/floor-0.png',
  1: '/maps/floor-1.png',
  2: '/maps/floor-2.png',
  3: '/maps/floor-3.png',
}

// Calculates the Euclidean distance between two touch points for pinch-to-zoom
function pinchDist(t1, t2) {
  const dx = t1.clientX - t2.clientX
  const dy = t1.clientY - t2.clientY
  return Math.sqrt(dx * dx + dy * dy)
}

// Renders the SVG floor plan with pan, zoom, route overlay, and POI markers
export default function MapCanvas({
  floor, pois, route, origin, destination,
  onPoiClick, hoveredPoi, onPoiHover,
  centerOn, isDark, walkerPos,
  highlightPoiIds,
  accessMode,
}) {
  // Ref to the outer wrapper div — used to attach wheel and touch listeners
  const wrapRef  = useRef(null)
  // Pan and zoom transform state: x/y offset in pixels, s = scale factor
  const [tx, setTx] = useState({ x: 0, y: 0, s: 1 })
  // Holds the mouse-down anchor point { sx, sy } while dragging
  const drag     = useRef(null)
  // Records where the drag started so we can distinguish a click from a pan
  const dragStart = useRef(null)
  // True if the pointer moved far enough during a drag to count as a pan (not a click)
  const didDrag  = useRef(false)

  // ── Feature 4: Pinch-to-zoom refs ─────────────────────────────────────────
  // { sx, sy } for single-finger pan
  const touchPan   = useRef(null)   // { sx, sy } for single-finger pan
  // { startDist, startScale } for two-finger zoom
  const pinch      = useRef(null)   // { startDist, startScale } for two-finger zoom

  // Only POIs that belong to the currently visible floor
  const floorPois = (pois || []).filter(p => p.floor === floor)

  // Filter route waypoints to the current floor and convert them to an SVG path string
  const routeWps  = route ? floorWaypoints(route.waypoints, floor) : []
  const routePath = waypointsToPath(routeWps)

  // ── Stair transition markers ───────────────────────────────────────────────
  // When the route is multi-floor, mark the exact point where the path
  // reaches the staircase on this floor (origin floor: last waypoint before the
  // floor changes; destination floor: first waypoint where the floor begins).
  // We collect positions that are on this floor but are adjacent to a different floor.
  const stairMarkers = (() => {
    if (!route || !route.multiFloor) return []
    const all = route.waypoints
    const markers = []
    for (let i = 0; i < all.length; i++) {
      const wp = all[i]
      if (wp.floor !== floor) continue
      const prev = all[i - 1]
      const next = all[i + 1]
      // Entry from another floor: previous wp was on a different floor
      if (prev && prev.floor !== floor) markers.push({ x: wp.x, y: wp.y, type: 'entry' })
      // Exit to another floor: next wp is on a different floor
      if (next && next.floor !== floor) markers.push({ x: wp.x, y: wp.y, type: 'exit' })
    }
    return markers
  })()

  // ── Pan (mouse) ──────────────────────────────────────────────────────────
  // Records the anchor position when the user starts dragging the map
  const onMouseDown = useCallback((e) => {
    if (e.button !== 0) return
    drag.current     = { sx: e.clientX - tx.x, sy: e.clientY - tx.y }
    dragStart.current = { x: e.clientX, y: e.clientY }
    didDrag.current  = false
  }, [tx])

  // Updates the pan offset while the mouse is held and moving
  const onMouseMove = useCallback((e) => {
    if (!drag.current) return
    if (dragStart.current) {
      const dx = e.clientX - dragStart.current.x
      const dy = e.clientY - dragStart.current.y
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) didDrag.current = true
    }
    const sx = drag.current.sx
    const sy = drag.current.sy
    setTx(t => ({ ...t, x: e.clientX - sx, y: e.clientY - sy }))
  }, [])

  // Clears the drag anchor when the mouse button is released
  const onMouseUp = useCallback(() => {
    drag.current      = null
    dragStart.current = null
  }, [])

  // ── Global mouse-up safety ───────────────────────────────────────────────
  // Listens on the document so dragging outside the map element still stops the pan
  useEffect(() => {
    const stop = () => { drag.current = null; dragStart.current = null }
    document.addEventListener('mouseup', stop)
    return () => document.removeEventListener('mouseup', stop)
  }, [])

  // ── Zoom (wheel) ─────────────────────────────────────────────────────────
  // Desktop: zoom only when Ctrl is held (Ctrl+scroll). Normal scroll passes through.
  // Mobile: pinch gestures fire synthetic wheel events with ctrlKey=true, so
  //         the same check naturally enables pinch-zoom without extra code.
  const onWheel = useCallback((e) => {
    if (!e.ctrlKey) return          // no Ctrl → let the page scroll normally
    e.preventDefault()
    const f = e.deltaY > 0 ? 0.88 : 1.14
    setTx(t => ({ ...t, s: Math.max(0.3, Math.min(6, t.s * f)) }))
  }, [])

  // Attaches the wheel listener with { passive: false } so we can preventDefault
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [onWheel])

  // ── Feature 4: Pinch-to-zoom (touch) ────────────────────────────────────
  // Handles single-finger pan and two-finger pinch-to-zoom on touch devices
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return

    // Called when one or two fingers touch the screen
    const onTouchStart = (e) => {
      if (e.touches.length === 1) {
        const t = e.touches[0]
        // Read current tx via closure captured in setTx updater instead
        touchPan.current = { sx: t.clientX, sy: t.clientY }
        pinch.current    = null
        didDrag.current  = false
      } else if (e.touches.length === 2) {
        const dist = pinchDist(e.touches[0], e.touches[1])
        setTx(cur => {
          pinch.current = { startDist: dist, startScale: cur.s }
          return cur
        })
        touchPan.current = null
      }
    }

    // Called while fingers are moving; handles both pan and pinch simultaneously
    const onTouchMove = (e) => {
      e.preventDefault()
      if (e.touches.length === 1 && touchPan.current) {
        const t  = e.touches[0]
        const dx = t.clientX - touchPan.current.sx
        const dy = t.clientY - touchPan.current.sy
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didDrag.current = true
        touchPan.current = { sx: t.clientX, sy: t.clientY }
        setTx(cur => ({ ...cur, x: cur.x + dx, y: cur.y + dy }))
      } else if (e.touches.length === 2 && pinch.current) {
        const newDist  = pinchDist(e.touches[0], e.touches[1])
        const newScale = Math.max(0.3, Math.min(6,
          pinch.current.startScale * (newDist / pinch.current.startDist)
        ))
        setTx(cur => ({ ...cur, s: newScale }))
      }
    }

    // Resets all touch state when fingers leave the screen
    const onTouchEnd = () => {
      touchPan.current = null
      pinch.current    = null
    }

    el.addEventListener('touchstart', onTouchStart, { passive: false })
    el.addEventListener('touchmove',  onTouchMove,  { passive: false })
    el.addEventListener('touchend',   onTouchEnd,   { passive: false })
    el.addEventListener('touchcancel',onTouchEnd,   { passive: false })

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove',  onTouchMove)
      el.removeEventListener('touchend',   onTouchEnd)
      el.removeEventListener('touchcancel',onTouchEnd)
    }
  }, [])

  // ── Auto-center on selected POI ──────────────────────────────────────────
  useEffect(() => {
    if (!centerOn) return
    setTx(prev => {
      const s = Math.max(prev.s, 2.0)
      return { x: 400 - centerOn.x * s, y: 343 - centerOn.y * s, s }
    })
  }, [centerOn])

  // Resets pan and zoom to the default (no transform)
  const resetView = () => setTx({ x: 0, y: 0, s: 1 })

  return (
    <div
      className={styles.wrapper}
      ref={wrapRef}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <svg
        className={styles.svg}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <style>{`
            @keyframes dotFlow { to { stroke-dashoffset: -14; } }
            .rDots { animation: dotFlow 0.75s linear infinite; }
            @keyframes pulse { 0%,100%{opacity:0.6} 50%{opacity:0.1} }
            .pPulse { animation: pulse 1.8s ease-in-out infinite; }
            @keyframes pulse2 { 0%,100%{opacity:0.35;transform:scale(1)} 50%{opacity:0;transform:scale(1.6)} }
            .pPulse2 { animation: pulse2 2.2s ease-out infinite; transform-origin:center; transform-box:fill-box; }
            @keyframes wPulse { 0%,100%{opacity:0.5;transform:scale(1)} 50%{opacity:0.15;transform:scale(1.8)} }
            .wRing { animation: wPulse 1.1s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }
          `}</style>
          <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="3" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          {/* Amber glow for programme-filter highlighted POIs */}
          <filter id="glowAmber" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="5" result="b"/>
            <feFlood floodColor="#f59e0b" floodOpacity="0.6" result="c"/>
            <feComposite in="c" in2="b" operator="in" result="d"/>
            <feMerge><feMergeNode in="d"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(192,96,224,0.3)" strokeWidth="1.5"/>
          </pattern>
        </defs>

        {/* Fixed background */}
        <rect width={SVG_W} height={SVG_H} fill="#2a2a2a"/>

        <g transform={`translate(${tx.x},${tx.y}) scale(${tx.s})`}>

          {/* ── Floor plan image ───────────────────────────────────── */}
          <image
            href={FLOOR_IMAGES[floor]}
            x="0" y="0"
            width={SVG_W} height={SVG_H}
            preserveAspectRatio="none"
          />

          {/* ── Route — Situm-style dots ────────────────────────────── */}
          {routePath && (
            <>
              <path d={routePath} fill="none"
                stroke="rgba(224,64,251,0.18)" strokeWidth="14"
                strokeLinecap="round" strokeLinejoin="round"/>
              <path className="rDots" d={routePath} fill="none"
                stroke="#e040fb" strokeWidth="5"
                strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray="1 13"
                filter="url(#glow)"/>
            </>
          )}

          {/* ── Demo walker ──────────────────────────────────────────────── */}
          {walkerPos && walkerPos.floor === floor && (
            <g transform={`translate(${walkerPos.x},${walkerPos.y})`} pointerEvents="none">
              <circle className="wRing" r="14" fill="rgba(224,64,251,0.25)" stroke="none"/>
              <circle r="6" fill="#e040fb" stroke="#fff" strokeWidth="2"
                filter="url(#glow)"/>
            </g>
          )}

          {/* ── Stair transition markers ─────────────────────────────────── */}
          {/* Small 🪜 badge at the exact staircase waypoint so it's crystal-clear
              where the route enters or leaves via the stairs on this floor. */}
          {stairMarkers.map((m, i) => (
            <g key={i} transform={`translate(${m.x},${m.y})`} pointerEvents="none">
              {/* Outer pulse ring */}
              <circle r="13" fill="rgba(255,200,0,0.15)"
                stroke="#f59e0b" strokeWidth="1.5" className="pPulse"/>
              {/* Inner badge */}
              <circle r="8" fill="#f59e0b" opacity="0.9"/>
              <text textAnchor="middle" dominantBaseline="central"
                fontSize="9" dy="0.5" pointerEvents="none">🪜</text>
              {/* Label */}
              <g transform="translate(0,-22)" pointerEvents="none">
                <rect x="-18" y="-7" width="36" height="13" rx="3"
                  fill="#f59e0b" opacity="0.95"/>
                <text textAnchor="middle" y="0" dominantBaseline="central"
                  fontSize="7" fill="#1a1a1a"
                  fontFamily="'DM Sans',sans-serif" fontWeight="700">
                  Trap
                </text>
              </g>
            </g>
          ))}

          {/* ── POI markers ────────────────────────────────────────── */}
          {floorPois.map(poi => {
            const isOrigin   = origin?.id      === poi.id
            const isDest     = destination?.id  === poi.id
            const isHov      = hoveredPoi?.id   === poi.id
            const isTransit  = poi.category === 'transport'
            // Amber/gold highlight for programme filter
            const isProgramHL = Array.isArray(highlightPoiIds) && highlightPoiIds.includes(poi.id)

            const r      = isOrigin || isDest ? 12 : isHov ? 10 : 8
            const stroke = isOrigin ? '#4caf50' : isDest ? '#f44336'
              : isProgramHL ? '#f59e0b'
              : isTransit ? '#c060e0' : '#e040fb'
            const fill   = isOrigin ? 'rgba(76,175,80,0.15)'
              : isDest    ? 'rgba(244,67,54,0.15)'
              : isProgramHL ? 'rgba(245,158,11,0.20)'
              : isTransit ? 'rgba(192,96,224,0.12)'
              : 'rgba(224,64,251,0.12)'

            const lw = Math.max(poi.label.length * 5.8 + 14, 50)

            return (
              <g key={poi.id}
                transform={`translate(${poi.x},${poi.y})`}
                onClick={() => { if (!didDrag.current) onPoiClick(poi) }}
                onMouseEnter={() => onPoiHover(poi)}
                onMouseLeave={() => onPoiHover(null)}
                style={{ cursor: 'pointer' }}>

                {/* Outer expanding pulse — origin only, "you are here" signal */}
                {isOrigin && (
                  <circle className="pPulse2" r="22"
                    fill="rgba(76,175,80,0.18)" stroke="#4caf50" strokeWidth="1"/>
                )}

                {(isOrigin || isDest) && (
                  <circle className="pPulse" r="18"
                    fill="none" stroke={stroke} strokeWidth="1.5"/>
                )}

                <circle r={r} fill={fill} stroke={stroke} strokeWidth="1.5"
                  filter={isOrigin || isDest ? 'url(#glow)' : isProgramHL ? 'url(#glowAmber)' : undefined}/>

                <text textAnchor="middle" dominantBaseline="central"
                  fontSize={isOrigin || isDest ? '10' : '9'} dy="0.5"
                  pointerEvents="none">
                  {poi.icon}
                </text>

                {(isHov || isOrigin || isDest) && (
                  <g transform="translate(0,-20)" pointerEvents="none">
                    <rect x={-lw/2} y="-9" width={lw} height="16" rx="3"
                      fill={isDark ? '#2a2a2a' : '#fff'}
                      stroke={isOrigin ? '#4caf50' : isDest ? '#f44336' : '#e040fb'}
                      strokeWidth="1"/>
                    <text textAnchor="middle" y="0" dominantBaseline="central"
                      fontSize="8"
                      fill={isOrigin ? '#4caf50' : isDest ? '#f44336' : '#e040fb'}
                      fontFamily="'DM Sans',sans-serif" fontWeight="600"
                      pointerEvents="none">
                      {poi.label}
                    </text>
                  </g>
                )}

                {/* "Je bent hier" badge — rendered last so it sits on top */}
                {isOrigin && (
                  <text
                    textAnchor="middle"
                    y="-46"
                    fontSize="6.5"
                    fill="#4caf50"
                    fontFamily="'DM Sans',sans-serif"
                    fontWeight="700"
                    letterSpacing="0.04em"
                    pointerEvents="none"
                  >
                    📍 Je bent hier
                  </text>
                )}
              </g>
            )
          })}
        </g>
      </svg>

      {/* Zoom buttons */}
      <div className={styles.zoom}>
        <button className={styles.zBtn}
          onClick={() => setTx(t => ({ ...t, s: Math.min(6, t.s * 1.25) }))}>+</button>
        <button className={styles.zBtn}
          onClick={() => setTx(t => ({ ...t, s: Math.max(0.3, t.s / 1.25) }))}>−</button>
        <button className={styles.zBtn} onClick={resetView} title="Reset">⊡</button>
      </div>
    </div>
  )
}
