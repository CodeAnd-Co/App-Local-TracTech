const bcrypt = require("bcrypt");
const { iniciarSesion: iniciarSesionAPI } = require("../../domain/sesionAPI/sesionAPI");

async function iniciarSesion(correo, contrasena) {
  try {

    const respuesta = await iniciarSesionAPI(correo, contrasena);

    return respuesta;
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    throw new Error("No se pudo iniciar sesión");
  }
}

module.exports = {
  iniciarSesion,
};