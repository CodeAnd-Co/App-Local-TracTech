// RF40 Administrador consulta usuarios - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF40

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

module.exports = {
    obtenerUsuarios,
    eliminarUsuario,
};