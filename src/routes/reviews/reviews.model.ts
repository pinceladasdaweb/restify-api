import * as mongoose from 'mongoose'

import { Restaurant } from '../restaurants/restaurants.model'
import { User } from '../users/users.model'

export interface Review extends mongoose.Document {
  date: Date,
  rating: number,
  comments: string,
  restaurant: mongoose.Types.ObjectId | Restaurant,
  user: mongoose.Types.ObjectId | User
}

const reviewSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comments: {
    type: String,
    trim: true,
    required: true,
    maxlength: 500
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

export const Review = mongoose.model<Review>('Review', reviewSchema)