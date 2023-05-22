import {
  IJsonRpcRequest,
  IJsonRpcResponse,
  IJsonRpcResponseError,
  IJsonRpcResponseSuccess,
  KoaMessage,
  isJsonRpcRequest,
  isJsonRpcResponse,
  isJsonRpcResponseError,
  isJsonRpcResponseSuccess,
} from '@chrome-extension-boilerplate/utils'

export class KoaRequest {
  readonly msg: KoaMessage
  respondMsg: (msg: KoaMessage) => Promise<void>
  constructor(msg: KoaMessage, respondMsg: (msg: KoaMessage) => Promise<void>) {
    this.msg = msg
    this.respondMsg = respondMsg
  }

  get id(): string {
    return this.msg.payload.id
  }

  get rpcReq(): IJsonRpcRequest | undefined {
    if (this.msg.payload && isJsonRpcRequest(this.msg.payload)) {
      return this.msg.payload
    }
  }
  get rpcRes(): IJsonRpcResponse | undefined {
    if (this.msg.payload && isJsonRpcResponse(this.msg.payload)) {
      return this.msg.payload
    }
  }
  get rpcResSuccess(): IJsonRpcResponseSuccess | undefined {
    if (this.msg.payload && isJsonRpcResponseSuccess(this.msg.payload)) {
      return this.msg.payload
    }
  }
  get rpcError(): IJsonRpcResponseError | undefined {
    if (this.msg.payload && isJsonRpcResponseError(this.msg.payload)) {
      return this.msg.payload
    }
  }
}
