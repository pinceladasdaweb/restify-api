import { Server } from './server/server'
import { usersRouter } from './routes/users/users.router'
import { restaurantsRouter } from './routes/restaurants/restaurants.router'
import { reviewsRouter } from './routes/reviews/reviews.router'
import { mainRouter } from './routes/main.router'

const server = new Server()

server.bootstrap([
    usersRouter,
    restaurantsRouter,
    reviewsRouter,
    mainRouter
  ]).then(server => {
  console.log('Server is listening on:', server.application.address())
}).catch(error => {
  console.log('Server failed to start')
  console.error(error)
  process.exit(1)
})