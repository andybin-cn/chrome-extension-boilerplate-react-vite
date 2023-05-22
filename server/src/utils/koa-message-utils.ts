import {
  ClientRole,
  KoaMessage,
  KoaSession,
  payloadId,
  uuid,
} from '@chrome-extension-boilerplate/utils'

export function broadcastReqMessage(params: {
  method: string
  params: any[]
  role: ClientRole
}): KoaMessage {
  return {
    id: uuid(),
    payload: {
      id: payloadId(),
      jsonrpc: '2.0',
      method: params.method,
      params: params.params,
    },
    createTime: Date.now(),
    session: {
      id: '',
      url: '',
      name: '',
      role: params.role,
    },
  }
}

export function koaReqMessage(params: {
  method: string
  params: any[]
  session: KoaSession
}): KoaMessage {
  return {
    id: uuid(),
    payload: {
      id: payloadId(),
      jsonrpc: '2.0',
      method: params.method,
      params: params.params,
    },
    createTime: Date.now(),
    session: params.session,
  }
}
