import * as restify from 'restify'
import * as mongoose from 'mongoose'
import { NotFoundError } from 'restify-errors'

import { Router } from './router'

export abstract class ModelRouter<D extends mongoose.Document> extends Router {

  basePath: string
  pageSize: number = 5

  constructor(protected model: mongoose.Model<D>) {
    super()
    this.basePath = `/${model.collection.name}`
  }

  protected prepareOne(query: mongoose.DocumentQuery<D,D>): mongoose.DocumentQuery<D,D>{
    return query
  }

  envelope(document: any): any {
    let resource = Object.assign({_links: {}}, document.toJSON())
    resource._links.self = `${this.basePath}/${resource._id}`
    return resource
  }

  envelopeAll(documents: any[], options: any = {}): any {
    const resource: any = {
      _links: {
        self: `${options.url}`
      },
      items: documents
    }

    if (options.page && options.count && options.pageSize) {
      if (options.page > 1) {
        resource._links.previous = `${this.basePath}?_page=${options.page - 1}`  
      }
      
      const remaining = options.count - (options.page * options.pageSize)
      if (remaining > 0) {
        resource._links.next = `${this.basePath}?_page=${options.page + 1}`
      }
    }
    return resource
  }

  validateId = (req: restify.Request, res: restify.Response, next: restify.Next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      next(new NotFoundError('Document not found'))
    } else {
      next()
    }
  }

  findAll = (req: restify.Request, res: restify.Response, next: restify.Next) => {
    let page = parseInt(req.query._page || 1, 10)
    page = page > 0 ? page : 1

    const skip = (page - 1) * this.pageSize

    this.model.countDocuments({}).exec().then(count => this.model.find()
      .skip(skip)
      .limit(this.pageSize)
      .then(this.renderAll(res, next, {
        page, count, pageSize: this.pageSize, url: req.url
      })))
      .catch(next)
  }

  findById = (req: restify.Request, res: restify.Response, next: restify.Next) => {
    this.prepareOne(this.model.findById(req.params.id))
      .then(this.render(res, next)).catch(next)
  }

  save = (req: restify.Request, res: restify.Response, next: restify.Next) => {
    let document = new this.model(req.body)

    document.save().then(this.render(res, next)).catch(next)
  }

  replace = (req: restify.Request, res: restify.Response, next: restify.Next) => {
    const options = { runValidators: true, overWrite: true }

    this.model.updateMany({_id: req.params.id}, req.body, options).exec().then(result => {
      if (result.n) {
        return this.model.findById(req.params.id).then(this.render(res, next)).catch(next)
      } else {
        throw new NotFoundError('Document not found')
      }
    })
  }

  update = (req: restify.Request, res: restify.Response, next: restify.Next) => {
    const options = { runValidators: true, new: true }

    this.model.findByIdAndUpdate(req.params.id, req.body, options).then(this.render(res, next))
        .catch(next)
  }

  delete = (req: restify.Request, res: restify.Response, next: restify.Next) => {
    this.model.findOneAndDelete({_id: req.params.id}).exec().then(result => {
      if (result._id) {
        res.send(204)
      } else {
        throw new NotFoundError('Document not found')
      }
      return next()
    }).catch(next)
  }
}