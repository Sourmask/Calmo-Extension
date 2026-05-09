const REMINDER_ALARM = 'calmo-rest-reminder'
const DEFAULT_INTERVAL_MINUTES = 1
const OFFSCREEN_DOCUMENT_PATH = 'offscreen.html'
let pomodoroActive = false

async function hasOffscreenDocument() {
  if (!chrome.runtime.getContexts) return false

  const contexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [chrome.runtime.getURL(OFFSCREEN_DOCUMENT_PATH)],
  })

  return contexts.length > 0
}

async function ensureOffscreenDocument() {
  if (!chrome.offscreen || (await hasOffscreenDocument())) return

  await chrome.offscreen.createDocument({
    url: OFFSCREEN_DOCUMENT_PATH,
    reasons: ['AUDIO_PLAYBACK'],
    justification: 'Play soft completion sounds for Calmo timers.',
  })
}

async function playTimerSound(soundType) {
  const { calmoSound } = await chrome.storage.local.get('calmoSound')

  if (calmoSound === 'Off') return

  try {
    await ensureOffscreenDocument()
    await chrome.runtime.sendMessage({
      type: 'CALMO_OFFSCREEN_PLAY_TIMER_SOUND',
      soundType,
    })
  } catch {
    // Sound is optional; timers should continue if audio is unavailable.
  }
}

async function getReminderInterval() {
  const { calmoReminderInterval } = await chrome.storage.local.get('calmoReminderInterval')
  return Number.isFinite(calmoReminderInterval) && calmoReminderInterval > 0
    ? calmoReminderInterval
    : DEFAULT_INTERVAL_MINUTES
}

async function scheduleReminder() {
  if (pomodoroActive) return

  const intervalMinutes = await getReminderInterval()

  await chrome.alarms.clear(REMINDER_ALARM)
  chrome.alarms.create(REMINDER_ALARM, {
    delayInMinutes: intervalMinutes,
    periodInMinutes: intervalMinutes,
  })
}

async function showRestOverlay() {
  if (pomodoroActive) return

  await sendActiveTabMessage({ type: 'CALMO_SHOW_REST_OVERLAY' })
}

async function sendActiveTabMessage(message) {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })

  if (!tab?.id || !tab.url || isRestrictedUrl(tab.url)) return false

  try {
    await chrome.tabs.sendMessage(tab.id, message)
    return true
  } catch {
    return injectContentScript(tab.id).then(
      async () => {
        try {
          await chrome.tabs.sendMessage(tab.id, message)
          return true
        } catch {
          return false
        }
      },
      () => false,
    )
  }
}

function isRestrictedUrl(url) {
  return (
    url.startsWith('chrome://') ||
    url.startsWith('edge://') ||
    url.startsWith('about:') ||
    url.startsWith('chrome-extension://')
  )
}

function injectContentScript(tabId) {
  if (!chrome.scripting?.executeScript) return Promise.reject(new Error('No scripting API'))

  return chrome.scripting.executeScript({
    target: { tabId },
    files: ['content.js'],
  })
}

async function startPomodoro(workMinutes, breakMinutes) {
  await chrome.alarms.clear(REMINDER_ALARM)

  const sent = await sendActiveTabMessage({
    type: 'CALMO_START_POMODORO',
    workMinutes,
    breakMinutes,
  })

  pomodoroActive = sent

  if (!sent) {
    scheduleReminder()
  }

  return sent
}

function finishPomodoro() {
  pomodoroActive = false
  scheduleReminder()
}

chrome.runtime.onInstalled.addListener(async () => {
  const { calmoReminderInterval } = await chrome.storage.local.get('calmoReminderInterval')

  if (!calmoReminderInterval) {
    await chrome.storage.local.set({ calmoReminderInterval: DEFAULT_INTERVAL_MINUTES })
  }

  scheduleReminder()
})

chrome.runtime.onStartup.addListener(scheduleReminder)

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'CALMO_UPDATE_REMINDER_INTERVAL') {
    chrome.storage.local
      .set({ calmoReminderInterval: message.intervalMinutes })
      .then(scheduleReminder)
      .then(() => sendResponse({ ok: true }))
      .catch(() => sendResponse({ ok: false }))

    return true
  }

  if (message?.type === 'CALMO_START_POMODORO') {
    startPomodoro(message.workMinutes, message.breakMinutes)
      .then((sent) => sendResponse({ ok: sent }))
      .catch(() => sendResponse({ ok: false }))

    return true
  }

  if (message?.type === 'CALMO_UPDATE_THEME') {
    chrome.storage.local
      .set({ calmoTheme: message.theme })
      .then(() => sendActiveTabMessage({ type: 'CALMO_SET_THEME', theme: message.theme }))
      .then(() => sendResponse({ ok: true }))
      .catch(() => sendResponse({ ok: false }))
    return true
  }

  if (message?.type === 'CALMO_UPDATE_SOUND') {
    chrome.storage.local.set({ calmoSound: message.sound }).then(() => sendResponse({ ok: true }))
    return true
  }

  if (message?.type === 'CALMO_PLAY_TIMER_SOUND') {
    playTimerSound(message.soundType).then(() => sendResponse({ ok: true }))
    return true
  }

  if (message?.type === 'CALMO_POMODORO_DONE') {
    finishPomodoro()
    sendResponse({ ok: true })
    return false
  }

  return false
})

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === REMINDER_ALARM) {
    showRestOverlay()
  }
})

scheduleReminder()
