import mongoose from "mongoose";

const ajustesSchema = new mongoose.Schema(
  {
    // Identificador único para patrón singleton
    clave: {
      type: String,
      default: "general",
      unique: true,
      immutable: true,
    },
    // RF-08 y RF-14: Canal de WhatsApp para pedidos y consultas
    whatsapp: {
      numero: {
        type: String,
        default: "573001234567",
        trim: true,
      },
      mensajeBase: {
        type: String,
        default: "¡Hola! Adjunto el comprobante de mi transferencia para el siguiente pedido:",
      },
    },
    // RF-12 y RF-13: Medios de pago y políticas de anticipo
    pagos: {
      nequi: {
        numero: { type: String, default: "", trim: true },
        titular: { type: String, default: "PintuSan", trim: true },
        qrUrl: { type: String, default: "" },
      },
      daviplata: {
        numero: { type: String, default: "", trim: true },
        titular: { type: String, default: "PintuSan", trim: true },
        qrUrl: { type: String, default: "" },
      },
      bancolombia: {
        tipoCuenta: { type: String, default: "Ahorros", trim: true },
        numero: { type: String, default: "", trim: true },
        titular: { type: String, default: "PintuSan", trim: true },
      },
      porcentajeAnticipo: {
        type: Number,
        default: 50,
        min: 0,
        max: 100,
      },
      anticipoRequeridoPreparados: {
        type: Boolean,
        default: true,
      },
    },
    // RF-07 y RF-15: Avisos informativos obligatorios
    avisos: {
      varianzaColor: {
        type: String,
        default:
          "Los tonos mostrados en pantalla son una referencia digital y pueden variar según la calibración de su dispositivo. Para un 100% de exactitud, recomendamos acudir al local comercial con su muestra física.",
      },
      cotizacionDomicilio: {
        type: String,
        default:
          "El valor del domicilio no está incluido en el pedido inicial; este se calcula y acuerda según la zona de entrega y el volumen de la compra.",
      },
    },
    // RF-11: Guía técnica de dilución agua/pintura
    guiaDilucion: {
      excesoAgua: {
        type: String,
        default:
          "Menor cubrimiento, chorreo en aplicación, pérdida de intensidad del color y menor durabilidad.",
      },
      pocaAgua: {
        type: String,
        default:
          "Dificultad para aplicar, marcas visibles de brocha o rodillo y menor rendimiento por m².",
      },
      consejoGeneral: {
        type: String,
        default:
          "Diluya únicamente con agua limpia en una proporción máxima del 10% al 20% según la superficie a pintar.",
      },
    },
    // RF-10: Parámetros base para la calculadora de rendimiento PintuSan (m² por galón)
    calculadora: {
      tipo1: {
        nombre: { type: String, default: "PintuSan Tipo 1 (T1)" },
        descripcion: { type: String, default: "Alto rendimiento en interiores y acabados finos." },
        m2PorGalon: { type: Number, default: 45 },
        manosSugeridas: { type: Number, default: 2 },
      },
      tipo2: {
        nombre: { type: String, default: "PintuSan Tipo 2 (T2)" },
        descripcion: { type: String, default: "Rendimiento estándar / económico." },
        m2PorGalon: { type: Number, default: 35 },
        manosSugeridas: { type: Number, default: 2 },
      },
      coraza: {
        nombre: { type: String, default: "PintuSan Coraza" },
        descripcion: { type: String, default: "Alta resistencia a la intemperie y exteriores." },
        m2PorGalon: { type: Number, default: 30 },
        manosSugeridas: { type: Number, default: 2 },
      },
    },
    // RF-20 y RF-21: Datos institucionales y del local
    institucional: {
      nombreNegocio: { type: String, default: "PintuSan" },
      lema: { type: String, default: "Fabricantes locales de pintura en vinilo y venta fraccionada" },
      direccion: { type: String, default: "", trim: true },
      ciudad: { type: String, default: "", trim: true },
      horarios: {
        type: String,
        default: "Lunes a Sábado: 8:00 a.m. - 6:00 p.m. | Domingos y Festivos: 8:30 a.m. - 1:00 p.m.",
      },
      telefonoContacto: { type: String, default: "", trim: true },
      googleMapsUrl: { type: String, default: "" },
      sobreNosotros: {
        type: String,
        default:
          "En PintuSan producimos pinturas en vinilo de alta blancura y poder cubriente, además de comercializar todo tipo de insumos, solventes y colores personalizados en la medida exacta que necesitas.",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Método estático para obtener la configuración singleton o crearla por defecto
ajustesSchema.statics.obtenerAjustes = async function () {
  let ajustes = await this.findOne({ clave: "general" });
  if (!ajustes) {
    ajustes = await this.create({ clave: "general" });
  }
  return ajustes;
};

const Ajustes = mongoose.models.Ajustes || mongoose.model("Ajustes", ajustesSchema);

export default Ajustes;
