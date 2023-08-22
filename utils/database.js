import mongoose from 'mongoose'

export const connectDb = async () => {
  if (!process.env.MONGO_URI || process.env.MONGO_URI.length === 0) {
    throw new Error("Please add your MongoDB URI to .env.local");
  }
  
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'MultiLingualChatbot'
    })
    console.log("database connected")
  } catch (error) {
    console.log(error)
  }
}