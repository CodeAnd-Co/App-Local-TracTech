const Chart = require('chart.js/auto');
const { crearGrafica } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/graficas/crearGrafica.js`);

/**
 * Crea un menú desplegable para seleccionar columnas.
 * @param {HTMLDivElement} contenedor - Contenedor donde se agregará el menú desplegable.
 * @param {string[]} filtros - Lista de filtros disponibles.
 * @param {number} graficaId - ID de la gráfica asociada.
 * @returns {void}
 */
function crearMenuFiltros(contenedor, filtros, graficaId) {
  const nuevoMenu = document.createElement('div');
  nuevoMenu.className = 'opcion';
  const seleccionValores = document.createElement('select');
  seleccionValores.className = 'opcion-texto';
  seleccionValores.innerHTML = '<option value="">-- Selecciona un filtro --</option>'
  filtros.forEach((filtro) => {
    seleccionValores.innerHTML = `${seleccionValores.innerHTML}
    <option value="${filtro.Nombre}"> ${filtro.Nombre} </option>`
  });

  // Agregar evento de cambio para actualizar la gráfica
  seleccionValores.addEventListener('change', (evento) => {
    const filtroSeleccionado = evento.target.value;
    // Si se deselecciona, resetear la gráfica a estado inicial
    const graficaDiv = document.getElementById(`previsualizacion-grafica-${graficaId}`);
    if (graficaDiv) {
      const canvas = graficaDiv.querySelector('canvas');
      const contexto = canvas.getContext('2d');
      const graficaExistente = Chart.getChart(contexto);

      if (graficaExistente) {
        graficaExistente.destroy();
        const nuevaGrafica = crearGrafica(contexto, 'line');
        nuevaGrafica.options.plugins.title.text = '';
        nuevaGrafica.update();
      }
    }
  });

  nuevoMenu.appendChild(seleccionValores);
  contenedor.appendChild(nuevoMenu);
}

module.exports = {
  crearMenuFiltros,
}