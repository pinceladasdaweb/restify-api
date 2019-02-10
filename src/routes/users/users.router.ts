import * as restify from 'restify'
import { NotFoundError } from 'restify-errors'

import { ModelRouter } from '../../common/model-router'
import { User } from './users.model'

class UsersRouter extends ModelRouter<User> {

  constructor() {
    super(User)
    this.on('beforeRender', document => {
      document.password = undefined
    })
  }

  findByEmail = (req: restify.Request, res: restify.Response, next: restify.Next) => {
    if (req.query.email) {
      User.findByEmail(req.query.email)
        .then(user => user ? [user] : [])
        .then(this.renderAll(res, next))
        .catch(next)
    } else {
      next()
    }
  }

  applyRoutes(application: restify.Server) {
    application.get('/users', [this.findByEmail, this.findAll])
    application.get('/users/:id', [this.validateId, this.findById])
    application.post('/users', this.save)
    application.put('/users/:id', [this.validateId,this.replace])
    application.patch('/users/:id', [this.validateId,this.update])
    application.del('/users/:id', [this.validateId,this.delete])
  }
}

export const usersRouter = new UsersRouter()