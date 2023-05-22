import { isKoaMessage } from '@@utils/index'

declare global {
  interface Window {
    cryptoExtentionGeneratorProvider?: any
  }
}

function injectScript() {
  console.log('injectScripts11:')
  try {
    const container = document.head || document.documentElement
    const injectScripts: string[] = [browser.runtime.getURL('inpage_script.js')]
    console.log('injectScripts:', injectScripts)
    const importScript = (url: string) => {
      const scriptTag = document.createElement('script')
      scriptTag.src = url
      scriptTag.type = 'text/javascript'
      container.insertBefore(scriptTag, container.children[0])
      scriptTag.remove()
    }
    injectScripts.forEach(importScript)
  } catch (error) {
    console.error(
      'Chrome Extension Boilerplate: script injection failed.',
      error,
    )
  }
}

injectScript()

class ContentScript {
  _port?: browser.runtime.Port

  start = () => {
    this._port = this.connectServiceWorker()
    window.addEventListener('message', this._receiveMessageFromWeb)
  }

  _receiveMessageFromWeb = (e: any) => {
    const request = e.data
    if (request?.type !== 'chrome-extension-boilerplate-inpage-to-content') {
      return
    }
    if (isKoaMessage(request.payload)) {
      this._port?.postMessage(request.payload || {})
    }
  }

  connectServiceWorker() {
    const port = browser.runtime.connect()
    port.onDisconnect.addListener(() => {
      setTimeout(() => {
        this.connectServiceWorker()
      }, 1000)
    })
    this._port = port
    this._port.onMessage.addListener((message) => {
      window.postMessage(
        {
          type: 'chrome-extension-boilerplate-content-to-inpage',
          payload: message,
        },
        location.origin,
      )
    })
    return port
  }
}

const contentScript = new ContentScript()
contentScript.start()

export default contentScript
