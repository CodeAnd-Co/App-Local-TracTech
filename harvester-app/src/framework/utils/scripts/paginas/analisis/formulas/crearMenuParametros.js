const { actualizarGraficaConColumna } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/graficas/actualizarGraficaConColumna.js`);
const { crearGrafica } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/graficas/crearGrafica.js`);
const { filtrarDatos } = require(`${rutaBase}/src/backend/casosUso/formulas/filtrarDatos.js`);
const Chart = require('chart.js/auto');

/**
 * Crea un menú desplegable para seleccionar columnas.
 * @param {HTMLDivElement} contenedor - Contenedor donde se agregará el menú desplegable.
 * @param {string[]} columnas - Lista de columnas disponibles.
 * @param {number} graficaId - ID de la gráfica asociada.
 * @returns {void}
 */
function crearMenuParametros(contenedor, columnas, graficaId, datosOriginalesFormulas, tractorSeleccionado, filtrosDisponibles, contenedorFiltros) {
  const nuevoMenu = document.createElement('div');
  nuevoMenu.className = 'opcion';
  const seleccionValores = document.createElement('select');
  seleccionValores.className = 'opcion-texto';
  seleccionValores.innerHTML = '<option value="">-- Selecciona una columna --</option>'
  columnas.forEach((texto) => {
    seleccionValores.innerHTML = `${seleccionValores.innerHTML}
    <option value="${texto}"> ${texto} </option>`
  });

  // Agregar evento de cambio para actualizar la gráfica
  seleccionValores.addEventListener('change', (evento) => {

    const filtroAplicado = filtrosDisponibles.filter(filtro => {
      return contenedorFiltros.querySelector('.opcion-texto').value == filtro.Nombre;
    });

    const datosFiltrados = filtrarDatos(filtroAplicado, JSON.parse(localStorage.getItem('datosFiltradosExcel')), tractorSeleccionado);

    const columnaSeleccionada = evento.target.value;
    if (columnaSeleccionada && columnaSeleccionada !== '') {
      actualizarGraficaConColumna(graficaId, columnaSeleccionada, datosOriginalesFormulas, tractorSeleccionado, datosFiltrados.resultados);
    } else {
      // Si se deselecciona, resetear la gráfica a estado inicial
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
  crearMenuParametros,
}