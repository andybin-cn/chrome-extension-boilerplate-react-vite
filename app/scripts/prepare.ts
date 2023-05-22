import fs from 'fs-extra'

import { generateManifest } from '../manifest'
import { r } from './utils'

export async function copyDevDistFiles(mode: string, target = 'chrome') {
  await fs.emptyDir(r('dist'))
  await fs.ensureDir(r(`dist/src`))
  fs.ensureSymlink(r('src/assets'), r('dist/src/assets'))
  await fs.copy('public', 'dist')
  await fs.copy('dev/background.js', 'dist/background.js', { overwrite: true })
  await fs.copy(
    'node_modules/webextension-polyfill/dist/browser-polyfill.min.js',
    'dist/browser-polyfill.min.js',
  )

  await fs.copy('dev/background.html', 'dist/background.html', {
    overwrite: true,
  })
  await fs.copy('dev/content_script.js', 'dist/content_script.js', {
    overwrite: true,
  })
  await fs.copy('dev/index.js', 'dist/index.js')
  await fs.copy('dev/index.html', 'dist/index.html')
  const devManifest = generateManifest(true, mode, target)
  await fs.writeJSON(r('dist/manifest.json'), devManifest, { spaces: 2 })
}

export async function copyProdDistFiles() {
  await fs.copy(
    'node_modules/webextension-polyfill/dist/browser-polyfill.min.js',
    'dist/browser-polyfill.min.js',
    { overwrite: true },
  )
}
