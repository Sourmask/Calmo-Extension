import { LineIcon } from '../components/LineIcon'
import { moodOptions } from '../data'
import type { Mood } from '../types'

export function MoodScreen({
  selectedMood,
  onSelect,
}: {
  selectedMood: Mood | null
  onSelect: (mood: Mood) => void
}) {
  const selectedWeather = moodOptions.find((option) => option.label === selectedMood)?.weather

  return (
    <section className={`screen mood-screen ${selectedWeather ? `weather-${selectedWeather}` : ''}`}>
      <div className="weather-atmosphere" aria-hidden="true" />
      <div className="screen-heading">
        <span className="weather-kicker">Emotional Weather</span>
        <h1>What is the weather inside?</h1>
        <p>Name the climate, then let Calmo soften the day around it.</p>
      </div>
      <div className="mood-list">
        {moodOptions.map((option) => (
          <button
            className={`mood-card weather-card weather-${option.weather} ${
              selectedMood === option.label ? 'selected' : ''
            }`}
            type="button"
            key={option.label}
            onClick={() => onSelect(option.label)}
          >
            <LineIcon name={option.icon} />
            <span>
              <strong>{option.label}</strong>
              <small>{option.detail}</small>
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}

