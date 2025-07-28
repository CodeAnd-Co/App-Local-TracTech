
const { consultarPlantilla: consultarPlantillaAPI} = require('../../domain/plantillasAPI/consultarPlantilla.js');

/**
 * Crea una plantilla a través de la API y retorna la respuesta obtenida.
 * @async
 * @function consultarPlantillas
 * @param {string} token - Token de autenticación.
 * @returns {Promise<Object>} Respuesta del servidor.
 * @throws {Error} Si no se pudo consultar las plantillas.
 */
async function consultarPlantilla(nombrePlantilla){
    try{
        const respuesta = await consultarPlantillaAPI(nombrePlantilla, localStorage.getItem('token'));
        return respuesta;
    } catch(error){
        throw new Error('No se pudo consultar la plantilla', error);
    }
}
module.exports = {
    consultarPlantilla
};