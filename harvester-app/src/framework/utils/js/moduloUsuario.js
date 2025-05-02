// RF3 Usuario cierra sesión - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF3
// RF40 Administrador consulta usuarios - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF40

const { cerrarSesion } = require('../../backend/casosUso/sesion/cerrarSesion');

/**
 * Inicializa el módulo de usuario, incluyendo gestión de usuarios y cierre de sesión.
 */
function inicializarModuloUsuario() {
    // Seleccionar el botón para gestión de usuarios
    const botonGestion = document.querySelector('#botonGestion');
    const { verificarPermisos, PERMISOS } = require('../utils/js/auth.js');

    if (!verificarPermisos(PERMISOS.ADMIN)) {
        botonGestion?.remove();  // o botonGestion.style.display = 'none';
      } else {
        // 2) Sólo si existe y tiene permiso, le pones el listener:
        botonGestion.addEventListener('click', async () => {
          console.log('Cargando módulo de gestión de usuarios...');
          localStorage.setItem('seccion-activa', 'gestionUsuarios');
          const ventanaPrincipal = document.getElementById('ventana-principal');
          if (!ventanaPrincipal) return;
          try {
            const html = await fetch('../vistas/moduloGestionUsuarios.html').then(r => r.text());
            ventanaPrincipal.innerHTML = html;
            const script = document.createElement('script');
            script.src = '../utils/js/moduloGestionUsuario.js';
            document.body.appendChild(script);
            script.onload = () => window.inicializarModuloGestionUsuarios?.();
          } catch (err) {
            console.error('Error cargando módulo de gestión de usuarios:', err);
          }
        });
      }

    // Seleccionar el botón para cerrar sesión
    const btnCerrarSesion = document.querySelector('.boton-cerrar-sesion');

    // Agregar listener al botón de cerrar sesión
    btnCerrarSesion.addEventListener('click', async () => {
        console.log('Cerrando sesión...');
        
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
