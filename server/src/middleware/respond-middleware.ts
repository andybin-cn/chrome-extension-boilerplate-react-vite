import { sessionManager } from '@@server/manager/session-manager'
import { KoaMessage } from '@chrome-extension-boilerplate/utils'

import { KoaContext } from '../koa'

const isBroadcastMsg = (msg: KoaMessage) => {
  return (
    msg.session.id === '' && msg.session.name === '' && msg.session.url === ''
  )
}

const RespondMiddleware = async (
  ctx: KoaContext<any>,
  next: () => Promise<any>,
) => {
  sessionManager.saveSessionByReq(ctx.req)
  await next()
  await Promise.all(
    ctx.responses.map((msg) => {
      if (isBroadcastMsg(msg)) {
        const broadcastSessions = sessionManager.getSessionByRole(
          msg.session.role,
        )
        console.log('111 broadcastSessions', broadcastSessions)
        return Promise.all(
          broadcastSessions.map((sess) => sess.respondMsg(msg)),
        )
      }
      const session = sessionManager.getSessionById(msg.session.id)
      console.log('111 session', session)
      if (session) {
        return session.respondMsg(msg)
      }
    }),
  )
}

export default RespondMiddleware
