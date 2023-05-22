import { KoaRequest } from '@@server/koa'
import { startService } from '@chrome-extension-boilerplate/server/src/bootstrap'

startService({
  requestCb: async (handleRequest) => {
    chrome.runtime.onConnect.addListener((port) => {
      port.onMessage.addListener((msg) => {
        console.log('onMessage', msg)
        const request = new KoaRequest(msg, async (msg) => {
          port.postMessage(msg)
        })
        handleRequest(request)
      })
    })
  },
})
