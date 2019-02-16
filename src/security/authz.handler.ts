import * as restify from 'restify'

import { ForbiddenError } from 'restify-errors'

export const authorize: (...profiles: string[]) => restify.RequestHandler = (...profiles) => {
  return (req, res, next) => {
    if (req.authenticated !== undefined && req.authenticated.hasAny(...profiles)) {
      req.log.debug('User %s is authorized with profiles %j on route %s. Required profiles %j',
        req.authenticated._id,
        req.authenticated.profiles,
        req.path(),
        profiles)
      next()
    } else {
      if (req.authenticated) {
        req.log.debug(
          'Permission denied for %s. Required profiles: %j. User profiles: %j',
            req.authenticated._id, profiles, req.authenticated.profiles)
      }
      next(new ForbiddenError('Permission denied'))
    }
  }
}
