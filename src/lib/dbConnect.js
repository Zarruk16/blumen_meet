import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("please define MONGODB_URI in your environment variable for databse connection");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

function isConnected() {
  return mongoose.connection.readyState === 1;
}

function resetCache() {
  cached.conn = null;
  cached.promise = null;
}

async function dbConnect() {
  if (cached.conn && isConnected()) {
    return cached.conn;
  }

  resetCache();

  const options = {
    bufferCommands: false,
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    dbName: process.env.MONGODB_DB || "google-meet",
    /** Prefer IPv4 — avoids intermittent Atlas SRV (querySrv ETIMEOUT) on some networks. */
    family: 4,
  };

  cached.promise = mongoose.connect(MONGODB_URI, options).then((conn) => conn);

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    resetCache();
    throw error;
  }

  return cached.conn;
}

/** Retry transient DNS / Atlas timeouts during OAuth sign-in. */
export async function dbConnectWithRetry(retries = 3) {
  let lastError;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await dbConnect();
    } catch (error) {
      lastError = error;
      resetCache();
      if (attempt < retries - 1) {
        await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

export default dbConnect;
