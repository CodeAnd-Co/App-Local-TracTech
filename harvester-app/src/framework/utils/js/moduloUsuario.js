// RF3 Usuario cierra sesión - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF3
// RF40 Administrador consulta usuarios - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF40

const { cerrarSesion } = require('../../backend/casosUso/sesion/cerrarSesion');
const { verificarPermisos, PERMISOS } = require('../utils/js/auth.js');

// Flag para evitar cargar dos veces el mismo script de gestión de usuarios
let moduloGestionDeUsuariosIniciado = false;

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
    if (botonGestion) {
      botonGestion.addEventListener('click', async () => {
        localStorage.setItem('seccion-activa', 'gestionUsuarios');
        const ventanaPrincipal = document.getElementById('ventana-principal');
        if (!ventanaPrincipal) return;

        try {
          // Carga el HTML del módulo de gestión de usuarios
          const html = await fetch('../vistas/moduloGestionUsuarios.html')
          .then(response => response.text());
          ventanaPrincipal.innerHTML = html;

          // Añade el script de gestión de usuarios al HTML la primera vez
          if (!moduloGestionDeUsuariosIniciado) {
            moduloGestionDeUsuariosIniciado = true;

            const cargadorGestionUsuarios = document.createElement('script');
            cargadorGestionUsuarios.src = '../utils/js/moduloGestionUsuario.js';
            document.body.appendChild(cargadorGestionUsuarios);

            cargadorGestionUsuarios.onload = () => {
              window.inicializarModuloGestionUsuarios?.();
            };
          } else {
            window.inicializarModuloGestionUsuarios?.();
          }

        } catch (error) {
          console.error('Error cargando módulo de gestión de usuarios:', error);
        }
      });
    } else {
      console.warn('No se encontró el botón #botonGestion en el DOM.');
    }

    // Botón de Cerrar Sesión
    const botonCerrarSesion = document.querySelector('.boton-cerrar-sesion');
    if (botonCerrarSesion) {
      botonCerrarSesion.addEventListener('click', async () => {
        try {
          const respuesta = await cerrarSesion();

          if (respuesta.ok) {
            localStorage.removeItem('token');
            window.location.href = './inicioSesion.html';
          } else {
            alert(respuesta.mensaje || 'Error al cerrar sesión.');
          }
        } catch (err) {
          console.error('Error al cerrar sesión:', err);
          alert('No se pudo cerrar sesión. Intenta nuevamente.');
        }
      });
    } else {
      console.warn('No se encontró el botón .boton-cerrar-sesion en el DOM.');
    }
}

// Exponer la función para que pueda ser llamada desde el navegador
window.inicializarModuloUsuario = inicializarModuloUsuario;