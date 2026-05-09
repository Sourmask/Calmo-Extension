import type { CSSProperties } from 'react'
import { TopBar } from '../components/TopBar'

export function PomodoroScreen({
  workMinutes,
  breakMinutes,
  recommendedBreakMinutes,
  onWorkMinutesChange,
  onBreakMinutesChange,
  onStartTimer,
}: {
  workMinutes: number
  breakMinutes: number
  recommendedBreakMinutes: number
  onWorkMinutesChange: (value: number) => void
  onBreakMinutesChange: (value: number) => void
  onStartTimer: () => void
}) {
  const setupPercent = Math.min(100, Math.max(8, (workMinutes / 60) * 100))
  const changeWorkMinutes = (value: number) => onWorkMinutesChange(Math.max(1, value))
  const changeBreakMinutes = (value: number) => onBreakMinutesChange(Math.max(1, value))

  return (
    <section className="screen tabbed-screen pomodoro-screen">
      <TopBar />
      <div className="pomodoro-clock" aria-label="Pomodoro timer settings">
        <div className="pomodoro-ring">
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle className="pomodoro-ring-track" cx="60" cy="60" r="52" pathLength="100" />
            <circle
              className="pomodoro-ring-progress"
              cx="60"
              cy="60"
              r="52"
              pathLength="100"
              style={{ '--pomodoro-progress': setupPercent } as CSSProperties}
            />
          </svg>
          <span>{workMinutes}</span>
          <small>Min Focus</small>
        </div>
      </div>
      <div className="pomodoro-settings">
        <label className="pomodoro-row">
          <span>Work</span>
          <div className="number-control">
            <input
              type="number"
              min="1"
              step="1"
              value={workMinutes}
              onChange={(event) => changeWorkMinutes(Number(event.target.value) || 1)}
              aria-label="Work duration in minutes"
            />
            <div className="number-control-buttons">
              <button type="button" onClick={() => changeWorkMinutes(workMinutes + 1)} aria-label="Increase work minutes">
                <span className="number-arrow up" />
              </button>
              <button type="button" onClick={() => changeWorkMinutes(workMinutes - 1)} aria-label="Decrease work minutes">
                <span className="number-arrow down" />
              </button>
            </div>
          </div>
        </label>
        <label className="pomodoro-row">
          <span>Break</span>
          <div className="number-control">
            <input
              type="number"
              min="1"
              step="1"
              value={breakMinutes}
              onChange={(event) => changeBreakMinutes(Number(event.target.value) || 1)}
              aria-label="Break duration in minutes"
            />
            <div className="number-control-buttons">
              <button type="button" onClick={() => changeBreakMinutes(breakMinutes + 1)} aria-label="Increase break minutes">
                <span className="number-arrow up" />
              </button>
              <button type="button" onClick={() => changeBreakMinutes(breakMinutes - 1)} aria-label="Decrease break minutes">
                <span className="number-arrow down" />
              </button>
            </div>
          </div>
          <small>Suggested: {recommendedBreakMinutes} min</small>
        </label>
      </div>
      <div className="pomodoro-next">
        <span>Next Up</span>
        <p>Break for {breakMinutes} min</p>
      </div>
      <button className="start-timer-button" type="button" onClick={onStartTimer}>
        Start Timer
      </button>
    </section>
  )
}
