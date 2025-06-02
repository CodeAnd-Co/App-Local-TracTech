
/**
 * Modifica el título de la gráfica según la entrada del usuario.
 * 
 * @param {HTMLDivElement} grafica - Contenedor de la gráfica a modificar.
 * @param {HTMLInputElement} entradaTexto - Campo de texto donde el usuario ingresa el nuevo título.
 * @param {HTMLDivElement} tarjetaGrafica - Tarjeta de gráfica donde se encuentra el campo de texto.
 */
function modificarTitulo(grafica, entradaTexto, tarjetaGrafica) {
  const caracteresUsados = entradaTexto.value.length;
  const limite = parseInt(entradaTexto.getAttribute('maxlength'), 10);
  const caracteresRestantes = limite - caracteresUsados;
  
  const contadorCaracteres = tarjetaGrafica.querySelector('.contador-caracteres');

  contadorCaracteres.textContent = `${caracteresUsados}/${limite} caracteres`;
  
  if (caracteresRestantes < 10) {
    contadorCaracteres.style.color = '#e74c3c';
  } else {
    contadorCaracteres.style.color = '#7f8c8d';
  }

  if (grafica) {
    const contexto = grafica.querySelector('canvas').getContext('2d');
    const graficaChartjs = Chart.getChart(contexto);
    if (graficaChartjs) {
      graficaChartjs.options.plugins.title.text = entradaTexto.value;
      graficaChartjs.update();
    }
  }
}

module.exports = {
  modificarTitulo,
};