import { useEffect, useMemo, useState } from 'react'
import { TabBar } from './components/TabBar'
import { dailyPrompts, themes } from './data'
import { BreatheScreen } from './screens/BreatheScreen'
import { InsightsScreen } from './screens/InsightsScreen'
import { JournalScreen } from './screens/JournalScreen'
import { MoodScreen } from './screens/MoodScreen'
import { PomodoroScreen } from './screens/PomodoroScreen'
import { RestScreen } from './screens/RestScreen'
import { ResetScreen } from './screens/ResetScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { TabsScreen } from './screens/TabsScreen'
import { WelcomeScreen } from './screens/WelcomeScreen'
import type { BreathMode, CurrentTab, JournalEntry, Mood, SavedTab, Screen, Theme } from './types'
import './App.css'

declare const chrome:
  | {
      runtime?: {
        sendMessage?: (
          message:
            | { type: 'CALMO_UPDATE_REMINDER_INTERVAL'; intervalMinutes: number }
            | { type: 'CALMO_START_POMODORO'; workMinutes: number; breakMinutes: number }
            | { type: 'CALMO_UPDATE_THEME'; theme: Theme }
            | { type: 'CALMO_UPDATE_SOUND'; sound: string },
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
          set?: (items: Record<string, unknown>) => void
        }
      }
      tabs?: {
        query?: (
          queryInfo: { active: boolean; currentWindow?: boolean; lastFocusedWindow?: boolean },
          callback: (tabs: Array<{ id?: number; title?: string; url?: string }>) => void,
        ) => void
        remove?: (tabId: number) => void
      }
    }
  | undefined

const DEFAULT_REMINDER_INTERVAL = 1
const JOURNAL_KEY = 'calmo-journal'
const JOURNAL_DATE_KEY = 'calmo-journal-date'
const JOURNAL_ENTRIES_KEY = 'calmo-journal-entries'
const PROFILE_NAME_KEY = 'calmo-profile-name'
const LAST_CHECK_IN_KEY = 'calmo-last-check-in'
const SAVED_TABS_KEY = 'calmo-saved-tabs'
const CHECK_IN_COOLDOWN = 6 * 60 * 60 * 1000

function getDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`
}

function formatDate(date = new Date()) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date)
}

function loadJournalEntries(): JournalEntry[] {
  try {
    const entries = JSON.parse(localStorage.getItem(JOURNAL_ENTRIES_KEY) ?? '[]')
    return Array.isArray(entries) ? entries : []
  } catch {
    return []
  }
}

function saveJournalEntries(entries: JournalEntry[]) {
  localStorage.setItem(JOURNAL_ENTRIES_KEY, JSON.stringify(entries))
}

function saveJournalEntry(text: string, dateKey = getDateKey()) {
  const trimmedText = text.trim()

  if (!trimmedText) return loadJournalEntries()

  const entries = [
    {
      id: dateKey,
      date: formatDate(new Date(`${dateKey}T12:00:00`)),
      dateKey,
      text: trimmedText,
    },
    ...loadJournalEntries().filter((entry) => entry.dateKey !== dateKey),
  ]

  saveJournalEntries(entries)
  return entries
}

function loadDailyJournal() {
  const todayKey = getDateKey()
  const savedDateKey = localStorage.getItem(JOURNAL_DATE_KEY) ?? todayKey
  const text = localStorage.getItem(JOURNAL_KEY) ?? ''

  if (savedDateKey !== todayKey) {
    const entries = saveJournalEntry(text, savedDateKey)
    localStorage.setItem(JOURNAL_KEY, '')
    localStorage.setItem(JOURNAL_DATE_KEY, todayKey)
    return { dateKey: todayKey, text: '', entries }
  }

  localStorage.setItem(JOURNAL_DATE_KEY, todayKey)
  return { dateKey: todayKey, text, entries: loadJournalEntries() }
}

function recommendedBreakMinutes(workMinutes: number) {
  if (workMinutes <= 15) return 3
  if (workMinutes <= 30) return 5
  if (workMinutes <= 45) return 8
  if (workMinutes <= 60) return 10
  if (workMinutes <= 90) return 15
  return 20
}

function shouldCheckIn() {
  const lastCheckIn = Number(localStorage.getItem(LAST_CHECK_IN_KEY))
  return !Number.isFinite(lastCheckIn) || lastCheckIn <= 0 || Date.now() - lastCheckIn >= CHECK_IN_COOLDOWN
}

function loadSavedTabs(): SavedTab[] {
  try {
    const tabs = JSON.parse(localStorage.getItem(SAVED_TABS_KEY) ?? '[]')
    return Array.isArray(tabs) ? tabs : []
  } catch {
    return []
  }
}

function App() {
  const dailyJournal = useMemo(() => loadDailyJournal(), [])
  const [screen, setScreen] = useState<Screen>('welcome')
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null)
  const [breathMode, setBreathMode] = useState<BreathMode>('4-7-8')
  const [breathPhase, setBreathPhase] = useState('Breathe in...')
  const [profileName, setProfileName] = useState(() => localStorage.getItem(PROFILE_NAME_KEY) ?? '')
  const [journalDateKey, setJournalDateKey] = useState(dailyJournal.dateKey)
  const [journalText, setJournalText] = useState(dailyJournal.text)
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(dailyJournal.entries)
  const [openEntry, setOpenEntry] = useState<number | null>(null)
  const [savedTabs, setSavedTabs] = useState<SavedTab[]>(loadSavedTabs)
  const [currentTab, setCurrentTab] = useState<CurrentTab | null>(null)
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
    () => formatDate(new Date(`${journalDateKey}T12:00:00`)),
    [journalDateKey],
  )

  useEffect(() => {
    localStorage.setItem(JOURNAL_KEY, journalText)
  }, [journalText])

  useEffect(() => {
    localStorage.setItem(JOURNAL_DATE_KEY, journalDateKey)
  }, [journalDateKey])

  useEffect(() => {
    localStorage.setItem('calmo-theme', theme)
    document.documentElement.dataset.calmoTheme = theme
    chrome?.storage?.local?.set?.({ calmoTheme: theme })
    chrome?.runtime?.sendMessage?.({ type: 'CALMO_UPDATE_THEME', theme })
  }, [theme])

  useEffect(() => {
    chrome?.storage?.local?.set?.({ calmoSound: sound })
    chrome?.runtime?.sendMessage?.({ type: 'CALMO_UPDATE_SOUND', sound })
  }, [sound])

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
    if (screen === 'tabs') {
      chrome?.tabs?.query?.({ active: true, currentWindow: true }, ([tab]) => {
        if (!tab) {
          setCurrentTab(null)
          return
        }

        setCurrentTab({
          id: tab.id,
          title: tab.title || 'Untitled tab',
          url: tab.url || '',
        })
      })
    }
  }, [screen])

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
    localStorage.setItem(LAST_CHECK_IN_KEY, String(Date.now()))
    window.setTimeout(() => setScreen('rest'), 400)
  }

  function beginResting() {
    setScreen(shouldCheckIn() ? 'mood' : 'rest')
  }

  function changeReminderInterval(value: number) {
    const interval = Math.max(1, Math.round(value))
    setReminderInterval(interval)
    localStorage.setItem('calmo-reminder-interval', String(interval))
    chrome?.runtime?.sendMessage?.({
      type: 'CALMO_UPDATE_REMINDER_INTERVAL',
      intervalMinutes: interval,
    })
  }

  function changeWorkMinutes(value: number) {
    const minutes = Math.max(1, Math.round(value))
    setWorkMinutes(minutes)
    setBreakMinutes(recommendedBreakMinutes(minutes))
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

  function saveCurrentTab() {
    if (!currentTab?.url) return

    const nextTabs = [
      {
        id: `${Date.now()}`,
        title: currentTab.title,
        url: currentTab.url,
        savedAt: new Date().toISOString(),
      },
      ...savedTabs.filter((tab) => tab.url !== currentTab.url),
    ].slice(0, 12)

    setSavedTabs(nextTabs)
    localStorage.setItem(SAVED_TABS_KEY, JSON.stringify(nextTabs))
  }

  function closeCurrentTab() {
    if (currentTab?.id) {
      chrome?.tabs?.remove?.(currentTab.id)
    }
  }

  function saveProfileName(value: string) {
    const nextName = value.trim()
    setProfileName(nextName)
    localStorage.setItem(PROFILE_NAME_KEY, nextName)
  }

  function saveJournal() {
    setJournalEntries(saveJournalEntry(journalText, journalDateKey))
    setOpenEntry(null)
  }

  useEffect(() => {
    const checkDate = () => {
      const todayKey = getDateKey()

      if (todayKey !== journalDateKey) {
        setJournalEntries(saveJournalEntry(journalText, journalDateKey))
        setJournalText('')
        setJournalDateKey(todayKey)
        setOpenEntry(null)
      }
    }

    const interval = window.setInterval(checkDate, 60 * 1000)
    checkDate()
    return () => window.clearInterval(interval)
  }, [journalDateKey, journalText])

  return (
    <main
      className={`app theme-${theme.toLowerCase()} ${screen === 'breathe' ? 'breathe-active' : ''}`}
    >
      {screen === 'welcome' && <WelcomeScreen onBegin={beginResting} />}
      {screen === 'mood' && <MoodScreen selectedMood={selectedMood} onSelect={chooseMood} />}
      {screen === 'rest' && (
        <RestScreen
          greeting={greeting}
          selectedMood={selectedMood}
          journalText={journalText}
          savedTabsCount={savedTabs.length}
          reminderInterval={reminderInterval}
          workMinutes={workMinutes}
          onNavigate={setScreen}
        />
      )}
      {screen === 'reset' && <ResetScreen />}
      {screen === 'tabs' && (
        <TabsScreen
          currentTab={currentTab}
          savedTabs={savedTabs}
          onSaveTab={saveCurrentTab}
          onCloseTab={closeCurrentTab}
        />
      )}
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
          entries={journalEntries}
          openEntry={openEntry}
          onTextChange={setJournalText}
          onSaveEntry={saveJournal}
          onToggleEntry={setOpenEntry}
        />
      )}
      {screen === 'insights' && <InsightsScreen />}
      {screen === 'pomodoro' && (
        <PomodoroScreen
          workMinutes={workMinutes}
          breakMinutes={breakMinutes}
          recommendedBreakMinutes={recommendedBreakMinutes(workMinutes)}
          onWorkMinutesChange={changeWorkMinutes}
          onBreakMinutesChange={changeBreakMinutes}
          onStartTimer={startPomodoro}
        />
      )}
      {screen === 'you' && (
        <SettingsScreen
          reminderInterval={reminderInterval}
          profileName={profileName}
          sound={sound}
          theme={theme}
          onReminderIntervalChange={changeReminderInterval}
          onProfileNameSave={saveProfileName}
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
