// RF40 Administrador consulta usuarios - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF40
// RF41 Administrador modifica usuario - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF41

const token = localStorage.getItem('token');

/**
 * Obtiene la lista de usuarios desde el servidor
 * @async
 * @returns {Promise<Object>} Objeto con la propiedad 'ok' que indica si la petición fue exitosa y los datos de usuarios
 * @throws {Error} Si hay un error en la comunicación con el servidor
 */
async function obtenerUsuarios() {
    const respuesta = await fetch('http://localhost:3000/usuarios/consultar-usuarios', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });
    
    const datos = await respuesta.json();

    return { ok: respuesta.ok, ...datos };
}

async function modificarUsuario(idUsuario, nombre, correo, contrasenia) {
    try {
        const respuesta = await fetch('http://localhost:3000/usuarios/modificar-usuario', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ idUsuario, nombre, correo, contrasenia }),
        });
        
        const datos = await respuesta.json();
    
        return { ok: respuesta.ok, ...datos };
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        return { ok: false, mensaje: 'Error al conectar con el servidor' };
    }
}

module.exports = {
    obtenerUsuarios,
    modificarUsuario
};