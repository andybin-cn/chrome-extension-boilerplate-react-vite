import { generateManifest as chromeManifest } from './chrome'
import { generateManifest as chromeDevManifest } from './chrome_dev'

export function generateManifest(isDev: boolean, mode: string, target: string) {
  if (target === 'chrome' && isDev) {
    return chromeDevManifest(mode)
  }
  return chromeManifest(mode)
}
