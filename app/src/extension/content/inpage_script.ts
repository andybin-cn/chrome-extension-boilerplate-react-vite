import { WebRpcClient } from './web-rpc-client'

declare global {
  interface Window {
    chromeExtensionBoilerplate: any
  }
}
console.log('inpage script  111111')

const rpcClient = new WebRpcClient()
window.chromeExtensionBoilerplate = {
  rpcClient,
  test: async () => {
    const result = await rpcClient.sendRequest({
      method: 'test_hello',
      params: ['Hi, I am from the inpage script.'],
    })
    console.log('result:', result)
  },
}

export {}
