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
 * 
 */
function validacionInicial(nombre, correo, contrasenia, confirmContrasenia, idRolFK, listaCorreos) {
    // const mensajesError = document.querySelectorAll('.mensajeError');
    // let hayErroresVisibles = false;

    // mensajesError.forEach(mensaje => {
    //     if (mensaje.textContent.trim() !== '') {
    //         hayErroresVisibles = true;
    //     }
    // });

    // if (hayErroresVisibles) {
    //     mostrarAlerta('Formulario con errores', 'Por favor, corrige los errores señalados en el formulario antes de continuar.', 'warning');
    //     return false;
    // }

    const nombreTrim = nombre.trim();
    const correoTrim = correo.trim();
    const contraseniaTrim = contrasenia.trim();
    const confirmContraseniaTrim = confirmContrasenia.trim();
    const idRolNum = parseInt(idRolFK, 10);

    if (!nombreTrim || !correoTrim || !contraseniaTrim || !confirmContraseniaTrim || isNaN(idRolNum)) {
        mostrarAlerta('Datos incompletos', 'Por favor, completa todos los campos.', 'warning');
        return false;
    }

    if (contraseniaTrim !== confirmContraseniaTrim) {
        mostrarAlerta('Las contraseñas no coinciden', 'Por favor, asegúrate de que la contraseña y su confirmación sean iguales.', 'warning');
        return false;
    }

    const campos = [
        { fn: validarNombreCampo, args: [nombre] },
        { fn: validarCorreoCampo, args: [correo, listaCorreos] },
        { fn: validarContraseniaCampo, args: [contrasenia] },
        { fn: validarRolCampo, args: [idRolNum] }
    ];

    campos.forEach(({ fn, args }) => {
        const respuesta = fn(...args);
        if (respuesta) {
            mostrarAlerta(respuesta.titulo, respuesta.mensaje, respuesta.tipo);
            return false;
        }
    })

    return true;
}

/** 
 * Valida el nombre de usuario.
 * @param {string} nombre
 * @returns {boolean} - Mensaje de error o cadena vacía si es válido.
 */
function validarNombreCampo(nombre) {
    const nombreTrim = nombre.trim();

    if (nombreTrim.length > tamanioMaximoNombre) {
        return {
            titulo: 'Nombre demasiado largo',
            mensaje: `El nombre no puede tener más de ${tamanioMaximoNombre} caracteres.`,
            tipo: 'error'
        };
    } else if (nombre.length > 0 && nombre[0] === ' ') {
        return {
            titulo: 'Nombre inválido',
            mensaje: 'El nombre no puede comenzar con un espacio.',
            tipo: 'error'
        };
    } else if (!regexNombre.test(nombreTrim)) {
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
 * @param {string} correo
 * @returns {object|null}
 */
function validarCorreoCampo(correo, listaCorreos) {
    const correoTrim = correo.trim();

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
    if (correo.length > 0 && correo[0] === ' ') {
        return {
            titulo: 'Correo inválido',
            mensaje: 'El correo no puede comenzar con un espacio.',
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
 * @param {string} contrasenia
 * @param {string} confirmContrasenia
 * @returns {object|null}
 */
function validarContraseniaCampo(contrasenia, confirmContrasenia = '') {
    const contraseniaTrim = contrasenia.trim();

    if (contraseniaTrim.length < tamanioMinimoContrasenia || contraseniaTrim.length > tamanioMaximoContrasenia) {
        return {
            titulo: 'Contraseña inválida',
            mensaje: `La contraseña debe tener entre ${tamanioMinimoContrasenia} y ${tamanioMaximoContrasenia} caracteres.`,
            tipo: 'error'
        };
    }
    if (contrasenia.length > 0 && contrasenia[0] === ' ') {
        return {
            titulo: 'Contraseña inválida',
            mensaje: 'La contraseña no puede comenzar con un espacio.',
            tipo: 'error'
        };
    }
    if (confirmContrasenia.length > 0 && confirmContrasenia[0] === ' ') {
        return {
            titulo: 'Confirmación inválida',
            mensaje: 'La confirmación de contraseña no puede comenzar con un espacio.',
            tipo: 'error'
        };
    }
    return null;
}

/** 
 * Valida el ID del rol.
 * @param {number|string} idRol
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
 * Valida y sanea los datos para la edición de un usuario en el front-end.
 * Reproduce las mismas validaciones que el back-end y devuelve los valores listos para enviar.
 *
 * @param {Object} params - Parámetros de validación.
 * @param {string} params.nombre - Nuevo nombre ingresado por el usuario.
 * @param {string} params.correo - Nuevo correo ingresado por el usuario.
 * @param {string} params.contrasenia - Nueva contraseña ingresada por el usuario.
 * @param {number|null} params.idRol - Nuevo ID de rol ingresado, o null si no se modificó.
 * @returns {{ error: string|null, datos: Object|null }}
 */
function validarYLimpiarUsuario({ nombre, correo, contrasenia, idRol }, usuarioAEditar, roles, listaUsuarios) {
    const idRolUsuarioAEditar = roles.find(rol => rol.Nombre === usuarioAEditar.rol)?.idRol

    // Flags de “campo modificado”
    const cambioNombre = nombre !== '' && nombre !== usuarioAEditar.nombre;
    const cambioCorreo = correo !== '' && correo !== usuarioAEditar.correo;
    const cambioContrasenia = contrasenia !== '';
    const cambioRol = idRol !== null && idRol !== idRolUsuarioAEditar

    // Validar que haya cambiado mínimo un campo
    if (!(cambioNombre || cambioCorreo || cambioContrasenia || cambioRol)) {
        return { error: 'Para modificar un usuario, al menos uno de sus datos (nombre, correo o rol) debe ser diferente al valor actual.', datos: null };
    }

    const datos = { idUsuario: usuarioAEditar.id };

    // Validar nombre
    if (cambioNombre) {
        const error = validarNombreCampo(nombre);
        if (error) {
            return { error, datos: null };
        }
        datos.nombre = validator.escape(nombre.trim());
    } else {
        datos.nombre = usuarioAEditar.nombre;
    }

    // Validar correo
    if (cambioCorreo) {
        const error = validarCorreoCampo(correo);
        if (error) {
            return { error, datos: null };
        }
        const correoNormalizado = validator.normalizeEmail(correo.trim())
        const correoYaExiste = listaUsuarios.some(usuario =>
            usuario.correo === correoNormalizado && usuario.id !== usuarioAEditar.id);
        if (correoYaExiste) {
            return { error: 'No se puede repetir el correo entre usuarios.', datos: null };
        }
        datos.correo = correoNormalizado;
    } else {
        datos.correo = usuarioAEditar.correo;
    }

    // Validar contraseña
    if (cambioContrasenia) {
        const error = validarContraseniaCampo(contrasenia);
        if (error) {
            return { error, datos: null };
        }
        datos.contrasenia = contrasenia.trim();
    } else {
        datos.contrasenia = contrasenia;
    }

    // Validar rol
    if (cambioRol) {
        const error = validarRolCampo(idRol);
        if (error) {
            return { error, datos: null };
        }
        datos.idRol = idRol;
    } else {
        datos.idRol = idRolUsuarioAEditar;
    }

    return { error: null, datos };
}

module.exports = {
    validacionInicial,
    validarNombreCampo,
    validarCorreoCampo,
    validarContraseniaCampo,
    validarRolCampo,
    validarYLimpiarUsuario
};