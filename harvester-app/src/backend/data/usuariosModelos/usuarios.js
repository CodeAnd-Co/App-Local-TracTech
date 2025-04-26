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

    // Agregar usuarios deserializados
    agregarUsuario(usuarioNuevo) {
        if (this.usuarios.has(usuarioNuevo.id)) {
            throw new Error(`El usuario con ID ${usuarioNuevo.id} ya existe.`);
        }
        this.usuarios.set(usuarioNuevo.id, usuarioNuevo);
    }

    // Obtener todos los usuarios
    obtenerUsuarios() {
        return Array.from(this.usuarios.values());
    }

    // Buscar un usuario por correo
    buscarUsuarioPorCorreo(correo) {
        const usuario = Array.from(this.usuarios.values()).find(usuario => usuario.correo === correo);
        if (!usuario) {
            throw new Error(`No se encontró un usuario con el correo ${correo}.`);
        }
        return usuario;
    }

    // Eliminar un usuario por ID
    eliminarUsuario(id) {
        if (!this.usuarios.has(id)) {
            throw new Error(`No se encontró un usuario con ID ${id}.`);
        }
        this.usuarios.delete(id);
    }

    // Limpiar la lista temporal
    limpiarLista() {
        this.usuarios.clear();
    }
}

module.exports = { 
    Usuario, 
    ListaUsuarios, 
};