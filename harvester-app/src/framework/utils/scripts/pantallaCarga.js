 
const { verificarToken } = require(`${rutaBase}/src/backend/servicios/verificarToken`); // Importar la función verificarToken
const { verificarPermisos } = require(`${rutaBase}/src/backend/servicios/verificarPermisos`); // Importar la función verificarPermisos
const { ipcRenderer } = require('electron');

/**
 * Evento que se dispara cuando el contenido del DOM ha sido completamente cargado.
 * Verifica la validez del token almacenado y redirige según corresponda.
 */
document.addEventListener('DOMContentLoaded', async () => {
    const token = obtenerToken(); // Llamamos a la función para obtener el token al cargar la página

    try {
        // Verificar si el token es válido
        const tokenValido = await verificarToken(token);

        if (tokenValido) {
            // Si el token es válido, obtener los permisos del usuario
            const permisos = await verificarPermisos(token);

            // Guardar los permisos en localStorage como una cadena JSON
            localStorage.setItem('permisos', JSON.stringify(permisos.permisos));

            // Si el token es válido, mostrar la pantalla de carga 2 segundos y luego redirigir a la página principal
            const rutaInicio = `${rutaBase}src/framework/vistas/paginas/inicio/inicio.ejs`;
            try {
                localStorage.setItem('seccion-activa', 'inicio');
                const vista = await ipcRenderer.invoke('precargar-ejs', rutaInicio, { Seccion : 'Inicio', Icono : 'Casa', permisos});
                window.location.href = vista;
            } catch (err) {
                console.error('Error al cargar vista:', err);
            }

        } else {
            const rutaIniciarSesion = `${rutaBase}src/framework/vistas/paginas/iniciarSesion.ejs`;
            try {
                const vista = await ipcRenderer.invoke('precargar-ejs', rutaIniciarSesion);
                window.location.href = vista;
            } catch (err) {
                console.error("Error al cargar vista:", err);
            }
        }
    } catch (error) {
        console.error('Error al verificar el token:', error);
        // En caso de error, mostrar la pantalla de carga y luego redirigir a inicio de sesión
        const rutaIniciarSesion = `${rutaBase}src/framework/vistas/paginas/iniciarSesion.ejs`;
        try {
            const vista = await ipcRenderer.invoke('precargar-ejs', rutaIniciarSesion);
            window.location.href = vista;
        } catch (err) {
            console.error('Error al cargar vista:', err);
        } 
    }
});

/**
 * Obtiene el token almacenado en el almacenamiento local del navegador.
 *
 * @returns {string|null} El token almacenado, o `null` si no existe.
 */
function obtenerToken() {
    // Obtener el token del almacenamiento local
    const token = localStorage.getItem('token');
    return token;
}
