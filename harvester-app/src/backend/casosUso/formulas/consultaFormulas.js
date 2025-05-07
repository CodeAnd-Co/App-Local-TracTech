// RF76 usuario consulta formulas - http..

const { consultaFormulas} = require('../../domain/formulasAPI/formulaApi');

/**
 * @async
 * @function consultaFormulasCasoUso
 * @returns {Promise<Object>} Respuesta del servidor con las fórmulas.
 * @throws {Error} Si no se obtuvo ninguna fórmula.
 */
function consultaFormulasCasoUso() {
    try{
        const respuesta = consultaFormulas();
        return respuesta;
    } catch(error){
        console.error('Error al consultar las fórmulas:', error);
        throw new Error('No se obtuvo ninguna fórmula');
    }
}
window.consultaFormulasCasoUso = consultaFormulasCasoUso; // Para que sea accesible desde el frontend
