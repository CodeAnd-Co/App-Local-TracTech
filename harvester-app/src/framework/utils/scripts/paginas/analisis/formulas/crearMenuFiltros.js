const { actualizarGraficaConColumna } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/graficas/actualizarGraficaConColumna.js`);

/**
 * Crea un menú desplegable para seleccionar columnas.
 * @param {HTMLDivElement} contenedor - Contenedor donde se agregará el menú desplegable.
 * @param {string[]} filtros - Lista de filtros disponibles.
 * @param {number} graficaId - ID de la gráfica asociada.
 * @returns {void}
 */
function crearMenuFiltros(contenedor, filtros, graficaId, datosOriginalesFormulas, tractorSeleccionado) {
  const nuevoMenu = document.createElement('div');
  nuevoMenu.className = 'opcion';
  const seleccionValores = document.createElement('select');
  seleccionValores.className = 'opcion-texto';
  seleccionValores.innerHTML = '<option value="">-- Selecciona un filtro --</option>'
  filtros.forEach((texto) => {
    seleccionValores.innerHTML = `${seleccionValores.innerHTML}
    <option value="${texto}"> ${texto} </option>`
  });

  // Agregar evento de cambio para actualizar la gráfica
  seleccionValores.addEventListener('change', (evento) => {
    const filtroSeleccionado = evento.target.value;
    if (filtroSeleccionado && filtroSeleccionado !== '') {
      actualizarGraficaConColumna(graficaId, filtroSeleccionado, datosOriginalesFormulas, tractorSeleccionado);
    } else {
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
    }
  });

  nuevoMenu.appendChild(seleccionValores);
  contenedor.appendChild(nuevoMenu);
}

module.exports = {
  crearMenuFiltros,
}