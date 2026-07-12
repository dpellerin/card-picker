import { describe, expect, it } from 'vitest'
import { ShakeDetector } from './motion.ts'

const impulse = { x: 14, y: 0, z: 0 }

describe('ShakeDetector', () => {
  it('requires two impulses inside the shake window', () => {
    const detector = new ShakeDetector()
    expect(detector.process(impulse, 0)).toBe(false)
    expect(detector.process(impulse, 300)).toBe(true)
  })

  it('ignores weak motion and impulses too far apart', () => {
    const detector = new ShakeDetector()
    expect(detector.process({ x: 3, y: 2, z: 1 }, 0)).toBe(false)
    expect(detector.process(impulse, 100)).toBe(false)
    expect(detector.process(impulse, 1_000)).toBe(false)
  })

  it('enforces a cooldown after a shake', () => {
    const detector = new ShakeDetector()
    detector.process(impulse, 0)
    expect(detector.process(impulse, 100)).toBe(true)
    expect(detector.process(impulse, 200)).toBe(false)
    expect(detector.process(impulse, 300)).toBe(false)
  })

  it('detects changes when only gravity-inclusive motion is available', () => {
    const detector = new ShakeDetector({ threshold: 8 })
    expect(detector.process({ x: 0, y: 0, z: 9.8 }, 0, true)).toBe(false)
    expect(detector.process({ x: 10, y: 0, z: 9.8 }, 100, true)).toBe(false)
    expect(detector.process({ x: 0, y: 0, z: 9.8 }, 300, true)).toBe(true)
  })
})
