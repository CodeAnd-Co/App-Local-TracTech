// RF40 Administrador consulta usuarios - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF40
// RF41 Administrador modifica usuario - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF41
// RF43 Administrador elimina usuario - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF43

const token = localStorage.getItem('token');

/**
 * Obtiene la lista de usuarios desde el servidor
 * @async
 * @returns {Promise<Object>} Objeto con la propiedad 'ok' que indica si la petición fue exitosa y los datos de usuarios
 * @throws {Error} Si hay un error en la comunicación con el servidor
 */
async function obtenerUsuarios() {
    const respuesta = await fetch('http://localhost:3000/usuarios/consultarUsuarios', {
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
async function modificarUsuario(idUsuario, nombre, correo, contrasenia, idRol) {
    try {
        const respuesta = await fetch('http://localhost:3000/usuarios/modificarUsuario', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ idUsuario, nombre, correo, contrasenia, idRol }),
        });
        
        const datos = await respuesta.json();
    
        return { ok: respuesta.ok, ...datos };
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        return { ok: false, mensaje: 'Error al conectar con el servidor' };
    }
}

/**
 * Elimina un usuario del sistema mediante una solicitud HTTP DELETE a la API.
 *
 * Esta función realiza una petición al endpoint de eliminación de usuarios del servidor
 * y devuelve el resultado indicando si la operación fue exitosa o no.
 *
 * @async
 * @function eliminarUsuario
 * @param {string} id - ID del usuario a eliminar.
 * @returns {Promise<{ok: boolean, mensaje?: string}>} Objeto con el estado de la operación y un posible mensaje del servidor.
 */
async function eliminarUsuario(id) {
    const respuesta = await fetch(`http://localhost:3000/usuarios/eliminarUsuario/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });
    
    const datos = await respuesta.json();

    return { ok: respuesta.ok, ...datos };
}

/**
 * Crea un nuevo usuario enviando una solicitud POST al backend.
 *
 * Esta función es utilizada por el administrador para registrar usuarios nuevos en el sistema.
 * Envia los datos al endpoint correspondiente, incluyendo autenticación con token.
 *
 * @async
 * @function crearUsuarioAPI
 * @param {object} datos - Objeto con los datos del usuario a crear.
 * @param {string} datos.nombre - Nombre del nuevo usuario.
 * @param {string} datos.correo - Correo electrónico del nuevo usuario.
 * @param {string} datos.contrasenia - Contraseña del nuevo usuario.
 * @param {number} datos.idRol_FK - ID del rol asignado al usuario.
 * @returns {Promise<{ok: boolean, mensaje: string, id?: number}>} Resultado de la operación.
 */
async function crearUsuario(datos) {
    const token = localStorage.getItem('token');

    const respuesta = await fetch('http://localhost:3000/usuarios/crearUsuario', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(datos),
    });

    const resultado = await respuesta.json();
    return { ok: respuesta.ok, ...resultado };
}

/**
 * Obtiene los roles disponibles para agregar a los nuevos usuarios
 * @async
 * @returns {Promise<Object>} Objeto con la propiedad 'ok' que indica si la petición fue exitosa y los datos de usuarios
 * @throws {Error} Si hay un error en la comunicación con el servidor
 */
async function consultarRoles() {
    const respuesta = await fetch('http://localhost:3000/usuarios/consultarRolesUsuarios', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });
    
    const datos = await respuesta.json();

    return { ok: respuesta.ok, ...datos };
}

module.exports = {
    obtenerUsuarios,
    modificarUsuario,
    eliminarUsuario,
    crearUsuario,
    consultarRoles
};
