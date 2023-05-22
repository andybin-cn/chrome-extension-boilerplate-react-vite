import {
  IJsonRpcErrorMessage,
  IJsonRpcMessage,
  IJsonRpcRequest,
  IJsonRpcResponse,
  IJsonRpcResponseError,
  IJsonRpcResponseSuccess,
  KoaMessage,
  KoaReqMessage,
  KoaSession,
} from './types'

export function isJsonRpcRequest(object: any): object is IJsonRpcRequest {
  return (
    object &&
    typeof object.method !== 'undefined' &&
    typeof object.id !== 'undefined' &&
    typeof object.jsonrpc !== 'undefined'
  )
}

export function isJsonRpcResponseSuccess(
  object: any,
): object is IJsonRpcResponseSuccess {
  return (
    object &&
    typeof object.result !== 'undefined' &&
    typeof object.id !== 'undefined' &&
    typeof object.jsonrpc !== 'undefined'
  )
}

export function isJsonRpcErrorMessage(
  object: any,
): object is IJsonRpcErrorMessage {
  return object && typeof object.message !== 'undefined'
}

export function isJsonRpcResponseError(
  object: any,
): object is IJsonRpcResponseError {
  return (
    object &&
    typeof object.id !== 'undefined' &&
    typeof object.jsonrpc !== 'undefined' &&
    isJsonRpcErrorMessage(object.error)
  )
}

export function isJsonRpcResponse(object: any): object is IJsonRpcResponse {
  return isJsonRpcResponseSuccess(object) || isJsonRpcResponseError(object)
}

export function isJsonRpcMessage(object: any): object is IJsonRpcMessage {
  return isJsonRpcRequest(object) || isJsonRpcResponse(object)
}

export function isKoaSession(object: any): object is KoaSession {
  return (
    !!object &&
    typeof object.id === 'string' &&
    typeof object.url === 'string' &&
    typeof object.name === 'string' &&
    typeof object.role === 'string'
  )
}

export function isKoaMessage(object: any): object is KoaMessage {
  return (
    !!object &&
    typeof object.id === 'string' &&
    typeof object.createTime === 'number' &&
    isKoaSession(object.session) &&
    isJsonRpcMessage(object.payload)
  )
}

export function isKoaReqMessage(object: any): object is KoaReqMessage {
  return (
    !!object &&
    typeof object.from === 'string' &&
    typeof object.to === 'string' &&
    isJsonRpcRequest(object.payload)
  )
}
