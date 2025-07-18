
const { crearPlantilla: crearPlantillaAPI} = require('../../domain/plantillasAPI/crearPlantilla.js');

/**
 * Crea una plantilla a través de la API y retorna la respuesta obtenida.
 * @async
 * @function crearPlantilla
 * @param {string} nombre - Nombre de la plantilla.
 * @param {string} datos - Contenido de la plantilla.
 * @returns {Promise<Object>} Respuesta del servidor.
 * @throws {Error} Si no se pudo crear la plantilla.
 */
async function crearPlantilla(nombre, datos){
    try{
        const respuesta = await crearPlantillaAPI(nombre, datos, localStorage.getItem('token'));
        return respuesta;
    } catch(error){
        throw new Error('No se pudo crear la plantilla', error);
    }
}
module.exports = {
    crearPlantilla
};