// RF68 Modificar fórmula - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF68 

const { modificarFormulaCasoUso } = require(`${rutaBase}src/backend/casosUso/formulas/modificarFormula.js`);
const Swal = require(`${rutaBase}/node_modules/sweetalert2/dist/sweetalert2.all.min.js`);

/**
 * @function inicializarModificarFormula
 * @param {string} id - ID de la fórmula a modificar.
 * @param {string} nombre - Nombre de la fórmula a modificar.
 * @param {string} formula - Fórmula a modificar.
 */

document.addEventListener('DOMContentLoaded', () => {
    const id = localStorage.getItem('modificarFormulaId');
    const nombre = localStorage.getItem('modificarFormulaNombre');
    const formula = localStorage.getItem('modificarFormulaDatos');

    // Eliminar inmediatamente
    localStorage.removeItem('modificarFormulaId');
    localStorage.removeItem('modificarFormulaNombre');
    localStorage.removeItem('modificarFormulaDatos');

    if (id && nombre && formula) {
        inicializarModificarFormula(id, nombre, formula);
    } else {
        console.warn('Datos incompletos para modificar la fórmula');
    }
});

async function inicializarModificarFormula(id, nombre, formula) {
    localStorage.setItem('secccion-activa', 'modificarFormula');
        const botonGuardar = document.getElementById('btnGuardar');
        const nombreInput = document.getElementById('nombreFormula');
        const formulaInput = document.getElementById('resultado');
        nombreInput.value = nombre;
        formulaInput.value = formula;
        document.getElementById('btnCancelar').addEventListener('click', () => {
            window.cargarModulo('formulas');
        });
        botonGuardar.addEventListener('click', () => {
            const nombreInput = document.getElementById('nombreFormula').value;
            const formulaInput = document.getElementById('resultado').value;
            if (nombreInput === nombre && formulaInput === formula) {
                Swal.fire({
                    title: 'Error',
                    text: 'No se han realizado cambios en la fórmula.',
                    icon: 'error',
                    confirmButtonColor: '#a61930',
                });
                return;
            }
            
            modificarFormulaCasoUso(id, nombreInput, formulaInput, nombre);
        });
    } 

module.exports = {
    inicializarModificarFormula
};