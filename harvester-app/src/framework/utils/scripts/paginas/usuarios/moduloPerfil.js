// RF3 Usuario cierra sesión - https://codeandco-wiki.netlify.app/docs/next/proyectos/tractores/documentacion/requisitos/rf3/

/* eslint-disable no-undef */
const { cerrarSesion } = require(`${rutaBase}src/backend/casosUso/sesion/cerrarSesion.js`);
const { mostrarAlerta } = require(`${rutaBase}/src/framework/vistas/includes/componentes/moleculas/alertaSwal/alertaSwal`);


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

      const confirmacion = await mostrarAlertaConfirmacion(
        '¿Estás seguro de que quieres cerrar sesión?',
        'Se cerrará tu sesión actual.',
        'warning',
        'Cerrar sesión',
        'Cancelar'
    );
    if (!confirmacion) {
        // Si el usuario cancela, restaurar el contenido original del botón y habilitarlo
        botonCerrarSesion.disabled = false;
        return;
    }

      const contenidoOriginal = botonCerrarSesion.innerHTML;
      botonCerrarSesion.innerHTML = '<div class="cerrar-sesi-n">Cerrando sesión...</div>';
      

      const timeoutPromise = new Promise((reject) => {
        setTimeout(() => reject(new Error('Tiempo de espera agotado')), 5000);
      });


      try {
        const respuesta = await Promise.race([cerrarSesion(), timeoutPromise]);
        const rutaIniciarSesion = `${rutaBase}src/framework/vistas/paginas/iniciarSesion.ejs`;
        if (respuesta.ok) {
          if (require('electron').remote && require('electron').remote.app.verificacionIntervalo) {
              clearInterval(require('electron').remote.app.verificacionIntervalo);
          }
          localStorage.removeItem('seccion-activa')
          localStorage.removeItem('token');
          localStorage.removeItem('nombreUsuario');
          const vista = await ipcRenderer.invoke('precargar-ejs', rutaIniciarSesion);
          window.location.href = vista;
        } else {
          throw new Error('La respuesta del servidor no fue exitosa');
        }
      } catch {
        mostrarAlerta('Error', 'Hubo un error al cerrar sesión:', 'error');

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