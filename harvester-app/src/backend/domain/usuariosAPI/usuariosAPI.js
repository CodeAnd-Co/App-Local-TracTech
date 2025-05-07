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

/**
 * Esta función se utiliza para actualizar los datos de un usuario ya existente
 * en la base de datos. Incluye el token JWT en la cabecera para verificar
 * permisos del usuario autenticado.
 *
 * @async
 * @function modificarUsuario
 * @param {number} idUsuario - ID del usuario a modificar
 * @param {string} nombre - Nuevo nombre del usuario
 * @param {string} correo - Nuevo correo electrónico del usuario
 * @param {string} contrasenia - Nueva contraseña del usuario (se enviará en texto plano y será hasheada en el backend)
 * @returns {Promise<{ok: boolean, [key: string]: any}>}
 * Objeto con `ok` indicando éxito o fallo, y propiedades adicionales como `mensaje`.
 *
 * @throws {Error} Si ocurre un problema de red o el servidor no responde.
 */
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