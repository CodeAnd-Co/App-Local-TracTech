// RF3 Usuario cierra sesión - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF3

const { cerrarSesion } = require('../../backend/casosUso/sesion/cerrarSesion');

/**
 * Inicializa el módulo de usuario, incluyendo gestión de usuarios y cierre de sesión.
 *
 * Este módulo gestiona la interacción con el botón de gestión de usuarios y el botón de cerrar sesión.
 * Al hacer clic en el botón de gestión, se carga la vista correspondiente.
 * Al hacer clic en cerrar sesión, se elimina el token del almacenamiento y se redirige al inicio de sesión.
 *
 * @function inicializarModuloUsuario
 * @returns {void}
 */
function inicializarModuloUsuario() {
    // Seleccionar el botón para gestión de usuarios
    const botonGestion = document.querySelector('#botonGestion');

    if (botonGestion) {
        // Agregar listener al botón de gestión de usuarios
        botonGestion.addEventListener('click', async () => {

            // Actualizar el localStorage para indicar la sección activa
            localStorage.setItem('seccion-activa', 'gestionUsuarios');

            // Cargar el contenido del módulo de gestión de usuarios en la ventana principal
            const ventanaPrincipal = document.getElementById('ventana-principal');
            if (ventanaPrincipal) {
                fetch('../vistas/moduloGestionUsuarios.html')
                    .then(res => res.text())
                    .then(html => {
                        ventanaPrincipal.innerHTML = html;
                    })
                    .catch(err => console.error('Error cargando módulo de gestión de usuarios:', err));
            }
        });
    } else {
        // Mostrar error si no se encuentra el botón en el DOM
        console.error('El botón de gestión de usuarios no se encontró en el DOM.');
    }

    // Seleccionar el botón para cerrar sesión
    const botonCerrarSesion = document.querySelector('.boton-cerrar-sesion');

    // Agregar listener al botón de cerrar sesión
    botonCerrarSesion.addEventListener('click', async () => {
        
        // Llamar a la función cerrarSesion para finalizar la sesión
        const respuesta = await cerrarSesion();
    
        if (respuesta.ok) {
            // Eliminar el token de localStorage al cerrar sesión exitosamente
            localStorage.removeItem('token');
    
            // Redirigir al usuario a la página de inicio de sesión
            window.location.href = './inicioSesion.html';
        } else {
            // Mostrar mensaje de error si ocurre un problema al cerrar sesión
            alert(respuesta.message || 'Error al cerrar sesión.');
        }
    });
}

// Exponer la función para que pueda ser llamada desde el navegador
window.inicializarModuloUsuario = inicializarModuloUsuario;
