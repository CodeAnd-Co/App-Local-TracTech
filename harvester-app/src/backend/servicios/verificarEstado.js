const { URL_BASE } = require('../../framework/utils/scripts/constantes');

/**
 * Verifica el estado de la aplicación (estado/deshabilitada) en el servidor
 * @param {string} token - Token de autenticación
 * @param {string} dispositivoId - ID único del dispositivo
 * @returns {Promise<{estado: boolean, mensaje?: string, codigo?: string}>}
 */
async function verificarEstado(token, dispositivoId) {
    if (!token || !dispositivoId) {
        return { estado: false, mensaje: 'Token o ID de dispositivo no válido' };
    }
    
    try {
        const respuesta = await fetch(`${URL_BASE}/dispositivo/estado`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ dispositivoId })
        });

        const datos = await respuesta.json();
        
        if (!respuesta.ok) {
            return { 
                estado: false, 
                mensaje: datos.mensaje || 'Error del servidor',
                codigo: datos.codigo || null
            };
        }

        return {
            estado: datos.estado,
            mensaje: datos.mensaje,
            codigo: datos.codigo || null
        };
    } catch {
        return { estado: false, mensaje: 'Error de conexión' };
    }
}

module.exports = { verificarEstado };