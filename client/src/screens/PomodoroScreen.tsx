import { TopBar } from '../components/TopBar'

export function PomodoroScreen({
  workMinutes,
  breakMinutes,
  onWorkMinutesChange,
  onBreakMinutesChange,
  onStartTimer,
}: {
  workMinutes: number
  breakMinutes: number
  onWorkMinutesChange: (value: number) => void
  onBreakMinutesChange: (value: number) => void
  onStartTimer: () => void
}) {
  return (
    <section className="screen tabbed-screen pomodoro-screen">
      <TopBar />
      <div className="pomodoro-clock" aria-label="Pomodoro timer settings">
        <div className="pomodoro-ring">
          <span>{workMinutes}</span>
          <small>min focus</small>
        </div>
      </div>
      <div className="pomodoro-settings">
        <label className="pomodoro-row">
          <span>Work</span>
          <input
            type="number"
            min="1"
            step="1"
            value={workMinutes}
            onChange={(event) => onWorkMinutesChange(Number(event.target.value) || 1)}
            aria-label="Work duration in minutes"
          />
        </label>
        <label className="pomodoro-row">
          <span>Break</span>
          <input
            type="number"
            min="1"
            step="1"
            value={breakMinutes}
            onChange={(event) => onBreakMinutesChange(Number(event.target.value) || 1)}
            aria-label="Break duration in minutes"
          />
        </label>
      </div>
      <div className="pomodoro-next">
        <span>Next up</span>
        <p>Break for {breakMinutes} min</p>
      </div>
      <button className="start-timer-button" type="button" onClick={onStartTimer}>
        Start timer
      </button>
    </section>
  )
}
