// RF31 - Usuario retira fórmula - https://codeandco-wiki.netlify.app/docs/next/proyectos/tractores/documentacion/requisitos/rf31/

const Chart = require('chart.js/auto');
const { mostrarAlerta } = require(`${rutaBase}/src/framework/vistas/includes/componentes/moleculas/alertaSwal/alertaSwal.js`);

/**
 * Retira la fórmula aplicada de una gráfica y la restaura a su estado inicial.
 * @param {number} graficaId - ID de la gráfica de la cual retirar la fórmula.
 * @param {Map} datosOriginalesFormulas - Mapa con los datos originales de las fórmulas.
 * @returns {void}
 */
function retirarDatos(graficaId, datosOriginalesFormulas) {
  // Obtener la gráfica
  const graficaDiv = document.getElementById(`previsualizacion-grafica-${graficaId}`);
  if (!graficaDiv) {
    mostrarAlerta('Error', 'No se encontró la gráfica especificada.', 'error');
    return;
  }

  const canvas = graficaDiv.querySelector('canvas');
  if (!canvas) {
    mostrarAlerta('Error', 'No se encontró el canvas de la gráfica.', 'error');
    return;
  }

  const contexto = canvas.getContext('2d');
  const graficaExistente = Chart.getChart(contexto);

  if (!graficaExistente) {
    mostrarAlerta('Error', 'No se encontró la instancia de Chart.js.', 'error');
    return;
  }

  try {
    // Verificar si hay datos originales para esta gráfica
    const datosOriginales = datosOriginalesFormulas.get(graficaId);

    if (!datosOriginales) {
      mostrarAlerta('Información', 'Esta gráfica no tiene fórmula aplicada para retirar.', 'info');
      return;
    }

    // Obtener el título actual del input de la tarjeta
    const tarjetaGrafica = document.getElementById(graficaId.toString());
    const tituloInput = tarjetaGrafica ? tarjetaGrafica.querySelector('.titulo-grafica') : null;
    const tituloPersonalizado = tituloInput ? tituloInput.value : '';

    // Restaurar gráfica a estado inicial
    graficaExistente.data.labels = ['Sin datos'];
    graficaExistente.data.datasets[0].data = [0];
    graficaExistente.data.datasets[0].label = 'Datos';

    // Restaurar título: usar el título personalizado del input o el mensaje por defecto
    if (tituloPersonalizado && tituloPersonalizado.trim() !== '') {
      graficaExistente.options.plugins.title.text = tituloPersonalizado;
    } else {
      graficaExistente.options.plugins.title.text = 'Gráfica sin datos - Aplica una fórmula para ver resultados';
    }
  
    try {
      // Verificar si hay datos originales para esta gráfica
      const datosOriginales = datosOriginalesFormulas.get(graficaId);
      
      if (!datosOriginales) {
        mostrarAlerta('Información', 'Esta gráfica no tiene fórmula aplicada para retirar.', 'info');
        return;
      }
  
      // Obtener el título actual del input de la tarjeta
      const tarjetaGrafica = document.getElementById(graficaId.toString());
      const tituloInput = tarjetaGrafica ? tarjetaGrafica.querySelector('.titulo-grafica') : null;
      const tituloPersonalizado = tituloInput ? tituloInput.value : '';
  
      // Restaurar gráfica a estado inicial
      graficaExistente.data.labels = ['Sin datos'];
      graficaExistente.data.datasets[0].data = [0];
      graficaExistente.data.datasets[0].label = 'Datos';
      
      // Restaurar título: usar el título personalizado del input o el mensaje por defecto
      if (tituloPersonalizado && tituloPersonalizado.trim() !== '') {
        graficaExistente.options.plugins.title.text = tituloPersonalizado;
      } else {
        graficaExistente.options.plugins.title.text = 'Gráfica sin datos - Aplica una fórmula para ver resultados';
      }
  
      // Configurar etiquetas: ocultar según el tipo de gráfica
      const tipoActual = graficaExistente.config.type;
      graficaExistente.options.plugins.datalabels.display = tipoActual !== 'line';
      graficaExistente.options.plugins.title.display = true;
  
      // Actualizar la gráfica
      graficaExistente.update();
  
      // Eliminar los datos originales del mapa
      datosOriginalesFormulas.delete(graficaId);
  
      // Restablecer los menús desplegables de parámetros si existen
      const cuadroFormulas = document.querySelector('.contenedor-formulas');
      if (cuadroFormulas) {
        const selectoresParametros = cuadroFormulas.querySelectorAll('.opcion-texto');
        selectoresParametros.forEach(selector => {
          selector.value = '';
        });
      }
  
      mostrarAlerta('Éxito', 'Los datos han sido retirados correctamente de la gráfica.', 'success');
      
    } catch (error) {
      mostrarAlerta('Error', `Error inesperado al retirar la fórmula: ${error.message}`, 'error');
    }

    mostrarAlerta('Éxito', 'Los datos han sido retirados correctamente de la gráfica.', 'success');

  } catch (error) {
    mostrarAlerta('Error', `Error inesperado al retirar la fórmula: ${error.message}`, 'error');
  }
}

module.exports = {
  retirarDatos
};