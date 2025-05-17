// RF68 Modificar fórmula - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF68 

const { modificarFormula } = require('../../domain/formulasAPI/formulaApi');

/**
 * @async
 * @function modificarFormulaCasoUso
 * @param {string} id - ID de la fórmula a modificar.
 * @param {string} nombre - Nuevo nombre de la fórmula.
 * @param {string} formula - Nueva fórmula.
 * @returns {Promise<Object>} Respuesta del servidor con la fórmula modificada.
 * @throws {Error} Si no se pudo modificar la fórmula.
 */
function modificarFormulaCasoUso(id, nombre, formula) {
    const token = localStorage.getItem('token');
    try {
        const respuesta = modificarFormula(id, nombre, formula, token);
        return respuesta;
    } catch (error) {
        console.error('Error al modificar la fórmula:', error);
        throw new Error('No se pudo modificar la fórmula');
    }
}

module.exports = {
    modificarFormulaCasoUso
};