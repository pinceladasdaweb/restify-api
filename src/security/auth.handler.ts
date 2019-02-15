import * as restify from 'restify'
import * as jwt from 'jsonwebtoken'

import { NotAuthorizedError } from 'restify-errors'
import { User } from '../routes/users/users.model'
import { environment } from '../common/environment' 

export const authenticate: restify.RequestHandler = (req: restify.Request, res: restify.Response, next: restify.Next) => {
  const { email, password } = req.body

  User.findByEmail(email, '+password')
    .then(user => {
      if (user && user.matches(password)) {
        const token = jwt.sign({
          sub: user.email,
          iss: 'meat-api'
        }, environment.security.apiSecret)

        res.json({
          name: user.name,
          email: user.email,
          accessToken: token
        })
        return next(false)
      } else {
        return next(new NotAuthorizedError('Invalid Credentials'))
      }
  }).catch(next)
}