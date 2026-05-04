import { useEffect, useMemo, useState } from 'react'
import { TabBar } from './components/TabBar'
import { dailyPrompts, themes } from './data'
import { BreatheScreen } from './screens/BreatheScreen'
import { InsightsScreen } from './screens/InsightsScreen'
import { JournalScreen } from './screens/JournalScreen'
import { MoodScreen } from './screens/MoodScreen'
import { PomodoroScreen } from './screens/PomodoroScreen'
import { RestScreen } from './screens/RestScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { WelcomeScreen } from './screens/WelcomeScreen'
import type { BreathMode, Mood, Screen, Theme } from './types'
import './App.css'

declare const chrome:
  | {
      runtime?: {
        sendMessage?: (
          message:
            | { type: 'CALMO_UPDATE_REMINDER_INTERVAL'; intervalMinutes: number }
            | { type: 'CALMO_START_POMODORO'; workMinutes: number; breakMinutes: number },
          callback?: (response?: { ok: boolean }) => void,
        ) => void
        lastError?: unknown
      }
      storage?: {
        local?: {
          get?: (
            key: string,
            callback: (items: { calmoReminderInterval?: number }) => void,
          ) => void
        }
      }
    }
  | undefined

const DEFAULT_REMINDER_INTERVAL = 1

function App() {
  const [screen, setScreen] = useState<Screen>('welcome')
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null)
  const [breathMode, setBreathMode] = useState<BreathMode>('4-7-8')
  const [breathPhase, setBreathPhase] = useState('Breathe in...')
  const [journalText, setJournalText] = useState(() => localStorage.getItem('calmo-journal') ?? '')
  const [openEntry, setOpenEntry] = useState<number | null>(null)
  const [sound, setSound] = useState('On')
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('calmo-theme')
    return themes.includes(savedTheme as Theme) ? (savedTheme as Theme) : 'Primary'
  })
  const [reminderInterval, setReminderInterval] = useState(() => {
    const savedInterval = Number(localStorage.getItem('calmo-reminder-interval'))
    return Number.isFinite(savedInterval) && savedInterval > 0
      ? savedInterval
      : DEFAULT_REMINDER_INTERVAL
  })
  const [workMinutes, setWorkMinutes] = useState(() => {
    const savedWorkMinutes = Number(localStorage.getItem('calmo-pomodoro-work'))
    return Number.isFinite(savedWorkMinutes) && savedWorkMinutes > 0 ? savedWorkMinutes : 25
  })
  const [breakMinutes, setBreakMinutes] = useState(() => {
    const savedBreakMinutes = Number(localStorage.getItem('calmo-pomodoro-break'))
    return Number.isFinite(savedBreakMinutes) && savedBreakMinutes > 0 ? savedBreakMinutes : 5
  })

  const todayPrompt = useMemo(() => {
    const day = new Date().getDate()
    return dailyPrompts[day % dailyPrompts.length]
  }, [])

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning.'
    if (hour >= 18) return 'Good evening.'
    return "It's okay to pause."
  }, [])

  const todayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }).format(new Date()),
    [],
  )

  useEffect(() => {
    localStorage.setItem('calmo-journal', journalText)
  }, [journalText])

  useEffect(() => {
    localStorage.setItem('calmo-theme', theme)
    document.documentElement.dataset.calmoTheme = theme
  }, [theme])

  useEffect(() => {
    chrome?.storage?.local?.get?.('calmoReminderInterval', (items) => {
      const savedInterval = items.calmoReminderInterval

      if (typeof savedInterval === 'number' && Number.isFinite(savedInterval) && savedInterval > 0) {
        setReminderInterval(savedInterval)
      }
    })
  }, [])

  useEffect(() => {
    localStorage.setItem('calmo-reminder-interval', String(reminderInterval))
    chrome?.runtime?.sendMessage?.({
      type: 'CALMO_UPDATE_REMINDER_INTERVAL',
      intervalMinutes: reminderInterval,
    })
  }, [reminderInterval])

  useEffect(() => {
    localStorage.setItem('calmo-pomodoro-work', String(workMinutes))
  }, [workMinutes])

  useEffect(() => {
    localStorage.setItem('calmo-pomodoro-break', String(breakMinutes))
  }, [breakMinutes])

  useEffect(() => {
    if (screen !== 'breathe') return

    const phases = [
      { label: 'Breathe in...', duration: 4000 },
      { label: 'Hold...', duration: 7000 },
      { label: 'Let go...', duration: 8000 },
    ]
    let index = 0
    let timeout: number

    const tick = () => {
      setBreathPhase(phases[index].label)
      timeout = window.setTimeout(() => {
        index = (index + 1) % phases.length
        tick()
      }, phases[index].duration)
    }

    tick()
    return () => window.clearTimeout(timeout)
  }, [screen])

  function chooseMood(mood: Mood) {
    setSelectedMood(mood)
    window.setTimeout(() => setScreen('rest'), 400)
  }

  function changeReminderInterval(value: number) {
    setReminderInterval(Math.max(1, Math.round(value)))
  }

  function changeWorkMinutes(value: number) {
    setWorkMinutes(Math.max(1, Math.round(value)))
  }

  function changeBreakMinutes(value: number) {
    setBreakMinutes(Math.max(1, Math.round(value)))
  }

  function startPomodoro() {
    chrome?.runtime?.sendMessage?.({
      type: 'CALMO_START_POMODORO',
      workMinutes,
      breakMinutes,
    })
  }

  return (
    <main
      className={`app theme-${theme.toLowerCase()} ${screen === 'breathe' ? 'breathe-active' : ''}`}
    >
      {screen === 'welcome' && <WelcomeScreen onBegin={() => setScreen('mood')} />}
      {screen === 'mood' && <MoodScreen selectedMood={selectedMood} onSelect={chooseMood} />}
      {screen === 'rest' && <RestScreen greeting={greeting} onBreathe={() => setScreen('breathe')} />}
      {screen === 'breathe' && (
        <BreatheScreen
          breathMode={breathMode}
          phase={breathPhase}
          onModeChange={setBreathMode}
          onExit={() => setScreen('rest')}
        />
      )}
      {screen === 'journal' && (
        <JournalScreen
          date={todayLabel}
          prompt={todayPrompt}
          journalText={journalText}
          openEntry={openEntry}
          onTextChange={setJournalText}
          onToggleEntry={setOpenEntry}
        />
      )}
      {screen === 'insights' && <InsightsScreen />}
      {screen === 'pomodoro' && (
        <PomodoroScreen
          workMinutes={workMinutes}
          breakMinutes={breakMinutes}
          onWorkMinutesChange={changeWorkMinutes}
          onBreakMinutesChange={changeBreakMinutes}
          onStartTimer={startPomodoro}
        />
      )}
      {screen === 'you' && (
        <SettingsScreen
          reminderInterval={reminderInterval}
          sound={sound}
          theme={theme}
          onReminderIntervalChange={changeReminderInterval}
          onSoundChange={setSound}
          onThemeChange={setTheme}
        />
      )}
      {screen !== 'welcome' && screen !== 'mood' && screen !== 'breathe' && (
        <TabBar active={screen} onChange={setScreen} />
      )}
    </main>
  )
}

export default App
