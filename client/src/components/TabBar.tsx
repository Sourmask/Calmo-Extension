import { tabs } from '../data'
import type { Screen } from '../types'
import { LineIcon } from './LineIcon'

export function TabBar({ active, onChange }: { active: Screen; onChange: (screen: Screen) => void }) {
  return (
    <nav className="tab-bar" aria-label="Main navigation">
      {tabs.map((tab) => (
        <button
          className={active === tab.id ? 'active' : ''}
          type="button"
          key={tab.id}
          onClick={() => onChange(tab.id)}
          aria-label={tab.title}
        >
          <LineIcon name={tab.icon} />
        </button>
      ))}
    </nav>
  )
}

