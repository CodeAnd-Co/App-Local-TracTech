// RF39 Administrador crea usuario - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF39

const { crearUsuario: crearUsuarioAPI } = require('../../domain/usuariosAPI/usuariosAPI');

/**
 * Crea un nuevo usuario a través de una llamada a la API.
 *
 * Esta función valida que se proporcionen los campos requeridos (nombre, correo, contraseña, idRol_FK).
 * Si son válidos, realiza una solicitud asíncrona a la API para crear el nuevo usuario.
 *
 * @async
 * @function crearUsuario
 * @param {object} datos - Datos del nuevo usuario.
 * @param {string} datos.nombre - Nombre del usuario.
 * @param {string} datos.correo - Correo electrónico del usuario.
 * @param {string} datos.contrasenia - Contraseña del usuario.
 * @param {number} datos.idRol_FK - ID del rol asignado al usuario.
 * @returns {Promise<{ok: boolean, mensaje: string, id?: number}>} Resultado de la operación.
 */
async function crearUsuario({ nombre, correo, contrasenia, idRol_FK }) {
    if (!nombre || !correo || !contrasenia || !idRol_FK) {
        return { ok: false, mensaje: 'Todos los campos son obligatorios' };
    }

    //const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    //if (!correoRegex.test(correo)) {
    //    return { ok: false, mensaje: 'Correo electrónico no válido' };
    //}

    try {
        const respuesta = await crearUsuarioAPI({ nombre, correo, contrasenia, idRol_FK });
        return { ok: true, mensaje: respuesta.mensaje, id: respuesta.id };
    } catch (error) {
        console.error('Error al crear el usuario:', error);
        return { ok: false, mensaje: 'Error al crear el usuario' };
    }
}

module.exports = {
    crearUsuario,
};
