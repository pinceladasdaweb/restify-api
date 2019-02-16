import { User } from 'routes/users/users.model'

declare module 'restify' {
  export interface Request {
    authenticated: User
  }
}