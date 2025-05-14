// RF2 Usuario registrado inicia sesión - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF2
// RF3 Usuario cierra sesión - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF3

/**
 * Realiza la solicitud para iniciar sesión en el servidor.
 * Envía el correo y la contraseña como datos en el cuerpo de la petición.
 * @param {string} correo - Correo del usuario
 * @param {string} contrasenia - Contraseña del usuario
 * @returns {Promise<object>} - Objeto con el estado de la respuesta y los datos recibidos
 */
async function iniciarSesion(correo, contrasenia) {
  const respuesta = await fetch('http://localhost:3000/sesion/iniciarSesion', {
    method: 'POST', // Método HTTP POST para enviar las credenciales
    headers: {
      'Content-Type': 'application/json', // Especificar el tipo de contenido
    },
    body: JSON.stringify({ correo, contrasenia }), // Convertir los datos a JSON
  });

  // Convertir la respuesta a JSON
  const datos = await respuesta.json();

  // Retornar un objeto combinando el estado ok y los datos
  return { ok: respuesta.ok, ...datos };
}

/**
 * Realiza la solicitud para cerrar la sesión del usuario.
 * Envía el token en los encabezados de la solicitud para autenticar al usuario.
 * @param {string} token - Token de autenticación del usuario
 * @returns {Promise<object>} - Objeto con el estado de la respuesta y los datos recibidos
 */
async function cerrarSesion(token, tokenCSRF) {
  const respuesta = await fetch('http://localhost:3000/sesion/cerrarSesion', {
    method: 'POST', // Método HTTP POST para cerrar sesión
    headers: {
      'Content-Type': 'application/json', // Especificar el tipo de contenido
      Authorization: `Bearer ${token}`, // Incluir el token en el encabezado Authorization  
      'X-CSRF-Token': tokenCSRF, // Incluir el token CSRF en el encabezado
    },
  });

  // Convertir la respuesta a JSON
  const datos = await respuesta.json();

  // Retornar un objeto combinando el estado ok y los datos
  return { ok: respuesta.ok, ...datos };
}

// Exportar las funciones iniciarSesion y cerrarSesion para ser utilizadas en otros módulos
module.exports = {
  iniciarSesion,
  cerrarSesion,
};
