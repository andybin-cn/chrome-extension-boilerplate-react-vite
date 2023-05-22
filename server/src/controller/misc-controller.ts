import { sessionManager } from '@@server/manager/session-manager'

import { KoaContext } from '..'

const BwController = {
  async misc_ping() {
    return 'misc_pong'
  },
  async misc_disconnect(ctx: KoaContext<[]>) {
    sessionManager.removeSessionById(ctx.req.msg.session.id)
    return 'success'
  },
  async misc_sayHello() {
    return 'hi, this is background script.'
  },
}
export default BwController
