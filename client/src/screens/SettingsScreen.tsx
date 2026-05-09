import { useMemo, useState } from 'react'
import { LineIcon } from '../components/LineIcon'
import { TopBar } from '../components/TopBar'
import { themes } from '../data'
import type { Theme } from '../types'

export function SettingsScreen({
  reminderInterval,
  profileName,
  sound,
  theme,
  onReminderIntervalChange,
  onProfileNameSave,
  onSoundChange,
  onThemeChange,
}: {
  reminderInterval: number
  profileName: string
  sound: string
  theme: Theme
  onReminderIntervalChange: (value: number) => void
  onProfileNameSave: (value: string) => void
  onSoundChange: (value: string) => void
  onThemeChange: (value: Theme) => void
}) {
  const [draftName, setDraftName] = useState(profileName)
  const initial = useMemo(() => (profileName.trim()[0] ?? 'C').toUpperCase(), [profileName])
  const changeReminder = (value: number) => onReminderIntervalChange(Math.max(1, value))

  return (
    <section className="screen tabbed-screen settings-screen">
      <TopBar />
      <div className="profile">
        <span aria-hidden="true">{initial}</span>
        <input
          aria-label="Name"
          placeholder="Name, optional"
          value={draftName}
          onChange={(event) => setDraftName(event.target.value)}
        />
        <button type="button" onClick={() => onProfileNameSave(draftName)}>
          Save
        </button>
      </div>
      <div className="settings-list">
        <label className="settings-row">
          <span>Rest reminder</span>
          <div className="number-control settings-number-control">
            <input
              type="number"
              min="1"
              step="1"
              value={reminderInterval}
              onChange={(event) => changeReminder(Number(event.target.value) || 1)}
              aria-label="Rest reminder interval in minutes"
            />
            <div className="number-control-buttons">
              <button type="button" onClick={() => changeReminder(reminderInterval + 1)} aria-label="Increase rest reminder interval">
                <span className="number-arrow up" />
              </button>
              <button type="button" onClick={() => changeReminder(reminderInterval - 1)} aria-label="Decrease rest reminder interval">
                <span className="number-arrow down" />
              </button>
            </div>
          </div>
        </label>
        <label className="settings-row">
          <span>Sound</span>
          <select value={sound} onChange={(event) => onSoundChange(event.target.value)}>
            <option>On</option>
            <option>Off</option>
            <option>Ambient Only</option>
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
          <span>Duration Defaults</span>
        </button>
        <button className="settings-row" type="button">
          <span>Export journal</span>
          <LineIcon name="arrow" />
        </button>
        <button className="settings-row" type="button">
          <span>About Calmo</span>
          <span>Version 1.0</span>
        </button>
      </div>
      <p className="settings-note">Built for the person who needed permission to rest.</p>
    </section>
  )
}
