/**
 * Obtiene los permisos del usuario desde localStorage
 * @returns {Array<string>} Lista de permisos del usuario
 */
function obtenerPermisos() {
    try {
        return JSON.parse(localStorage.getItem('permisos')) || [];
    } catch (error) {
        console.error('Error al obtener permisos del localStorage:', error);
        return [];
    }
}

/**
 * Verifica si el usuario tiene un permiso específico
 * @param {string} permiso - El permiso a verificar
 * @returns {boolean} True si el usuario tiene el permiso, false en caso contrario
 */
function verificarPermisos(permiso) {
    const permisos = obtenerPermisos();
    return permisos.includes(permiso);
}

/**
 * Objeto que contiene los tipos de permisos disponibles en el sistema
 * @constant {Object}
 */
const PERMISOS = {
    ADMIN: 'ADMIN',
    SUPERADMIN: 'SUPERADMIN',
}

module.exports = { verificarPermisos, PERMISOS };
