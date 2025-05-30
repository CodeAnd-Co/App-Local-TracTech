// RF46 Administrador deshabilita dispositivo - Nuevo requerimiento para deshabilitar dispositivos de usuarios

const { deshabilitarDispositivo: deshabilitarDispositivoAPI } = require('../../domain/usuariosAPI/usuariosAPI');

/**
 * Deshabilita el dispositivo de un usuario específico a través de una llamada a la API.
 *
 * Esta función valida que se proporcione un ID de usuario y, si es válido, 
 * realiza una solicitud asíncrona a la API para deshabilitar el dispositivo del usuario correspondiente.
 * Retorna un objeto con el resultado de la operación.
 *
 * @async
 * @function deshabilitarDispositivo
 * @param {string} idUsuario - ID del usuario cuyo dispositivo se va a deshabilitar.
 * @returns {Promise<{ok: boolean, mensaje: string}>} Resultado de la operación de deshabilitación.
 */
async function deshabilitarDispositivo(idUsuario) {
    if (!idUsuario) {
        return { ok: false, mensaje: 'ID de usuario no proporcionado' };
    }

    try {
        const respuesta = await deshabilitarDispositivoAPI(idUsuario);
        return respuesta;

    } catch {
        return { ok: false, mensaje: 'Error al deshabilitar el dispositivo' };
    }
}

module.exports = {
    deshabilitarDispositivo,
};
