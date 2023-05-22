import type Application from '..'
import type { KoaRequest } from './request'
import type {
  IJsonRpcRequest,
  IJsonRpcResponse,
  IJsonRpcResponseError,
  IJsonRpcResponseSuccess,
  KoaMessage,
} from '@chrome-extension-boilerplate/utils'

import { koaResponseForRequest } from './message'

export class KoaContext<T> {
  req: KoaRequest
  app: Application
  responses: KoaMessage[] = []
  constructor(app: Application, req: KoaRequest) {
    this.app = app
    this.req = req
  }
  get rpcReq(): IJsonRpcRequest | undefined {
    return this.req.rpcReq
  }
  get rpcRes(): IJsonRpcResponse | undefined {
    return this.req.rpcRes
  }
  get rpcResSuccess(): IJsonRpcResponseSuccess | undefined {
    return this.req.rpcResSuccess
  }
  get rpcError(): IJsonRpcResponseError | undefined {
    return this.req.rpcError
  }
  /**
   * this is request params from RPC params
   *
   * and  the params type this `Array`
   */
  get params(): T {
    return (this.req?.rpcReq?.params ?? []) as unknown as T
  }

  pushResponse<R, RPCError>(params: { result?: R; error?: RPCError }) {
    this.responses.push(
      koaResponseForRequest({
        reqMsg: this.req.msg,
        ...params,
      }),
    )
  }
}
