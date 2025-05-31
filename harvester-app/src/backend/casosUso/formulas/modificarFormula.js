// RF68 Modificar fórmula - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF68 
const { modificarFormula } = require(`${rutaBase}src/backend/domain/formulasAPI/formulaAPI.js`);

const { LONGITUD_MAXIMA_NOMBRE_FORMULA,
    LONGITUD_MAXIMA_FORMULA} = require(`${rutaBase}src/framework/utils/scripts/constantes.js`);
const { mostrarAlerta } = require(`${rutaBase}/src/framework/vistas/includes/componentes/moleculas/alertaSwal/alertaSwal`);

/**
 * @async
 * @function modificarFormulaCasoUso
 * @param {string} id - ID de la fórmula a modificar.
 * @param {string} nombre - Nuevo nombre de la fórmula.
 * @param {string} formula - Nueva fórmula.
 * @param {string} nombreOriginal - Nombre original de la fórmula.
 * @returns {Promise<Object>} Respuesta del servidor con la fórmula modificada.
 * @throws {Error} Si no se pudo modificar la fórmula.
 */
async function modificarFormulaCasoUso(id, nombre, formula, nombreOriginal) {
    if (!id || !nombre || !formula || id === '' || nombre === '' || formula === '') {
        mostrarAlerta('Error', 'Por favor, completa todos los campos.', 'error');
        return;
    }
    if (nombre === '' || nombre.length >= LONGITUD_MAXIMA_NOMBRE_FORMULA) {
        mostrarAlerta('Error', `Verifica que la fórmula tenga un nombre válido y menor de ${LONGITUD_MAXIMA_NOMBRE_FORMULA} caracteres.`, 'error');
        return;
    }
    if (formula.length >= LONGITUD_MAXIMA_FORMULA) {
        mostrarAlerta('Error', `La fórmula excede los ${LONGITUD_MAXIMA_FORMULA} caracteres, no puede ser guardada.`, 'error');
        return;
    }
    
    
    let formulasGuardadas = localStorage.getItem('nombresFormulas');
    formulasGuardadas = JSON.parse(formulasGuardadas);
    if (formulasGuardadas && formulasGuardadas.includes(nombre) && nombre !== nombreOriginal) {
        mostrarAlerta('Error', 'Ya existe una fórmula con ese nombre.', 'error');
        return
        
    }
    
    const token = localStorage.getItem('token');
    try {
        const respuesta = await modificarFormula(id, nombre, formula, token);
        if (respuesta.ok) {
            mostrarAlerta('Fórmula modificada', 'La fórmula ha sido modificada exitosamente.', 'success');
            window.cargarModulo('formulas');
        } else {
            mostrarAlerta('Error de conexión', respuesta.mensaje, 'error');
            return;
        }
    } catch (error) {
        mostrarAlerta('Error', `No se pudo modificar la fórmula. Inténtalo de nuevo más tarde: ${error}`, 'error');
        return;
    }
}

module.exports = {
    modificarFormulaCasoUso
}