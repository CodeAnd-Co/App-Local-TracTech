// RF2 Usuario registrado inicia sesión - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF2

// Seleccionar elementos del DOM necesarios
const btnAbrirInfo = document.querySelector("#btn-abrir-info");
const modalInfo = document.querySelector("#modalContacto");
const btnAcceder = document.querySelector(".boton-acceder");
const entradaCorreo = document.querySelector(".correo[type='email']");
const entradaContrasena = document.querySelector(".contrasena");
const { verificarPermisos } = require("../../backend/servicios/verificarPermisos");
const { iniciarSesion } = require("../../backend/casosUso/sesion/iniciarSesion");

/**
 * Maneja el evento de clic en el botón de acceso para iniciar sesión.
 */
btnAcceder.addEventListener("click", async () => {
  // Obtener valores de los campos de entrada
  const correo = entradaCorreo.value;
  const contrasena = entradaContrasena.value;

  // Validar que ambos campos estén completos
  if (!correo || !contrasena) {
    alert("Por favor, completa todos los campos.");
    return;
  }

  try {
    // Intentar iniciar sesión llamando a la función iniciarSesion
    const respuesta = await iniciarSesion(correo, contrasena);

    if (respuesta.ok) {
      // Guardar el token en localStorage
      localStorage.setItem("token", respuesta.token);

      const resultado = await verificarPermisos(respuesta.token);
      const listaPermisos = resultado.permisos || [];
      localStorage.setItem("permisos", JSON.stringify(listaPermisos));

      // Redirigir al usuario a la página principal
      window.location.href = "./frameLayout.html";

    } else {
      // Mostrar mensaje de error si las credenciales no son válidas
      alert(respuesta.message || "Error al iniciar sesión.");
    }
  } catch (error) {
    console.error("Error al conectar con el backend:", error);
    // Mostrar alerta si ocurre un error de conexión
    alert("No se pudo conectar con el servidor.");
  }
});

/**
 * Muestra el modal de información al hacer clic en el botón correspondiente.
 */
btnAbrirInfo.addEventListener("click", () => {
  modalInfo.showModal();
});

/**
 * Cierra el modal si el usuario hace clic fuera del contenido del mismo.
 *
 * @param {Event} event - Evento de clic.
 */
function onClick(event) {
  if (event.target === dialog) {
    dialog.close();
  }
}

// Seleccionar el elemento dialog y agregar evento de cierre al hacer clic fuera
const dialog = document.querySelector("dialog");
dialog.addEventListener("click", onClick);
