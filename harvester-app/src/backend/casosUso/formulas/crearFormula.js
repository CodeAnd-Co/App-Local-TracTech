// RF67 Crear Fórmula - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF67 
// RF69 Guardar Fórmula - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF69
// RF72 Usuario selecciona parámetros de fórmula - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF72

const { guardarFormula: guardarFormulaAPI} = require('../../domain/formulasAPI/formulaApi');

/**
 * Guarda una fórmula a través de la API y retorna la respuesta obtenida.
 * @async
 * @function guardarFormula
 * @param {string} nombre - Nombre de la fórmula.
 * @param {string} formula - Contenido de la fórmula.
 * @returns {Promise<Object>} Respuesta del servidor.
 * @throws {Error} Si no se pudo guardar la fórmula.
 */
async function guardarFormula (nombre, formula){
    try{
        const respuesta = await guardarFormulaAPI(nombre, formula, localStorage.getItem('token'));
        return respuesta;
    } catch(error){
        throw new Error(`No se pudo guardar la fórmula: ${error.mensaje}`);
    }
}
module.exports = {
    guardarFormula
};