// RF39 Administrador crea usuario - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF39

const validador = require('validator');
const { crearUsuario: crearUsuarioAPI } = require('../../domain/usuariosAPI/usuariosAPI');

/**
 * Sanitiza los datos de entrada del usuario, como nombre, correo y contraseña.
 *
 * Utiliza `validador.escape` para proteger contra inyecciones escapando caracteres especiales.
 *
 * @function sanitizarEntrada
 * @param {object} datos - Datos del usuario a sanitizar.
 * @param {string} datos.nombre - Nombre del usuario.
 * @param {string} datos.correo - Correo electrónico del usuario.
 * @param {string} datos.contrasenia - Contraseña del usuario.
 * @param {number} datos.idRolFK - ID del rol asignado al usuario.
 * @returns {object} Objeto con los datos sanitizados.
 */
function sanitizarEntrada({ nombre, correo, contrasenia, idRolFK }) {
    const nombreSanitizado = validador.escape(nombre);
    const correoSanitizado = validador.normalizeEmail(correo);
    const contraseniaSanitizada = validador.escape(contrasenia);
    const idRolFKSanitizada = Number(idRolFK);
    return { nombreSanitizado, correoSanitizado, contraseniaSanitizada, idRolFKSanitizada };
}

/**
 * Valida si una dirección de correo electrónico tiene el formato correcto.
 *
 * @param {string} correo - Dirección de correo electrónico a validar.
 * @returns {boolean} `true` si el correo es válido, de lo contrario `false`.
 */
function validarCorreo(correo) {
    const regex = /^[a-z0-9!#$%&'*+=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
    return regex.test(correo);
}

/**
 * Crea un nuevo usuario a través de una llamada a la API.
 *
 * Esta función valida que se proporcionen los campos requeridos (nombre, correo, contraseña, idRolFK).
 * Si son válidos, realiza una solicitud asíncrona a la API para crear el nuevo usuario.
 *
 * @async
 * @function crearUsuario
 * @param {object} datos - Datos del nuevo usuario.
 * @param {string} datos.nombre - Nombre del usuario.
 * @param {string} datos.correo - Correo electrónico del usuario.
 * @param {string} datos.contrasenia - Contraseña del usuario.
 * @param {number} datos.idRolFK - ID del rol asignado al usuario.
 * @returns {Promise<{ok: boolean, mensaje: string, id?: number}>} Resultado de la operación.
 */
async function crearUsuario({ nombre, correo, contrasenia, idRolFK }) {
    if (!nombre || !correo || !contrasenia || !idRolFK) {
        return { ok: false, mensaje: 'Todos los campos son obligatorios' };
    }

    if (!validarCorreo(correo)) {
        return { ok: false, mensaje: 'Correo electrónico no válido' };
    }

    // Sanitizar los datos de entrada
    const { nombreSanitizado, correoSanitizado, contraseniaSanitizada, idRolFKSanitizada } = sanitizarEntrada({
        nombre,
        correo,
        contrasenia,
        idRolFK,
    });
    const datosApi = {
        nombre: nombreSanitizado,
        correo: correoSanitizado,
        contrasenia: contraseniaSanitizada,
        idRolFK: idRolFKSanitizada,
    };

    try {
        const respuesta = await crearUsuarioAPI(datosApi);
        if (!respuesta.ok) {
            return { ok: false, mensaje: respuesta.mensaje || 'Error al crear el usuario' };
        }
        return { ok: true, mensaje: respuesta.mensaje, id: respuesta.id };
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
        return { ok: false, mensaje: 'Error al crear el usuario'};
    }
}

module.exports = {
    crearUsuario,
};
