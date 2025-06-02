// RF68 Modificar fórmula - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF68 

const { modificarFormulaCasoUso } = require(`${rutaBase}src/backend/casosUso/formulas/modificarFormula.js`);
const { mostrarAlerta } = require(`${rutaBase}/src/framework/vistas/includes/componentes/moleculas/alertaSwal/alertaSwal`);
const { LONGITUD_MAXIMA_NOMBRE_FORMULA,
  LONGITUD_MAXIMA_FORMULA } = require(`${rutaBase}src/framework/utils/scripts/constantes.js`);

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
    return ('Datos incompletos para modificar la fórmula');
  }
});

/**
 * Inicializa el formulario para modificar una fórmula.
 *
 * @param {string} id - ID de la fórmula.
 * @param {string} nombre - Nombre actual de la fórmula.
 * @param {string} formula - Contenido actual de la fórmula.
 * @returns {Promise<void>}
 */
async function inicializarModificarFormula(id, nombre, formula) {
  localStorage.setItem('seccion-activa', 'modificarFormula');

  const botonGuardar = document.getElementById('btnGuardar');
  const nombreInput = document.getElementById('nombreFormula');
  const formulaInput = document.getElementById('resultado');

  // Asigna valores iniciales
  nombreInput.value = nombre;
  formulaInput.value = formula;

  // Configura contadores y validadores
  nombreInput.setAttribute('maxlength', LONGITUD_MAXIMA_NOMBRE_FORMULA);
  actualizarCaracteres(nombreInput);
  nombreInput.addEventListener('input', () => actualizarCaracteres(nombreInput));

  formulaInput.setAttribute('maxlength', LONGITUD_MAXIMA_FORMULA);
  actualizarCaracteres(formulaInput);
  formulaInput.addEventListener('input', () => actualizarCaracteres(formulaInput));

  // Botón cancelar
  document.getElementById('btnCancelar').addEventListener('click', () => {
    window.cargarModulo('formulas');
  });

  // Botón guardar
  botonGuardar.addEventListener('click', () => {
    const nombreValor = document.getElementById('nombreFormula').value.trim();
    const formulaValor = document.getElementById('resultado').value.trim();

    if (nombreValor === nombre && formulaValor === formula) {
      mostrarAlerta('Error', 'No se han realizado cambios en la fórmula.', 'error');
      return;
    }

    modificarFormulaCasoUso(id, nombreValor, formulaValor, nombre);
  });
}

/**
 * Actualiza el contador de caracteres restantes.
 *
 * @param {HTMLTextAreaElement} areaEscritura - Área de texto a validar.
 * @returns {void}
 */
function actualizarCaracteres(areaEscritura) {
  const contador = areaEscritura.parentElement?.querySelector('.contador-caracteres');

  if (!contador) {
    console.warn('No se encontró el elemento con clase .contador-caracteres');
    return;
  }

  const caracteresUsados = areaEscritura.value.length;
  const limite = parseInt(areaEscritura.getAttribute('maxlength'), 10);

  const caracteresRestantes = limite - caracteresUsados;
  contador.textContent = `${caracteresUsados}/${limite} caracteres`;
  contador.style.color = caracteresRestantes < 5 ? '#e74c3c' : '#7f8c8d';

  validador(areaEscritura)
}

/**
 * Valida el contenido del área de texto.
 *
 * @param {HTMLTextAreaElement} areaEscritura - Área a validar.
 * @returns {void}
 */
function validador(areaEscritura) {
  const mensajeError = areaEscritura.parentElement?.querySelector('.mensajeError');
  const valor = areaEscritura.value;
  const mensaje = validarContenido(valor);

  if (mensaje) {
      mensajeError.style.color = '#e74c3c';
    mensajeError.textContent = mensaje;
  } else {
    mensajeError.style.color = '#7f8c8d';
    mensajeError.textContent = '';
  }
}

/**
 * Lógica personalizada de validación.
 *
 * @param {string} texto - Texto ingresado.
 * @returns {string|null} - Mensaje de error o null si es válido.
 */
function validarContenido(texto) {
  if (texto.trim().length === 0) {
    return 'Debe contener al menos 1 carácter válido';
  }
  return null;
}

module.exports = {
  inicializarModificarFormula,
};
