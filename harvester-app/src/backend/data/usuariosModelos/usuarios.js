// RF40 Administrador consulta usuarios - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF40

class Usuario {
    constructor(id, nombre, correo) {
      this.id = id;
      this.nombre = nombre;
      this.correo = correo;
    }
  }

class ListaUsuarios {
    constructor() {
        this.usuarios = new Map();
    }

    agregarUsuario(usuarioNuevo) {
        if (this.usuarios.has(usuarioNuevo.id)) {
            throw new Error(`El usuario con ID ${usuarioNuevo.id} ya existe.`);
        }
        this.usuarios.set(usuarioNuevo.id, usuarioNuevo);
    }

    obtenerUsuarios() {
        return Array.from(this.usuarios.values());
    }

    buscarUsuarioPorCorreo(correo) {
        const usuario = Array.from(this.usuarios.values()).find(usuario => usuario.correo === correo);
        if (!usuario) {
            throw new Error(`No se encontró un usuario con el correo ${correo}.`);
        }
        return usuario;
    }

    eliminarUsuario(id) {
        if (!this.usuarios.has(id)) {
            throw new Error(`No se encontró un usuario con ID ${id}.`);
        }
        this.usuarios.delete(id);
    }

    limpiarLista() {
        this.usuarios.clear();
    }
}

module.exports = { 
    Usuario, 
    ListaUsuarios, 
};