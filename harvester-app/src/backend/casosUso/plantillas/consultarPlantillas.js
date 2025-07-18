
const { consultarPlantillas: consultarPlantillasAPI} = require('../../domain/plantillasAPI/consultarPlantillas.js');

/**
 * Crea una plantilla a través de la API y retorna la respuesta obtenida.
 * @async
 * @function consultarPlantillas
 * @param {string} token - Token de autenticación.
 * @returns {Promise<Object>} Respuesta del servidor.
 * @throws {Error} Si no se pudo consultar las plantillas.
 */
async function consultarPlantillas(){
    try{
        const respuesta = await consultarPlantillasAPI(localStorage.getItem('token'));
        return respuesta;
    } catch(error){
        throw new Error('No se pudo consultar las plantillas', error);
    }
}
module.exports = {
    consultarPlantillas
};