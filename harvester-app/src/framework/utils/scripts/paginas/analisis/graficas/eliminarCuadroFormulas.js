/**
 * Verifica si existe un cuadro de fórmulas y lo elimina si existe.
 * 
 * @returns {void} True si existía un cuadro de fórmulas, false en caso contrario.
 */
function eliminarCuadroFormulas() {
  const contenedorAnalisis = document.querySelector('.frame-analisis');
  if (!contenedorAnalisis) return false;

  const cuadrosExistentes = Array.from(contenedorAnalisis.children);
  const cuadros = cuadrosExistentes.filter(cuadro => cuadro.className == 'contenedor-formulas');
  if (cuadros.length == 1) {
    cuadros[0].remove()
  }
}

module.exports = {
    eliminarCuadroFormulas,
};