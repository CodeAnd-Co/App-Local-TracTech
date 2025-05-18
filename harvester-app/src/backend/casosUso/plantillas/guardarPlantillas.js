const PlantillaReporte = require('../../data/plantillasModelos/PlantillaReporte.js');
const { guardarPlantillaAPI } = require('../../domain/plantillasAPI/guardarPlantilla');

/**
 * Arma el objeto PlantillaReporte y lo manda al API.
 * 
 * @param {string} htmlString  — El outerHTML del elemento
 * @param {Object} opciones    — Parámetros adicionales
 * @param {string} opciones.nombrePlantilla
 * @param {number} opciones.frecuenciaEnvio
 * @param {string} opciones.correoDestino
 * @param {string} opciones.numeroDestino
 */
async function guardarPlantillas(
  htmlString,
  nombrePlantillaParametro
) {
  const plantilla = new PlantillaReporte({
    nombrePlantilla:   nombrePlantillaParametro,
    datos: htmlString,
    frecuenciaEnvio: null ,
    correoDestino: null,
    numeroDestino: null,
  });

  return guardarPlantillaAPI(plantilla);
}

module.exports = { guardarPlantillas };
