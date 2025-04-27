// RF2 Usuario registrado inicia sesión - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF2

const { iniciarSesion: iniciarSesionAPI } = require("../../domain/sesionAPI/sesionAPI");

/**
 * Valida si una dirección de correo electrónico tiene el formato correcto.
 *
 * @param {string} correo - Dirección de correo electrónico a validar.
 * @returns {boolean} `true` si el correo es válido, de lo contrario `false`.
 */
function validarCorreo(correo) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(correo);
}

/**
 * Inicia sesión utilizando las credenciales proporcionadas.
 *
 * @async
 * @param {string} correo - Dirección de correo electrónico del usuario.
 * @param {string} contrasena - Contraseña del usuario.
 * @returns {Promise<Object>} Respuesta del intento de inicio de sesión.
 * @throws {Error} Si el correo no es válido o si ocurre un error al intentar iniciar sesión.
 */
async function iniciarSesion(correo, contrasena) {
  try {
    if (!validarCorreo(correo)) {
      throw new Error("Correo inválido");
    }

    const respuesta = await iniciarSesionAPI(correo, contrasena);
    return respuesta;
  } catch (error) {
    console.error("Error al iniciar sesión:", error);

    // Re-lanzar el error si es un error de validación
    if (error.message === "Correo inválido") {
      throw error;
    }

    // Lanzar un mensaje genérico para otros errores
    throw new Error("No se pudo iniciar sesión");
  }
}

module.exports = {
  iniciarSesion,
};
