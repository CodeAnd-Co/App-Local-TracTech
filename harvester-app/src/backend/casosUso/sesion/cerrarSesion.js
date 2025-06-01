// RF3 Usuario cierra sesión - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF3

const { cerrarSesion: cerrarSesionAPI } = require('../../domain/sesionAPI/sesionAPI'); // Importa la función cerrarSesionAPI

/**
 * Cierra la sesión del usuario actual.
 * Obtiene el token del localStorage y llama a la API para finalizar la sesión.
 */
async function cerrarSesion() {
    try {
        // Obtener el token del almacenamiento local
        // Si no hay token, no hay sesión activa
        const token = localStorage.getItem('token');
        if (!token) {
            return;
        }

        // Llamar a la API para cerrar sesión enviando el token
        const respuesta = await cerrarSesionAPI(token);
        return respuesta;
    } catch {
        // Capturar y mostrar errores en consola
        throw new Error('No se pudo cerrar sesión');
    }
}

// Exportar la función cerrarSesion para que pueda ser utilizada en otros módulos
module.exports = {
    cerrarSesion,
};
