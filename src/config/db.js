import mongoose from "mongoose";
import { env } from "./env.js";

// Guardamos la conexión en globalThis: en serverless (Vercel) la función se
// reutiliza entre peticiones y así no abrimos una conexión nueva cada vez.
const cache = (globalThis._mongoose ??= { conn: null, promise: null });

export async function connectDB() {
  if (cache.conn) return cache.conn;

  cache.promise ??= mongoose.connect(env.MONGODB_URI, {
    bufferCommands: false,
    serverSelectionTimeoutMS: 5000,
  });

  try {
    cache.conn = await cache.promise;
  } catch (err) {
    cache.promise = null; // permite reintentar en la siguiente petición
    throw err;
  }
  return cache.conn;
}
