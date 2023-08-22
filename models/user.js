import { Schema, model, models } from 'mongoose'

const UserSchema = new Schema({
  username: {
    type: String,
  },
  name: {
    type: String,
    required: [true, 'name required'],

  },
  email: {
    type: String,
    unique: [true, 'email already exists'],
    required: [true, 'email is required']

  },
  image: {
    type: String,
  },
  nativeLanguage: {
    type: String,
  },
  languages: {
    type: [{ type: Schema.Types.ObjectId, ref: "languages" }]
  },
  age: {
    type: String
  },
  topics: {
    type: [{ type: Schema.Types.ObjectId, ref: "topics"}]
  },
  streak: {
    type: Number
  },
  points: {
    type: Number
  },
 
},
{
  timestamps: true
}
)

const User = models.User || model('User', UserSchema, "users")

export default User