import mongoose from "mongoose";

const varianteSchema = new mongoose.Schema(
  {
    medida: {
      type: String,
      required: [true, "La medida de la variante es obligatoria"],
      trim: true,
      // Ejemplos: "1/32 Galón", "1/16 Galón", "1/8 Galón", "1/4 Galón", "Galón", "Balde (2.5 Gal)", "Cuñete (5 Gal)", "Unidad"
    },
    etiqueta: {
      type: String,
      trim: true,
      // Ejemplos: "Tarro de compota", "Cuñete", "Balde"
    },
    precio: {
      type: Number,
      required: [true, "El precio de la variante es obligatorio"],
      min: [0, "El precio no puede ser negativo"],
    },
    disponible: {
      type: Boolean,
      default: true,
    },
    sku: {
      type: String,
      trim: true,
    },
  },
  { _id: true }
);

const productoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre del producto es obligatorio"],
      trim: true,
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
    },
    descripcion: {
      type: String,
      trim: true,
      default: "",
    },
    categoria: {
      type: String,
      required: [true, "La categoría es obligatoria"],
      enum: {
        values: [
          "Pintura propia",
          "Esmaltes",
          "Herramientas",
          "Preparación de superficies",
          "Impermeabilizantes",
          "Solventes",
          "Otros",
        ],
        message: "{VALUE} no es una categoría válida",
      },
      index: true,
    },
    marca: {
      type: String,
      trim: true,
      default: "PintuSan",
    },
    esMarcaPropia: {
      type: Boolean,
      default: false,
      index: true,
    },
    // Línea de la marca propia (RF-10)
    linea: {
      type: String,
      enum: ["Tipo 1", "Tipo 2", "Coraza", "No aplica"],
      default: "No aplica",
    },
    // Venta fraccionada (RF-02)
    esFraccionable: {
      type: Boolean,
      default: true,
    },
    // Permite tinturación / preparación a la medida (RF-05)
    permitePreparacion: {
      type: Boolean,
      default: false,
    },
    acabado: {
      type: String,
      enum: ["Mate", "Satinado", "Semibrillante", "Brillante", "No aplica"],
      default: "No aplica",
    },
    dilucion: {
      type: String,
      enum: ["Agua", "Thinner", "Disolvente especial", "No requiere"],
      default: "Agua",
    },
    rendimientoM2PorGalon: {
      type: Number,
      min: 0,
      default: 0, // 0 si no aplica o es herramienta
    },
    imagen: {
      url: {
        type: String,
        default: "https://placehold.co/600x400?text=PintuSan",
      },
      publicId: {
        type: String,
        default: null,
      },
    },
    imagenesSecundarias: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: null },
      },
    ],
    variantes: {
      type: [varianteSchema],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "El producto debe tener al menos una variante o presentación con precio",
      },
    },
    disponible: {
      type: Boolean,
      default: true,
      index: true,
    },
    destacado: {
      type: Boolean,
      default: false,
      index: true,
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

// Autogeneración de slug antes de validar si no existe o si cambia el nombre
productoSchema.pre("validate", function () {
  if (this.nombre && (!this.slug || this.isModified("nombre"))) {
    this.slug = this.nombre
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // quita tildes
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
});

// Índice de texto para búsqueda en tiempo real (RF-04)
productoSchema.index({
  nombre: "text",
  descripcion: "text",
  marca: "text",
  categoria: "text",
});

// Índice compuesto para filtros combinados
productoSchema.index({ categoria: 1, disponible: 1 });
productoSchema.index({ esMarcaPropia: 1, linea: 1 });

const Producto = mongoose.models.Producto || mongoose.model("Producto", productoSchema);

export default Producto;
