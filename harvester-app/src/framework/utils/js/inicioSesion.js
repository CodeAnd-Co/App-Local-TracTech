// RF2 Usuario registrado inicia sesión - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF2

// Seleccionar elementos del DOM necesarios
const botonAbrirInfo = document.querySelector('#btn-abrir-info');
const modalInfo = document.querySelector('#modalContacto');
const botonAcceder = document.querySelector('.boton-acceder');
const entradaCorreo = document.querySelector('.correo[type="email"]');
const entradaContrasenia = document.querySelector('.contrasena');
const { verificarPermisos } = require('../../backend/servicios/verificarPermisos');
const { iniciarSesion } = require('../../backend/casosUso/sesion/iniciarSesion');
const Swal = require('sweetalert2');

/**
 * Maneja el evento de clic en el botón de acceso para iniciar sesión.
 */
async function manejarInicioSesion() {
  // Deshabilitar botón para evitar múltiples envíos
  botonAcceder.disabled = true;
  
  // Almacenar el contenido original del botón
  const contenidoOriginal = botonAcceder.innerHTML;
  
  // Cambiar el texto del botón para indicar que está procesando
  botonAcceder.innerHTML = '<div class="acceder">Accediendo...</div>';
  
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
    // Restaurar botón en caso de validación fallida
    botonAcceder.innerHTML = contenidoOriginal;
    botonAcceder.disabled = false;
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

      // Redirigir al usuario a la página principal
      window.location.href = './frameLayout.html';
      // No es necesario restaurar el botón aquí ya que se redirige

    } else {
      // Mostrar mensaje de error si las credenciales no son válidas
      Swal.fire({
        title: 'Verifica tus datos',
        text: respuesta.mensaje,
        icon: 'warning'
      });
      
      // Restaurar el botón en caso de credenciales inválidas
      botonAcceder.innerHTML = contenidoOriginal;
      botonAcceder.disabled = false;
    }
  } catch (error) {
    console.error('Error al conectar con el backend:', error);
    // Mostrar alerta si ocurre un error de conexión
    Swal.fire({
      title: 'Error de conexión',
      text: 'Verifica tu conexión e inténtalo de nuevo.',
      icon: 'error'
    });
    
    // Restaurar el botón en caso de error
    botonAcceder.innerHTML = contenidoOriginal;
    botonAcceder.disabled = false;
  }
}

// Agregar evento al botón 'Acceder'
botonAcceder.addEventListener('click', manejarInicioSesion);

// Agregar evento para detectar la tecla 'Enter' en los campos de entrada
[entradaCorreo, entradaContrasenia].forEach(entrada => {
  entrada.addEventListener('keydown', (evento) => {
    if (evento.key === 'Enter') {
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
