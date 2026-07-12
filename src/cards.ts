export const SUITS = ['clubs', 'diamonds', 'hearts', 'spades'] as const
export const RANKS = [
  'ace',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'jack',
  'queen',
  'king',
] as const

export type Suit = (typeof SUITS)[number]
export type Rank = (typeof RANKS)[number]

export interface Card {
  rank: Rank
  suit: Suit
  fileName: string
  label: string
}

const DISPLAY_RANKS: Record<Rank, string> = {
  ace: 'Ace',
  '2': 'Two',
  '3': 'Three',
  '4': 'Four',
  '5': 'Five',
  '6': 'Six',
  '7': 'Seven',
  '8': 'Eight',
  '9': 'Nine',
  '10': 'Ten',
  jack: 'Jack',
  queen: 'Queen',
  king: 'King',
}

export const DECK: readonly Card[] = SUITS.flatMap((suit) =>
  RANKS.map((rank) => ({
    rank,
    suit,
    fileName: `${rank}_of_${suit}.svg`,
    label: `${DISPLAY_RANKS[rank]} of ${suit}`,
  })),
)

export function randomIndex(
  length: number,
  getRandomValue: () => number = secureRandomValue,
): number {
  if (!Number.isSafeInteger(length) || length <= 0 || length > 0x1_0000_0000) {
    throw new RangeError('length must be a positive 32-bit integer')
  }

  const range = 0x1_0000_0000
  const unbiasedLimit = range - (range % length)
  let value: number

  do {
    value = getRandomValue()
  } while (value >= unbiasedLimit)

  return value % length
}

function secureRandomValue(): number {
  const value = new Uint32Array(1)
  crypto.getRandomValues(value)
  return value[0]
}

export function pickRandomCard(): Card {
  return DECK[randomIndex(DECK.length)]
}
