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
  {
    nombrePlantilla  = 'Plantilla',
    frecuenciaEnvio  = null,
    correoDestino    = null,
    numeroDestino    = null,
  } = {}
) {
  const plantilla = new PlantillaReporte({
    nombrePlantilla,
    datos: htmlString,
    frecuenciaEnvio,
    correoDestino,
    numeroDestino,
  });

  return guardarPlantillaAPI(plantilla);
}

module.exports = { guardarPlantillas };
