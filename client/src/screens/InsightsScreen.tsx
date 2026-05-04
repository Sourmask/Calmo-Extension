import { LineIcon } from '../components/LineIcon'
import { TopBar } from '../components/TopBar'

const observations = [
  { icon: 'small-circle', text: 'You rested 3 times this week.' },
  { icon: 'moon', text: 'You rest best in the evenings.' },
  { icon: 'tilt', text: 'Your longest rest was 22 minutes.' },
  { icon: 'wave', text: 'You returned to quiet for 4 days.' },
]

export function InsightsScreen() {
  return (
    <section className="screen tabbed-screen insights-screen">
      <TopBar />
      <h1>This week</h1>
      <div className="observation-list">
        {observations.map((item) => (
          <article className="observation-card" key={item.text}>
            <LineIcon name={item.icon} />
            <p>{item.text}</p>
          </article>
        ))}
      </div>
      <p className="weekly-note">Rest does not wait for finished work. It is the work.</p>
    </section>
  )
}

