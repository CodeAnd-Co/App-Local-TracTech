// RF41 Administrador modifica usuario - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF41

const { modificarUsuario: modificarUsuarioAPI } = require('../../domain/usuariosAPI/usuariosAPI');

/**
 * Llama a la API de modificación de usuario y maneja errores de red o respuesta inválida.
 *
 * @async
 * @function modificarUsuario
 * @param {number} idUsuario - ID del usuario a modificar
 * @param {string} nombre - Nuevo nombre del usuario
 * @param {string} correo - Nuevo correo electrónico
 * @param {string} contrasenia - Nueva contraseña del usuario
 * @returns {Promise<{ok: boolean, mensaje?: string}>}
 */

async function modificarUsuario(idUsuario, nombre, correo, contrasenia, idRol) {
    try {
        const respuesta = await modificarUsuarioAPI(idUsuario, nombre, correo, contrasenia, idRol);

        if (!respuesta.ok) {
            return {
                ok: false,
                mensaje: respuesta.mensaje || 'Error al modificar el usuario',
            };
        }

        return respuesta;
    } catch (error) {
        return { ok: false, mensaje: error.message || 'Error al conectar con el servidor' };
    }
}

module.exports = {
    modificarUsuario,
};
