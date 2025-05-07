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
        const respuesta = await eliminarFormulaAPI(id);
        return respuesta;
    } catch (error) {
        console.error('Error al eliminar la fórmula:', error);
        throw new Error('No se pudo eliminar la fórmula');
    }
}
window.eliminarFormula = eliminarFormula; // Para que sea accesible desde el frontend
