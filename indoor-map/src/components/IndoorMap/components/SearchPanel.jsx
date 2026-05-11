import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ALL_POIS, CATEGORIES, FLOORS } from '../data/building'
import styles from './SearchPanel.module.scss'

export default function SearchPanel({
  origin,
  destination,
  selectionMode,
  onSetMode,
  onPoiSelect,
  onClear,
  onSwap,
  floor,
  onFloorChange,
}) {
  const [query,    setQuery]    = useState('')
  const [category, setCategory] = useState('all')

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return ALL_POIS.filter(p => {
      const matchCat  = category === 'all' || p.category === category
      const matchQ    = !q || p.label.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)
      return matchCat && matchQ
    })
  }, [query, category])

  // Group filtered POIs by floor
  const byFloor = useMemo(() => {
    const map = {}
    filtered.forEach(p => {
      if (!map[p.floor]) map[p.floor] = []
      map[p.floor].push(p)
    })
    return map
  }, [filtered])

  return (
    <div className={styles.panel}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.buildingIcon}>🎓</div>
        <div>
          <div className={styles.buildingName}>Mediacollege Amsterdam</div>
          <div className={styles.buildingFloor}>{FLOORS[floor].name}</div>
        </div>
      </div>

      {/* Route inputs */}
      <div className={styles.routeInputs}>
        <button
          className={`${styles.routeField} ${selectionMode === 'from' ? styles.activeField : ''} ${origin ? styles.filled : ''}`}
          onClick={() => onSetMode('from')}
        >
          <span className={styles.fieldDot} style={{ background: '#4caf50' }}/>
          <span className={styles.fieldText}>
            {origin ? origin.label : 'Vertrekpunt kiezen…'}
          </span>
          {origin && (
            <span className={styles.fieldIcon}>{origin.icon}</span>
          )}
        </button>

        {(origin || destination) && (
          <button className={styles.swapBtn} onClick={onSwap} title="Wissel">
            ⇅
          </button>
        )}

        <button
          className={`${styles.routeField} ${selectionMode === 'to' ? styles.activeField : ''} ${destination ? styles.filled : ''}`}
          onClick={() => onSetMode('to')}
        >
          <span className={styles.fieldDot} style={{ background: '#f44336' }}/>
          <span className={styles.fieldText}>
            {destination ? destination.label : 'Bestemming kiezen…'}
          </span>
          {destination && (
            <span className={styles.fieldIcon}>{destination.icon}</span>
          )}
        </button>

        {(origin || destination) && (
          <button className={styles.clearBtn} onClick={onClear}>
            ✕ Wis route
          </button>
        )}
      </div>

      {/* Selection mode hint */}
      <AnimatePresence>
        {(selectionMode === 'from' || selectionMode === 'to') && (
          <motion.div
            className={styles.hint}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            <span className={styles.hintDot}
              style={{ background: selectionMode === 'from' ? '#4caf50' : '#f44336' }}/>
            Klik op de kaart of kies uit de lijst
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search bar */}
      <div className={styles.searchWrap}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Zoek een lokatie…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {query && (
          <button className={styles.clearSearch} onClick={() => setQuery('')}>✕</button>
        )}
      </div>

      {/* Category filters */}
      <div className={styles.categories}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className={`${styles.catBtn} ${category === cat.id ? styles.catActive : ''}`}
            onClick={() => setCategory(cat.id)}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* POI list */}
      <div className={styles.list}>
        {Object.keys(byFloor).sort((a, b) => Number(a) - Number(b)).map(floorId => (
          <div key={floorId}>
            <div className={styles.floorDivider}>
              {FLOORS[Number(floorId)].name}
            </div>
            {byFloor[floorId].map(poi => {
              const isOrigin = origin?.id === poi.id
              const isDest   = destination?.id === poi.id
              return (
                <button
                  key={poi.id}
                  className={`${styles.poiRow}
                    ${isOrigin ? styles.poiOrigin : ''}
                    ${isDest   ? styles.poiDest   : ''}
                  `}
                  onClick={() => {
                    onPoiSelect(poi)
                    if (Number(floorId) !== floor) onFloorChange(Number(floorId))
                  }}
                >
                  <span className={styles.poiIcon}>{poi.icon}</span>
                  <div className={styles.poiInfo}>
                    <span className={styles.poiLabel}>{poi.label}</span>
                    <span className={styles.poiDesc}>{poi.desc}</span>
                  </div>
                  {isOrigin && <span className={styles.poiTag} style={{ color: '#4caf50' }}>VAN</span>}
                  {isDest   && <span className={styles.poiTag} style={{ color: '#f44336' }}>NAAR</span>}
                </button>
              )
            })}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className={styles.empty}>Geen locaties gevonden</div>
        )}
      </div>
    </div>
  )
}
