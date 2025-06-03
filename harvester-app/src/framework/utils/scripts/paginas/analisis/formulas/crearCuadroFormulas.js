const { eliminarCuadroFormulas } = require('./eliminarCuadroFormulas');
const { cargarFormulasIniciales } = require('./cargarFormulasIniciales');
const { mostrarAlerta } = require(`${rutaBase}/src/framework/vistas/includes/componentes/moleculas/alertaSwal/alertaSwal`);
const { filtrarYRenderizarFormulas } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/formulas/filtrarYRenderizarFormulas.js`);
const { aplicarFormula } = require(`${rutaBase}/src/backend/casosUso/formulas/aplicarFormula.js`);
const { actualizarGraficaConColumna } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/graficas/actualizarGraficaConColumna.js`);
const { procesarDatosUniversal } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/graficas/procesarDatosUniversal.js`);
const {obtenerParametrosTractor } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/formulas/obtenerParametrosTractor.js`);
const { retirarDatos } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/graficas/retirarDatos.js`);
const { crearGrafica } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/graficas/crearGrafica.js`);
const Chart = require('chart.js/auto');
const ChartDataLabels = require('chartjs-plugin-datalabels');
Chart.register(ChartDataLabels);


/**
 * Crea un cuadro de fórmulas asociado a una gráfica.
 * @param {string[]} columnas - Lista de columnas disponibles en los datos.
 * @param {number} graficaId - ID de la gráfica asociada.
 * @param {Array} datosGrafica - Datos de la gráfica.
 * @param {Array} formulasDisponibles - Lista de fórmulas disponibles.
 * @returns {void}
 */  
async function crearCuadroFormulas(columnas, graficaId, datosGrafica, formulasDisponibles, datosOriginalesFormulas, tractorSeleccionado) {

  eliminarCuadroFormulas(); // Ahora esta función ya está definida

  // Cargar fórmulas una sola vez al inicio
  await cargarFormulasIniciales(formulasDisponibles);

  const cuadroFormulas = document.createElement('div');
  cuadroFormulas.className = 'contenedor-formulas';
  
  // Almacenar el ID de la gráfica en el dataset
  cuadroFormulas.dataset.graficaId = graficaId;

  // Obtener las columnas de la hoja seleccionada
  const datos = JSON.parse(localStorage.getItem('datosFiltradosExcel'));
  const columnasActualizadas = obtenerParametrosTractor(datos, tractorSeleccionado);

cuadroFormulas.innerHTML = `<div class='titulo-formulas'>
              <img class='flecha-atras' src='${rutaBase}/src/framework/utils/iconos/FlechaAtras.svg' />
              <p class='texto'>Fórmulas</p>
          </div>
          <div class='seccion-formulas'>
              <div class='opciones-seccion'>
                  <p>Parámetros</p>
                  <div class='opciones-carta'>
                  </div>
              </div>
              <div class='opciones-seccion'>
                  <div class='titulo-aplicar-formulas'>
                      <p>Aplicar Fórmula</p>
                  </div>
                  <div class='opciones-carta'>
                      <input class='search-section' placeholder='Encuentra una fórmula' />
                      <div class='contenedor-busqueda'>
                          <div class="mensaje-inicial">Escribe para buscar fórmulas...</div>
                      </div>
                      <div style='display: flex; justify-content: space-between; gap: 1rem;'>
                        <div class='boton-agregar'id = 'btnAplicarFormula'>
                            <div>Aplicar Fórmula</div>
                        </div>
                        <div class='boton-agregar' id='btnRetirarDatos'>
                            <div>Retirar datos</div>
                        </div>
                      </div>
                  </div>
              </div>
          </div>`;

  const contenedoesSeleccion = cuadroFormulas.querySelectorAll('.opciones-carta');

  //ToDo: Escalar en número de variables dependiendo de las variables en las fórmulas
  crearMenuDesplegable(contenedoesSeleccion[0], 'A', columnasActualizadas, graficaId, datosOriginalesFormulas, tractorSeleccionado);

  // Configurar búsqueda de fórmulas
  const campoBusqueda = cuadroFormulas.querySelector('.search-section');
  const contenedorBusqueda = cuadroFormulas.querySelector('.contenedor-busqueda');
  const botonAplicarFormula = cuadroFormulas.querySelector('#btnAplicarFormula');
  const botonRetirarDatos = cuadroFormulas.querySelector('#btnRetirarDatos');

  botonRetirarDatos.addEventListener('click', () => {
    retirarDatos(graficaId, datosOriginalesFormulas);
  })

  botonAplicarFormula.addEventListener('click', () => {
    const formulaSeleccionada = contenedorBusqueda.querySelector('.formula-seleccionada');
    if (!formulaSeleccionada) {
      mostrarAlerta('Error', 'Debes buscar y seleccionar una fórmula antes de aplicar.', 'error');
      return;
    }

    // Verificar que hay datos disponibles
    const datosExcel = localStorage.getItem('datosFiltradosExcel');
    if (!datosExcel) {
      mostrarAlerta('Error', 'No hay datos de Excel cargados. Por favor, carga un archivo Excel primero.', 'error');
      return;
    }

    // Asegurar que window.datosExcelGlobal existe
    if (!window.datosExcelGlobal) {
      try {
        const datosParseados = JSON.parse(datosExcel);
        if (Array.isArray(datosParseados)) {
          window.datosExcelGlobal = {
            hojas: {
              datosParseados
            }
          };
        } else {
          window.datosExcelGlobal = datosParseados;
        }
      } catch (error) {
        mostrarAlerta('Error', `Error al procesar los datos de Excel: ${error}.`, 'error');
        return;
      }
    }

    // Buscar el input radio en el elemento padre (formula-objeto)
    const formulaObjeto = formulaSeleccionada.closest('.formula-objeto');
    const inputRadio = formulaObjeto.querySelector('input[type="radio"]');
    
    if (!inputRadio) {
      mostrarAlerta('Error', 'Error al obtener los datos de la fórmula seleccionada.', 'error');
      return;
    }

    // Obtener los datos directamente de las propiedades del elemento
    const nombreFormula = inputRadio.formulaNombre;
    const datosFormula = inputRadio.formulaDatos;

    // Verificar que los datos están completos
    if (!datosFormula || datosFormula.trim() === '') {
      mostrarAlerta('Error', 'Los datos de la fórmula están vacíos o incompletos.', 'error');
      return;
    }


    // Obtener la gráfica asociada
    const graficaId = cuadroFormulas.dataset.graficaId;
    const graficaDiv = document.getElementById(`previsualizacion-grafica-${graficaId}`);
    
    if (!graficaDiv) {
      mostrarAlerta('Error', 'No se encontró la gráfica asociada.', 'error');
      return;
    }

    try {
      let resultadoFormula;
      if (tractorSeleccionado.length != 0) {
        resultadoFormula = aplicarFormula(nombreFormula, datosFormula, tractorSeleccionado);
      } else {
        resultadoFormula = aplicarFormula(nombreFormula, datosFormula);
      }
      // Aplicar la fórmula a los datos
      if (resultadoFormula.error) {
        mostrarAlerta('Error', `Error al aplicar la fórmula: ${resultadoFormula.error}`, 'error');
        return;
      }

      // GUARDAR DATOS ORIGINALES DE LA FÓRMULA
      if (resultadoFormula.resultados) {
        datosOriginalesFormulas.set(parseInt(graficaId), {
          datos: resultadoFormula.resultados,
          nombre: nombreFormula,
          tipo: 'formula'
        });
      }

      // Obtener el canvas y la gráfica existente
      const canvas = graficaDiv.querySelector('canvas');
      if (!canvas) {
        mostrarAlerta('Error', 'No se encontró el canvas de la gráfica.', 'error');
        return;
      }

      const contexto = canvas.getContext('2d');
      const graficaExistente = Chart.getChart(contexto);
      
      if (graficaExistente && resultadoFormula.resultados) {
        const resultados = resultadoFormula.resultados;
        const tipoGrafica = graficaExistente.config.type;
        
        // Usar el procesamiento universal
        const datosRebuild = procesarDatosUniversal(resultados, tipoGrafica, nombreFormula);
        
        // Actualizar la gráfica
        graficaExistente.options.plugins.title.text = nombreFormula; 
        graficaExistente.data.labels = datosRebuild.labels;
        graficaExistente.data.datasets[0].data = datosRebuild.valores;
        
        // CORRECCIÓN: Actualizar también la etiqueta del dataset
        graficaExistente.data.datasets[0].label = nombreFormula;

        // Configurar etiquetas: ocultar SOLO en gráficas de línea
        graficaExistente.options.plugins.datalabels.display = tipoGrafica !== 'line';

        graficaExistente.update();
        
        mostrarAlerta('Éxito', `Fórmula "${nombreFormula}" aplicada correctamente a la gráfica.`, 'success');
        
        // Cerrar el cuadro de fórmulas
        cuadroFormulas.remove();
        
      } else {
        mostrarAlerta('Error', 'No se pudo encontrar la gráfica para actualizar o no hay resultados válidos.', 'error');
      }
      
    } catch (error) {
      mostrarAlerta('Error', `Error inesperado al aplicar la fórmula: ${error.message}`, 'error');
    }
  });

  // Configurar evento de búsqueda (filtrado local)
  campoBusqueda.addEventListener('input', (evento) => {
    const terminoBusqueda = evento.target.value.trim();
    filtrarYRenderizarFormulas(contenedorBusqueda, terminoBusqueda, formulasDisponibles);
  });



  const botonCerrarCuadroFormulas = cuadroFormulas.querySelector('.titulo-formulas');
  botonCerrarCuadroFormulas.addEventListener('click', () => {
    cuadroFormulas.remove();
  });

  const seccionReporte = document.querySelector('.seccion-elemento-reporte');
  if (seccionReporte) {
    seccionReporte.insertAdjacentElement('afterend', cuadroFormulas);
  } else {
    document.querySelector('.frame-analisis').appendChild(cuadroFormulas);
  }
  return datosOriginalesFormulas;
}




/**
 * Crea un menú desplegable para seleccionar columnas.
 * @param {HTMLDivElement} contenedor - Contenedor donde se agregará el menú desplegable.
 * @param {string} letra - Letra identificadora del menú.
 * @param {string[]} columnas - Lista de columnas disponibles.
 * @param {number} graficaId - ID de la gráfica asociada.
 * @returns {void}
 */
function crearMenuDesplegable(contenedor, letra, columnas, graficaId, datosOriginalesFormulas, tractorSeleccionado) {
  const nuevoMenu = document.createElement('div');
  nuevoMenu.className = 'opcion';
  const seleccionValores = document.createElement('select');
  seleccionValores.className = 'opcion-texto';
  seleccionValores.innerHTML = '<option value="">-- Selecciona Columna --</option>'
  columnas.forEach((texto) => {
    seleccionValores.innerHTML = `${seleccionValores.innerHTML}
    <option value="${texto}"> ${texto} </option>`
  });

  // Agregar evento de cambio para actualizar la gráfica
  seleccionValores.addEventListener('change', (evento) => {
    const columnaSeleccionada = evento.target.value;
    if (columnaSeleccionada && columnaSeleccionada !== '') {
      actualizarGraficaConColumna(graficaId, columnaSeleccionada, datosOriginalesFormulas, tractorSeleccionado);
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
  crearCuadroFormulas
};