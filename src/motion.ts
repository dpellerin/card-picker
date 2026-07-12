export interface MotionSample {
  x: number
  y: number
  z: number
}

interface ShakeDetectorOptions {
  threshold?: number
  impulseWindowMs?: number
  cooldownMs?: number
}

export class ShakeDetector {
  private readonly threshold: number
  private readonly impulseWindowMs: number
  private readonly cooldownMs: number
  private previousFallbackSample: MotionSample | null = null
  private firstImpulseAt = -Infinity
  private lastShakeAt = -Infinity

  constructor(options: ShakeDetectorOptions = {}) {
    this.threshold = options.threshold ?? 12
    this.impulseWindowMs = options.impulseWindowMs ?? 650
    this.cooldownMs = options.cooldownMs ?? 1_200
  }

  process(sample: MotionSample, now: number, includesGravity = false): boolean {
    let force: number

    if (includesGravity) {
      if (!this.previousFallbackSample) {
        this.previousFallbackSample = sample
        return false
      }

      force = magnitude({
        x: sample.x - this.previousFallbackSample.x,
        y: sample.y - this.previousFallbackSample.y,
        z: sample.z - this.previousFallbackSample.z,
      })
      this.previousFallbackSample = sample
    } else {
      force = magnitude(sample)
    }

    if (force < this.threshold || now - this.lastShakeAt < this.cooldownMs) {
      return false
    }

    if (now - this.firstImpulseAt <= this.impulseWindowMs) {
      this.firstImpulseAt = -Infinity
      this.lastShakeAt = now
      return true
    }

    this.firstImpulseAt = now
    return false
  }
}

function magnitude(sample: MotionSample): number {
  return Math.hypot(sample.x, sample.y, sample.z)
}
