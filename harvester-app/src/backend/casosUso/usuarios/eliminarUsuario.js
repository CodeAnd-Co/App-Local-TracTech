// RF43 Administrador elimina usuario - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF43

const { eliminarUsuario: eliminarUsuarioAPI } = require('../../domain/usuariosAPI/usuariosAPI');

async function eliminarUsuario(id) {
    if (!id) {
        console.error('ID de usuario no proporcionado');
        return { ok: false, mensaje: 'ID de usuario no proporcionado' };
    }

    try {
        const respuesta = await eliminarUsuarioAPI(id);
        return respuesta;

    } catch (error) {
        console.error('Error al eliminar el usuario:', error);
        return { ok: false, mensaje: 'Error al eliminar el usuario' };
    }
}

module.exports = {
    eliminarUsuario,
}