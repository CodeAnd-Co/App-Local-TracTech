const { consultarRoles: consultarRolesAPI } = require('../../domain/usuariosAPI/usuariosAPI');

/**
 * Consulta los roles disponibles para los usuarios desde la API.
 * 
 * @async
 * @function consultarRoles
 * @returns {Promise<Array<Object>>} Una lista de roles disponibles.
 * @throws {Error} Si hay un problema al comunicarse con el servidor o procesar la respuesta.
 */
async function consultarRoles() {
    const respuesta = await consultarRolesAPI();

    if (!respuesta.ok) {
        throw new Error('Error al obtener los roles desde el servidor.');
    }

    return respuesta.roles || [];
}

module.exports = {
    consultarRoles,
};