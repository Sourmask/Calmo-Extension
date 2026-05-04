import { PebbleStack } from '../components/PebbleStack'
import type { BreathMode } from '../types'

export function BreatheScreen({
  breathMode,
  phase,
  onModeChange,
  onExit,
}: {
  breathMode: BreathMode
  phase: string
  onModeChange: (mode: BreathMode) => void
  onExit: () => void
}) {
  return (
    <section className="screen breathe-screen">
      <button className="exit-button" type="button" onClick={onExit} aria-label="Exit breathing">
        x
      </button>
      <div className="breath-center">
        <div className="breath-ring" aria-hidden="true">
          <svg viewBox="0 0 160 160">
            <circle className="ring-track" cx="80" cy="80" r="72" />
            <circle className="ring-progress" cx="80" cy="80" r="72" />
          </svg>
          <PebbleStack className="breathing-pebbles" />
        </div>
        <p>{phase}</p>
      </div>
      <div className="breath-options" aria-label="Breathing pattern">
        {(['4-7-8', 'Box', 'Natural'] as BreathMode[]).map((mode) => (
          <button
            className={breathMode === mode ? 'active' : ''}
            type="button"
            key={mode}
            onClick={() => onModeChange(mode)}
          >
            {mode}
          </button>
        ))}
      </div>
    </section>
  )
}

