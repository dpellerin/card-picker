export class ShuffleAudio {
  private context: AudioContext | null = null
  private timer: number | null = null

  unlock(): void {
    this.context ??= new AudioContext()
    if (this.context.state === 'suspended') {
      void this.context.resume().catch(() => {
        // Audio is optional; the visual interaction must remain responsive.
      })
    }
  }

  start(): void {
    if (!this.context || this.timer !== null) return

    this.riffle()
    this.timer = window.setInterval(() => this.riffle(), 78)
  }

  stop(): void {
    if (this.timer !== null) {
      window.clearInterval(this.timer)
      this.timer = null
    }
  }

  private riffle(): void {
    const context = this.context
    if (!context) return

    const now = context.currentTime
    const duration = 0.032
    const frameCount = Math.floor(context.sampleRate * duration)
    const buffer = context.createBuffer(1, frameCount, context.sampleRate)
    const channel = buffer.getChannelData(0)

    for (let index = 0; index < frameCount; index += 1) {
      const decay = Math.pow(1 - index / frameCount, 3)
      channel[index] = (Math.random() * 2 - 1) * decay
    }

    const snap = context.createBufferSource()
    const snapFilter = context.createBiquadFilter()
    const snapGain = context.createGain()
    snapFilter.type = 'lowpass'
    snapFilter.frequency.value = 1_350 + Math.random() * 300
    snapFilter.Q.value = 0.9
    snapGain.gain.setValueAtTime(0.1, now)
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + duration)
    snap.buffer = buffer
    snap.connect(snapFilter).connect(snapGain).connect(context.destination)
    snap.start(now)

    const body = context.createOscillator()
    const bodyGain = context.createGain()
    body.type = 'triangle'
    body.frequency.setValueAtTime(165 + Math.random() * 20, now)
    body.frequency.exponentialRampToValueAtTime(82, now + 0.055)
    bodyGain.gain.setValueAtTime(0.12, now)
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.055)
    body.connect(bodyGain).connect(context.destination)
    body.start(now)
    body.stop(now + 0.06)
  }
}
