// RF76 usuario consulta formulas - http..

const { consultarFormulas } = require('../../domain/formulasAPI/formulaApi');

/**
 * @async
 * @function consultaFormulasCasoUso
 * @returns {Promise<Object>} Respuesta del servidor con las fórmulas.
 * @throws {Error} Si no se obtuvo ninguna fórmula.
 */
function consultaFormulasCasoUso() {
    const token = localStorage.getItem('token');
    try{
        const respuesta = consultarFormulas(token);
        return respuesta;
    } catch(error){
        console.error('Error al consultar las fórmulas:', error);
        throw new Error('No se obtuvo ninguna fórmula');
    }
}

module.exports = {
    consultaFormulasCasoUso
};



