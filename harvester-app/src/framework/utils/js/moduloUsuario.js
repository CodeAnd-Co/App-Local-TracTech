// RF3 Ususario cierra sesión - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF3

const { cerrarSesion } = require('../../backend/casosUso/sesion/cerrarSesion');
const { verificarPermisos, PERMISOS } = require('../utils/js/auth.js');

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

    const botonGestion = document.querySelector('#botonGestion');

    if (!verificarPermisos(PERMISOS.ADMIN)) {
        botonGestion?.remove();
      } else {

        botonGestion.addEventListener('click', async () => {
          localStorage.setItem('seccion-activa', 'gestionUsuarios');
          const ventanaPrincipal = document.getElementById('ventana-principal');
          if (!ventanaPrincipal) return;
          try {
            const html = await fetch('../vistas/moduloGestionUsuarios.html').then(response => response.text());
            ventanaPrincipal.innerHTML = html;
            const cargadorGestionUsuarios = document.createElement('script');
            cargadorGestionUsuarios.src = '../utils/js/moduloGestionUsuario.js';
            document.body.appendChild(cargadorGestionUsuarios);
            cargadorGestionUsuarios.onload = () => window.inicializarModuloGestionUsuarios?.();
          } catch (error) {
            console.error('Error cargando módulo de gestión de usuarios:', error);
          }
        });
      }

    const botonCerrarSesion = document.querySelector('.boton-cerrar-sesion');

    botonCerrarSesion.addEventListener('click', async () => {
        
        const respuesta = await cerrarSesion();
    
        if (respuesta.ok) {
            // Eliminar el token de localStorage al cerrar sesión exitosamente
            localStorage.removeItem("token");
    
            // Redirigir al usuario a la página de inicio de sesión
            window.location.href = "./inicioSesion.html";
        } else {
            alert(respuesta.mensaje || 'Error al cerrar sesión.');
        }
    });
}

// Exponer la función para que pueda ser llamada desde el navegador
window.inicializarModuloUsuario = inicializarModuloUsuario;
