let audioContext = null

function getAudioContext() {
  const AudioContext = window.AudioContext || window.webkitAudioContext

  if (!AudioContext) return null

  if (!audioContext || audioContext.state === 'closed') {
    audioContext = new AudioContext()
  }

  return audioContext
}

async function playTimerChime(type = 'complete') {
  const context = getAudioContext()

  if (!context) return

  try {
    await context.resume()

    const now = context.currentTime
    const notes = type === 'work-complete' ? [392, 523.25, 659.25] : [349.23, 440, 523.25]

    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      const filter = context.createBiquadFilter()
      const startTime = now + index * 0.28
      const endTime = startTime + 0.9

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(frequency, startTime)
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(1000, startTime)
      gain.gain.setValueAtTime(0, startTime)
      gain.gain.linearRampToValueAtTime(type === 'work-complete' ? 0.16 : 0.13, startTime + 0.06)
      gain.gain.exponentialRampToValueAtTime(0.001, endTime)

      oscillator.connect(filter)
      filter.connect(gain)
      gain.connect(context.destination)
      oscillator.start(startTime)
      oscillator.stop(endTime)
    })
  } catch {
    // Audio failure must stay isolated from the timers.
  }
}

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === 'CALMO_OFFSCREEN_PLAY_TIMER_SOUND') {
    playTimerChime(message.soundType)
  }
})
