import BwController from './controller/misc-controller'
import { KoaContext } from './koa'

const routers = {
  ...BwController,
}

export type IRouters = keyof typeof routers

export type GetResponseType<T extends IRouters> = Awaited<
  ReturnType<(typeof routers)[T]>
>

type GetKoaGeneric<T> = T extends KoaContext<infer P> ? P : never

export type GetParameters<T extends IRouters> = GetKoaGeneric<
  Parameters<(typeof routers)[T]>[0]
>

export default routers
