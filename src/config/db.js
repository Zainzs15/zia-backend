import mongoose from "mongoose";

// Connection caching for Vercel serverless (reuse across invocations)
const cached = global.mongoose || (global.mongoose = { conn: null, promise: null });

export async function connectDB() {
  if (!process.env.MONGO_URI) {
    const msg = "MONGO_URI is not set. Add it in Vercel Environment Variables.";
    console.error("❌", msg);
    if (typeof process.exit === "function") {
      process.exit(1);
    }
    throw new Error(msg);
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI).then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    cached.promise = null;
    console.error("❌ MongoDB connection error:", err);
    if (typeof process.exit === "function") {
      process.exit(1);
    }
    throw err;
  }
}
