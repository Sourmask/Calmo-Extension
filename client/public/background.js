const REMINDER_ALARM = 'calmo-rest-reminder'
const DEFAULT_INTERVAL_MINUTES = 1
let pomodoroActive = false

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

  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })

  if (!tab?.id || !tab.url || tab.url.startsWith('chrome://')) return

  chrome.tabs.sendMessage(tab.id, { type: 'CALMO_SHOW_REST_OVERLAY' }).catch(() => {
    // Some browser pages and restricted documents cannot receive content script messages.
  })
}

async function sendActiveTabMessage(message) {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })

  if (!tab?.id || !tab.url || tab.url.startsWith('chrome://')) return false

  try {
    await chrome.tabs.sendMessage(tab.id, message)
    return true
  } catch {
    return false
  }
}

async function startPomodoro(workMinutes, breakMinutes) {
  pomodoroActive = true
  await chrome.alarms.clear(REMINDER_ALARM)

  return sendActiveTabMessage({
    type: 'CALMO_START_POMODORO',
    workMinutes,
    breakMinutes,
  })
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
