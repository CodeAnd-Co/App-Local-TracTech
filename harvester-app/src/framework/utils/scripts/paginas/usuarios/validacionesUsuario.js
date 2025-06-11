const validator = require('validator');
const { mostrarAlerta } = require(`${rutaBase}/src/framework/vistas/includes/componentes/moleculas/alertaSwal/alertaSwal`);

const numeroMinimoID = 1;
const tamanioMinimoNombre = 1;
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
    const nombreTrim = nombre.trim();
    const correoTrim = correo.trim();
    const contraseniaTrim = contrasenia.trim();
    const confirmContraseniaTrim = confirmContrasenia.trim();
    const idRolFKTrim = parseInt(idRolFK, 10);

    const mensajesError = document.querySelectorAll('.mensajeError');
    let hayErroresVisibles = false;

    mensajesError.forEach(mensaje => {
        if (mensaje.textContent.trim() !== '') {
            hayErroresVisibles = true;
        }
    });

    if (hayErroresVisibles) {
        mostrarAlerta('Formulario con errores', 'Por favor, corrige los errores señalados en el formulario antes de continuar.', 'warning');
        return false;
    }

    // Verificar campos obligatorios
    if (!nombreTrim || !correoTrim || !contraseniaTrim || !confirmContraseniaTrim || isNaN(idRolFKTrim)) {
        mostrarAlerta('Datos incompletos', 'Por favor, completa todos los campos.', 'warning');
        return false;
    }

    // Verificar si las contraseñas coinciden (si existe el campo de confirmación)
    if (contraseniaTrim !== confirmContraseniaTrim) {
        mostrarAlerta('Las contraseñas no coinciden', 'Por favor, asegúrate de que la contraseña y su confirmación sean iguales.', 'warning');
        return false;
    }

    if (nombreTrim.length > 45) {
        mostrarAlerta('Nombre demasiado largo', `El nombre no puede tener más de ${tamanioMaximoNombre} caracteres.`, 'error');
        return false;
    } else if (nombre.length > 0 && nombre[0] === ' ') {
        mostrarAlerta('Nombre inválido', 'El nombre no puede comenzar con un espacio.', 'error');
        return false;
    } else if (!regexNombre.test(nombreTrim)) {
        mostrarAlerta('Nombre inválido', 'El nombre solo puede contener letras, espacios y puntos.', 'error');
        return false;
    }

    if (correoTrim.length > tamanioMaximoCorreo || correoTrim.length < tamanioMinimoCorreo) {
        mostrarAlerta('Correo demasiado largo', `El correo debe tener entre ${tamanioMinimoCorreo} y ${tamanioMaximoCorreo} caracteres.`, 'error');
        return false;
    } else if (!validator.isEmail(correoTrim)) {
        mostrarAlerta('Correo inválido', 'El correo debe tener un formato válido.', 'error');
        return false;
    } else if (correo.length > 0 && correo[0] === ' ') {
        mostrarAlerta('Correo inválido', 'El correo no puede comenzar con un espacio.', 'error');
        return false;
    } else if (listaCorreos.some(correoExistente => correoExistente && correoExistente.toLowerCase() === correoTrim.toLowerCase())) {
        mostrarAlerta('Correo ya registrado', 'El correo ingresado ya existe. Por favor, usa otro correo.', 'error');;
        return false;
    }

    if (contraseniaTrim.length < tamanioMinimoContrasenia || contraseniaTrim.length > tamanioMaximoContrasenia) {
        mostrarAlerta('Contraseña demasiado corta', `La contraseña debe tener entre ${tamanioMinimoContrasenia} y ${tamanioMaximoContrasenia} caracteres.`, 'error');
        return false;
    } else if (contrasenia.length > 0 && contrasenia[0] === ' ') {
        mostrarAlerta('Contraseña inválida', 'La contraseña no puede comenzar con un espacio.', 'error');
        return false;
    } else if (confirmContrasenia.length > 0 && confirmContrasenia[0] === ' ') {
        mostrarAlerta('Confirmación inválida', 'La confirmación de contraseña no puede comenzar con un espacio.', 'error');
        return false;
    }

    if (!Number.isInteger(idRolFKTrim) || idRolFKTrim <= numeroMinimoID) {
        mostrarAlerta('Rol inválido', 'Ingresa un rol válido.', 'error');
        return false;
    }

    return true;
}

/** 
 * Valida el nombre de usuario.
 * @param {string} nombre
 * @returns {string} - Mensaje de error o cadena vacía si es válido.
 */
function validarNombreCampo(nombre) {
    const valor = nombre.trim();

    if (valor.length < tamanioMinimoNombre || valor.length > tamanioMaximoNombre) {
        return `El nombre no puede tener más de ${tamanioMaximoContrasenia} caracteres.`;
    }
    if (nombre[0] === ' ') {
        return 'El nombre no puede comenzar con un espacio.';
    }
    if (!regexNombre.test(valor)) {
        return 'El nombre solo puede contener letras, espacios y puntos.';
    }
    if (valor === '') {
        return 'El nombre no puede estar vacío.';
    }
    return '';
}

/**
 * Valida el correo electrónico.
 * @param {string} correo
 * @returns {string}
 */
function validarCorreoCampo(correo) {
    const valor = correo.trim();
    if (valor.length < tamanioMinimoCorreo || valor.length > tamanioMaximoCorreo) {
        return `El correo debe tener entre ${tamanioMinimoCorreo} y ${tamanioMaximoCorreo} caracteres.`;
    }
    if (!validator.isEmail(valor)) {
        return 'El correo debe tener un formato válido.';
    }
    return '';
}

/**
 * Valida la contraseña.
 * @param {string} contrasenia
 * @returns {string}
 */
function validarContraseniaCampo(contrasenia) {
    const valor = contrasenia.trim();
    if (valor.length < tamanioMinimoContrasenia || valor.length > tamanioMaximoContrasenia) {
        return `La contraseña debe tener entre ${tamanioMinimoContrasenia} y ${tamanioMaximoContrasenia} caracteres.`;
    }
    return '';
}

/**
 * Valida el rol seleccionado.
 * @param {string} idRol
 * @returns {string}
 */
function validarRolCampo(idRol) {
    if (!Number.isInteger(idRol) || idRol <= numeroMinimoID) {
        return 'Ingresa un rol válido.';
    }
    return '';
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