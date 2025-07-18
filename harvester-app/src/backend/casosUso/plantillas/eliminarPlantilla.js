
const { eliminarPlantilla: eliminarPlantillaAPI} = require('../../domain/plantillasAPI/eliminarPlantilla.js');

/**
 * Crea una plantilla a través de la API y retorna la respuesta obtenida.
 * @async
 * @function eliminarPlantilla
 * @param {string} token - Token de autenticación.
 * @returns {Promise<Object>} Respuesta del servidor.
 * @throws {Error} Si no se pudo eliminar la plantilla.
 */
async function eliminarPlantilla(nombrePlantilla){
    try{
        const respuesta = await eliminarPlantillaAPI(nombrePlantilla, localStorage.getItem('token'));
        return respuesta;
    } catch(error){
        throw new Error('No se pudo eliminar la plantilla', error);
    }
}
module.exports = {
    eliminarPlantilla
};