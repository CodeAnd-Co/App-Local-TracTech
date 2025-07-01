const Chart = require('chart.js/auto');
const { filtrarDatos } = require(`${rutaBase}/src/backend/casosUso/formulas/filtrarDatos.js`);
const { crearGrafica } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/graficas/crearGrafica.js`);
const { actualizarGraficaConColumna } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/graficas/actualizarGraficaConColumna.js`);

/**
 * Crea un menú desplegable para seleccionar columnas.
 * @param {HTMLDivElement} contenedor - Contenedor donde se agregará el menú desplegable.
 * @param {string[]} filtros - Lista de filtros disponibles.
 * @param {number} graficaId - ID de la gráfica asociada.
 * @returns {void}
 */
function crearMenuFiltros(contenedor, filtros, graficaId, contenedorParametros, datosOriginalesFormulas, tractorSeleccionado) {
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
  seleccionValores.addEventListener('change', () => {
    // Si se deselecciona, resetear la gráfica a estado inicial
    const selectorParametro = contenedorParametros.querySelector('select');

    const filtroAplicado = filtros.filter(filtro => {
      return seleccionValores.value == filtro.Nombre;
    });

    const datosFiltrados = filtrarDatos(filtroAplicado, JSON.parse(localStorage.getItem('datosFiltradosExcel')), tractorSeleccionado);
;
    if (datosFiltrados.error) {
      mostrarAlerta(`Columna no encontrada: ${datosFiltrados.columnaNoEncontrada}`, 'Asegúrate de seleccionar todas las columnas necesarias para aplicar este filtro.', 'error');
      if (textoAplicar) textoAplicar.textContent = 'Aplicar Fórmula';
      return;
    }

    if (selectorParametro && selectorParametro.value !== '') {
      actualizarGraficaConColumna(graficaId, selectorParametro.value, datosOriginalesFormulas, tractorSeleccionado, datosFiltrados.resultados);

    } else{

      const graficaDiv = document.getElementById(`previsualizacion-grafica-${graficaId}`);
      if (graficaDiv) {
        const canvas = graficaDiv.querySelector('canvas');
        const contexto = canvas.getContext('2d');
        const graficaExistente = Chart.getChart(contexto);
  
        if (graficaExistente) {
          const tipo = graficaExistente.config.type;
          const titulo = graficaExistente.options.plugins.title.text;
          graficaExistente.destroy();
          const nuevaGrafica = crearGrafica(contexto, tipo);
          nuevaGrafica.options.plugins.title.text = titulo;
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

