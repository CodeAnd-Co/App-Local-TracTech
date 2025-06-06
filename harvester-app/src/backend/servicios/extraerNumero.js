/**
 * Extrae el número de un string para limpiar datos. 
 * @param {string} valor - Valor del cual se extraerá el número
 * @returns {float} - Número extraído del string o null si no es válido
 */

function extraerNumero(valor) {
    if (typeof valor === 'number') return valor;
    if (typeof valor === 'string') {
        // Busca el primer número en el string (incluye decimales y signo)
        const match = valor.match(/-?\d+(\.\d+)?/);
        if (match) {
            return parseFloat(match[0]);
        }
    }
    return null; // Si no es número ni string válido
}

module.exports = {
    extraerNumero,
};