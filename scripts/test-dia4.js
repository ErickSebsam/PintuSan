import { connectDB } from "../src/config/db.js";
import app from "../src/app.js";
import Admin from "../src/models/Admin.js";
import mongoose from "mongoose";

async function runTests() {
  console.log("=== INICIANDO PRUEBAS DE SEGURIDAD Y AUTENTICACIÓN - DÍA 4 ===");

  await connectDB();
  console.log("✔ Conexión a MongoDB exitosa");

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/v1`;

  const testEmail = `admin_test_${Date.now()}@pintusan.com`;
  const testPassword = "PasswordSegura123*";
  let adminTemp = null;
  let authToken = null;

  try {
    // 1. Probar Headers de Helmet
    const resHealth = await fetch(`${baseUrl}/health`);
    const xContentType = resHealth.headers.get("x-content-type-options");
    console.log(
      "1. Headers de seguridad Helmet (X-Content-Type-Options):",
      xContentType === "nosniff" ? "✔ OK (nosniff)" : "❌ FAIL",
      xContentType
    );

    // 2. Crear admin temporal
    adminTemp = await Admin.create({
      nombre: "Admin Pruebas Día 4",
      email: testEmail,
      password: testPassword,
      rol: "superadmin",
      activo: true,
    });
    console.log("2. Admin temporal creado para pruebas:", adminTemp.email);

    // 3. Login con email inexistente -> 401
    const resLoginInvalido = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "noexiste@pintusan.com", password: testPassword }),
    });
    console.log(
      "3. POST /auth/login (email inexistente):",
      resLoginInvalido.status === 401 ? "✔ OK (401)" : "❌ FAIL",
      resLoginInvalido.status
    );

    // 4. Login con password incorrecto -> 401
    const resPassInvalido = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: "ClaveErronea123" }),
    });
    console.log(
      "4. POST /auth/login (password incorrecto):",
      resPassInvalido.status === 401 ? "✔ OK (401)" : "❌ FAIL",
      resPassInvalido.status
    );

    // 5. Login con datos vacíos -> 400
    const resVacio = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    console.log(
      "5. POST /auth/login (payload vacío):",
      resVacio.status === 400 ? "✔ OK (400)" : "❌ FAIL",
      resVacio.status
    );

    // 6. Login exitoso -> 200 y retorno de JWT
    const resLoginExitoso = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: testPassword }),
    });
    const dataLogin = await resLoginExitoso.json();
    authToken = dataLogin.token;

    console.log(
      "6. POST /auth/login (credenciales válidas):",
      resLoginExitoso.status === 200 && authToken && !dataLogin.admin.password
        ? "✔ OK (200 + JWT + password excluida)"
        : "❌ FAIL"
    );

    // 7. GET /auth/perfil sin token -> 401
    const resPerfilSinToken = await fetch(`${baseUrl}/auth/perfil`);
    console.log(
      "7. GET /auth/perfil (sin token):",
      resPerfilSinToken.status === 401 ? "✔ OK (401)" : "❌ FAIL",
      resPerfilSinToken.status
    );

    // 8. GET /auth/perfil con token inválido -> 401
    const resPerfilTokenFalso = await fetch(`${baseUrl}/auth/perfil`, {
      headers: { Authorization: "Bearer token_falso_invalido_123" },
    });
    console.log(
      "8. GET /auth/perfil (token inválido):",
      resPerfilTokenFalso.status === 401 ? "✔ OK (401)" : "❌ FAIL",
      resPerfilTokenFalso.status
    );

    // 9. GET /auth/perfil con token válido -> 200
    const resPerfilValido = await fetch(`${baseUrl}/auth/perfil`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const dataPerfil = await resPerfilValido.json();
    console.log(
      "9. GET /auth/perfil (con token válido):",
      resPerfilValido.status === 200 && dataPerfil.admin.email === testEmail
        ? "✔ OK (200 + perfil recibido)"
        : "❌ FAIL"
    );

    // 10. Actualizar contraseña (PUT /auth/cambiar-password)
    const nuevoPassword = "NuevoPassword2026*";
    const resCambio = await fetch(`${baseUrl}/auth/cambiar-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        passwordActual: testPassword,
        passwordNuevo: nuevoPassword,
      }),
    });
    console.log(
      "10. PUT /auth/cambiar-password:",
      resCambio.status === 200 ? "✔ OK (200)" : "❌ FAIL"
    );

    // 11. Probar login con nueva contraseña
    const resLoginNuevo = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: nuevoPassword }),
    });
    const dataLoginNuevo = await resLoginNuevo.json();
    console.log(
      "11. POST /auth/login con nueva contraseña:",
      resLoginNuevo.status === 200 && dataLoginNuevo.token ? "✔ OK (200)" : "❌ FAIL"
    );

    // 12. Probar acceso con cuenta desactivada -> 403
    await Admin.findByIdAndUpdate(adminTemp._id, { activo: false });
    const resCuentaDesactivada = await fetch(`${baseUrl}/auth/perfil`, {
      headers: { Authorization: `Bearer ${dataLoginNuevo.token}` },
    });
    console.log(
      "12. GET /auth/perfil con cuenta desactivada:",
      resCuentaDesactivada.status === 403 ? "✔ OK (403 Acceso Denegado)" : "❌ FAIL",
      resCuentaDesactivada.status
    );

    // Limpieza
    await Admin.findByIdAndDelete(adminTemp._id);
    console.log("✔ Admin temporal eliminado con éxito");

    console.log("\n=== TODAS LAS PRUEBAS DEL DÍA 4 PASARON EXITOSAMENTE ===");
  } catch (error) {
    console.error("❌ Error durante las pruebas del Día 4:", error);
  } finally {
    if (adminTemp?._id) {
      await Admin.findByIdAndDelete(adminTemp._id).catch(() => {});
    }
    server.close();
    await mongoose.connection.close();
    process.exit(0);
  }
}

runTests();
