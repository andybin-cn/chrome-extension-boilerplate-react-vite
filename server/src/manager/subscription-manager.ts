import {
  broadcastReqMessage,
  koaReqMessage,
} from '@@server/utils/koa-message-utils'
import assert from 'assert'

import { KoaContext, KoaRequest } from '..'

type SessionSet = Map<string, KoaRequest>

interface ISubscription<T> {
  data: () => Promise<T>
  onRegister?: () => Promise<void>
}

const Subscriptions: Record<string, ISubscription<unknown>> = {
  'popup.walletSession': {
    data: async function () {
      // return WalletService.getWalletSession()
      return []
    },
  },
  'popup.uiRequestQueue': {
    data: async function () {
      return []
    },
  },
  'popup.connectDappSession': {
    data: async function () {
      return []
    },
  },
  'popup.tokenBalance': {
    data: async function () {
      return []
    },
    onRegister: async function () {
      // BalanceService.refreshBalanceIfNeed(true).catch(() => {
      //   // ignore, because if not import wallet, this function will throw error.
      // })
    },
  },
}

export type ISubscriptions = keyof typeof Subscriptions

class SubscriptionManagerCore {
  private subscriptions: Map<string, SessionSet> = new Map<string, SessionSet>()
  async register(ctx: KoaContext<[{ path: ISubscriptions }]>) {
    const { path } = ctx.params[0] ?? {}
    const subscription = this.getSubscription({ path })
    assert.ok(subscription, `not support subscription "${path}"`)
    const request = ctx.req
    const sessions =
      this.subscriptions.get(path) ?? new Map<string, KoaRequest>()
    sessions.set(request.msg.session.id, request)
    this.subscriptions.set(path, sessions)
    if (subscription.onRegister) {
      try {
        await subscription.onRegister()
      } catch (e) {
        // ignore
      }
    }
    const existData = await subscription.data()
    broadcastReqMessage
    await request.respondMsg(
      koaReqMessage({
        method: 'subscribe_update',
        params: [
          {
            path,
            data: existData ?? {},
          },
        ],
        session: request.msg.session,
      }),
    )
  }
  getSubscription(params: { path: ISubscriptions }) {
    return Subscriptions[params.path]
  }
  async pushSubscriptionUpdate(params: { path: ISubscriptions }) {
    const path = params.path
    const subscription = this.getSubscription({ path })
    const existData = await subscription?.data()
    const sessions = this.subscriptions.get(path)
    try {
      sessions?.forEach((req) => {
        req.respondMsg(
          koaReqMessage({
            method: 'subscribe_update',
            params: [
              {
                path,
                data: existData ?? {},
              },
            ],
            session: req.msg.session,
          }),
        )
      })
    } catch (error) {
      console.error(error)
    }
  }
  removeSub(params: { path: string; req: KoaRequest }) {
    const { path, req } = params
    const sessions =
      this.subscriptions.get(path) ?? new Map<string, KoaRequest>()
    sessions.delete(req.msg.session.id)
  }
  removeAllSub(params: { req: KoaRequest }) {
    const { req } = params
    this.subscriptions.forEach((value) => {
      value.delete(req.msg.session.id)
    })
  }
}

const SubscriptionManager = new SubscriptionManagerCore()
export default SubscriptionManager
