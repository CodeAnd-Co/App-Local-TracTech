function obtenerPermisos() {
    try {
        return JSON.parse(localStorage.getItem('permisos')) || [];
    } catch (error) {
        console.error("Error al obtener permisos del localStorage:", error);
        return [];
    }
}

function verificarPermisos(permiso) {
    const permisos = obtenerPermisos();
    return permisos.includes(permiso);
}

const PERMISOS = {
    ADMIN: 'ADMIN',
}

module.exports = { verificarPermisos, PERMISOS };
