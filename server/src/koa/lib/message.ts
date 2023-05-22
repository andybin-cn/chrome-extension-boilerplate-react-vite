import {
  IJsonRpcErrorMessage,
  IJsonRpcResponse,
  KoaMessage,
  uuid,
} from '@chrome-extension-boilerplate/utils'

export const constructJsonRpcResponse = (params: {
  id: string
  result?: any
  error?: any
}): IJsonRpcResponse => {
  if (params.error) {
    return {
      id: params.id,
      jsonrpc: '2.0',
      error: params.error,
    }
  }
  return {
    id: params.id,
    jsonrpc: '2.0',
    result: params.result,
  }
}

export function koaResponseForRequest(params: {
  reqMsg: KoaMessage
  result?: any
  error?: any
}): KoaMessage {
  const resp = constructJsonRpcResponse({
    id: params.reqMsg.payload.id,
    result: params.result,
    error: params.error,
  })
  return {
    id: uuid(),
    payload: resp,
    createTime: Date.now(),
    session: params.reqMsg.session,
  }
}

export class RPCError extends Error implements IJsonRpcErrorMessage {
  code?: number
  message: string
  constructor(params: { code?: number; message: string }) {
    super(params.message)
    this.code = params.code
    this.message = params.message
  }
}
