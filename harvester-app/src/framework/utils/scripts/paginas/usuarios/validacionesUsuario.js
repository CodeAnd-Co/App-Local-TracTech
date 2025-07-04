// RF14 Administrador crea usuario - https://codeandco-wiki.netlify.app/docs/next/proyectos/tractores/documentacion/requisitos/rf14/
// RF16 Administrador modifica usuario - https://codeandco-wiki.netlify.app/docs/next/proyectos/tractores/documentacion/requisitos/rf16/

const validator = require('validator');
const { mostrarAlerta } = require(`${rutaBase}/src/framework/vistas/includes/componentes/moleculas/alertaSwal/alertaSwal`);

const numeroMinimoID = 1;
const tamanioMaximoNombre = 45;
const tamanioMinimoCorreo = 5;
const tamanioMaximoCorreo = 50;
const tamanioMinimoContrasenia = 8;
const tamanioMaximoContrasenia = 512;
const regexNombre = /^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ. ]*$/;

/**
 * Valida los campos del formulario de creación de usuario.
 * 
 * @param {Object} datosUsuario - Datos del usuario
 * @param {string} datosUsuario.nombre - Nombre del usuario.
 * @param {string} datosUsuario.correo - Correo electrónico del usuario.
 * @param {string} datosUsuario.contrasenia - Contraseña del usuario.
 * @param {string} datosUsuario.confirmarContrasenia - Confirmación de la contraseña.
 * @param {string} datosUsuario.idRol - ID del rol del usuario.
 * @param {Array<String>} listaCorreos - Lista de correos electrónicos ya registrados.
 * @returns {boolean} - Si la validación es exitosa
 */
function validarCrearUsuario(datosUsuario, listaCorreos) {
    const nombreTrim = datosUsuario.nombre.trim();
    const correoTrim = datosUsuario.correo.trim();
    const contraseniaTrim = datosUsuario.contrasenia.trim();
    const confirmarContraseniaTrim = datosUsuario.confirmarContrasenia.trim();
    const idRolNum = parseInt(datosUsuario.idRol, 10);

    if (!nombreTrim || !correoTrim || !contraseniaTrim || !confirmarContraseniaTrim || isNaN(idRolNum)) {
        mostrarAlerta('Datos incompletos', 'Por favor, completa todos los campos.', 'warning');
        return false;
    }

    if (contraseniaTrim !== confirmarContraseniaTrim) {
        mostrarAlerta('Las contraseñas no coinciden', 'Por favor, asegúrate de que la contraseña y su confirmación sean iguales.', 'warning');
        return false;
    }

    const campos = [
        { fn: validarNombreCampo, args: [datosUsuario.nombre] },
        { fn: validarCorreoCampo, args: [datosUsuario.correo, listaCorreos] },
        { fn: validarContraseniaCampo, args: [datosUsuario.contrasenia, datosUsuario.confirmarContrasenia] },
        { fn: validarRolCampo, args: [idRolNum] }
    ];

    let verificación = true;
    campos.forEach(({ fn, args }) => {
        const respuesta = fn(...args);
        if (respuesta) {
            mostrarAlerta(respuesta.titulo, respuesta.mensaje, respuesta.tipo);
            verificación = false;
        }
    })

    return verificación;
}

/** 
 * Valida el nombre de usuario.
 * @param {string} nombre
 * @returns {object|null} - Mensaje de error o null si es válido.
 */
function validarNombreCampo(nombre) {
    const nombreTrim = nombre.trim();

    if (nombre.length > 0 && nombre[0] === ' ') {
        return {
            titulo: 'Nombre inválido',
            mensaje: 'El nombre no puede comenzar con un espacio.',
            tipo: 'error'
        };
    }
    if (nombreTrim == '') {
        return {
            titulo: 'Nombre faltante',
            mensaje: 'El nombre no puede estar vacío.',
            tipo: 'error'
        };
    }
    if (nombreTrim.length > tamanioMaximoNombre) {
        return {
            titulo: 'Nombre demasiado largo',
            mensaje: `El nombre no puede tener más de ${tamanioMaximoNombre} caracteres.`,
            tipo: 'error'
        };
    }
    if (!regexNombre.test(nombreTrim)) {
        return {
            titulo: 'Nombre inválido',
            mensaje: 'El nombre solo puede contener letras, espacios y puntos.',
            tipo: 'error'
        };
    } else {
        return null;
    }
}

/**
 * Valida el correo electrónico.
 * @param {string} correo - Correo electrónico a validar.
 * @param {Array<string>|null} listaCorreos - Lista de correos electrónicos ya registrados.
 * @returns {object|null} - Mensaje de error o null si es válido.
 */
function validarCorreoCampo(correo, listaCorreos = null) {
    if (correo.length > 0 && correo[0] === ' ') {
        return {
            titulo: 'Correo inválido',
            mensaje: 'El correo no puede comenzar con un espacio.',
            tipo: 'error'
        };
    }
    const correoTrim = correo.trim();
    if (correoTrim === '') {
        return {
            titulo: 'Correo faltante',
            mensaje: 'El correo no puede estar vacío.',
            tipo: 'error'
        };
    }
    if (correoTrim.length > tamanioMaximoCorreo || correoTrim.length < tamanioMinimoCorreo) {
        return {
            titulo: 'Correo inválido',
            mensaje: `El correo debe tener entre ${tamanioMinimoCorreo} y ${tamanioMaximoCorreo} caracteres.`,
            tipo: 'error'
        };
    }
    if (!validator.isEmail(correoTrim)) {
        return {
            titulo: 'Correo inválido',
            mensaje: 'El correo debe tener un formato válido.',
            tipo: 'error'
        };
    }
    if (listaCorreos && listaCorreos.some(correoExistente => correoExistente && correoExistente.toLowerCase() === correoTrim.toLowerCase())) {
        return {
            titulo: 'Correo ya registrado',
            mensaje: 'El correo ingresado ya existe. Por favor, usa otro correo.',
            tipo: 'error'
        };
    }
    return null;
}

/**
 * Valida la contraseña.
 * @param {string} contrasenia - Contraseña a validar.
 * @param {string|null} confirmarContrasenia - Confirmación de la contraseña (opcional).
 * @returns {object|null} - Mensaje de error o null si es válida.
 */
function validarContraseniaCampo(contrasenia, confirmarContrasenia = null) {
    const contraseniaTrim = contrasenia.trim();
    
    if (contrasenia.length > 0 && contrasenia[0] === ' ') {
        return {
            titulo: 'Contraseña inválida',
            mensaje: 'La contraseña no puede comenzar con un espacio.',
            tipo: 'error'
        };
    }
    if (contraseniaTrim === '') {
        return {
            titulo: 'Contraseña faltante',
            mensaje: 'La contraseña no puede estar vacía.',
            tipo: 'error'
        };
    }
    if (contraseniaTrim.length < tamanioMinimoContrasenia || contraseniaTrim.length > tamanioMaximoContrasenia) {
        return {
            titulo: 'Contraseña inválida',
            mensaje: `La contraseña debe tener entre ${tamanioMinimoContrasenia} y ${tamanioMaximoContrasenia} caracteres.`,
            tipo: 'error'
        };
    }
    if (confirmarContrasenia && confirmarContrasenia !== '') {
        const errorConfirmarContrasenia = validarConfirmarContrasenia(confirmarContrasenia, contrasenia);
        if (errorConfirmarContrasenia) {
            return errorConfirmarContrasenia;
        }
    }
    return null;
}

/**
 * Valida la confirmación de la contraseña.
 * @param {string} confirmarContrasenia - Confirmación de la contraseña a validar.
 * @param {string} contrasenia - Contraseña original para comparar.
 * @returns {object|null} - Mensaje de error o null si es válida.
 */
function validarConfirmarContrasenia(confirmarContrasenia, contrasenia) {
    const confirmarContraseniaTrim = confirmarContrasenia.trim();
    
    if (confirmarContrasenia.length > 0 && confirmarContrasenia[0] === ' ') {
        return {
            titulo: 'Contraseña inválida',
            mensaje: 'La confirmación no puede comenzar con un espacio.',
            tipo: 'error'
        };
    }
    if (confirmarContraseniaTrim === '') {
        return {
            titulo: 'Contraseña faltante',
            mensaje: 'La confirmación no puede estar vacía.',
            tipo: 'error'
        };
    }
    if (contrasenia.trim() !== confirmarContraseniaTrim) {
        return {
            titulo: 'Contraseña no coincide',
            mensaje: 'Las contraseñas no coinciden.',
            tipo: 'error'
        };
    }
    return null;
}

/** 
 * Valida el ID del rol.
 * @param {string} idRol - ID del rol a validar.
 * @returns {object|null} - Mensaje de error o null si es válido.
*/
function validarRolCampo(idRol) {
    const idRolNum = parseInt(idRol, 10);

    if (!Number.isInteger(idRolNum) || idRolNum <= numeroMinimoID) {
        return {
            titulo: 'Rol inválido',
            mensaje: 'Ingresa un rol válido.',
            tipo: 'error'
        };
    } else {
        return null
    }
}

/**
 * Valida y limpia los datos para la edición de un usuario en el front-end.
 *
 * @param {Object} datosUsuario - datos del usuario a validar
 * @param {string} datosUsuario.nombre - Nuevo nombre ingresado por el usuario.
 * @param {string} datosUsuario.correo - Nuevo correo ingresado por el usuario.
 * @param {string} datosUsuario.contrasenia - Nueva contraseña ingresada por el usuario.
 * @param {number|null} datosUsuario.idRol - Nuevo ID de rol ingresado, o null si no se modificó.
 * @param {Object} usuarioAEditar - Datos originales del usuario
 * @param {Array<Object>} roles - Roles disponibles
 * @param {Array<String>} listaCorreos - Lista de correos electrónicos ya registrados.
 * @returns {{ error: Object|null, datos: Object|null }}
 */
function validarModificarUsuario(datosUsuario, usuarioAEditar, roles, listaCorreos) {
    const idRolUsuarioAEditar = roles.find(rol => rol.Nombre === usuarioAEditar.rol)?.idRol
    const cambioNombre = datosUsuario.nombre !== '' && datosUsuario.nombre !== usuarioAEditar.nombre;
    const cambioCorreo = datosUsuario.correo !== '' && datosUsuario.correo !== usuarioAEditar.correo;
    const cambioContrasenia = datosUsuario.contrasenia !== '';
    const cambioConfirmarContrasenia = datosUsuario.confirmarContrasenia !== '';
    const cambioRol = datosUsuario.idRol !== null && datosUsuario.idRol !== idRolUsuarioAEditar

    if (!(cambioNombre || cambioCorreo || cambioContrasenia || cambioRol)) {
        return { error: 'Para modificar un usuario, al menos uno de sus datos (nombre, correo o rol) debe ser diferente al valor actual.', datos: null };
    }

    const datos = { idUsuario: usuarioAEditar.id };

    if (cambioNombre) {
        const error = validarNombreCampo(datosUsuario.nombre);
        if (error) {
            return { error, datos: null };
        }
        datos.nombre = validator.escape(datosUsuario.nombre.trim());
    } else {
        datos.nombre = usuarioAEditar.nombre;
    }

    if (cambioCorreo) {
        const error = validarCorreoCampo(datosUsuario.correo, listaCorreos);
        if (error) {
            return { error, datos: null };
        }
        const correoNormalizado = validator.normalizeEmail(datosUsuario.correo.trim())
        datos.correo = correoNormalizado;
    } else {
        datos.correo = usuarioAEditar.correo;
    }

    if (cambioContrasenia || cambioConfirmarContrasenia) {
        const error = validarContraseniaCampo(datosUsuario.contrasenia, datosUsuario.confirmarContrasenia);
        if (error) {
            return { error, datos: null };
        }
        datos.contrasenia = datosUsuario.contrasenia.trim();
    } else {
        datos.contrasenia = datosUsuario.contrasenia;
    }

    if (cambioRol) {
        const error = validarRolCampo(datosUsuario.idRol);
        if (error) {
            return { error, datos: null };
        }
        datos.idRol = parseInt(datosUsuario.idRol, 10);
    } else {
        datos.idRol = idRolUsuarioAEditar;
    }

    return { error: null, datos };
}

module.exports = {
    validarCrearUsuario,
    validarNombreCampo,
    validarCorreoCampo,
    validarContraseniaCampo,
    validarConfirmarContrasenia,
    validarRolCampo,
    validarModificarUsuario
};