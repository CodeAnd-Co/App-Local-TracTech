// RF3 Usuario cierra sesión - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF3
// RF40 Administrador consulta usuarios - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF40

const { cerrarSesion } = require('../../backend/casosUso/sesion/cerrarSesion');

/**
 * Inicializa el módulo de usuario, incluyendo gestión de usuarios y cierre de sesión.
 */
function inicializarModuloUsuario() {

    const botonGestion = document.querySelector('#botonGestion');
    const { verificarPermisos, PERMISOS } = require('../utils/js/auth.js');

    if (!verificarPermisos(PERMISOS.ADMIN)) {
        botonGestion?.remove();
      } else {

        botonGestion.addEventListener('click', async () => {
          console.log('Cargando módulo de gestión de usuarios...');
          localStorage.setItem('seccion-activa', 'gestionUsuarios');
          const ventanaPrincipal = document.getElementById('ventana-principal');
          if (!ventanaPrincipal) return;
          try {
            const html = await fetch('../vistas/moduloGestionUsuarios.html').then(response => response.text());
            ventanaPrincipal.innerHTML = html;
            const script = document.createElement('script');
            script.src = '../utils/js/moduloGestionUsuario.js';
            document.body.appendChild(script);
            script.onload = () => window.inicializarModuloGestionUsuarios?.();
          } catch (error) {
            console.error('Error cargando módulo de gestión de usuarios:', error);
          }
        });
      }

    const btnCerrarSesion = document.querySelector('.boton-cerrar-sesion');

    btnCerrarSesion.addEventListener('click', async () => {
        console.log('Cerrando sesión...');
        
        const respuesta = await cerrarSesion();
    
        if (respuesta.ok) {
            localStorage.removeItem('token');
            window.location.href = './inicioSesion.html';
        } else {
            alert(respuesta.message || 'Error al cerrar sesión.');
        }
    });
}

// Exponer la función para que pueda ser llamada desde el navegador
window.inicializarModuloUsuario = inicializarModuloUsuario;
