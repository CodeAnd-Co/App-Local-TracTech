// RF47 Administrador consulta dispositivos - Nuevo requerimiento para listar todos los dispositivos

const { obtenerDispositivos: obtenerDispositivosAPI } = require('../../domain/usuariosAPI/usuariosAPI');

/**
 * Obtiene la lista completa de dispositivos con información de sus propietarios.
 *
 * Esta función realiza una solicitud asíncrona a la API para obtener todos los dispositivos
 * registrados en el sistema, incluyendo información sobre sus propietarios y estado.
 * Retorna un objeto con el resultado de la operación.
 *
 * @async
 * @function obtenerDispositivos
 * @returns {Promise<{ok: boolean, dispositivos?: Array, mensaje?: string}>} Resultado de la operación con la lista de dispositivos.
 */
async function obtenerDispositivos() {
    try {
        const respuesta = await obtenerDispositivosAPI();
        return respuesta;

    } catch {
        return { ok: false, mensaje: 'Error al obtener la lista de dispositivos' };
    }
}

module.exports = {
    obtenerDispositivos,
};
