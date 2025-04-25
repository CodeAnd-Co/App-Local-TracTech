const { obtenerUsuarios: obtenerUsuariosAPI } = require("../../domain/usuariosAPI/usuariosAPI");

async function obtenerUsuarios() {
    try {
        const respuesta = await obtenerUsuariosAPI();

        return respuesta;
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        throw new Error("No se pudo obtener la lista de usuarios");
    }
}

module.exports = {
    obtenerUsuarios,
};