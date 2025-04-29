// RF3 Ususario cierra sesión - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF3

const { cerrarSesion: cerrarSesionAPI } = require("../../domain/sesionAPI/sesionAPI"); // Importa la función cerrarSesionAPI

/**
 * Cierra la sesión del usuario actual.
 * Obtiene el token del localStorage y llama a la API para finalizar la sesión.
 */
async function cerrarSesion() {
    try {
        // Obtener el token del almacenamiento local
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No hay sesión activa.");
            return; // Si no hay token, no hay sesión activa
        }

        // Llamar a la API para cerrar sesión enviando el token
        const respuesta = await cerrarSesionAPI(token);
        return respuesta;
    } catch (error) {
        // Capturar y mostrar errores en consola
        console.error("Error al cerrar sesión:", error);
        throw new Error("No se pudo cerrar sesión"); // Lanzar error si ocurre un fallo
    }
}

// Exportar la función cerrarSesion para que pueda ser utilizada en otros módulos
module.exports = {
    cerrarSesion,
};
