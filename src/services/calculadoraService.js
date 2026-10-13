import Ajustes from "../models/Ajustes.js";
import { AppError } from "../utils/AppError.js";

/**
 * Convierte un volumen en galones a una combinación recomendada de envases comerciales PintuSan.
 * Prioriza los tamaños más convenientes: Cuñete (5G), Balde (2.5G), Galón (1G) y Cuarto (1/4G).
 *
 * @param {number} totalGalones - Volumen total requerido en galones.
 * @returns {Array<{ medida: string, cantidad: number, galonesUnitarios: number }>}
 */
export function calcularPresentacionesRecomendadas(totalGalones) {
  if (totalGalones <= 0) return [];

  const presentaciones = [
    { medida: "Cuñete (5 Gal)", galones: 5 },
    { medida: "Balde (2.5 Gal)", galones: 2.5 },
    { medida: "Galón", galones: 1 },
    { medida: "1/4 Galón", galones: 0.25 },
    { medida: "1/8 Galón", galones: 0.125 },
    { medida: "1/16 Galón", galones: 0.0625 },
    { medida: "1/32 Galón (tarro de compota)", galones: 0.03125 },
  ];

  let restante = totalGalones;
  const desglose = [];

  for (const pres of presentaciones) {
    if (restante >= pres.galones) {
      const cantidad = Math.floor(restante / pres.galones);
      if (cantidad > 0) {
        desglose.push({
          medida: pres.medida,
          cantidad,
          galonesUnitarios: pres.galones,
        });
        restante = Number((restante - cantidad * pres.galones).toFixed(4));
      }
    }
  }

  // Si aún queda una fracción residual muy pequeña (> 0.015), redondeamos al envase más pequeño
  if (restante > 0.015) {
    const ultimo = desglose.find((d) => d.medida.includes("1/32"));
    if (ultimo) {
      ultimo.cantidad += 1;
    } else {
      desglose.push({
        medida: "1/32 Galón (tarro de compota)",
        cantidad: 1,
        galonesUnitarios: 0.03125,
      });
    }
  }

  return desglose;
}

/**
 * Realiza el cálculo del rendimiento de pintura PintuSan según el área y número de manos.
 * Si se especifica una línea, calcula solo para esa; si no, calcula para las tres líneas (Tipo 1, Tipo 2, Coraza).
 *
 * @param {object} params
 * @param {number} params.m2 - Metros cuadrados de superficie.
 * @param {number} [params.manos=2] - Número de manos o capas recomendadas.
 * @param {string} [params.linea] - Línea específica ("Tipo 1", "Tipo 2", "Coraza"). Opcional.
 */
export async function calcularRendimientoPintuSan({ m2, manos = 2, linea = null }) {
  const superficie = Number(m2);
  const totalManos = Number(manos) || 2;

  if (!superficie || isNaN(superficie) || superficie <= 0) {
    throw new AppError(400, "El área en metros cuadrados (m2) debe ser un número mayor a cero");
  }

  if (totalManos <= 0 || totalManos > 5) {
    throw new AppError(400, "El número de manos debe ser entre 1 y 5");
  }

  const ajustes = await Ajustes.obtenerAjustes();
  const configCalc = ajustes.calculadora || {};

  const lineasDisponibles = {
    "tipo 1": { clave: "tipo1", fallbackM2: 45, nombre: "PintuSan Tipo 1 (T1)" },
    "tipo 2": { clave: "tipo2", fallbackM2: 35, nombre: "PintuSan Tipo 2 (T2)" },
    coraza: { clave: "coraza", fallbackM2: 30, nombre: "PintuSan Coraza" },
  };

  const calcularParaLinea = (claveConfig, fallback) => {
    const info = configCalc[claveConfig] || {};
    const rendimientoM2 = info.m2PorGalon || fallback.fallbackM2;
    const nombreLinea = info.nombre || fallback.nombre;
    const descripcion = info.descripcion || "";

    const areaTotalConManos = superficie * totalManos;
    const galonesRequeridos = Number((areaTotalConManos / rendimientoM2).toFixed(2));
    const presentaciones = calcularPresentacionesRecomendadas(galonesRequeridos);

    return {
      linea: nombreLinea,
      descripcion,
      rendimientoM2PorGalon: rendimientoM2,
      manosSugeridas: info.manosSugeridas || totalManos,
      galonesRequeridos,
      litrosAproximados: Number((galonesRequeridos * 3.78541).toFixed(2)),
      presentacionesSugeridas: presentaciones,
    };
  };

  let resultados = [];

  if (linea) {
    const key = linea.trim().toLowerCase();
    const target = lineasDisponibles[key];
    if (!target) {
      throw new AppError(
        400,
        `Línea no válida. Las opciones permitidas son: "Tipo 1", "Tipo 2" o "Coraza"`
      );
    }
    resultados.push(calcularParaLinea(target.clave, target));
  } else {
    // Si no se pide una línea en particular, calcular para las tres y permitir comparar
    for (const item of Object.values(lineasDisponibles)) {
      resultados.push(calcularParaLinea(item.clave, item));
    }
  }

  return {
    consulta: {
      m2Superficie: superficie,
      manos: totalManos,
      areaEfectivaM2: superficie * totalManos,
    },
    resultados,
    guiaDilucion: ajustes.guiaDilucion,
    sinCompromiso: "Este cálculo es libre e informativo. No estás obligado a realizar la compra.",
  };
}
