async function verificarPermisos(token) {
  if (!token) {
    // Si no se proporciona un token, se considera inválido
    return false;
  }

  try {
    // Enviar solicitud GET al servidor para verificar el token
    const respuesta = await fetch("http://localhost:3000", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Incluir el token en el encabezado Authorization
      },
    });

    // Parsear la respuesta del servidor
    const datos = await respuesta.json();

    // Retornar true si la respuesta fue exitosa y el servidor confirmó la validez
    return respuesta.ok && datos;
  } catch (error) {
    console.error("Error al verificar el token:", error);
    // En caso de error en la solicitud, se considera que el token no es válido
    return false;
  }
}

module.exports = {
    verificarPermisos,
};