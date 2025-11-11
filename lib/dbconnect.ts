// lib/dbConnect.ts
import mongoose, { Mongoose } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  // During build time, we don't need a real database connection
  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
    console.warn('MONGODB_URI not defined. Using placeholder for build.');
  } else {
    throw new Error(
      'Please define the MONGODB_URI environment variable inside .env.local'
    );
  }
}

declare global {
  var mongoose: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  };
}

// Ensure the global object has the mongoose cache
if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}

/**
 * Global is used here to maintain a cached connection across hot-reloads
 * in development. This prevents connections growing exponentially
 */
async function dbConnect() {
  // If no MONGODB_URI is available (e.g., during build), return a mock connection
  if (!MONGODB_URI) {
    console.warn('No MONGODB_URI available, returning mock connection for build');
    return null;
  }

  const cached = global.mongoose;

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };
    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;