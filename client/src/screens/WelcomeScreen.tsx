import { CalmoLogo } from '../components/CalmoLogo'

export function WelcomeScreen({ onBegin }: { onBegin: () => void }) {
  return (
    <section className="screen welcome-screen">
      <div className="welcome-mark">
        <CalmoLogo stacked label="Calmo" />
      </div>
      <p className="welcome-tagline">You've done enough.</p>
      <div className="welcome-actions">
        <button className="primary-button" type="button" onClick={onBegin}>
          begin resting
        </button>
        <span>No account needed</span>
      </div>
    </section>
  )
}
