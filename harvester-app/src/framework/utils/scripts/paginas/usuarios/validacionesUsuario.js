const validator = require('validator');

const numeroMinimoID = 1;
const tamanioMinimoNombre = 1;
const tamanioMaximoNombre = 45;
const tamanioMinimoCorreo = 5;
const tamanioMaximoCorreo = 50;
const tamanioMinimoContrasenia = 8;
const tamanioMaximoContrasenia = 512;

/**
 * Valida el nombre de usuario.
 * @param {string} nombre
 * @returns {string} - Mensaje de error o cadena vacía si es válido.
 */
function validarNombreCampo(nombre) {
    const valor = nombre.trim();

    if (valor.length < tamanioMinimoNombre || valor.length > tamanioMaximoNombre) {
        return `El nombre debe tener entre ${tamanioMinimoNombre} y ${tamanioMaximoNombre} caracteres.`;
    }
    if (valor === '') {
        return 'El nombre no puede estar compuesto solo por espacios.';
    }
    if (nombre[0] === ' ') {
        return 'El nombre no puede comenzar con un espacio.';
    }
    const regex = /^[A-Za-zÀ-ÖØ-öø-ÿ .][A-Za-zÀ-ÖØ-öø-ÿ. ]*$/;
    if (!regex.test(valor)) {
        return 'El nombre solo puede contener letras, espacios y puntos.';
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
  if (!Number.isInteger(idRol) || idRol < numeroMinimoID) {
    return 'El rol debe ser un número entero mayor o igual a 1.';
  }
  return '';
}

module.exports = {
    validarNombreCampo,
    validarCorreoCampo,
    validarContraseniaCampo,
    validarRolCampo,
};
