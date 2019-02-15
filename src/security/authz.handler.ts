import * as restify from 'restify'

import { ForbiddenError } from 'restify-errors'

export const authorize: (...profiles: string[]) => restify.RequestHandler = (...profiles) => {
  return (req, res, next) => {
    if (req.authenticated !== undefined && req.authenticated.hasAny(...profiles)) {
      next()
    } else {
      next(new ForbiddenError('Permission denied'))
    }
  }
}

