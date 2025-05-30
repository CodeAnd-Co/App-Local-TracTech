// RF68 Modificar fórmula - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF68 

const { modificarFormulaCasoUso } = require(`${rutaBase}src/backend/casosUso/formulas/modificarFormula.js`);
const Swal = require(`${rutaBase}/node_modules/sweetalert2/dist/sweetalert2.all.min.js`);
const { LONGITUD_MAXIMA_NOMBRE_FORMULA,
    LONGITUD_MAXIMA_FORMULA} = require(`${rutaBase}src/framework/utils/scripts/constantes.js`);

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

        nombreInput.setAttribute('maxlength', LONGITUD_MAXIMA_NOMBRE_FORMULA)
        nombreInput.addEventListener('input', () => {
            actualizarCaracteres(nombreInput);
        });

        formulaInput.setAttribute('maxlength', LONGITUD_MAXIMA_FORMULA)
        formulaInput.addEventListener('input', () => {
            actualizarCaracteres(formulaInput);
        });


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
    } 

module.exports = {
    inicializarModificarFormula
};

/**
 * Actualiza el contador de caracteres restantes en la tarjeta del {@link areaEscritura}.
 *
 * @param {HTMLTextAreaElement} areaEscritura - Área de texto con el contenido a mostrar.
 * @returns {void}
 */
function actualizarCaracteres(areaEscritura) {
  const caracteresUsados = areaEscritura.value.length;
  const limite = parseInt(areaEscritura.getAttribute('maxlength'), 10);

  const selector = `[maxlength_placeholder='${areaEscritura.getAttribute('maxlength')}']`;
  const elementosContador = document.querySelectorAll(selector);

  if (elementosContador.length === 0) {
    const nuevoContador = document.createElement('div');
    nuevoContador.className = 'contador-caracteres';
    nuevoContador.setAttribute('maxlength_placeholder', areaEscritura.getAttribute('maxlength'));
    actualizarContador(nuevoContador, caracteresUsados, limite);
    areaEscritura.after(nuevoContador);
    return;
  }

  elementosContador.forEach((elemento) => {
    actualizarContador(elemento, caracteresUsados, limite);
  });
}

/**
 * Actualiza el contenido y color del contador de caracteres.
 *
 * @param {HTMLElement} elemento - Elemento del DOM que muestra el contador.
 * @param {number} caracteresUsados - Cantidad de caracteres utilizados.
 * @param {number} limite - Límite total de caracteres permitido.
 * @returns {void}
 */
function actualizarContador(elemento, caracteresUsados, limite) {
  const caracteresRestantes = limite - caracteresUsados;
  elemento.textContent = `${caracteresUsados}/${limite} caracteres`;
  elemento.style.color = caracteresRestantes < 5 ? '#e74c3c' : '#7f8c8d';
}