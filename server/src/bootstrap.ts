import Koa, { RequestListener } from './koa'
import ErrorHandleMiddleware from './middleware/error-handle-middleware'
import RespondMiddleware from './middleware/respond-middleware'
import RouterMiddleware from './middleware/router-middleware'

export const app = new Koa()

interface IStartServiceProps {
  requestCb: (handleRequest: RequestListener) => void
}

const startService = (props: IStartServiceProps) => {
  const middleware = [
    ErrorHandleMiddleware,
    RespondMiddleware,
    RouterMiddleware,
  ]
  app.reset()
  middleware.forEach((fn) => app.use(fn))
  const handleRequest = app.listen()
  props.requestCb(handleRequest)
}

export { startService }
