import { motion } from 'framer-motion'
import { FLOORS } from '../data/building'
import styles from './RoutePanel.module.scss'

const STEP_ICONS = {
  start:    '📍',
  walk:     '🚶',
  elevator: '🛗',
  enter:    '🚪',
  arrive:   '✅',
}

export default function RoutePanel({ route, origin, destination, activeFloor, onFloorChange }) {
  if (!route) return null

  const { steps, totalDistance, multiFloor, originFloor, destinationFloor } = route

  return (
    <motion.div
      className={styles.panel}
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
    >
      {/* Summary bar */}
      <div className={styles.summary}>
        <div className={styles.summaryRoute}>
          <span className={styles.summaryPoi} style={{ color: '#4caf50' }}>
            {origin?.icon} {origin?.label}
          </span>
          <span className={styles.summaryArrow}>→</span>
          <span className={styles.summaryPoi} style={{ color: '#f44336' }}>
            {destination?.icon} {destination?.label}
          </span>
        </div>
        <div className={styles.summaryMeta}>
          <span className={styles.metaTag}>
            📏 ~{totalDistance} m
          </span>
          {multiFloor && (
            <span className={styles.metaTag}>
              🛗 {FLOORS[originFloor].label} → {FLOORS[destinationFloor].label}
            </span>
          )}
        </div>
      </div>

      {/* Floor tabs if multi-floor */}
      {multiFloor && (
        <div className={styles.floorTabs}>
          {[originFloor, destinationFloor].map(fid => (
            <button
              key={fid}
              className={`${styles.floorTab} ${activeFloor === fid ? styles.floorTabActive : ''}`}
              onClick={() => onFloorChange(fid)}
            >
              {FLOORS[fid].label} · {FLOORS[fid].name}
            </button>
          ))}
        </div>
      )}

      {/* Steps */}
      <div className={styles.steps}>
        {steps.map((step, i) => (
          <motion.div
            key={i}
            className={`${styles.step} ${styles[`step_${step.type}`]}`}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
          >
            <div className={styles.stepLeft}>
              <span className={styles.stepIcon}>{STEP_ICONS[step.icon] || step.icon}</span>
              {i < steps.length - 1 && <div className={styles.stepLine}/>}
            </div>
            <div className={styles.stepText}>{step.text}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
