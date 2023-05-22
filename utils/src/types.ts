export type ClientRole =
  | 'app'
  | 'extension'
  | 'web'
  | 'service'
  | 'unknown'
  | 'BroadcastToAll'

export interface IJsonRpcRequest {
  id: string
  jsonrpc: string
  method: string
  params: any[]
}

export interface IJsonRpcResponseSuccess {
  id: string
  jsonrpc: string
  result: any
}

export interface IJsonRpcErrorMessage {
  code?: number
  message: string
}

export interface IJsonRpcResponseError {
  id: string
  jsonrpc: string
  error: IJsonRpcErrorMessage
}

export type IJsonRpcMessage = IJsonRpcResponse | IJsonRpcRequest

export type IJsonRpcResponse = IJsonRpcResponseSuccess | IJsonRpcResponseError

export interface KoaSession {
  id: string
  url: string
  name: string
  role: ClientRole
}
export interface KoaMessage {
  readonly id: string
  readonly payload: IJsonRpcMessage
  readonly createTime: number
  readonly session: KoaSession
  readonly auth?: string
  readonly extendInfo?: JSON
}

export interface KoaReqMessage extends KoaMessage {
  readonly payload: IJsonRpcRequest
}
