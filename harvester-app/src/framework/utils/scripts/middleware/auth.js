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

module.exports = { obtenerPermisos, verificarPermisos };
