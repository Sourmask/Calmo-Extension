import { LineIcon } from '../components/LineIcon'
import { TopBar } from '../components/TopBar'
import type { Mood, Screen } from '../types'

function getSuggestion(mood: Mood | null) {
  if (mood === 'Overstimulated') return 'Start with one quiet reset before opening anything new.'
  if (mood === 'Mentally cloudy') return 'Take one minute to clear the next step.'
  if (mood === 'Emotionally noisy') return 'Use a breathing round before deciding what to do next.'
  if (mood === 'Heavy') return 'Keep the next action very small and low effort.'
  if (mood === 'Clear headed') return 'Protect the calm with a short focus block.'
  return 'Pick the smallest thing that would make this moment easier.'
}

const quickActions: Array<{
  title: string
  detail: string
  icon: string
  screen: Screen
}> = [
  {
    title: 'One-minute reset',
    detail: 'Come back to your body before you continue.',
    icon: 'small-circle',
    screen: 'reset',
  },
  {
    title: 'Breathe',
    detail: 'Use a guided breathing round when your mind feels busy.',
    icon: 'rings',
    screen: 'breathe',
  },
  {
    title: 'Journal',
    detail: 'Put the thought down so it stops asking to be held.',
    icon: 'leaf',
    screen: 'journal',
  },
  {
    title: 'Focus timer',
    detail: 'Work in one clear block, then take the break.',
    icon: 'timer',
    screen: 'pomodoro',
  },
]

export function RestScreen({
  greeting,
  selectedMood,
  journalText,
  savedTabsCount,
  reminderInterval,
  workMinutes,
  onNavigate,
}: {
  greeting: string
  selectedMood: Mood | null
  journalText: string
  savedTabsCount: number
  reminderInterval: number
  workMinutes: number
  onNavigate: (screen: Screen) => void
}) {
  const hasJournalDraft = journalText.trim().length > 0

  return (
    <section className="screen tabbed-screen dashboard-screen">
      <TopBar />
      <div className="screen-heading dashboard-heading">
        <h1>{greeting}</h1>
        <p>A simple place to choose what helps right now.</p>
      </div>

      <section className="today-card" aria-label="Today in Calmo">
        <span>Suggested next</span>
        <p>{getSuggestion(selectedMood)}</p>
        <button className="today-card-button" type="button" onClick={() => onNavigate('reset')}>
          Start Reset
          <LineIcon name="arrow" />
        </button>
      </section>

      <div className="dashboard-stats" aria-label="Current calm status">
        <article>
          <strong>{selectedMood ? selectedMood.replace('Mentally ', '') : 'Not set'}</strong>
          <span>Mood</span>
        </article>
        <article>
          <strong>{hasJournalDraft ? 'Draft' : 'Empty'}</strong>
          <span>Journal</span>
        </article>
        <article>
          <strong>{savedTabsCount}</strong>
          <span>Saved tabs</span>
        </article>
      </div>

      <div className="dashboard-list">
        {quickActions.map((action) => (
          <button
            className="dashboard-action"
            type="button"
            key={action.title}
            onClick={() => onNavigate(action.screen)}
          >
            <div className="rest-icon">
              <LineIcon name={action.icon} />
            </div>
            <div>
              <h2>{action.title}</h2>
              <p>{action.detail}</p>
            </div>
          </button>
        ))}
      </div>
      <p className="quiet-note">
        Reminders every {reminderInterval} min. Focus blocks are set to {workMinutes} min.
      </p>
    </section>
  )
}

