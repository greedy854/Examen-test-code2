import { useRef, useState, useEffect, useCallback } from 'react'
import { FLOOR_ROOMS, ROOM_DOORS, SVG_W, SVG_H } from '../data/building'
import { floorWaypoints, waypointsToPath } from '../utils/routing'
import styles from './MapCanvas.module.scss'

// ── Wall lines per floor ──────────────────────────────────────────────────────
// Each entry is an array of line segments { x1, y1, x2, y2 } that form the
// structural walls for that floor. Lines with dim:true are interior partition
// walls drawn thinner and more transparent.
const WALL_LINES = {
  0: [
    { x1: 160, y1: 0,   x2: 395, y2: 0   },
    { x1: 160, y1: 0,   x2: 160, y2: 155 },
    { x1: 395, y1: 0,   x2: 395, y2: 155 },
    { x1: 0,   y1: 155, x2: 160, y2: 155 },
    { x1: 0,   y1: 155, x2: 0,   y2: 515 },
    { x1: 0,   y1: 515, x2: 720, y2: 515 },
    { x1: 720, y1: 335, x2: 720, y2: 515 },
    { x1: 395, y1: 155, x2: 795, y2: 155 },
    { x1: 795, y1: 155, x2: 795, y2: 335 },
    { x1: 40,  y1: 295, x2: 795, y2: 295 },
    { x1: 40,  y1: 335, x2: 795, y2: 335 },
    { x1: 40,  y1: 295, x2: 40,  y2: 335 },
    { x1: 248, y1: 0,   x2: 248, y2: 295, dim: true },
    { x1: 308, y1: 0,   x2: 308, y2: 295, dim: true },
    { x1: 160, y1: 77,  x2: 395, y2: 77,  dim: true },
    { x1: 160, y1: 154, x2: 395, y2: 154, dim: true },
    { x1: 60,  y1: 155, x2: 60,  y2: 515, dim: true },
    { x1: 0,   y1: 245, x2: 60,  y2: 245, dim: true },
    { x1: 0,   y1: 335, x2: 160, y2: 335, dim: true },
    { x1: 0,   y1: 425, x2: 60,  y2: 425, dim: true },
    { x1: 475, y1: 155, x2: 475, y2: 295, dim: true },
    { x1: 555, y1: 155, x2: 555, y2: 295, dim: true },
    { x1: 635, y1: 155, x2: 635, y2: 295, dim: true },
    { x1: 715, y1: 155, x2: 715, y2: 295, dim: true },
    { x1: 300, y1: 335, x2: 300, y2: 515, dim: true },
    { x1: 440, y1: 335, x2: 440, y2: 515, dim: true },
    { x1: 580, y1: 335, x2: 580, y2: 515, dim: true },
  ],
  1: [
    { x1: 5,   y1: 195, x2: 795, y2: 195 },
    { x1: 5,   y1: 325, x2: 795, y2: 325 },
    { x1: 355, y1: 5,   x2: 355, y2: 195 },
    { x1: 355, y1: 100, x2: 565, y2: 100 },
    { x1: 565, y1: 5,   x2: 565, y2: 195 },
    { x1: 180, y1: 325, x2: 180, y2: 515 },
    { x1: 435, y1: 325, x2: 435, y2: 515 },
    { x1: 85,  y1: 195, x2: 85,  y2: 325, dim: true },
    { x1: 360, y1: 195, x2: 360, y2: 325, dim: true },
    { x1: 440, y1: 195, x2: 440, y2: 325, dim: true },
    { x1: 715, y1: 195, x2: 715, y2: 325, dim: true },
  ],
  2: [
    { x1: 5,   y1: 325, x2: 795, y2: 325 },
    { x1: 5,   y1: 415, x2: 795, y2: 415 },
    { x1: 445, y1: 5,   x2: 445, y2: 325 },
    { x1: 5,   y1: 195, x2: 445, y2: 195 },
    { x1: 200, y1: 415, x2: 200, y2: 515 },
    { x1: 445, y1: 415, x2: 445, y2: 515 },
    { x1: 85,  y1: 325, x2: 85,  y2: 415, dim: true },
    { x1: 360, y1: 325, x2: 360, y2: 415, dim: true },
    { x1: 440, y1: 325, x2: 440, y2: 415, dim: true },
    { x1: 715, y1: 325, x2: 715, y2: 415, dim: true },
  ],
  // 3e Verdieping — same wall layout as floor 0
  3: [
    { x1: 160, y1: 0,   x2: 395, y2: 0   },
    { x1: 160, y1: 0,   x2: 160, y2: 155 },
    { x1: 395, y1: 0,   x2: 395, y2: 155 },
    { x1: 0,   y1: 155, x2: 160, y2: 155 },
    { x1: 0,   y1: 155, x2: 0,   y2: 515 },
    { x1: 0,   y1: 515, x2: 720, y2: 515 },
    { x1: 720, y1: 335, x2: 720, y2: 515 },
    { x1: 395, y1: 155, x2: 795, y2: 155 },
    { x1: 795, y1: 155, x2: 795, y2: 335 },
    { x1: 40,  y1: 295, x2: 795, y2: 295 },
    { x1: 40,  y1: 335, x2: 795, y2: 335 },
    { x1: 40,  y1: 295, x2: 40,  y2: 335 },
    { x1: 248, y1: 0,   x2: 248, y2: 295, dim: true },
    { x1: 308, y1: 0,   x2: 308, y2: 295, dim: true },
    { x1: 160, y1: 77,  x2: 395, y2: 77,  dim: true },
    { x1: 160, y1: 154, x2: 395, y2: 154, dim: true },
    { x1: 60,  y1: 155, x2: 60,  y2: 515, dim: true },
    { x1: 0,   y1: 245, x2: 60,  y2: 245, dim: true },
    { x1: 0,   y1: 335, x2: 160, y2: 335, dim: true },
    { x1: 0,   y1: 425, x2: 60,  y2: 425, dim: true },
    { x1: 475, y1: 155, x2: 475, y2: 295, dim: true },
    { x1: 555, y1: 155, x2: 555, y2: 295, dim: true },
    { x1: 635, y1: 155, x2: 635, y2: 295, dim: true },
    { x1: 715, y1: 155, x2: 715, y2: 295, dim: true },
    { x1: 300, y1: 335, x2: 300, y2: 515, dim: true },
    { x1: 440, y1: 335, x2: 440, y2: 515, dim: true },
    { x1: 580, y1: 335, x2: 580, y2: 515, dim: true },
  ],
}

// ── Theme-aware SVG colours ───────────────────────────────────────────────────
// Returns a colour palette object suited for the current theme (dark or light)
function getColors(isDark) {
  return isDark ? {
    canvas:         '#1a1a1a',
    border:         'rgba(224,64,251,0.30)',
    roomBase:       '#2a2a2a',
    corridor:       '#200e35',
    stairs:         '#180c28',
    elevator:       '#200e32',
    labelDim:       'rgba(200,130,240,0.55)',
    labelSpecial:   'rgba(200,140,250,0.85)',
    doorGap:        '#1a1a1a',
    statusBezet:    'rgba(244,67,54,0.18)',
    statusGesloten: 'rgba(120,120,120,0.20)',
    statusVrij:     'rgba(76,175,80,0.15)',
  } : {
    canvas:         '#ffffff',
    border:         'rgba(224,64,251,0.18)',
    roomBase:       '#ffffff',
    corridor:       '#fdf0ff',
    stairs:         '#f5e6f8',
    elevator:       '#fce4ff',
    labelDim:       'rgba(180,80,210,0.45)',
    labelSpecial:   'rgba(160,60,200,0.70)',
    doorGap:        '#ffffff',
    statusBezet:    'rgba(244,67,54,0.09)',
    statusGesloten: 'rgba(100,100,100,0.09)',
    statusVrij:     'rgba(76,175,80,0.07)',
  }
}

// Returns the fill colour for a room rectangle based on its type, highlight state, and status.
// accessElevator: when true, use a blue tint for elevator rooms (accessibility mode)
function roomFill(type, highlighted, status, C, accessElevator) {
  if (highlighted) return 'rgba(224,64,251,0.15)'
  if (type !== 'room') {
    if (type === 'corridor')  return C.corridor
    if (type === 'stairs')    return C.stairs
    if (type === 'elevator')  return accessElevator ? 'rgba(33,150,243,0.25)' : C.elevator
    return C.canvas
  }
  return C.roomBase
}

// Returns the stroke colour for special room types (elevator = pink/blue, stairs = purple)
// accessElevator: when true, draw elevator rooms with a blue stroke (accessibility mode)
function roomStroke(type, accessElevator) {
  if (type === 'elevator') return accessElevator ? '#2196f3' : '#e040fb'
  if (type === 'stairs')   return '#c060e0'
  return 'none'
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
  onPoiClick, hoveredPoi, onPoiHover, highlightRoomId,
  centerOn, roomStatuses, isDark, walkerPos,
  // highlightPoiIds: array of poi ids to glow amber (programme filter)
  highlightPoiIds,
  // accessMode: when true, draw elevator rooms with blue tint + ♿ emoji
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

  // Resolve the colour palette for the current theme
  const C        = getColors(isDark)
  // Room rectangles for the visible floor
  const rooms    = FLOOR_ROOMS[floor] || []
  // Door gap rectangles for the visible floor
  const doors    = ROOM_DOORS[floor]  || []
  // Wall line segments for the visible floor
  const walls    = WALL_LINES[floor]  || []
  // Only POIs that belong to the currently visible floor
  const floorPois = (pois || []).filter(p => p.floor === floor)

  // Filter route waypoints to the current floor and convert them to an SVG path string
  const routeWps  = route ? floorWaypoints(route.waypoints, floor) : []
  const routePath = waypointsToPath(routeWps)

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
  // Scales the map in/out on mouse-wheel, clamped between 0.3× and 6×
  const onWheel = useCallback((e) => {
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
  // Pans and zooms to centre the map on a given coordinate whenever centerOn changes
  useEffect(() => {
    if (!centerOn) return
    setTx(prev => {
      const s = Math.max(prev.s, 2.0)
      return { x: 400 - centerOn.x * s, y: 260 - centerOn.y * s, s }
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
        <rect width={SVG_W} height={SVG_H} fill={C.canvas}/>

        <g transform={`translate(${tx.x},${tx.y}) scale(${tx.s})`}>

          {/* Building outline border */}
          <rect x="1" y="1" width={SVG_W-2} height={SVG_H-2}
            fill="none" stroke={C.border} strokeWidth="1" rx="1"/>

          {/* ── Rooms ──────────────────────────────────────────────── */}
          {rooms.map(room => {
            const hl          = room.id === highlightRoomId
            const status      = roomStatuses?.[room.id]
            const statusColor = status === 'vrij' ? '#4caf50' : status === 'bezet' ? '#f44336' : status === 'gesloten' ? '#999999' : null
            // In accessibility mode elevator rooms get a blue tint
            const isAccessElev = accessMode && room.type === 'elevator'
            return (
              <g key={room.id}>
                <rect x={room.x} y={room.y} width={room.w} height={room.h}
                  fill={roomFill(room.type, hl, status, C, isAccessElev)}
                  stroke={roomStroke(room.type, isAccessElev)}
                  strokeWidth="0.8"/>

                {/* Status indicator dot */}
                {statusColor && room.type === 'room' && room.w >= 40 && room.h >= 30 && (
                  <circle cx={room.x + room.w - 8} cy={room.y + 8} r="5"
                    fill={statusColor} fillOpacity="0.85"/>
                )}

                {room.type === 'stairs' && (
                  <rect x={room.x} y={room.y} width={room.w} height={room.h}
                    fill="url(#hatch)" pointerEvents="none"/>
                )}

                {room.label && room.type !== 'corridor' && (
                  <text
                    x={room.x + room.w / 2}
                    y={room.y + room.h / 2 + (room.type === 'room' ? 6 : 10)}
                    textAnchor="middle"
                    fill={room.type === 'stairs' || room.type === 'elevator'
                      ? C.labelSpecial : C.labelDim}
                    fontSize={room.type === 'stairs' ? 6 : room.type === 'elevator' ? 7 : 9}
                    fontFamily="'Space Mono',monospace"
                    letterSpacing="0.5"
                    pointerEvents="none"
                  >
                    {room.label.toUpperCase()}
                  </text>
                )}
                {room.type === 'elevator' && (
                  <text x={room.x + room.w/2} y={room.y + room.h/2 - 4}
                    textAnchor="middle" dominantBaseline="central"
                    fontSize="18" pointerEvents="none">
                    {/* In accessibility mode show ♿ instead of 🛗 */}
                    {isAccessElev ? '♿' : '🛗'}
                  </text>
                )}
                {room.type === 'stairs' && (
                  <text x={room.x + room.w/2} y={room.y + room.h/2 - 4}
                    textAnchor="middle" dominantBaseline="central"
                    fontSize="12" pointerEvents="none">🪜</text>
                )}
              </g>
            )
          })}

          {/* ── Walls ──────────────────────────────────────────────── */}
          {walls.map((w, i) => (
            <line key={i} x1={w.x1} y1={w.y1} x2={w.x2} y2={w.y2}
              stroke={w.dim ? 'rgba(224,64,251,0.25)' : '#e040fb'}
              strokeWidth={w.dim ? 0.8 : 1.5}/>
          ))}

          {/* ── Door gaps ──────────────────────────────────────────── */}
          {doors.map((d, i) => (
            <rect key={i}
              x={d.x - d.w/2} y={d.y - 1.5}
              width={d.w} height={3}
              fill={C.doorGap}/>
          ))}

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
