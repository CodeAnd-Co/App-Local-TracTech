// RF76 usuario consulta formulas - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF76

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
        
        throw new Error(`No se obtuvo ninguna fórmula: ${error.mensaje}`);
    }
}

module.exports = {
    consultaFormulasCasoUso
};



