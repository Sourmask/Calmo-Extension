import { LineIcon } from '../components/LineIcon'
import { TopBar } from '../components/TopBar'

const observations = [
  { value: '3', label: 'Rests', detail: 'Short pauses taken this week.' },
  { value: '22m', label: 'Longest Rest', detail: 'Your longest completed rest.' },
  { value: '4', label: 'Quiet Days', detail: 'Days you came back to calm.' },
  { value: 'PM', label: 'Best Time', detail: 'Evenings are your strongest rest window.' },
]

export function InsightsScreen() {
  return (
    <section className="screen tabbed-screen insights-screen">
      <TopBar />
      <h1>This Week</h1>
      <div className="week-summary" aria-label="Weekly rest summary">
        <LineIcon name="rings" />
        <div>
          <span>Weekly Pattern</span>
          <p>You are building a steadier rest rhythm.</p>
        </div>
      </div>
      <div className="observation-list">
        {observations.map((item) => (
          <article className="observation-card" key={item.label}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
            <p>{item.detail}</p>
          </article>
        ))}
      </div>
      <p className="weekly-note">Rest does not wait for finished work. It is the work.</p>
    </section>
  )
}

