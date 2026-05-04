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
  return (
    <section className="screen mood-screen">
      <div className="screen-heading">
        <h1>How are you feeling right now?</h1>
        <p>There's no wrong answer.</p>
      </div>
      <div className="mood-list">
        {moodOptions.map((option) => (
          <button
            className={`mood-card ${selectedMood === option.label ? 'selected' : ''}`}
            type="button"
            key={option.label}
            onClick={() => onSelect(option.label)}
          >
            <LineIcon name={option.icon} />
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </section>
  )
}

