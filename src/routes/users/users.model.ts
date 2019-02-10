import * as mongoose from 'mongoose'
import * as bcrypt from 'bcrypt'

import { validateCPF } from '../../common/validators'
import { environment } from '../../common/environment'

export interface User extends mongoose.Document {
  name: string,
  email: string,
  password: string,
  gender: string,
  cpf: string
}

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 80,
    minlength: 3
  },
  email: {
    type: String,
    unique: true,
    match: /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/,
    required: true
  },
  password: {
    type: String,
    select: false,
    required: true
  },
  gender: {
    type: String,
    required: false,
    enum: ['Male', 'Female', 'Transsexual', 'Neutral', 'Cross Gender']
  },
  cpf: {
    type: String,
    required: false,
    validate: {
      validator: validateCPF,
      message: '{PATH}: Invalid CPF ({VALUE})'
    }
  }
})

const hashPassword = (obj, next) => {
  bcrypt.hash(obj.password, environment.security.saltRounds)
        .then(hash => {
          obj.password = hash
          next()
        }).catch(next)
}

const saveMiddleware = function(next) {
  const user: User = this
  if (!user.isModified('password')) {
    next()
  } else {
    hashPassword(user, next)
  }
}

const updateMiddleware = function(next) {
  if (!this.getUpdate().password) {
    next()
  } else {
    hashPassword(this.getUpdate(), next)
  }
}

userSchema.pre<User>('save', saveMiddleware)
userSchema.pre('findOneAndUpdate', updateMiddleware)
userSchema.pre('updateMany', updateMiddleware)

export const User = mongoose.model<User>('User', userSchema)