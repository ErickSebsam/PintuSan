import mongoose from "mongoose";

const colorSchema = new mongoose.Schema(
  {
    codigo: {
      type: String,
      required: [true, "El código del color o referencia es obligatorio"],
      unique: true,
      uppercase: true,
      trim: true,
      // Ejemplos: "#A45", "SW-7005", "BL-01"
    },
    nombre: {
      type: String,
      required: [true, "El nombre del color es obligatorio"],
      trim: true,
      // Ejemplos: "Blanco Almendra", "Azul Colonial", "Gris Urbano"
    },
    hex: {
      type: String,
      required: [true, "El código hexadecimal del color es obligatorio"],
      trim: true,
      match: [
        /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
        "El color debe ser un código hexadecimal válido (ej. #FFFFFF o #FFF)",
      ],
    },
    coleccion: {
      type: String,
      trim: true,
      default: "Carta Clásica",
      // Ejemplos: "Carta Clásica", "Tendencias 2026", "Neutros", "Pasteles", "Maderas"
      index: true,
    },
    tiposPermitidos: {
      type: [String],
      default: ["Vinilo", "Esmalte"],
      enum: {
        values: [
          "Vinilo",
          "Esmalte",
          "Laca",
          "Fondo",
          "Anticorrosivo",
          "Madera",
          "General",
        ],
        message: "{VALUE} no es un tipo de pintura válido para preparación",
      },
    },
    disponible: {
      type: Boolean,
      default: true,
      index: true,
    },
    popular: {
      type: Boolean,
      default: false,
    },
    orden: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Índice de texto para buscador de tonos (RF-06)
colorSchema.index({
  codigo: "text",
  nombre: "text",
  coleccion: "text",
});

// Índice compuesto para filtros por colección y disponibilidad
colorSchema.index({ coleccion: 1, disponible: 1 });

const Color = mongoose.models.Color || mongoose.model("Color", colorSchema);

export default Color;
