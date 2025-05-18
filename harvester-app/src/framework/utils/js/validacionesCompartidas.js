const validator = require('validator');

const numeroMinimoID = 1;
const tamanioMinimoNombre = 1;
const tamanioMaximoNombre = 50;
const tamanioMinimoContrasenia = 8;
const tamanioMaximoContrasenia = 50;

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
    const regex = /^[A-Za-zÀ-ÖØ-öø-ÿ\. ]+$/;
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
