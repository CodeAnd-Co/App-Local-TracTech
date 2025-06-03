
/**
 * Valida que el nombre de una columna no sea nulo, indefinido o contenga solo comillas
 * @param {any} nombreColumna - Nombre de la columna a validar
 * @returns {boolean} true si la columna es válida, false si no
 */
function validarNombreColumna(nombreColumna) {
    // Verificar si es null o undefined
    if (nombreColumna === null || nombreColumna === undefined) {
        return false;
    }

    // Convertir a string para verificar patrones de comillas
    const nombreStr = String(nombreColumna).trim();

    // Verificar si está vacío después del trim
    if (nombreStr === '' || nombreStr === 'undefined' || nombreStr === 'null') {
        return false;
    }

    // Verificar si contiene solo comillas (simples, dobles, backticks) o combinaciones
    const soloComillas = /^["`']+$/.test(nombreStr);

    return !soloComillas;
}

module.exports = {
    validarNombreColumna
};