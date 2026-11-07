import { describe, expect, it } from 'vitest'
import lockfile from '../pnpm-lock.yaml?raw'

// Inspect every packages entry, including non-hoisted and platform-only copies.
// A full audit in CI supplements these regression floors with new advisories.
const minimums: Record<string, number[]> = {
  vite: [8, 1, 6],
  vitest: [4, 1, 12],
  '@vitest/mocker': [4, 1, 12],
  postcss: [8, 5, 23],
  'source-map-js': [1, 2, 2],
  nanoid: [3, 3, 18],
}

describe('security dependency baseline', () => {
  for (const [name, minimum] of Object.entries(minimums)) {
    it(`keeps every ${name} copy at the patched baseline`, () => {
      const versions = [...lockfile.matchAll(/^  '?([^\s':]+)'?:\s*$/gm)]
        .map((match) => match[1].replace(/:$/, ''))
        .filter((entry) => entry.startsWith(`${name}@`))
        .map((entry) => entry.slice(name.length + 1).split('(')[0])
      expect(versions.length).toBeGreaterThan(0)
      for (const version of versions) {
        const parts = version.split('.').map(Number)
        const difference = minimum.map((floor, i) => parts[i] - floor).find((value) => value !== 0) ?? 0
        expect(difference, `${name}@${version}`).toBeGreaterThanOrEqual(0)
      }
    })
  }
})
