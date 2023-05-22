import { KoaContext, RPCError, koaResponseForRequest } from '..'

const ErrorHandleMiddleware = async (
  ctx: KoaContext<any>,
  next: () => Promise<any>,
) => {
  try {
    console.debug('%c[request begin]', 'font-weight: bold;')
    console.debug(
      `%c[request from ] %c ${ctx.req.msg.session.role}`,
      'font-weight: bold;',
      'color: red;font-weight: bold;',
      ctx.req.msg,
    )
    await next()
    ctx.responses.forEach((res) => {
      console.debug(
        `%c[response to  ] %c ${res.session.role}`,
        'font-weight: bold;',
        'color: blue;font-weight: bold;',
        res,
      )
    })
    console.debug('%c[request end  ]', 'font-weight: bold;')
  } catch (error: any) {
    let rpcError: RPCError = new RPCError({
      code: 500,
      message: error.message || 'background error',
    })
    if (error instanceof RPCError) {
      rpcError = error
    }
    ctx.req.respondMsg(
      koaResponseForRequest({
        reqMsg: ctx.req.msg,
        result: null,
        error: rpcError,
      }),
    )
    console.error(`middleware error:`, error)
  }
}
export default ErrorHandleMiddleware
