import { payloadId, uuid } from '@@utils/misc'
import { IJsonRpcResponse, KoaMessage, KoaSession } from '@@utils/types'
import {
  isJsonRpcRequest,
  isJsonRpcResponse,
  isJsonRpcResponseError,
  isJsonRpcResponseSuccess,
  isKoaMessage,
} from '@@utils/validators'
import EventEmitter from 'node:events'

export class WebRpcClient extends EventEmitter {
  private session: KoaSession

  constructor() {
    super()
    this.sendRequest.bind(this)
    this.sendRaw.bind(this)
    this.sendResponse.bind(this)
    this.sendResponseRaw.bind(this)

    this.session = {
      id: uuid(),
      url: location.origin,
      name: document.title,
      role: 'web',
    }
    window.addEventListener('message', this._receiveMessageFromContentScript)
  }
  _receiveMessageFromContentScript = (e: any) => {
    const request = e.data
    if (request?.type !== 'chrome-extension-boilerplate-content-to-inpage') {
      return
    }
    const message = request.payload
    if (!isKoaMessage(message)) {
      return
    }
    const { payload } = message
    if (isJsonRpcRequest(payload)) {
      this.emit(payload.method, payload)
    } else if (isJsonRpcResponse(payload)) {
      this.emit(`response-${payload.id}`, payload)
    }
  }
  sendRequest<T = any>(request: {
    method: string
    params?: any[]
    id?: string
  }): Promise<T> {
    const { method, params = [], id } = request
    const koaMsg: KoaMessage = {
      id: uuid(),
      createTime: Date.now(),
      session: this.session,
      payload: {
        method,
        params,
        id: id ?? payloadId(),
        jsonrpc: '2.0',
      },
    }

    this.sendRaw(koaMsg)
    return new Promise<T>((resole, reject) => {
      this.once(`response-${koaMsg.payload.id}`, (resp) => {
        if (isJsonRpcResponseSuccess(resp)) {
          resole(resp.result)
        } else if (isJsonRpcResponseError(resp)) {
          reject(resp.error)
        } else {
          reject(new Error('can not parse the response'))
        }
      })
    })
  }

  sendResponseRaw(resp: IJsonRpcResponse) {
    const koaMsg: KoaMessage = {
      id: uuid(),
      createTime: Date.now(),
      session: this.session,
      payload: resp,
    }

    this.sendRaw(koaMsg)
  }
  sendResponse(params: { requestId: string; result?: any; error?: any }) {
    const resp: IJsonRpcResponse = {
      id: params.requestId,
      jsonrpc: '2.0',
      result: params.result,
      error: params.error,
    }
    this.sendResponseRaw(resp)
  }

  public sendRaw(message: KoaMessage): void {
    if (!isKoaMessage(message)) {
      throw new Error('message not a KoaMessage format')
    }
    window.postMessage(
      {
        type: 'chrome-extension-boilerplate-inpage-to-content',
        payload: message,
      },
      location.origin,
    )
  }
}
