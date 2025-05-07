// RF40 Administrador consulta usuarios - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF40
// RF43 Administrador elimina usuario - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF43

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
    const respuesta = await fetch(`http://localhost:3000/usuarios/eliminar-usuario/${id}`, {
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

    const respuesta = await fetch('http://localhost:3000/usuarios/crear-usuario', {
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

module.exports = {
    obtenerUsuarios,
    eliminarUsuario,
    crearUsuario,
};
