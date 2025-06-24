// RF48 Administrador habilita dispositivo - Nuevo requerimiento para habilitar dispositivos deshabilitados

const { habilitarDispositivo: habilitarDispositivoAPI } = require('../../domain/usuariosAPI/usuariosAPI');

/**
 * Habilita un dispositivo específico que ha sido previamente deshabilitado.
 *
 * Esta función valida que se proporcione un ID de dispositivo y, si es válido, 
 * realiza una solicitud asíncrona a la API para habilitar el dispositivo correspondiente.
 * Retorna un objeto con el resultado de la operación.
 *
 * @async
 * @function habilitarDispositivo
 * @param {string} idDispositivo - ID del dispositivo que se va a habilitar.
 * @returns {Promise<{ok: boolean, mensaje: string}>} Resultado de la operación de habilitación.
 */
async function habilitarDispositivo(idDispositivo) {
    if (!idDispositivo) {
        return { ok: false, mensaje: 'ID de dispositivo no proporcionado' };
    }

    try {
        const respuesta = await habilitarDispositivoAPI(idDispositivo);
        return respuesta;

    } catch {
        return { ok: false, mensaje: 'Error al habilitar el dispositivo' };
    }
}

module.exports = {
    habilitarDispositivo,
};
