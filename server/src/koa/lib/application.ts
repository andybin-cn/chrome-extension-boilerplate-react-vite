/**
 * Module dependencies.
 */
import type { KoaRequest } from '..'
import type { ComposedMiddleware } from 'koa-compose'
import compose from 'koa-compose'

import { KoaContext } from '..'

export type RequestListener = (req: KoaRequest) => Promise<void>

type MiddlewareFunction = (
  ctx: KoaContext<any>,
  next: () => Promise<void>,
) => void

/**
 * Expose `Application` class.
 * Inherits from `Emitter.prototype`.
 */
export class Application {
  middleware: MiddlewareFunction[]

  /**
   * Initialize a new `Application`.
   *
   * @api public
   */
  constructor() {
    this.middleware = []
  }

  /**
   * Shorthand for:
   *
   *    http.createServer(app.callback()).listen(...)
   *
   * @param {Mixed} ...
   * @return {Server}
   * @api public
   */

  listen(): RequestListener {
    console.debug('listen')
    return this.callback()
  }

  reset() {
    this.middleware.splice(0, this.middleware.length)
    return this
  }

  /**
   * Use the given middleware `fn`.
   *
   * Old-style middleware will be converted.
   *
   * @param {Function} fn
   * @return {Application} self
   * @api public
   */
  use(fn: MiddlewareFunction) {
    if (typeof fn !== 'function')
      throw new TypeError('middleware must be a function!')
    this.middleware.push(fn)
    return this
  }

  /**
   * Return a request handler callback
   * for node's native http server.
   *
   * @return {Function}
   * @api public
   */
  callback(): RequestListener {
    const fn = compose(this.middleware)

    return (req: KoaRequest) => {
      const ctx = this.createContext(req)
      return this.handleRequest(ctx, fn)
    }
  }

  /**
   * Handle request in callback.
   *
   * @api private
   */
  handleRequest(
    ctx: KoaContext<any>,
    fnMiddleware: ComposedMiddleware<KoaContext<any>>,
  ) {
    return fnMiddleware(ctx).catch((e: Error) => {
      console.error('handleRequest error:', e)
    })
  }

  /**
   * Initialize a new context.
   *
   * @api private
   */

  createContext(req: KoaRequest): KoaContext<any> {
    return new KoaContext(this, req)
  }
}
