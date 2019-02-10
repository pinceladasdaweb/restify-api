import * as restify from 'restify'
import { NotFoundError } from 'restify-errors'

import { Router } from '../../common/router'
import { User } from './users.model'

class UsersRouter extends Router {

  constructor() {
    super()
    this.on('beforeRender', document => {
      document.password = undefined
    })
  }

  applyRoutes(application: restify.Server) {
    application.get('/users', (req: restify.Request, res: restify.Response, next: restify.Next) => {
      User.find()
          .then(this.render(res, next))
          .catch(next)
    })

    application.get('/users/:id', (req: restify.Request, res: restify.Response, next: restify.Next) => {
      User.findById(req.params.id)
          .then(this.render(res, next))
          .catch(next)
    })

    application.post('/users', (req: restify.Request, res: restify.Response, next: restify.Next) => {
      let user = new User(req.body)

      user.save()
          .then(this.render(res, next))
          .catch(next)
    })

    application.put('/users/:id', (req: restify.Request, res: restify.Response, next: restify.Next) => {
      const options = { runValidators: true, overWrite: true }

      User.updateMany({_id: req.params.id}, req.body, options).exec().then(result => {
        if (result.n) {
          return User.findById(req.params.id)
                     .then(this.render(res, next))
                     .catch(next)
        } else {
          throw new NotFoundError('Document not found')
        }
      })
    })

    application.patch('/users/:id', (req: restify.Request, res: restify.Response, next: restify.Next) => {
      const options = { runValidators: true, new: true }

      User.findByIdAndUpdate(req.params.id, req.body, options)
          .then(this.render(res, next))
          .catch(next)
    })

    application.del('/users/:id', (req: restify.Request, res: restify.Response, next: restify.Next) => {
      User.findOneAndDelete({_id: req.params.id})
          .exec()
          .then(result => {
            if (result._id) {
              res.send(204)
            } else {
              throw new NotFoundError('Document not found')
            }
            return next()
      }).catch(next)
    })
  }
}

export const usersRouter = new UsersRouter()