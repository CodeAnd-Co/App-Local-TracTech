const { eliminarCuadroFormulas} = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/graficas/eliminarCuadroFormulas.js`);

/**
 * Elimina la tarjeta de gráfica, su previsualización y el cuadro de fórmulas si es que existe.
 * 
 * @param {HTMLDivElement} tarjetaGrafica - Tarjeta de gráfica a eliminar.
 * @param {HTMLDivElement} grafica - Contenedor de la gráfica a eliminar.
 */
function eliminarGrafica(tarjetaGrafica, grafica) {
  tarjetaGrafica.remove();
  if (grafica) grafica.remove();
  eliminarCuadroFormulas();
}

module.exports = {
  eliminarGrafica,
};