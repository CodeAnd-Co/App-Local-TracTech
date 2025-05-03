// RF2 Usuario registrado inicia sesión - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF2

const { iniciarSesion: iniciarSesionAPI } = require('../../domain/sesionAPI/sesionAPI');

/**
 * Valida si una dirección de correo electrónico tiene el formato correcto.
 *
 * @param {string} correo - Dirección de correo electrónico a validar.
 * @returns {boolean} `true` si el correo es válido, de lo contrario `false`.
 */
function validarCorreo(correo) {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
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
  if (!validarCorreo(correo)) {
    return { ok: false, mensaje: 'Correo inválido' };
  }

  try {

    const respuesta = await iniciarSesionAPI(correo, contrasena);
    return respuesta;

  } catch (error) {

    console.error('Error al iniciar sesión:', error);

    // Lanzar un mensaje genérico para otros errores
    return { ok: false, mensaje: 'Error al iniciar sesión' };

  }
}

module.exports = {
  iniciarSesion,
};
