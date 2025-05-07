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

async function modificarUsuario(idUsuario, nombre, correo, contrasenia) {
    try {
        const respuesta = await modificarUsuarioAPI(idUsuario, nombre, correo, contrasenia);

        if (!respuesta.ok) {
            throw new Error('Error al modificar el usuario');
        }

        return respuesta;
    } catch (error) {
        console.error('Error al modificar usuario:', error);
        return { ok: false, mensaje: 'Error al conectar con el servidor' };
    }
}