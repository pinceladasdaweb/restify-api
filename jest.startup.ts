import * as jestCli from 'jest-cli'

import { Server } from './src/server/server'
import { environment } from './src/common/environment'
import { usersRouter } from './src/routes/users/users.router'
import { reviewsRouter } from './src/routes/reviews/reviews.router'
import { User } from './src/routes/users/users.model'
import { Review } from './src/routes/reviews/reviews.model'

let server: Server

const beforeAllTests = () => {
  environment.db.url = process.env.DB_URL || 'mongodb://localhost/meat-api-test-db',
  environment.server.port = process.env.SERVER_PORT || 3001
  server = new Server()
  return server.bootstrap([
    usersRouter,
    reviewsRouter
  ])
 .then(() => User.deleteMany({}).exec())
 .then(() => Review.deleteMany({}).exec())
}

const afterAllTests = () => {
  return server.shutdown()
}

beforeAllTests()
.then(() => jestCli.run())
.then(() => afterAllTests())
.catch(console.error)