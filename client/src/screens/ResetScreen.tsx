import { LineIcon } from '../components/LineIcon'
import { TopBar } from '../components/TopBar'

const resetActions = [
  {
    title: 'Drop your shoulders',
    detail: 'Unclench your jaw and let your hands rest open.',
    icon: 'body',
  },
  {
    title: 'Name one thing',
    detail: 'Pick the next small action. Leave the rest for later.',
    icon: 'small-circle',
  },
  {
    title: 'Clear the tab',
    detail: 'Close one noisy page or move it out of sight.',
    icon: 'layers',
  },
]

export function ResetScreen() {
  return (
    <section className="screen tabbed-screen reset-screen">
      <TopBar />
      <div className="screen-heading reset-heading">
        <h1>Quick Reset</h1>
        <p>Three small moves for when the browser gets too loud.</p>
      </div>
      <div className="reset-list">
        {resetActions.map((item) => (
          <article className="reset-card" key={item.title}>
            <div className="rest-icon">
              <LineIcon name={item.icon} />
            </div>
            <div>
              <h2>{item.title}</h2>
              <p>{item.detail}</p>
            </div>
          </article>
        ))}
      </div>
      <p className="quiet-note">One minute is enough to come back to yourself.</p>
    </section>
  )
}
