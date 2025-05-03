// RF2 Usuario registrado inicia sesión - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF2

const validator = require('validator');
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
 * Sanitiza los datos de entrada del usuario, como correo y contraseña.
 *
 * Utiliza `validator.normalizeEmail` para normalizar el correo electrónico y 
 * `validator.escape` para proteger contra inyecciones en la contraseña escapando caracteres especiales.
 *
 * @function sanitizarEntrada
 * @param {string} correo - Correo electrónico ingresado por el usuario.
 * @param {string} contrasena - Contraseña ingresada por el usuario.
 * @returns {{correoSanitizado: string, contrasenaSanitizada: string}} Objeto con el correo y la contraseña sanitizados.
 */
function sanitizarEntrada(correo, contrasena) {
  const correoSanitizado = validator.normalizeEmail(correo);
  const contrasenaSanitizada = validator.escape(contrasena); // Escapa caracteres peligrosos
  return { correoSanitizado, contrasenaSanitizada };
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

  // Sanitizar la entrada del correo y la contraseña
  const { correoSanitizado, contrasenaSanitizada } = sanitizarEntrada(correo, contrasena);

  try {

    const respuesta = await iniciarSesionAPI(correoSanitizado, contrasenaSanitizada);
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
