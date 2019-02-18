/// <reference path="../types/restify.d.ts" />

import * as restify from 'restify'
import * as jwt from 'jsonwebtoken'

import { User } from '../routes/users/users.model'
import { environment } from '../common/environment'

export const tokenParser: restify.RequestHandler = (req: restify.Request, res: restify.Response, next: restify.Next) => {
  const token: string = extractToken(req)

  if (token) {
    jwt.verify(token, environment.security.apiSecret, applyBearer(req, next))
  } else {
    next()
  }
}

function extractToken(req: restify.Request) {
  let token = undefined
  const authorization = req.header('authorization')
  if (authorization) {
    const parts: string[] = authorization.split(' ')
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1]
    }
  }
  return token
}

function applyBearer(req: restify.Request, next: restify.Next): (error, decoded) => void {
  return (error, decoded) => {
    if (decoded) {
      User.findByEmail(decoded.sub).then(user => {
        if (user) {
          req.authenticated = user
        }
        next()
      }).catch(next)
    } else {
      next()
    }
  }
}