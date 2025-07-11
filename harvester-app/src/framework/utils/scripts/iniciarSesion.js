// RF2 Usuario registrado inicia sesión - https://codeandco-wiki.netlify.app/docs/next/proyectos/tractores/documentacion/requisitos/RF2

// Seleccionar elementos del DOM necesarios
const botonAbrirInfo = document.querySelector('#btn-abrir-info');
const modalInfo = document.querySelector('#modalContacto');
const botonAcceder = document.querySelector('.boton-acceder');
const entradaCorreo = document.querySelector('.correo[type="email"]');
const entradaContrasenia = document.querySelector('.contrasena');
const { ipcRenderer } = require('electron');
const { verificarPermisos } = require(`${rutaBase}/src/backend/servicios/verificarPermisos`);
const { iniciarSesion } = require(`${rutaBase}/src/backend/casosUso/sesion/iniciarSesion`);
const { mostrarAlerta } = require(`${rutaBase}/src/framework/vistas/includes/componentes/moleculas/alertaSwal/alertaSwal`);
const { obtenerID } = require(`${rutaBase}/src/backend/servicios/generadorID`);
const { verificarEstado } = require(`${rutaBase}/src/backend/servicios/verificarEstado`);
const { PERMISOS } = require(`${rutaBase}/src/framework/utils/scripts/middleware/auth`);
/**
 * Maneja el evento de clic en el botón de acceso para iniciar sesión.
 */
async function manejarInicioSesion() {
  // Obtener valores de los campos de entrada
  const correo = entradaCorreo.value.trim();
  const contrasenia = entradaContrasenia.value;

  // Validar que ambos campos estén completos
  if (!correo || !contrasenia) {
    mostrarAlerta('Campos incompletos', 'Por favor, completa todos los campos.', 'warning');
    return;
  }
  if (/\s/.test(correo)) {
    mostrarAlerta('Correo inválido', 'El correo no debe contener espacios.', 'warning');
    return;
  }

  try {
    // Obtener el ID del dispositivo antes del login para enviarlo al servidor
    const dispositivoID = obtenerID();
    // Intentar iniciar sesión enviando también el ID del dispositivo para registro
    const respuesta = await iniciarSesion(correo, contrasenia, dispositivoID);
    
    if (respuesta.ok) {
      // Guardar el token en localStorage
      localStorage.setItem('token', respuesta.token);

      // Obtener permisos del usuario primero
      const resultado = await verificarPermisos(respuesta.token);
      const listaPermisos = resultado.permisos || [];
      localStorage.setItem('permisos', JSON.stringify(listaPermisos));
      const usuario = resultado.usuario;
      localStorage.setItem('nombreUsuario', usuario);
      
      // Verificar si el usuario es superadministrador
      const esSuperAdmin = listaPermisos.includes(PERMISOS.SUPERADMIN);
      
      // Solo verificar estado del dispositivo si NO es superadministrador
      if (!esSuperAdmin) {
        try {
          const verificacion = await verificarEstado(respuesta.token, dispositivoID);
          
          if (!verificacion.estado) {
            // Manejar diferentes tipos de error según el código
            if (verificacion.codigo === 'DISPOSITIVO_AJENO') {
              mostrarAlerta(
                'Dispositivo no autorizado', 
                `Este dispositivo pertenece a otro usuario. Por favor, utiliza tu dispositivo asignado o contacta al administrador.\nDispositivo ID: ${dispositivoID}`, 
                'error'
              );
            } else if (verificacion.codigo === 'MULTIPLES_DISPOSITIVOS') {
              mostrarAlerta(
                'Múltiples dispositivos detectados', 
                `Ya tienes un dispositivo vinculado a tu cuenta. Solo puedes usar un dispositivo por cuenta de usuario.\nDispositivo ID: ${dispositivoID}`, 
                'warning'
              );
            } else {
              mostrarAlerta(
                'Aplicación deshabilitada', 
                `La aplicación ha sido deshabilitada por el administrador. Por favor, contacta al soporte técnico.\nDispositivo ID: ${dispositivoID}`, 
                'error'
              );
            }
            localStorage.clear();
            return;
          }
        } catch  {
          mostrarAlerta('Error de verificación', `No se pudo verificar el estado del dispositivo. Inténtalo de nuevo.\nDispositivo ID: ${dispositivoID}`, 'error');
          localStorage.clear();
          return;
        }
      }

      // Reiniciar verificación periódica después del login exitoso
      await ipcRenderer.invoke('reiniciar-verificacion-periodica');

      // Guardar bandera para saber que vienes de login
      localStorage.setItem('cargando-desde-login', 'true');

      // Redirigir a pantallaCarga.ejs en vez de inicio.ejs directamente
      const rutaPantallaCarga = `${rutaBase}src/framework/vistas/paginas/pantallaCarga.ejs`;
      try {
          const vista = await ipcRenderer.invoke('precargar-ejs', rutaPantallaCarga, { rutaBase, permisos: listaPermisos });
          window.location.href = vista;
      } catch (err) {
          return ('Error al cargar vista:', err);
      }
    } else {
      mostrarAlerta('Verifica tus datos', respuesta.mensaje, 'warning');
    }
  } catch {
    mostrarAlerta('Error de conexión', 'Verifica tu conexión e inténtalo de nuevo.', 'error');
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

/**
 * Actualiza el contador de caracteres restantes.
 * @param {HTMLInputElement} campoEntrada - Campo de entrada a validar.
 * @returns {void}
 */
function actualizarCaracteres(campoEntrada) {
  const caracteresUsados = campoEntrada.value.length;
  const limite = parseInt(campoEntrada.getAttribute('maxlength'), 10);

  // Verificación cuando se alcanza el maxlength
  if (caracteresUsados >= limite) {
    const esCorreo = campoEntrada.classList.contains('correo');
    const tipoElemento = esCorreo ? 'correo electrónico' : 'contraseña';
    
    // Usar setTimeout para evitar conflictos con el evento input
    setTimeout(() => {
      mostrarAlerta('Límite alcanzado', `Has alcanzado el límite máximo de caracteres para el ${tipoElemento} (${limite} caracteres).`, 'warning');
    }, 100);
  }
}

// Inicializar validadores al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  // Configurar eventos para validación en tiempo real
  if (entradaCorreo) {
    entradaCorreo.addEventListener('input', () => {
      entradaCorreo.value = entradaCorreo.value.replace(/\s/g, '');
      actualizarCaracteres(entradaCorreo)
    });
    
    // Prevenir espacios en el campo de correo
    entradaCorreo.addEventListener('keydown', (evento) => {
      if (evento.key === ' ' || evento.keyCode === 32) {
        evento.preventDefault();
      }
    });
  }
  
  if (entradaContrasenia) {
    entradaContrasenia.addEventListener('input', () => actualizarCaracteres(entradaContrasenia));
  }
});
