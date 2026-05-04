const OVERLAY_ID = 'calmo-rest-overlay'
const TIMER_ID = 'calmo-rest-timer'
const POMODORO_ID = 'calmo-pomodoro-timer'
const REST_DURATION_SECONDS = 15 * 60

let restTimer = null
let pomodoroTimer = null

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

function createStyle() {
  const style = document.createElement('style')
  style.textContent = `
    #${OVERLAY_ID},
    #${TIMER_ID},
    #${POMODORO_ID} {
      box-sizing: border-box;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
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
      color: #21382a;
      background:
        radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.72), transparent 30%),
        linear-gradient(135deg, rgba(245, 250, 246, 0.42), rgba(215, 232, 220, 0.3));
      backdrop-filter: blur(26px) saturate(1.55);
      -webkit-backdrop-filter: blur(26px) saturate(1.55);
    }

    #${OVERLAY_ID} .calmo-rest-card,
    #${TIMER_ID},
    #${POMODORO_ID} {
      border: 1px solid rgba(255, 255, 255, 0.58);
      background: linear-gradient(145deg, rgba(255, 255, 255, 0.72), rgba(241, 247, 242, 0.44));
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.72),
        0 22px 70px rgba(38, 61, 46, 0.22);
      backdrop-filter: blur(24px) saturate(1.35);
      -webkit-backdrop-filter: blur(24px) saturate(1.35);
    }

    #${OVERLAY_ID} .calmo-rest-card {
      display: grid;
      gap: 18px;
      width: min(340px, calc(100vw - 48px));
      padding: 30px 26px 24px;
      text-align: center;
      border-radius: 28px;
    }

    #${OVERLAY_ID} .calmo-rest-title {
      margin: 0;
      font-family: Georgia, serif;
      font-size: 28px;
      line-height: 1.14;
      font-weight: 400;
    }

    #${OVERLAY_ID} .calmo-rest-copy {
      margin: 0;
      color: rgba(33, 56, 42, 0.68);
      font-size: 14px;
      line-height: 1.5;
    }

    #${OVERLAY_ID} .calmo-rest-actions {
      display: grid;
      gap: 10px;
      margin-top: 4px;
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
      min-height: 46px;
      border-radius: 999px;
    }

    #${OVERLAY_ID} .calmo-primary-button {
      color: #fff;
      background: #21382a;
      box-shadow: 0 10px 24px rgba(33, 56, 42, 0.24);
    }

    #${OVERLAY_ID} .calmo-secondary-button {
      color: #21382a;
      background: rgba(255, 255, 255, 0.48);
      border: 1px solid rgba(33, 56, 42, 0.12);
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
      color: #21382a;
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
      color: rgba(33, 56, 42, 0.68);
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.44);
      font-size: 18px;
      line-height: 1;
    }

    #${TIMER_ID} .calmo-timer-label {
      margin: 0;
      padding-right: 20px;
      color: rgba(33, 56, 42, 0.66);
      font-size: 12px;
      line-height: 1.2;
    }

    #${TIMER_ID} .calmo-timer-time {
      margin: 0;
      font-family: Georgia, serif;
      font-size: 30px;
      line-height: 1;
    }

    #${POMODORO_ID} {
      position: fixed;
      right: 18px;
      bottom: 18px;
      left: 18px;
      z-index: 2147483647;
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      gap: 16px;
      max-width: 760px;
      min-height: 82px;
      margin: 0 auto;
      padding: 16px 18px;
      color: #21382a;
      border-radius: 24px;
    }

    #${POMODORO_ID} .calmo-pomodoro-orbit {
      display: grid;
      width: 48px;
      height: 48px;
      place-items: center;
      border: 1.5px solid rgba(33, 56, 42, 0.22);
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.42);
    }

    #${POMODORO_ID} .calmo-pomodoro-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #21382a;
    }

    #${POMODORO_ID} .calmo-pomodoro-copy {
      display: grid;
      gap: 5px;
      min-width: 0;
    }

    #${POMODORO_ID} .calmo-pomodoro-phase {
      margin: 0;
      color: rgba(33, 56, 42, 0.68);
      font-size: 12px;
      line-height: 1.1;
      text-transform: lowercase;
    }

    #${POMODORO_ID} .calmo-pomodoro-time {
      margin: 0;
      font-family: Georgia, serif;
      font-size: 30px;
      line-height: 1;
    }

    #${POMODORO_ID} .calmo-pomodoro-next {
      margin: 0;
      color: rgba(33, 56, 42, 0.66);
      font-size: 13px;
      line-height: 1.3;
      white-space: nowrap;
    }

    #${POMODORO_ID} .calmo-pomodoro-close {
      display: grid;
      width: 30px;
      height: 30px;
      place-items: center;
      color: rgba(33, 56, 42, 0.7);
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.48);
      font-size: 18px;
      line-height: 1;
    }

    @media (max-width: 520px) {
      #${POMODORO_ID} {
        grid-template-columns: auto 1fr auto;
        gap: 12px;
      }

      #${POMODORO_ID} .calmo-pomodoro-next {
        white-space: normal;
      }
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
        <button type="button" class="calmo-primary-button" data-calmo-action="begin">begin resting</button>
        <button type="button" class="calmo-secondary-button" data-calmo-action="continue">continue working</button>
      </div>
    </div>
  `

  overlay.appendChild(createStyle())
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
    <button type="button" class="calmo-timer-close" aria-label="Close rest timer">x</button>
    <p class="calmo-timer-label">resting</p>
    <p class="calmo-timer-time">${formatTime(remainingSeconds)}</p>
  `

  timer.appendChild(createStyle())
  timer.querySelector('.calmo-timer-close')?.addEventListener('click', closeTimer)
  document.documentElement.appendChild(timer)

  const timeDisplay = timer.querySelector('.calmo-timer-time')
  restTimer = window.setInterval(() => {
    remainingSeconds -= 1

    if (remainingSeconds <= 0) {
      closeTimer()
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
    <button type="button" class="calmo-pomodoro-close" aria-label="Close Pomodoro timer">x</button>
  `

  timer.appendChild(createStyle())
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
})
