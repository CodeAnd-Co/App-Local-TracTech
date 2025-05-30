// RF68 Modificar fórmula - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF68 

const { modificarFormulaCasoUso } = require(`${rutaBase}src/backend/casosUso/formulas/modificarFormula.js`);
const Swal = require(`${rutaBase}/node_modules/sweetalert2/dist/sweetalert2.all.min.js`);

const { mostrarAlerta} = require(`${rutaBase}/src/framework/vistas/includes/componentes/moleculas/alertaSwal/alertaSwal`);

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
        actualizarCaracteres(nombreInput)
        nombreInput.addEventListener('input', () => {
            actualizarCaracteres(nombreInput);
        });

        formulaInput.setAttribute('maxlength', LONGITUD_MAXIMA_FORMULA)
        actualizarCaracteres(formulaInput)
        formulaInput.addEventListener('input', () => {
            actualizarCaracteres(formulaInput);
        });


        document.getElementById('btnCancelar').addEventListener('click', () => {
            window.cargarModulo('formulas');
        });
        botonGuardar.addEventListener('click', () => {
            const nombre =  document.getElementById('nombreFormula')
            const nombreInput = nombre.value.trim();

            const formula =  document.getElementById('resultado')
            const formulaInput = formula.value.trim();
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

  const contador = areaEscritura.parentElement.querySelector('.contador-caracteres');

  if (!contador) {
    console.warn('No se encontró el elemento con clase .contador-caracteres');
    return;
  }

  const caracteresUsados = areaEscritura.value.length;
  const limite = parseInt(areaEscritura.getAttribute('maxlength'), 10);


  const caracteresRestantes = limite - caracteresUsados;
  contador.textContent = `${caracteresUsados}/${limite} caracteres`;
  contador.style.color = caracteresRestantes < 5 ? '#e74c3c' : '#7f8c8d';
  validador(areaEscritura);
}


function validador(areaEscritura) {
    const mensajeError = areaEscritura.parentElement?.querySelector('.mensajeError');

    const valor = areaEscritura.value;
    const mensaje = validarContenido(valor);

    if (mensaje) {
        areaEscritura.classList.add('inputError');
        mensajeError.textContent = mensaje;
    } else {
        areaEscritura.classList.remove('inputError');
        mensajeError.textContent = '';
    }
}

function validarContenido(texto) {
    // Ejemplo adicional: mínimo 5 caracteres útiles
    if (texto.trim().length == 0) {
        return 'Debe contener al menos 1 caracteres válidos';
    }

    return null;
}


