import { FLOORS } from '../data/building'
import styles from './FloorSelector.module.scss'

// Vertical column of buttons for switching between floors.
// Floors are rendered top-to-bottom from highest to lowest (reversed).
export default function FloorSelector({ floor, onChange }) {
  return (
    <div className={styles.panel}>
      {[...FLOORS].reverse().map(f => (
        <button
          key={f.id}
          className={`${styles.btn} ${floor === f.id ? styles.active : ''}`}
          onClick={() => onChange(f.id)}
          title={f.name}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
