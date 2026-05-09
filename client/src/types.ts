export type Screen =
  | 'welcome'
  | 'mood'
  | 'rest'
  | 'reset'
  | 'tabs'
  | 'breathe'
  | 'journal'
  | 'insights'
  | 'pomodoro'
  | 'you'
export type Mood =
  | 'Mentally cloudy'
  | 'Emotionally noisy'
  | 'Clear headed'
  | 'Overstimulated'
  | 'Heavy'
export type BreathMode = '4-7-8' | 'Box' | 'Natural'
export type Theme = 'Primary' | 'Secondary' | 'Tertiary' | 'Light' | 'Dark'

export type JournalEntry = {
  id: string
  date: string
  dateKey: string
  text: string
}

export type SavedTab = {
  id: string
  title: string
  url: string
  savedAt: string
}

export type CurrentTab = {
  id?: number
  title: string
  url: string
}
