// RF68 Modificar fórmula - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF68 
const { modificarFormula } = require('../../domain/formulasAPI/formulaApi');
const { LONGITUD_MAXIMA_NOMBRE_FORMULA,
    LONGITUD_MAXIMA_FORMULA} = require('../../../framework/utils/js/constantes');
const Swal = require('sweetalert2');

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
function modificarFormulaCasoUso(id, nombre, formula, nombreOriginal) {
    if (!id || !nombre || !formula || id === '' || nombre === '' || formula === '') {
        Swal.fire({
            title: 'Error',
            text: 'Por favor, completa todos los campos.',
            icon: 'error',
            confirmButtonColor: '#1F4281',
        });
        return;
    }
    if (nombre === '' || nombre.length >= LONGITUD_MAXIMA_NOMBRE_FORMULA) {
        Swal.fire({
            title: 'Error',
            text: `Verifica que la formula tenga un nombre válido y menor de ${LONGITUD_MAXIMA_NOMBRE_FORMULA} caracteres.`,
            icon: 'error',
            confirmButtonColor: '#1F4281',
        });
        return;
    }
    if (formula.length >= LONGITUD_MAXIMA_FORMULA) {
        Swal.fire({
            title: 'Error',
            text: `La fórmula excede los ${LONGITUD_MAXIMA_FORMULA} caracteres, no puede ser guardada.`,
            icon: 'error',
            confirmButtonColor: '#1F4281',
        });
        return;
    }
    
    // When passing nombre and formula to the function, pass the original name too
    // This allows us to check if the name is being changed or not
    
    let formulasGuardadas = localStorage.getItem('nombresFormulas');
    formulasGuardadas = JSON.parse(formulasGuardadas);
    if (formulasGuardadas && formulasGuardadas.includes(nombre) && nombre !== nombreOriginal) {
        Swal.fire({
            title: 'Error',
            text: 'Ya existe una fórmula con ese nombre.',
            icon: 'error',
            confirmButtonColor: '#1F4281',
        });
        return
        
    }
    
    const token = localStorage.getItem('token');
    try {
        const respuesta = modificarFormula(id, nombre, formula, token);
        if (respuesta.ok) {
            Swal.fire({
                title: 'Fórmula modificada',
                text: 'La fórmula ha sido modificada exitosamente.',
                icon: 'success',
                confirmButtonColor: '#1F4281',
            });
            window.cargarModulo('formulas');
        } else {
            Swal.fire({
                title: 'Error de conexión',
                text: respuesta.mensaje,
                icon: 'error',
                confirmButtonColor: '#1F4281',
            });
            return;
        }
    } catch (error) {
        Swal.fire({
            title: 'Error',
            text: 'No se pudo modificar la fórmula. Inténtalo de nuevo más tarde.',
            icon: 'error',
            confirmButtonColor: '#1F4281',
        });
        return;
    }
}

function inicializarModificarFormula(id, nombre, formula) {
    localStorage.setItem('secccion-activa', 'modificarFormula');
    const ventanaPrincipal = document.querySelector('.ventana-principal');
    if (ventanaPrincipal){
        fetch('../vistas/modificarFormula.html')
            .then(res => res.text())
            .then(html => {
                ventanaPrincipal.innerHTML = html;
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
                            confirmButtonColor: '#1F4281',
                        });
                        return;
                    }
                    
                    modificarFormulaCasoUso(id, nombreInput, formulaInput, nombre);
                });
            });
    }
    

   
}

module.exports = {
    inicializarModificarFormula
};