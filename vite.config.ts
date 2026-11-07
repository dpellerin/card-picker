/// <reference types="vitest/config" />
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/card-picker/',
  test: {
    include: ['src/**/*.test.ts'],
  },
})
