const { URL_BASE } = require('../../framework/utils/scripts/constantes');

/**
 * Función para verificar los permisos de un token enviando una solicitud al servidor.
 * @param {string} token - El token JWT a verificar
 * @returns {Promise<boolean>} - Retorna true si el token es válido, false en caso contrario
 */
async function verificarPermisos(token) {
  if (!token) {
    // Si no se proporciona un token, se considera inválido
    return false;
  }

  try {
    // Enviar solicitud GET al servidor para verificar el token
    const respuesta = await fetch(`${URL_BASE}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // Incluir el token en el encabezado Authorization
      },
    });

    // Parsear la respuesta del servidor
    const datos = await respuesta.json();

    // Retornar true si la respuesta fue exitosa y el servidor confirmó la validez
    return respuesta.ok && datos;
  } catch (error) {
    console.error('Error al verificar el token:', error);

    // En caso de error en la solicitud, se considera que el token no es válido
    return false;
  }
}

module.exports = {
    verificarPermisos,
};
