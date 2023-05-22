import packageJson from '../package.json'

export function generateManifest(mode: string) {
  let suffix = ''
  suffix = `(${mode ?? 'development'})`
  if (mode === 'production') {
    suffix = ''
  }

  const versionNumbs = packageJson.version.split(/[^0-9]+/)

  const manifestVersion = versionNumbs.join('.')

  return {
    name: `Chrome Extension Boilerplate${suffix}`,
    version: manifestVersion,
    version_name: packageJson.version,
    manifest_version: 3,
    description: 'A Chrome Extension Boilerplate.',
    action: {
      default_popup: 'index.html#/',
      default_title: 'Chrome Extension Boilerplate',
      default_icon: {
        '32': 'icon-32.png',
        '48': 'icon-48.png',
        '64': 'icon-64.png',
        '128': 'icon-128.png',
        '512': 'icon-512.png',
      },
    },
    permissions: ['alarms', 'notifications', 'storage'],
    host_permissions: ['<all_urls>'],
    content_scripts: [
      {
        matches: ['<all_urls>'],
        js: ['browser-polyfill.min.js', 'content_script.js'],
        run_at: 'document_start',
        all_frames: true,
      },
    ],
    icons: {
      '32': 'icon-32.png',
      '48': 'icon-48.png',
      '64': 'icon-64.png',
      '128': 'icon-128.png',
      '512': 'icon-512.png',
    },
    background: {
      service_worker: 'background.js',
      type: 'module',
    },
    web_accessible_resources: [
      {
        resources: ['inpage_script.js', 'assets/*.js'],
        matches: ['<all_urls>'],
      },
    ],
  }
}
