import { connectDB } from "../src/config/db.js";
import Admin from "../src/models/Admin.js";
import mongoose from "mongoose";

async function seedAdmin() {
  console.log("=== INICIALIZANDO ADMINISTRADOR DE PINTUSAN ===");

  await connectDB();

  const email = process.env.ADMIN_SEED_EMAIL || "admin@pintusan.com";
  const password = process.env.ADMIN_SEED_PASSWORD || "AdminPintuSan2026*";
  const nombre = process.env.ADMIN_SEED_NOMBRE || "Administrador PintuSan";

  try {
    const adminExistente = await Admin.findOne({ email });

    if (adminExistente) {
      console.log(`ℹ El usuario administrador "${email}" ya existe en la base de datos.`);
      console.log(`  ID: ${adminExistente._id}`);
      console.log(`  Rol: ${adminExistente.rol}`);
      console.log(`  Activo: ${adminExistente.activo}`);
    } else {
      const nuevoAdmin = await Admin.create({
        nombre,
        email,
        password,
        rol: "superadmin",
        activo: true,
      });

      console.log("✔ Superadministrador creado exitosamente:");
      console.log(`  Nombre:   ${nuevoAdmin.nombre}`);
      console.log(`  Email:    ${nuevoAdmin.email}`);
      console.log(`  Rol:      ${nuevoAdmin.rol}`);
      console.log(`  Password: ${password}`);
    }
  } catch (error) {
    console.error("❌ Error creando administrador:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("✔ Conexión cerrada correctamente.");
    process.exit(0);
  }
}

seedAdmin();
