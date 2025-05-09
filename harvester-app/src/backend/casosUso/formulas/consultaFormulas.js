// RF76 usuario consulta formulas - http..

const { consultarFormulas } = require('../../domain/formulasAPI/formulaApi');

/**
 * @async
 * @function consultaFormulasCasoUso
 * @returns {Promise<Object>} Respuesta del servidor con las fórmulas.
 * @throws {Error} Si no se obtuvo ninguna fórmula.
 */
function consultaFormulasCasoUso() {
    console.log('Consultando fórmulas desde el caso de uso...');
    console.log(localStorage.getItem('token'));
    token = localStorage.getItem('token');
    console.log(consultarFormulas);
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



