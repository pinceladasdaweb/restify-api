import * as mongoose from 'mongoose'
import * as bcrypt from 'bcrypt'

import { validateCPF } from '../../common/validators'
import { environment } from '../../common/environment'

export interface User extends mongoose.Document {
  name: string,
  email: string,
  password: string,
  cpf: string,
  gender: string,
  profiles: [],
  matches(password: string): boolean,
  hasAny(...profiles: string[]): boolean
}

export interface UserModel extends mongoose.Model<User> {
  findByEmail(email: string, projection?: string): Promise<User>
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
  cpf: {
    type: String,
    required: false,
    validate: {
      validator: validateCPF,
      message: '{PATH}: Invalid CPF ({VALUE})'
    }
  },
  gender: {
    type: String,
    required: false,
    enum: ['Male', 'Female', 'Transsexual', 'Neutral', 'Cross Gender']
  },
  profiles: {
    type: [String],
    required: false
  }
})

userSchema.statics.findByEmail = function(email: string, projection: string) {
  return this.findOne({email}, projection)
}

userSchema.methods.matches = function(password: string): boolean {
  return bcrypt.compareSync(password, this.password)
}

userSchema.methods.hasAny = function(...profiles: string[]): boolean {
  return profiles.some(profile => this.profiles.indexOf(profile) !== -1)
}

const hashPassword = (obj, next) => {
  bcrypt.hash(obj.password, environment.security.saltRounds).then(hash => {
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

export const User = mongoose.model<User, UserModel>('User', userSchema)