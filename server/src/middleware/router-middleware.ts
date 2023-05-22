import { KoaContext } from '..'
import routers, { IRouters } from '../router'

const dispatchRoute = async (ctx: KoaContext<unknown>) => {
  const method = (ctx.rpcReq?.method ?? '') as IRouters
  if (typeof routers[method] === 'function') {
    const fn = routers[method] as (ctx: KoaContext<unknown>) => Promise<unknown>
    const result = await fn(ctx)
    ctx.pushResponse({ result })
  }
}

const RouterMiddleware = async (
  ctx: KoaContext<unknown>,
  next: () => Promise<unknown>,
) => {
  await dispatchRoute(ctx)
  await next()
}
export default RouterMiddleware
