import {
  ClientRole,
  KoaMessage,
  KoaSession,
} from '@chrome-extension-boilerplate/utils'

import { KoaRequest } from '..'

export interface Session {
  koaSession: KoaSession
  respondMsg: (msg: KoaMessage) => Promise<void>
  updateTime: number
}

class SessionManager {
  allSession: Map<string, Session> = new Map<string, Session>()
  lastCheckDieTime: number = Date.now()
  getSessionById(id: string): Session | undefined {
    return this.allSession.get(id)
  }
  removeSessionById(id: string) {
    this.allSession.delete(id)
  }
  getSessionByRole(role: ClientRole): Session[] {
    if (role === 'BroadcastToAll') {
      return Array.from(this.allSession).map((pairs) => pairs[1])
    }
    return Array.from(this.allSession)
      .map((pairs) => pairs[1])
      .filter((s) => s.koaSession.role === role)
  }
  saveSessionByReq(req: KoaRequest) {
    const nowTimestamp = Date.now()
    if (!this.allSession.get(req.msg.session.id)) {
      this.allSession.set(req.msg.session.id, {
        koaSession: req.msg.session,
        respondMsg: req.respondMsg,
        updateTime: nowTimestamp,
      })
    }

    if (nowTimestamp - this.lastCheckDieTime > 1000 * 60 * 5) {
      this.lastCheckDieTime = nowTimestamp
      const expireTime = 1000 * 60 * 10
      this.allSession.forEach((e) => {
        if (nowTimestamp - e.updateTime > expireTime) {
          this.allSession.delete(e.koaSession.id)
        }
      })
    }
  }
}

export const sessionManager = new SessionManager()
