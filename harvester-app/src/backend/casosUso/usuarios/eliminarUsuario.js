// RF43 Administrador elimina usuario - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF43

const { eliminarUsuario: eliminarUsuarioAPI } = require('../../domain/usuariosAPI/usuariosAPI');

/**
 * Elimina un usuario a través de una llamada a la API.
 *
 * Esta función valida que se proporcione un ID de usuario y, si es válido, 
 * realiza una solicitud asíncrona a la API para eliminar el usuario correspondiente.
 * Retorna un objeto con el resultado de la operación.
 *
 * @async
 * @function eliminarUsuario
 * @param {string} id - ID del usuario a eliminar.
 * @returns {Promise<{ok: boolean, mensaje: string}>} Resultado de la operación de eliminación.
 */
async function eliminarUsuario(id) {
    if (!id) {
        return { ok: false, mensaje: 'ID de usuario no proporcionado' };
    }

    try {
        const respuesta = await eliminarUsuarioAPI(id);
        return respuesta;

    } catch  {
        return { ok: false, mensaje: 'Error al eliminar el usuario' };
    }
}

module.exports = {
    eliminarUsuario,
}