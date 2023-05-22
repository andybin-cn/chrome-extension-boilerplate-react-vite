import path from 'path'
import { defineConfig, mergeConfig } from 'vitest/config'

import viteConfig from '../app/vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }),
)
