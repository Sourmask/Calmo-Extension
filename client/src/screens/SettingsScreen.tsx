import { LineIcon } from '../components/LineIcon'
import { TopBar } from '../components/TopBar'
import { themes } from '../data'
import type { Theme } from '../types'

export function SettingsScreen({
  reminderInterval,
  sound,
  theme,
  onReminderIntervalChange,
  onSoundChange,
  onThemeChange,
}: {
  reminderInterval: number
  sound: string
  theme: Theme
  onReminderIntervalChange: (value: number) => void
  onSoundChange: (value: string) => void
  onThemeChange: (value: Theme) => void
}) {
  return (
    <section className="screen tabbed-screen settings-screen">
      <TopBar />
      <div className="profile">
        <span aria-hidden="true">C</span>
        <input aria-label="Name" placeholder="name, optional" />
      </div>
      <div className="settings-list">
        <label className="settings-row">
          <span>Rest reminder</span>
          <input
            type="number"
            min="1"
            step="1"
            value={reminderInterval}
            onChange={(event) => onReminderIntervalChange(Number(event.target.value) || 1)}
            aria-label="Rest reminder interval in minutes"
          />
        </label>
        <label className="settings-row">
          <span>Sound</span>
          <select value={sound} onChange={(event) => onSoundChange(event.target.value)}>
            <option>On</option>
            <option>Off</option>
            <option>Ambient only</option>
          </select>
        </label>
        <label className="settings-row">
          <span>Theme</span>
          <select value={theme} onChange={(event) => onThemeChange(event.target.value as Theme)}>
            {themes.map((themeName) => (
              <option key={themeName}>{themeName}</option>
            ))}
          </select>
        </label>
        <button className="settings-row" type="button">
          <span>Rest preferences</span>
          <span>duration defaults</span>
        </button>
        <button className="settings-row" type="button">
          <span>Export journal</span>
          <LineIcon name="arrow" />
        </button>
        <button className="settings-row" type="button">
          <span>About Calmo</span>
          <span>version 1.0</span>
        </button>
      </div>
      <p className="settings-note">Built for the person who needed permission to rest.</p>
    </section>
  )
}
