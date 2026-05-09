import { PebbleStack } from './PebbleStack'

export function CalmoLogo({ stacked = false, label = 'Calm' }: { stacked?: boolean; label?: string }) {
  return (
    <div className={`calmo-logo ${stacked ? 'stacked' : ''}`} aria-label="Calmo">
      <span>{label}</span>
      <span className="logo-circle" aria-hidden="true">
        <PebbleStack />
      </span>
    </div>
  )
}
