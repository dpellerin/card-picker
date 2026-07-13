import './style.css'
import { pickRandomCard, type Card } from './cards.ts'
import { ShakeDetector, type MotionSample } from './motion.ts'
import { ShuffleAudio } from './shuffle-audio.ts'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`)
  })
}

type AppState = 'onboarding' | 'ready' | 'shuffling' | 'selected'
type MotionPermission = 'unknown' | 'granted' | 'unavailable'

interface PermissionAwareDeviceMotionEvent {
  requestPermission?: () => Promise<'granted' | 'denied'>
}

const app = document.querySelector<HTMLElement>('#app')
if (!app) throw new Error('App root not found')

app.innerHTML = `
  <button class="deck" type="button" aria-describedby="instruction">
    <span class="card">
      <span class="card-back" style="background-image: url('${import.meta.env.BASE_URL}card-back.png')" aria-hidden="true">
        <span class="card-back__border-fix" style="background-image: url('${import.meta.env.BASE_URL}card-back.png')"></span>
      </span>
      <img class="card-face" alt="" draggable="false" />
    </span>
    <span class="instruction" id="instruction">Tap to begin</span>
  </button>
  <div class="motion-error" role="status" aria-live="polite"></div>
`

const deckButton = app.querySelector<HTMLButtonElement>('.deck')!
const cardBack = app.querySelector<HTMLElement>('.card-back')!
const cardFace = app.querySelector<HTMLImageElement>('.card-face')!
const instruction = app.querySelector<HTMLElement>('.instruction')!
const motionError = app.querySelector<HTMLElement>('.motion-error')!

const shakeDetector = new ShakeDetector()
const shuffleAudio = new ShuffleAudio()
let state: AppState = 'onboarding'
let motionPermission: MotionPermission = 'unknown'
let shuffleTimer: number | null = null

deckButton.addEventListener('click', () => void handleTouch())
window.addEventListener('devicemotion', handleMotion, { passive: true })
document.addEventListener('visibilitychange', () => {
  if (document.hidden && state === 'shuffling') selectCard()
})

async function handleTouch(): Promise<void> {
  if (state === 'onboarding') {
    await begin()
    return
  }

  if (state === 'shuffling') {
    selectCard()
    return
  }

  startShuffle()
}

async function begin(): Promise<void> {
  try {
    shuffleAudio.unlock()
  } catch {
    // Visual behavior still works if audio initialization is blocked.
  }

  const MotionEvent = window.DeviceMotionEvent as PermissionAwareDeviceMotionEvent | undefined

  if (typeof MotionEvent === 'undefined') {
    motionPermission = 'unavailable'
  } else if (typeof MotionEvent.requestPermission === 'function') {
    try {
      motionPermission = (await MotionEvent.requestPermission()) === 'granted'
        ? 'granted'
        : 'unavailable'
    } catch {
      motionPermission = 'unavailable'
    }
  } else {
    motionPermission = 'granted'
  }

  state = 'ready'
  renderBack()
  setInstruction(motionPermission === 'granted' ? 'Shake to shuffle' : 'Tap to shuffle')

  if (motionPermission === 'unavailable') {
    motionError.textContent = 'Motion is unavailable. Touch controls are on.'
    window.setTimeout(() => { motionError.textContent = '' }, 3_500)
  }
}

function handleMotion(event: DeviceMotionEvent): void {
  if (motionPermission !== 'granted' || state === 'shuffling') return

  const acceleration = event.acceleration
  const gravityAcceleration = event.accelerationIncludingGravity
  let sample: MotionSample | null = null
  let includesGravity = false

  if (hasValues(acceleration)) {
    sample = acceleration
  } else if (hasValues(gravityAcceleration)) {
    sample = gravityAcceleration
    includesGravity = true
  }

  if (sample && shakeDetector.process(sample, performance.now(), includesGravity)) {
    startShuffle()
  }
}

function hasValues(value: DeviceMotionEventAcceleration | null): value is MotionSample {
  return value?.x != null && value.y != null && value.z != null
}

function startShuffle(): void {
  if (state === 'shuffling' || state === 'onboarding') return

  state = 'shuffling'
  deckButton.classList.add('is-shuffling')
  setInstruction('Touch to pick a card')
  showCard(pickRandomCard())
  shuffleAudio.start()
  let showBackNext = true
  shuffleTimer = window.setInterval(() => {
    if (showBackNext) {
      renderBack()
    } else {
      showCard(pickRandomCard())
    }

    showBackNext = !showBackNext
  }, 66)
}

function selectCard(): void {
  if (state !== 'shuffling') return

  if (shuffleTimer !== null) {
    window.clearInterval(shuffleTimer)
    shuffleTimer = null
  }

  shuffleAudio.stop()
  deckButton.classList.remove('is-shuffling')
  state = 'selected'
  showCard(pickRandomCard())
  setInstruction(motionPermission === 'granted' ? 'Shake to pick again' : 'Tap to shuffle')
}

function showCard(card: Card): void {
  cardBack.hidden = true
  cardFace.hidden = false
  cardFace.src = `${import.meta.env.BASE_URL}cards/${card.fileName}`
  cardFace.alt = card.label
}

function renderBack(): void {
  cardFace.hidden = true
  cardBack.hidden = false
}

function setInstruction(message: string): void {
  instruction.textContent = message
  instruction.classList.remove('is-changing')
  void instruction.offsetWidth
  instruction.classList.add('is-changing')
}
