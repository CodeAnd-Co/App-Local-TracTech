// RF2 Usuario registrado inicia sesión - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF2

const validador = require('validator');
const { iniciarSesion: iniciarSesionAPI } = require('../../domain/sesionAPI/sesionAPI');

/**
 * Valida si una dirección de correo electrónico tiene el formato correcto.
 *
 * @param {string} correo - Dirección de correo electrónico a validar.
 * @returns {boolean} `true` si el correo es válido, de lo contrario `false`.
 */
function validarCorreo(correo) {
  const regex = /^[a-z0-9!#$%&'*+=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
  return regex.test(correo);
}

/**
 * Sanitiza los datos de entrada del usuario, como correo y contraseña.
 *
 * Utiliza `validador.normalizeEmail` para normalizar el correo electrónico y 
 * `validador.escape` para proteger contra inyecciones en la contraseña escapando caracteres especiales.
 *
 * @function sanitizarEntrada
 * @param {string} correo - Correo electrónico ingresado por el usuario.
 * @param {string} contrasenia - Contraseña ingresada por el usuario.
 * @returns {{correoSanitizado: string, contraseniaSanitizada: string}} Objeto con el correo y la contraseña sanitizados.
 */
function sanitizarEntrada(correo, contrasenia) {
  const correoSanitizado = validador.normalizeEmail(correo);
  const contraseniaSanitizada = validador.escape(contrasenia); // Escapa caracteres peligrosos
  return { correoSanitizado, contraseniaSanitizada };
}

/**
 * Inicia sesión utilizando las credenciales proporcionadas.
 *
 * @async
 * @param {string} correo - Dirección de correo electrónico del usuario.
 * @param {string} contrasenia - Contraseña del usuario.
 * @returns {Promise<Object>} Respuesta del intento de inicio de sesión.
 * @throws {Error} Si el correo no es válido o si ocurre un error al intentar iniciar sesión.
 */
async function iniciarSesion(correo, contrasenia) {
  if (!validarCorreo(correo)) {
    return { ok: false, mensaje: 'Correo inválido' };
  }

  // Sanitizar la entrada del correo y la contraseña
  const { correoSanitizado, contraseniaSanitizada } = sanitizarEntrada(correo, contrasenia);

  try {
    const respuesta = await iniciarSesionAPI(correoSanitizado, contraseniaSanitizada);
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
