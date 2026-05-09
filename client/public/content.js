const OVERLAY_ID = 'calmo-rest-overlay'
const TIMER_ID = 'calmo-rest-timer'
const POMODORO_ID = 'calmo-pomodoro-timer'
const REST_DURATION_SECONDS = 15 * 60
const THEME_CLASS_PREFIX = 'calmo-theme-'

let restTimer = null
let pomodoroTimer = null
let activeTheme = 'Primary'

function removeElement(id) {
  document.getElementById(id)?.remove()
}

function clearRestTimer() {
  if (restTimer) {
    window.clearInterval(restTimer)
    restTimer = null
  }
}

function clearPomodoroTimer() {
  if (pomodoroTimer) {
    window.clearInterval(pomodoroTimer)
    pomodoroTimer = null
  }
}

function closeOverlay() {
  removeElement(OVERLAY_ID)
}

function closeTimer() {
  clearRestTimer()
  removeElement(TIMER_ID)
}

function closePomodoroTimer() {
  clearPomodoroTimer()
  removeElement(POMODORO_ID)
  chrome.runtime.sendMessage({ type: 'CALMO_POMODORO_DONE' })
}

function resetPomodoroTimer() {
  clearPomodoroTimer()
  removeElement(POMODORO_ID)
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
}

function themeClassName(theme = activeTheme) {
  return `${THEME_CLASS_PREFIX}${String(theme).toLowerCase()}`
}

function applyTheme(element) {
  element.classList.add(themeClassName())
}

function setTheme(theme) {
  activeTheme = theme || 'Primary'

  ;[OVERLAY_ID, TIMER_ID, POMODORO_ID].forEach((id) => {
    const element = document.getElementById(id)
    if (!element) return

    Array.from(element.classList)
      .filter((className) => className.startsWith(THEME_CLASS_PREFIX))
      .forEach((className) => element.classList.remove(className))
    applyTheme(element)
  })
}

function playTimerSound(soundType) {
  chrome.runtime.sendMessage({ type: 'CALMO_PLAY_TIMER_SOUND', soundType })
}

function createStyle() {
  const style = document.createElement('style')
  style.textContent = `
    #${OVERLAY_ID},
    #${TIMER_ID},
    #${POMODORO_ID} {
      box-sizing: border-box;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      --calmo-overlay-text: #21382a;
      --calmo-overlay-muted: rgba(33, 56, 42, 0.66);
      --calmo-overlay-border: rgba(33, 56, 42, 0.14);
      --calmo-overlay-accent: #21382a;
      --calmo-overlay-button: rgba(255, 255, 255, 0.54);
      --calmo-overlay-timer-shadow: rgba(33, 56, 42, 0.16);
      --calmo-overlay-surface: rgba(255, 255, 255, 0.72);
      --calmo-overlay-surface-2: rgba(241, 247, 242, 0.44);
      --calmo-overlay-page:
        radial-gradient(circle at 78% 16%, rgba(191, 213, 238, 0.72), transparent 36%),
        radial-gradient(circle at 18% 82%, rgba(235, 244, 235, 0.82), transparent 44%),
        linear-gradient(135deg, rgba(255, 255, 255, 0.78), rgba(218, 232, 225, 0.5));
    }

    #${OVERLAY_ID} *,
    #${TIMER_ID} *,
    #${POMODORO_ID} * {
      box-sizing: border-box;
    }

    #${OVERLAY_ID} {
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      display: grid;
      place-items: center;
      padding: 24px;
      color: var(--calmo-overlay-text);
      background: var(--calmo-overlay-page);
      backdrop-filter: blur(28px) saturate(1.35);
      -webkit-backdrop-filter: blur(28px) saturate(1.35);
    }

    #${OVERLAY_ID} .calmo-rest-card,
    #${TIMER_ID},
    #${POMODORO_ID} {
      border: 1px solid rgba(255, 255, 255, 0.58);
      background: linear-gradient(145deg, var(--calmo-overlay-surface), var(--calmo-overlay-surface-2));
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.72),
        0 22px 70px rgba(38, 61, 46, 0.22);
      backdrop-filter: blur(24px) saturate(1.35);
      -webkit-backdrop-filter: blur(24px) saturate(1.35);
    }

    #${OVERLAY_ID} .calmo-rest-card {
      display: grid;
      gap: 18px;
      width: min(360px, calc(100vw - 48px));
      padding: 31px 28px 27px;
      text-align: center;
      border-radius: 26px;
    }

    #${OVERLAY_ID} .calmo-rest-title {
      margin: 0;
      font-family: Georgia, serif;
      color: var(--calmo-overlay-text);
      font-size: 30px;
      line-height: 1.14;
      font-weight: 400;
    }

    #${OVERLAY_ID} .calmo-rest-copy {
      margin: 0;
      color: var(--calmo-overlay-muted);
      font-size: 16px;
      line-height: 1.5;
    }

    #${OVERLAY_ID} .calmo-rest-actions {
      display: grid;
      gap: 12px;
      margin-top: 6px;
    }

    #${OVERLAY_ID} button,
    #${TIMER_ID} button,
    #${POMODORO_ID} button {
      border: 0;
      cursor: pointer;
      font: inherit;
    }

    #${OVERLAY_ID} .calmo-primary-button,
    #${OVERLAY_ID} .calmo-secondary-button {
      min-height: 49px;
      border-radius: 999px;
      font-size: 16px;
      transition: transform 180ms ease, background 220ms ease, color 220ms ease;
    }

    #${OVERLAY_ID} .calmo-primary-button {
      color: var(--calmo-overlay-primary-text, #fff);
      background: var(--calmo-overlay-accent);
      box-shadow: 0 14px 28px rgba(33, 56, 42, 0.2);
    }

    #${OVERLAY_ID} .calmo-secondary-button {
      color: var(--calmo-overlay-text);
      background: rgba(255, 255, 255, 0.5);
      border: 1px solid var(--calmo-overlay-border);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.55);
    }

    #${OVERLAY_ID} .calmo-primary-button:hover,
    #${OVERLAY_ID} .calmo-secondary-button:hover {
      transform: translateY(-1px);
    }

    #${TIMER_ID} {
      position: fixed;
      top: 18px;
      right: 18px;
      z-index: 2147483647;
      display: grid;
      gap: 4px;
      min-width: 150px;
      padding: 16px 18px;
      color: var(--calmo-overlay-text);
      border-radius: 22px;
    }

    #${TIMER_ID} .calmo-timer-close {
      position: absolute;
      top: 7px;
      right: 8px;
      display: grid;
      width: 26px;
      height: 26px;
      place-items: center;
      color: var(--calmo-overlay-muted);
      border-radius: 50%;
      background: var(--calmo-overlay-button);
      line-height: 1;
    }

    #${TIMER_ID} .calmo-timer-close svg {
      width: 16px;
      height: 16px;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
    }

    #${TIMER_ID} .calmo-timer-label {
      margin: 0;
      padding-right: 20px;
      color: var(--calmo-overlay-muted);
      font-size: 12px;
      line-height: 1.2;
    }

    #${TIMER_ID} .calmo-timer-time {
      margin: 0;
      color: var(--calmo-overlay-text);
      font-family: Georgia, serif;
      font-size: 30px;
      line-height: 1;
    }

    #${POMODORO_ID} {
      position: fixed;
      top: 18px;
      right: 18px;
      z-index: 2147483647;
      display: grid;
      grid-template-columns: 38px minmax(0, 1fr);
      align-items: center;
      gap: 10px 12px;
      width: min(286px, calc(100vw - 36px));
      min-height: 72px;
      padding: 12px 42px 12px 12px;
      color: var(--calmo-overlay-text);
      border-radius: 20px;
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.72),
        0 16px 40px var(--calmo-overlay-timer-shadow);
    }

    #${POMODORO_ID} .calmo-pomodoro-orbit {
      display: grid;
      width: 38px;
      height: 38px;
      place-items: center;
      border: 2px solid var(--calmo-overlay-border);
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.24);
    }

    #${POMODORO_ID} .calmo-pomodoro-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--calmo-overlay-accent);
    }

    #${POMODORO_ID} .calmo-pomodoro-copy {
      display: grid;
      gap: 3px;
      min-width: 0;
    }

    #${POMODORO_ID} .calmo-pomodoro-phase {
      margin: 0;
      color: var(--calmo-overlay-muted);
      font-size: 12px;
      line-height: 1.1;
      text-transform: lowercase;
    }

    #${POMODORO_ID} .calmo-pomodoro-time {
      margin: 0;
      font-family: Georgia, serif;
      color: var(--calmo-overlay-text);
      font-size: 26px;
      line-height: 1;
      font-variant-numeric: tabular-nums;
    }

    #${POMODORO_ID} .calmo-pomodoro-next {
      grid-column: 1 / -1;
      margin: 0;
      padding-left: 2px;
      color: var(--calmo-overlay-muted);
      font-size: 12px;
      line-height: 1.3;
      white-space: normal;
    }

    #${POMODORO_ID} .calmo-pomodoro-close {
      position: absolute;
      top: 8px;
      right: 8px;
      display: grid;
      width: 26px;
      height: 26px;
      place-items: center;
      color: var(--calmo-overlay-muted);
      border-radius: 50%;
      background: var(--calmo-overlay-button);
      line-height: 1;
    }

    #${POMODORO_ID} .calmo-pomodoro-close svg {
      width: 15px;
      height: 15px;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
    }

    @media (max-width: 520px) {
      #${POMODORO_ID} {
        grid-template-columns: 38px minmax(0, 1fr);
        gap: 10px 12px;
        right: 12px;
        left: 12px;
        width: auto;
        min-height: 72px;
        padding: 12px 42px 12px 12px;
        border-radius: 20px;
      }

      #${POMODORO_ID} .calmo-pomodoro-next {
        grid-column: 1 / -1;
        font-size: 12px;
        white-space: normal;
      }
    }

    #${OVERLAY_ID}.${THEME_CLASS_PREFIX}secondary,
    #${TIMER_ID}.${THEME_CLASS_PREFIX}secondary,
    #${POMODORO_ID}.${THEME_CLASS_PREFIX}secondary {
      --calmo-overlay-text: #edf8fb;
      --calmo-overlay-muted: rgba(237, 248, 251, 0.68);
      --calmo-overlay-border: rgba(237, 248, 251, 0.18);
      --calmo-overlay-accent: #48b7d4;
      --calmo-overlay-primary-text: #001f28;
      --calmo-overlay-button: rgba(237, 248, 251, 0.1);
      --calmo-overlay-timer-shadow: rgba(0, 0, 0, 0.28);
      --calmo-overlay-surface: rgba(7, 49, 61, 0.78);
      --calmo-overlay-surface-2: rgba(0, 31, 40, 0.62);
      --calmo-overlay-page:
        radial-gradient(circle at 82% 16%, rgba(72, 183, 212, 0.3), transparent 34%),
        radial-gradient(circle at 18% 82%, rgba(130, 173, 186, 0.22), transparent 44%),
        linear-gradient(135deg, rgba(0, 31, 40, 0.76), rgba(7, 49, 61, 0.62));
    }

    #${OVERLAY_ID}.${THEME_CLASS_PREFIX}tertiary,
    #${TIMER_ID}.${THEME_CLASS_PREFIX}tertiary,
    #${POMODORO_ID}.${THEME_CLASS_PREFIX}tertiary {
      --calmo-overlay-text: #53483d;
      --calmo-overlay-muted: rgba(83, 72, 61, 0.66);
      --calmo-overlay-border: rgba(83, 72, 61, 0.14);
      --calmo-overlay-accent: #8f806f;
      --calmo-overlay-primary-text: #ffffff;
      --calmo-overlay-button: rgba(255, 255, 255, 0.45);
      --calmo-overlay-timer-shadow: rgba(83, 72, 61, 0.16);
      --calmo-overlay-surface: rgba(245, 238, 231, 0.78);
      --calmo-overlay-surface-2: rgba(232, 222, 209, 0.5);
      --calmo-overlay-page:
        radial-gradient(circle at 78% 18%, rgba(182, 159, 132, 0.36), transparent 36%),
        radial-gradient(circle at 18% 82%, rgba(255, 255, 255, 0.62), transparent 42%),
        linear-gradient(135deg, rgba(245, 238, 231, 0.74), rgba(232, 222, 209, 0.5));
    }

    #${OVERLAY_ID}.${THEME_CLASS_PREFIX}light,
    #${TIMER_ID}.${THEME_CLASS_PREFIX}light,
    #${POMODORO_ID}.${THEME_CLASS_PREFIX}light {
      --calmo-overlay-text: #000000;
      --calmo-overlay-muted: rgba(0, 0, 0, 0.62);
      --calmo-overlay-border: rgba(0, 0, 0, 0.12);
      --calmo-overlay-accent: #000000;
      --calmo-overlay-primary-text: #ffffff;
      --calmo-overlay-button: rgba(255, 255, 255, 0.72);
      --calmo-overlay-timer-shadow: rgba(0, 0, 0, 0.12);
      --calmo-overlay-surface: rgba(255, 255, 255, 0.82);
      --calmo-overlay-surface-2: rgba(245, 245, 245, 0.58);
      --calmo-overlay-page:
        radial-gradient(circle at 76% 16%, rgba(230, 230, 230, 0.65), transparent 34%),
        radial-gradient(circle at 18% 82%, rgba(255, 255, 255, 0.82), transparent 42%),
        linear-gradient(135deg, rgba(255, 255, 255, 0.7), rgba(245, 245, 245, 0.52));
    }

    #${OVERLAY_ID}.${THEME_CLASS_PREFIX}dark,
    #${TIMER_ID}.${THEME_CLASS_PREFIX}dark,
    #${POMODORO_ID}.${THEME_CLASS_PREFIX}dark {
      --calmo-overlay-text: #ffffff;
      --calmo-overlay-muted: rgba(255, 255, 255, 0.66);
      --calmo-overlay-border: rgba(255, 255, 255, 0.16);
      --calmo-overlay-accent: #ffffff;
      --calmo-overlay-primary-text: #000000;
      --calmo-overlay-button: rgba(255, 255, 255, 0.1);
      --calmo-overlay-timer-shadow: rgba(0, 0, 0, 0.34);
      --calmo-overlay-surface: rgba(17, 17, 17, 0.82);
      --calmo-overlay-surface-2: rgba(0, 0, 0, 0.64);
      --calmo-overlay-page:
        radial-gradient(circle at 78% 16%, rgba(255, 255, 255, 0.14), transparent 34%),
        radial-gradient(circle at 18% 82%, rgba(255, 255, 255, 0.08), transparent 44%),
        linear-gradient(135deg, rgba(0, 0, 0, 0.76), rgba(17, 17, 17, 0.62));
    }
  `

  return style
}

function showRestPrompt() {
  if (document.getElementById(OVERLAY_ID)) return

  const overlay = document.createElement('div')
  overlay.id = OVERLAY_ID
  overlay.innerHTML = `
    <div class="calmo-rest-card" role="dialog" aria-modal="true" aria-labelledby="calmo-rest-title">
      <p id="calmo-rest-title" class="calmo-rest-title">Time to rest.</p>
      <p class="calmo-rest-copy">Let the page soften for a moment. You can come back after a real pause.</p>
      <div class="calmo-rest-actions">
        <button type="button" class="calmo-primary-button" data-calmo-action="begin">Begin Resting</button>
        <button type="button" class="calmo-secondary-button" data-calmo-action="continue">Continue Working</button>
      </div>
    </div>
  `

  overlay.appendChild(createStyle())
  applyTheme(overlay)
  overlay.querySelector('[data-calmo-action="begin"]')?.addEventListener('click', beginResting)
  overlay.querySelector('[data-calmo-action="continue"]')?.addEventListener('click', closeOverlay)
  document.documentElement.appendChild(overlay)
}

function beginResting() {
  closeOverlay()
  showRestTimer()
}

function showRestTimer() {
  closeTimer()

  let remainingSeconds = REST_DURATION_SECONDS
  const timer = document.createElement('div')
  timer.id = TIMER_ID
  timer.innerHTML = `
    <button type="button" class="calmo-timer-close" aria-label="Close rest timer">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 6L18 18" />
        <path d="M18 6L6 18" />
      </svg>
    </button>
    <p class="calmo-timer-label">resting</p>
    <p class="calmo-timer-time">${formatTime(remainingSeconds)}</p>
  `

  timer.appendChild(createStyle())
  applyTheme(timer)
  timer.querySelector('.calmo-timer-close')?.addEventListener('click', closeTimer)
  document.documentElement.appendChild(timer)

  const timeDisplay = timer.querySelector('.calmo-timer-time')
  restTimer = window.setInterval(() => {
    remainingSeconds -= 1

    if (remainingSeconds <= 0) {
      closeTimer()
      playTimerSound('complete')
      showRestComplete()
      return
    }

    if (timeDisplay) {
      timeDisplay.textContent = formatTime(remainingSeconds)
    }
  }, 1000)
}

function showRestComplete() {
  const overlay = document.createElement('div')
  overlay.id = OVERLAY_ID
  overlay.innerHTML = `
    <div class="calmo-rest-card" role="dialog" aria-modal="true" aria-labelledby="calmo-rest-done-title">
      <p id="calmo-rest-done-title" class="calmo-rest-title">Rest over.</p>
      <p class="calmo-rest-copy">Good. Come back slowly. Press anywhere to continue.</p>
    </div>
  `

  overlay.appendChild(createStyle())
  applyTheme(overlay)
  overlay.addEventListener('click', closeOverlay)
  document.documentElement.appendChild(overlay)
}

function showPomodoroTimer(workMinutes, breakMinutes) {
  resetPomodoroTimer()

  let phase = 'work'
  let remainingSeconds = workMinutes * 60
  const timer = document.createElement('div')
  timer.id = POMODORO_ID
  timer.innerHTML = `
    <div class="calmo-pomodoro-orbit" aria-hidden="true">
      <span class="calmo-pomodoro-dot"></span>
    </div>
    <div class="calmo-pomodoro-copy">
      <p class="calmo-pomodoro-phase">work</p>
      <p class="calmo-pomodoro-time">${formatTime(remainingSeconds)}</p>
    </div>
    <p class="calmo-pomodoro-next">Next up: break for ${breakMinutes} min</p>
    <button type="button" class="calmo-pomodoro-close" aria-label="Close Pomodoro timer">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 6L18 18" />
        <path d="M18 6L6 18" />
      </svg>
    </button>
  `

  timer.appendChild(createStyle())
  applyTheme(timer)
  timer.querySelector('.calmo-pomodoro-close')?.addEventListener('click', closePomodoroTimer)
  document.documentElement.appendChild(timer)

  const phaseDisplay = timer.querySelector('.calmo-pomodoro-phase')
  const timeDisplay = timer.querySelector('.calmo-pomodoro-time')
  const nextDisplay = timer.querySelector('.calmo-pomodoro-next')

  const updateTimer = () => {
    if (phaseDisplay) phaseDisplay.textContent = phase
    if (timeDisplay) timeDisplay.textContent = formatTime(remainingSeconds)
    if (nextDisplay) {
      nextDisplay.textContent =
        phase === 'work'
          ? `Next up: break for ${breakMinutes} min`
          : `Next up: work for ${workMinutes} min`
    }
  }

  pomodoroTimer = window.setInterval(() => {
    remainingSeconds -= 1

    if (remainingSeconds <= 0) {
      phase = phase === 'work' ? 'break' : 'work'
      playTimerSound(phase === 'break' ? 'work-complete' : 'break-complete')
      remainingSeconds = (phase === 'work' ? workMinutes : breakMinutes) * 60
    }

    updateTimer()
  }, 1000)
}

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === 'CALMO_SHOW_REST_OVERLAY') {
    showRestPrompt()
  }

  if (message?.type === 'CALMO_START_POMODORO') {
    showPomodoroTimer(message.workMinutes, message.breakMinutes)
  }

  if (message?.type === 'CALMO_SET_THEME') {
    setTheme(message.theme)
  }
})

chrome.storage?.local?.get?.('calmoTheme', ({ calmoTheme }) => {
  setTheme(calmoTheme)
})
