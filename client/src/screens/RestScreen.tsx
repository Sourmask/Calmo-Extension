import { LineIcon } from '../components/LineIcon'
import { TopBar } from '../components/TopBar'
import { restModes } from '../data'

export function RestScreen({ greeting, onBreathe }: { greeting: string; onBreathe: () => void }) {
  return (
    <section className="screen tabbed-screen">
      <TopBar />
      <div className="screen-heading rest-heading">
        <h1>{greeting}</h1>
        <p>What kind of rest does your body need?</p>
      </div>
      <div className="rest-list">
        {restModes.map((mode, index) => (
          <button
            className="rest-card"
            type="button"
            key={mode.title}
            onClick={index === 0 ? onBreathe : undefined}
          >
            <div className="rest-icon">
              <LineIcon name={mode.icon} />
            </div>
            <div>
              <div className="rest-card-top">
                <h2>{mode.title}</h2>
                <span>{mode.duration}</span>
              </div>
              <p>{mode.description}</p>
            </div>
          </button>
        ))}
      </div>
      <p className="quiet-note">No pressure. No measuring. Just rest.</p>
    </section>
  )
}

