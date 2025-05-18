const { guardarPlantillaAPI } = require('../../domain/plantillasAPI/guardarPlantilla');

/**
 * Llama al API para guardar la plantilla
 * @param {string} contenedor - HTML de la vista a enviar
 */
async function guardarPlantillas(contenedor) {
    console.log('entraUCase');
    return guardarPlantillaAPI(contenedor);
}

module.exports = { guardarPlantillas };
