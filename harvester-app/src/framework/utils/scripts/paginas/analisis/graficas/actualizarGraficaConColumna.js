const Chart = require('chart.js/auto');
const { procesarDatosUniversal } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/graficas/procesarDatosUniversal.js`);
const { mostrarAlerta } = require(`${rutaBase}/src/framework/vistas/includes/componentes/moleculas/alertaSwal/alertaSwal`);

/**
 * Actualiza la gráfica con los datos de una columna específica.
 * @param {number} graficaId - ID de la gráfica a actualizar.
 * @param {string} nombreColumna - Nombre de la columna seleccionada.
 * @returns {void}
 */
function actualizarGraficaConColumna(graficaId, nombreColumna, datosOriginalesFormulas, tractorSeleccionado, datosExcel) {
  // Obtener la gráfica
  const graficaDiv = document.getElementById(`previsualizacion-grafica-${graficaId}`);
  if (!graficaDiv) {
    return;
  }

  const canvas = graficaDiv.querySelector('canvas');
  if (!canvas) {
    return;
  }

  const contexto = canvas.getContext('2d');
  const graficaExistente = Chart.getChart(contexto);

  if (!graficaExistente) {
    return;
  }

  // Obtener la hoja seleccionada del localStorage
  const datos = datosExcel;//localStorage.getItem('datosFiltradosExcel');

  if (!datos) {
    mostrarAlerta('Error', 'No hay datos cargados para mostrar en la gráfica.', 'error');
    return;
  }

  try {
    let datosHoja = null;

    // Parsear los datos del localStorage
    const datosParseados = datos;

    // Determinar qué hoja usar
    if (tractorSeleccionado && tractorSeleccionado.trim() !== '') {
      // Usar la hoja seleccionada específica
      if (datosParseados.hojas && datosParseados.hojas[tractorSeleccionado]) {
        datosHoja = datosParseados.hojas[tractorSeleccionado];
      } else {
        mostrarAlerta('Error', `No se encontró la hoja "${tractorSeleccionado}" en los datos.`, 'error');
        return;
      }
    } else {
      // Fallback: usar la primera hoja disponible o los datos directos
      if (datosParseados.hojas) {
        const nombrePrimeraHoja = Object.keys(datosParseados.hojas)[0];
        datosHoja = datosParseados.hojas[nombrePrimeraHoja];
      } else if (Array.isArray(datosParseados)) {
        datosHoja = datosParseados;
      } else {
        mostrarAlerta('Error', 'No se pudieron cargar los datos de la hoja.', 'error');
        return;
      }
    }

    if (!datosHoja || datosHoja.length === 0) {
      mostrarAlerta('Error', 'La hoja seleccionada no contiene datos.', 'error');
      return;
    }

    // Encontrar el índice de la columna
    const encabezados = datosHoja[0];
    const indiceColumna = encabezados.indexOf(nombreColumna);

    if (indiceColumna === -1) {
      mostrarAlerta('Error', `No se encontró la columna "${nombreColumna}" en la hoja "${tractorSeleccionado || 'seleccionada'}".`, 'error');
      return;
    }

    // Extraer los datos de la columna (omitiendo el encabezado)
    const datosColumna = datosHoja.slice(1).map(fila => fila[indiceColumna]);

    // GUARDAR DATOS ORIGINALES DE LA COLUMNA
    datosOriginalesFormulas.set(graficaId, {
      datos: datosColumna,
      nombre: nombreColumna,
      tipo: 'columna',
      hoja: tractorSeleccionado || 'Hoja por defecto'
    });

    const tipoGraficaActual = graficaExistente.config.type;

    // Usar el procesamiento universal
    const datosRebuild = procesarDatosUniversal(datosColumna, tipoGraficaActual, nombreColumna);

    // Actualizar la gráfica
    const tituloHoja = tractorSeleccionado ? ` (${tractorSeleccionado})` : '';
    graficaExistente.options.plugins.title.text = `Datos de: ${nombreColumna}${tituloHoja}`;
    graficaExistente.data.labels = datosRebuild.labels;
    graficaExistente.data.datasets[0].data = datosRebuild.valores;
    graficaExistente.data.datasets[0].label = nombreColumna;

    graficaExistente.update();

    const tipo = graficaExistente.config.type;
    const etiquetas = graficaExistente.data.labels || [];

    if (
      ['bar', 'pie', 'doughnut', 'polarArea'].includes(tipo)
      && etiquetas.length > 20
    ) {
      mostrarAlerta(
        'AVISO.',
        'La gráfica cuenta con más de 20 etiquetas, por lo que puede afectar su visualización e interpretación.',
        'warning'
      );
    }

  } catch {
    mostrarAlerta('Error', 'Error al procesar los datos de la columna seleccionada.', 'error');
  }
}

module.exports = {
  actualizarGraficaConColumna
};