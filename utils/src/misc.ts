import { v4 as uuidV4 } from 'uuid'

export const uuid = uuidV4

export function payloadId(): string {
  const date = Date.now().toString()
  const extra = Math.floor(Math.random() * Math.pow(10, 6)).toString()
  return date + extra
}
