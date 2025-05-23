// RF2 Usuario registrado inicia sesión - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF2

// Seleccionar elementos del DOM necesarios
const botonAbrirInfo = document.querySelector('#btn-abrir-info');
const modalInfo = document.querySelector('#modalContacto');
const botonAcceder = document.querySelector('.boton-acceder');
const entradaCorreo = document.querySelector('.correo[type="email"]');
const entradaContrasenia = document.querySelector('.contrasena');
const { ipcRenderer } = require('electron');
const { verificarPermisos } = require(`${rutaBase}/src/backend/servicios/verificarPermisos`);
const { iniciarSesion } = require(`${rutaBase}/src/backend/casosUso/sesion/iniciarSesion`);
const Swal = require(`${rutaBase}/node_modules/sweetalert2/dist/sweetalert2.all.min.js`);

/**
 * Maneja el evento de clic en el botón de acceso para iniciar sesión.
 */
async function manejarInicioSesion() {
  // Obtener valores de los campos de entrada
  const correo = entradaCorreo.value;
  const contrasenia = entradaContrasenia.value;

  // Validar que ambos campos estén completos
  if (!correo || !contrasenia) {
    Swal.fire({
      title: 'Campos faltantes',
      text: 'Por favor, completa todos los campos.',
      icon: 'warning'
    });
    return;
  }

  try {
    // Intentar iniciar sesión llamando a la función iniciarSesion
    const respuesta = await iniciarSesion(correo, contrasenia);

    if (respuesta.ok) {
      // Guardar el token en localStorage
      localStorage.setItem('token', respuesta.token);

      const resultado = await verificarPermisos(respuesta.token);
      const listaPermisos = resultado.permisos || [];
      localStorage.setItem('permisos', JSON.stringify(listaPermisos));
      const usuario = resultado.usuario;
      localStorage.setItem('nombreUsuario', usuario);
      const rutaInicio = `${rutaBase}src/framework/vistas/paginas/inicio/inicio.ejs`;
      try {
          const vista = await ipcRenderer.invoke('precargar-ejs', rutaInicio, { Seccion: 'Inicio', Icono : 'Casa'});
          const vista = await ipcRenderer.invoke('precargar-ejs', rutaInicio,{Seccion: 'Inicio', Icono: 'Casa'});
          window.location.href = vista;
      } catch (err) {
          console.error('Error al cargar vista:', err);
      }

    } else {
      // Mostrar mensaje de error si las credenciales no son válidas
      Swal.fire({
        title: 'Verifica tus datos',
        text: respuesta.mensaje,
        icon: 'warning'
      });
    }
  } catch (error) {
    console.error('Error al conectar con el backend:', error);
    // Mostrar alerta si ocurre un error de conexión
    Swal.fire({
      title: 'Error de conexión',
      text: 'Verifica tu conexión e inténtalo de nuevo.',
      icon: 'error'
    });
  }
}

// Agregar evento al botón 'Acceder'
botonAcceder.addEventListener('click', manejarInicioSesion);

// Agregar evento para detectar la tecla 'Enter' en los campos de entrada
[entradaCorreo, entradaContrasenia].forEach(entrada => {
  entrada.addEventListener('keydown', (evento) => {
    if (evento.key === 'Enter') {
      evento.preventDefault();
      manejarInicioSesion();
    }
  });
});

/**
 * Muestra el modal de información al hacer clic en el botón correspondiente.
 */
botonAbrirInfo.addEventListener('click', () => {
  modalInfo.showModal();
});

/**
 * Cierra el modal si el usuario hace clic fuera del contenido del mismo.
 *
 * @param {Event} evento - Evento de clic.
 */
function onClick(evento) {
  if (evento.target === dialogo) {
    dialogo.close();
  }
}

// Seleccionar el elemento dialog y agregar evento de cierre al hacer clic fuera
const dialogo = document.querySelector('dialog');
dialogo.addEventListener('click', onClick);
