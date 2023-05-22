import react from '@vitejs/plugin-react'
import path from 'path'
import { Plugin, defineConfig, loadEnv } from 'vite'
import generateFile from 'vite-plugin-generate-file'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import svgr from 'vite-plugin-svgr'

import { generateManifest } from './manifest'
import { copyDevDistFiles, copyProdDistFiles } from './scripts/prepare'

function PluginCopyDevFiles(): Plugin {
  return {
    name: 'vite-plugin-copy-dev-files',
    async configResolved(reservedConfig) {
      const isDev = reservedConfig.command === 'serve'
      if (isDev) {
        return await copyDevDistFiles(
          reservedConfig.mode,
          process.env.TARGET_PLATFORM,
        )
      }
    },
    async closeBundle() {
      return copyProdDistFiles()
    },
  }
}

// https://vitejs.dev/config/
const config = defineConfig((config) => {
  const { mode, command } = config
  const isDev = command === 'serve'
  process.env = { ...process.env, ...loadEnv(mode, path.resolve('env')) }
  const manifest = generateManifest(isDev, mode, 'chrome')
  return {
    envDir: 'env',
    define: {
      __NODE_VERSION__: JSON.stringify(process.versions.node),
      __APP_VERSION__: JSON.stringify(manifest.version),
      __APP_VERSION_NAME__: JSON.stringify(manifest.version_name),
    },
    esbuild: {
      drop: ['production', 'uat'].includes(mode) ? ['console', 'debugger'] : [],
    },
    plugins: [
      nodePolyfills({
        protocolImports: true,
      }),
      react(),
      PluginCopyDevFiles(),
      generateFile([
        {
          type: 'json',
          output: './manifest.json',
          data: manifest,
        },
      ]),
      svgr(),
    ],
    resolve: {
      alias: {
        '@@server': path.resolve(__dirname, '../server/src'),
        '@@utils': path.resolve(__dirname, '../utils/src'),
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      commonjsOptions: {
        include: /node_modules|packages/,
        transformMixedEsModules: true,
      },
      rollupOptions: {
        input: {
          index: path.resolve(__dirname, 'index.html'),
          start_service: path.resolve(
            __dirname,
            'src/extension/background/start_service.ts',
          ),
          inpage_script: path.resolve(
            __dirname,
            'src/extension/content/inpage_script.ts',
          ),
        },
        output: {
          entryFileNames: (asset) => {
            return `${asset.name}.js`
          },
        },
      },
    },
  }
})

export default config
