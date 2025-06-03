/**
 * Elimina el cuadro de fórmulas si existe.
 * @returns {void}
 */
function eliminarCuadroFormulas() {
  const cuadroFormulasExistente = document.querySelector('.contenedor-formulas');
  if (cuadroFormulasExistente) {
    cuadroFormulasExistente.remove();
  }
}

module.exports = {
    eliminarCuadroFormulas
};