import type { Mood, Screen, Theme } from './types'

export const themes: Theme[] = ['Primary', 'Secondary', 'Tertiary', 'Light', 'Dark']

export const moodOptions: Array<{
  label: Mood
  detail: string
  icon: 'wave' | 'storm' | 'soft-circle' | 'spark' | 'layers'
  weather: string
}> = [
  {
    label: 'Mentally cloudy',
    detail: 'Thoughts are soft around the edges.',
    icon: 'wave',
    weather: 'mentally-cloudy',
  },
  {
    label: 'Emotionally noisy',
    detail: 'A lot is moving at once.',
    icon: 'storm',
    weather: 'emotionally-noisy',
  },
  {
    label: 'Clear headed',
    detail: 'There is room to breathe.',
    icon: 'soft-circle',
    weather: 'clear-headed',
  },
  {
    label: 'Overstimulated',
    detail: 'Everything feels too bright.',
    icon: 'spark',
    weather: 'overstimulated',
  },
  {
    label: 'Heavy',
    detail: 'Your body wants less weight.',
    icon: 'layers',
    weather: 'heavy',
  },
]

export const restModes = [
  {
    title: 'Micro rest',
    duration: '2-5 min',
    description: 'A pause. Eyes closed. Nothing more.',
    icon: 'small-circle',
  },
  {
    title: 'Body rest',
    duration: '15-20 min',
    description: 'Lie down. Let your muscles go.',
    icon: 'body',
  },
  {
    title: 'Deep rest',
    duration: '30-45 min',
    description: 'Full stillness. Phone face-down.',
    icon: 'layers',
  },
]

export const dailyPrompts = [
  'What did your body ask for today?',
  'What felt heavy today?',
  'When did you last truly stop?',
  "What are you carrying that isn't yours?",
  'What would rest look like right now?',
]

export const earlierEntries = [
  {
    date: 'Friday, 1 May',
    text: 'I noticed my shoulders unclench after sitting quietly by the window.',
  },
  {
    date: 'Thursday, 30 April',
    text: 'Rest looked like leaving the phone in another room for a little while.',
  },
]

export const tabs: Array<{ id: Screen; icon: string; title: string }> = [
  { id: 'rest', icon: 'home', title: 'Home' },
  { id: 'tabs', icon: 'tabs', title: 'Tabs' },
  { id: 'journal', icon: 'leaf', title: 'Journal' },
  { id: 'insights', icon: 'wave-tab', title: 'Stats' },
  { id: 'pomodoro', icon: 'timer', title: 'Pomodoro' },
  { id: 'you', icon: 'person', title: 'You' },
]
