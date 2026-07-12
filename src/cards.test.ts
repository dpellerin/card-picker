import { describe, expect, it } from 'vitest'
import { DECK, randomIndex } from './cards.ts'

describe('deck', () => {
  it('contains 52 unique cards without jokers', () => {
    expect(DECK).toHaveLength(52)
    expect(new Set(DECK.map((card) => card.fileName))).toHaveLength(52)
    expect(DECK.some((card) => card.fileName.includes('joker'))).toBe(false)
  })
})

describe('randomIndex', () => {
  it('maps values into the requested range', () => {
    expect(randomIndex(52, () => 0)).toBe(0)
    expect(randomIndex(52, () => 51)).toBe(51)
    expect(randomIndex(52, () => 52)).toBe(0)
  })

  it('rejects values in the biased tail', () => {
    const values = [0xffff_ffff, 7]
    expect(randomIndex(52, () => values.shift()!)).toBe(7)
    expect(values).toHaveLength(0)
  })

  it('rejects invalid deck lengths', () => {
    expect(() => randomIndex(0)).toThrow(RangeError)
  })
})
