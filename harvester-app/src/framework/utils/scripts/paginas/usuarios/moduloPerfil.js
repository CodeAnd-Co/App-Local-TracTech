// RF3 Usuario cierra sesión - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF3
// RF40 Administrador consulta usuarios - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF40


/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

const { cerrarSesion } = require(`${rutaBase}src/backend/casosUso/sesion/cerrarSesion.js`);
const { verificarPermisos, PERMISOS } = require(`${rutaBase}src/framework/utils/scripts/middleware/auth.js`);
if (typeof Swal === 'undefined'){
  const Swal = require(`${rutaBase}/node_modules/sweetalert2/dist/sweetalert2.all.min.js`);
}


inicializarModuloUsuario();

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
  actualizarNombreUsuario();


  // Botón de Cerrar Sesión
  const botonCerrarSesion = document.querySelector('.boton-cerrar-sesion');
  if (botonCerrarSesion) {
    botonCerrarSesion.addEventListener('click', async () => {
      botonCerrarSesion.disabled = true;

      const contenidoOriginal = botonCerrarSesion.innerHTML;
      botonCerrarSesion.innerHTML = '<div class="cerrar-sesi-n">Cerrando sesión...</div>';

      const tiempoPromesa = new Promise((reject) => {
        setTimeout(() => reject(new Error('Tiempo de espera agotado')), 5000);
      });

      try {
        const respuesta = await Promise.race([cerrarSesion(), tiempoPromesa]);
        const rutaIniciarSesion = `${rutaBase}src/framework/vistas/paginas/iniciarSesion.ejs`;
        if (respuesta.ok) {
          localStorage.removeItem('token');
          localStorage.removeItem('nombreUsuario');
          const vista = await ipcRenderer.invoke('precargar-ejs', rutaIniciarSesion);
          window.location.href = vista;
        } else {
          throw new Error('La respuesta del servidor no fue exitosa');
        }
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'Hubo un error al cerrar sesión.',
          icon: 'error',
          confirmButtonColor: '#a61930',
        });

        botonCerrarSesion.innerHTML = contenidoOriginal;
        botonCerrarSesion.disabled = false;
      }
    });
  } 
}

/**
 * Actualiza el texto del div 'texto-usuario' con el nombre del usuario
 * que está almacenado en localStorage bajo la clave 'nombreUsuario'
 * 
 * @function actualizarNombreUsuario
 * @returns {void}
 */
function actualizarNombreUsuario() {
  const elementoTextoUsuario = document.querySelector('.texto-usuario');
  if (elementoTextoUsuario) {
    const nombreUsuario = localStorage.getItem('nombreUsuario');
    if (nombreUsuario) {
      elementoTextoUsuario.textContent = nombreUsuario;
    }
  }
}