const { URL_BASE } = require(`${rutaBase}src/framework/utils/scripts/constantes.js`);
/**
 * 
 * @module formulaApi
 * @description Módulo para interactuar con la API de fórmulas.
 * @param {string} nombre 
 * @param {string} datos
 * @param {string} token
 * @returns {Promise<Object>} Respuesta de la API. 
 * @throws {Error} Si no se pudo guardar la fórmula.
 */
async function crearPlantilla(titulo, contenido, token) {
    const respuesta = await fetch(`${URL_BASE}/plantillas/guardarPlantilla`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({titulo, contenido}),
    });

    const datos = await respuesta.json();
    return { ok: respuesta.ok, ...datos };
}

module.exports = {
    crearPlantilla,
};