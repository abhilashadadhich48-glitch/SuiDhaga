import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    console.log("Connecting to DB with URI:", process.env.MONGO_URI ? "URI Exists" : "URI Missing");
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tailorconnect';
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${(error as Error).message}`);
    process.exit(1);
  }
};
