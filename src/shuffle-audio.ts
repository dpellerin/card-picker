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
    this.timer = window.setInterval(() => this.riffle(), 132)
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

    const duration = 0.085
    const frameCount = Math.floor(context.sampleRate * duration)
    const buffer = context.createBuffer(1, frameCount, context.sampleRate)
    const channel = buffer.getChannelData(0)

    for (let index = 0; index < frameCount; index += 1) {
      const decay = 1 - index / frameCount
      channel[index] = (Math.random() * 2 - 1) * decay
    }

    const source = context.createBufferSource()
    const filter = context.createBiquadFilter()
    const gain = context.createGain()
    filter.type = 'bandpass'
    filter.frequency.value = 1_700 + Math.random() * 900
    filter.Q.value = 0.75
    gain.gain.value = 0.13
    source.buffer = buffer
    source.connect(filter).connect(gain).connect(context.destination)
    source.start()
  }
}
