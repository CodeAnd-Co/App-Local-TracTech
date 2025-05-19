// RF40 Administrador consulta usuarios - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF40

const { obtenerUsuarios: obtenerUsuariosAPI } = require('../../domain/usuariosAPI/usuariosAPI');
const { Usuario, ListaUsuarios } = require('../../data/usuariosModelos/usuarios');

/**
 * Obtiene la lista de usuarios desde la API y los transforma en objetos de dominio
 * 
 * @returns {Promise<ListaUsuarios>} Una promesa que resuelve a un objeto ListaUsuarios con todos los usuarios obtenidos
 * @throws {Error} Si hay problemas al comunicarse con el servidor o al procesar la respuesta
 */
async function obtenerUsuarios() {
    try {
        const respuesta = await obtenerUsuariosAPI();

        if (!respuesta.ok) {
            throw new Error('Error al obtener la lista de usuarios del servidor');
        }

        const listaUsuarios = new ListaUsuarios();

        const datosUsuarios = respuesta.usuarios || [];

        datosUsuarios.forEach(usuarioInformacion => {
            const usuario = new Usuario(usuarioInformacion.id, usuarioInformacion.nombre, usuarioInformacion.correo, usuarioInformacion.rol);
            listaUsuarios.agregarUsuario(usuario);
        });

        return listaUsuarios;
    } catch (error) {
        throw new Error('No se pudo obtener la lista de usuarios:', error.message);
    }
}

module.exports = {
    obtenerUsuarios,
};