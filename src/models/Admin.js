import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre del administrador es obligatorio"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "El correo electrónico es obligatorio"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Por favor ingrese un correo electrónico válido",
      ],
      index: true,
    },
    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
      minlength: [6, "La contraseña debe contener al menos 6 caracteres"],
      select: false, // Por seguridad no se incluye por defecto en consultas find()
    },
    rol: {
      type: String,
      enum: {
        values: ["admin", "superadmin"],
        message: "{VALUE} no es un rol válido",
      },
      default: "admin",
    },
    activo: {
      type: Boolean,
      default: true,
    },
    ultimoAcceso: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Hash de contraseña automático antes de guardar si fue modificada
adminSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Método de instancia para verificar contraseña
adminSchema.methods.compararPassword = async function (candidatoPassword) {
  return bcrypt.compare(candidatoPassword, this.password);
};

// Evitar exponer la contraseña en JSON
adminSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema);

export default Admin;
