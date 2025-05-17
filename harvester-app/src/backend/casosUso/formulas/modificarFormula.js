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

function inicializarModificarFormula(id, nombre, formula) {
    const nombreInput = document.getElementById(`nombreFormula-${id}`);
    const formulaInput = document.getElementById(`formula-${id}`);
    const botonModificar = document.getElementById(`botonModificar-${id}`);

    nombreInput.value = nombre;
    formulaInput.value = formula;

    botonModificar.addEventListener('click', async () => {
        try {
            const respuesta = await modificarFormulaCasoUso(id, nombreInput.value, formulaInput.value);
            if (respuesta.ok) {
                Swal.fire({
                    title: 'Fórmula modificada',
                    text: 'La fórmula ha sido modificada exitosamente.',
                    icon: 'success'
                });
            } else {
                Swal.fire({
                    title: 'Error de conexión',
                    text: respuesta.mensaje,
                    icon: 'error'
                });
            }
        } catch (error) {
            console.error('Error al modificar la fórmula:', error);
            Swal.fire({
                title: 'Error de conexión',
                text: 'Verifica tu conexión e inténtalo de nuevo.',
                icon: 'error'
            });
        }
    });

}

module.exports = {
    inicializarModificarFormula
};