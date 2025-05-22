const { verificarToken } = require(`${rutaBase}/src/backend/servicios/verificarToken`); // Importar la función verificarToken
const { verificarPermisos } = require(`${rutaBase}/src/backend/servicios/verificarPermisos`); // Importar la función verificarPermisos
const {precargarEJS} = require(`${rutaBase}/src/framework/utils/scripts/middleware/precargarEJS`)
const { ipcRenderer } = require('electron');

/**
 * Evento que se dispara cuando el contenido del DOM ha sido completamente cargado.
 * Verifica la validez del token almacenado y redirige según corresponda.
 */
document.addEventListener("DOMContentLoaded", async () => {
    const token = obtenerToken(); // Llamamos a la función para obtener el token al cargar la página

    try {
        // Verificar si el token es válido
        const tokenValido = await verificarToken(token);

        if (tokenValido) {
            // Si el token es válido, obtener los permisos del usuario
            const permisos = await verificarPermisos(token);

            // Guardar los permisos en localStorage como una cadena JSON
            localStorage.setItem("permisos", JSON.stringify(permisos.permisos));

            // Si el token es válido, mostrar la pantalla de carga 2 segundos y luego redirigir a la página principal
            const rutaContenedorPrincipal = `${rutaBase}src/framework/vistas/paginas/contenedorPrincipal.ejs`;
            try {
                const vista = await ipcRenderer.invoke('precargar-ejs', rutaContenedorPrincipal);
                window.location.href = vista;
            } catch (err) {
                console.error("Error al cargar vista:", err);
            }

            // setTimeout(() => {
            //     const vista = await precargarEJS(pantallaCargaPath);
            //     window.location.href = (`${rutaBase}src/framework/vistas/paginas/contenedorPrincipal.ejs`);
            // }, 2000); // 2 segundos
        } else {
            // Si el token no es válido, mostrar la pantalla de carga 2 segundos y luego redirigir a inicio de sesión
            setTimeout(() => {
                window.location.href = "../vistas/inicioSesion.html";
            }, 2000); // 2 segundos
        }
    } catch (error) {
        console.error("Error al verificar el token:", error);
        // En caso de error, mostrar la pantalla de carga 2 segundos y luego redirigir a inicio de sesión
        setTimeout(() => {
            window.location.href = "../vistas/inicioSesion.html";
        }, 2000); // 2 segundos
    }
});

/**
 * Obtiene el token almacenado en el almacenamiento local del navegador.
 *
 * @returns {string|null} El token almacenado, o `null` si no existe.
 */
function obtenerToken() {
    // Obtener el token del almacenamiento local
    const token = localStorage.getItem("token");
    return token;
}
