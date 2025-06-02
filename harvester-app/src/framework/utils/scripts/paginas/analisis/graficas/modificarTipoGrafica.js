const Chart = require('chart.js/auto');
const { crearGrafica } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/graficas/crearGrafica.js`);

/**
 * Modifica el tipo de gráfica según la selección del usuario.
 * 
 * @param {HTMLDivElement} grafica - Contenedor de la gráfica a modificar.
 * @param {HTMLSelectElement} selectorTipo - Selector de tipo de gráfica.
 * @param {string} tituloGrafica - Título de la gráfica.
 */
function modificarTipoGrafica(grafica, selectorTipo, tituloGrafica) {
  if (grafica) {
    const contexto = grafica.querySelector('canvas').getContext('2d');
    const graficaOriginal = Chart.getChart(contexto);
    if (graficaOriginal) {
      graficaOriginal.destroy();
      const nuevaGrafica = crearGrafica(contexto, selectorTipo.value);
      nuevaGrafica.options.plugins.title.text = tituloGrafica;
      nuevaGrafica.update();
    }
  }
}
module.exports = { modificarTipoGrafica };