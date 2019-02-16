import * as jestCli from 'jest-cli'

import { Server } from './src/server/server'
import { environment } from './src/common/environment'
import { usersRouter } from './src/routes/users/users.router'
import { reviewsRouter } from './src/routes/reviews/reviews.router'
import { restaurantsRouter } from './src/routes/restaurants/restaurants.router'
import { User } from './src/routes/users/users.model'
import { Review } from './src/routes/reviews/reviews.model'
import { Restaurant } from './src/routes/restaurants/restaurants.model'

let server: Server

const beforeAllTests = () => {
  environment.db.url = process.env.DB_URL || 'mongodb://localhost/meat-api-test-db',
  environment.server.port = process.env.SERVER_PORT || 3001
  server = new Server()
  return server.bootstrap([
    usersRouter,
    reviewsRouter,
    restaurantsRouter
  ])
 .then(() => User.deleteMany({}).exec())
 .then(() => {
   let admin = new User()
   admin.name = 'admin'
   admin.email = 'admin@email.com'
   admin.password = '123456'
   admin.profiles = ['admin', 'user']
   return admin.save()
 })
 .then(() => Review.deleteMany({}).exec())
 .then(() => Restaurant.deleteMany({}).exec())
}

const afterAllTests = () => {
  return server.shutdown()
}

beforeAllTests()
.then(() => jestCli.run())
.then(() => afterAllTests())
.catch(console.error)