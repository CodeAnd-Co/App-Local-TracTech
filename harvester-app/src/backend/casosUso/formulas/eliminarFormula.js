// RF71 - Eliminar una fórmula - http...

const { eliminarFormula: eliminarFormulaAPI } = require('../../domain/formulasAPI/formulaApi');

/**
 * @async
 * @function eliminarFormula
 * @param {INT} id 
 * @returns {Promise<Object>} Respuesta del servidor.
 * @throws {Error} Si no se pudo eliminar la fórmula.
 */
async function eliminarFormula(id) {
    try {
        const respuesta = await eliminarFormulaAPI(id, localStorage.getItem('token'));
        return respuesta;
    } catch {
        throw new Error('No se pudo eliminar la fórmula');
    }
}

module.exports = {
    eliminarFormula
};