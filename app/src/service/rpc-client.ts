import {
  GetParameters,
  GetResponseType,
  IRouters,
} from '@chrome-extension-boilerplate/server/src/router'
import {
  IJsonRpcMessage,
  IJsonRpcResponse,
  KoaMessage,
  KoaSession,
  isJsonRpcRequest,
  isJsonRpcResponseError,
  isJsonRpcResponseSuccess,
  isKoaMessage,
  payloadId,
  uuid,
} from '@chrome-extension-boilerplate/utils'
import EventEmitter from 'node:events'

import { retryPromise } from '@/tools/promise-tools'

interface SendRequestProps<T extends IRouters> {
  method: T
  params?: GetParameters<T>
  id?: string
}

interface SendOptionProps {
  timeout?: number
}

export class RpcClient extends EventEmitter {
  private session: KoaSession
  get origin(): string {
    if (
      typeof window !== 'undefined' &&
      typeof window.location !== 'undefined'
    ) {
      return window.location.origin
    }
    return ''
  }
  get name(): string {
    return 'place you app name here'
  }
  port?: browser.runtime.Port

  constructor() {
    super()
    this.session = {
      id: uuid(),
      url: this.origin,
      name: this.name,
      role: 'app',
    }
    this.setMaxListeners(100)
    this.port = this.connectServiceWorker(JSON.stringify(this.session), true)
    this.startPing()
  }

  async startPing(count = 1) {
    try {
      await this.sendRequest({ method: 'misc_ping' }, { timeout: 2000 * count })
      setTimeout(() => {
        this.startPing()
      }, 2000)
    } catch (error) {
      this.port = this.connectServiceWorker(JSON.stringify(this.session))
      setTimeout(() => {
        this.startPing(count + 1)
      }, 2000)
    }
  }

  private connectServiceWorker(name: string, isInitialize = false) {
    try {
      const port = browser.runtime.connect({ name })
      port?.onDisconnect.addListener(() => {
        setTimeout(() => {
          this.connectServiceWorker(name)
        }, 2000)
      })
      this.port = port
      this.port?.onMessage.addListener(this.receiveMessageFromService)
      if (!isInitialize) this.emit('reconnect')
      return port
    } catch (e) {
      setTimeout(() => {
        this.connectServiceWorker(name)
      }, 2000)
    }
    return undefined
  }

  private async sendResponseRaw(resp: IJsonRpcResponse) {
    await retryPromise(async () => {
      this.postMessage({
        id: uuid(),
        createTime: Date.now(),
        payload: resp,
        session: this.session,
      })
    })
  }

  private receiveMessageFromService = (message: any) => {
    if (!isKoaMessage(message)) {
      return
    }
    const { payload } = message
    this.emitEvent(payload)
  }

  emitEvent(payload: IJsonRpcMessage) {
    if (isJsonRpcRequest(payload)) {
      this.emit(payload.method, payload)
    } else if (isJsonRpcResponseSuccess(payload)) {
      this.emit(`response-${payload.id}`, payload)
    } else if (isJsonRpcResponseError(payload)) {
      this.emit(`response-${payload.id}`, payload)
    }
  }

  async postMessage(koaMsg: KoaMessage): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.port?.postMessage(koaMsg)
        resolve()
      } catch (e) {
        reject(e)
      }
    })
  }

  sendRequest<T extends IRouters>(
    request: SendRequestProps<T>,
    options?: SendOptionProps,
  ): Promise<GetResponseType<T>> {
    const { method, params = [], id = payloadId() } = request
    const { timeout = 300 * 1000 } = options ?? {}
    const koaMsg: KoaMessage = {
      id: uuid(),
      createTime: Date.now(),
      session: this.session,
      payload: {
        method,
        params,
        id,
        jsonrpc: '2.0',
      },
    }
    return new Promise<GetResponseType<T>>((resole, reject) => {
      const timer = setTimeout(() => {
        this.emit(`response-${koaMsg.payload.id}`, {
          id: koaMsg.payload.id,
          jsonrpc: '2.0',
          error: {
            code: 408,
            message: 'RpcClientMobile request time out with method:' + method,
          },
        })
      }, timeout)
      this.once(`response-${koaMsg.payload.id}`, (resp) => {
        clearTimeout(timer)
        if (isJsonRpcResponseSuccess(resp)) {
          resole(resp.result)
        } else if (isJsonRpcResponseError(resp)) {
          reject(resp.error)
        } else {
          reject(new Error('can not parse the response'))
        }
      })
      retryPromise(async () => {
        return this.postMessage(koaMsg)
      })
    })
  }

  async sendResponse(params: { requestId: string; result?: any; error?: any }) {
    const resp: IJsonRpcResponse = {
      id: params.requestId,
      jsonrpc: '2.0',
      result: params.result,
      error: params.error,
    }
    return this.sendResponseRaw(resp)
  }
}

export const rpcClient = new RpcClient()
