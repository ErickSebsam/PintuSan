import { env } from "./config/env.js"; // siempre primero
import app from "./app.js";
import { connectDB } from "./config/db.js";

try {
  await connectDB();
  console.log("MongoDB conectado");
  app.listen(env.PORT, () =>
    console.log(`PintuSan API en http://localhost:${env.PORT}/api/v1/health`)
  );
} catch (err) {
  console.error("No se pudo conectar a MongoDB:", err.message);
  process.exit(1);
}
