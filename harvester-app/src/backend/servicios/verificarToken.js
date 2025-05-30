const { URL_BASE } = require('../../framework/utils/scripts/constantes');


/**
 * Verifica la validez de un token JWT enviando una solicitud al servidor.
 *
 * @param {string} token - Token JWT que se desea verificar.
 * @returns {Promise<boolean>} `true` si el token es válido, `false` en caso contrario o si ocurre un error.
 */
async function verificarToken(token) {
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
      localStorage.setItem('permisos', datos.permisos); // Guardar los permisos en el localStorage

      // Retornar true si la respuesta fue exitosa y el servidor confirmó la validez
      return respuesta.ok;
  } catch {
      // En caso de error en la solicitud, se considera que el token no es válido
      return false;
  }
}

module.exports = {
  verificarToken,
};
