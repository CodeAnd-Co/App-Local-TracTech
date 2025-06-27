const { eliminarCuadroFormulas } = require('./eliminarCuadroFormulas');
const { mostrarAlerta } = require(`${rutaBase}/src/framework/vistas/includes/componentes/moleculas/alertaSwal/alertaSwal`);
const { filtrarYRenderizarFormulas, actualizarCaracteresBuscador } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/formulas/filtrarYRenderizarFormulas.js`);
const { aplicarFormula } = require(`${rutaBase}/src/backend/casosUso/formulas/aplicarFormula.js`);
const { filtrarDatos } = require(`${rutaBase}/src/backend/casosUso/formulas/filtrarDatos.js`);
const { procesarDatosUniversal } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/graficas/procesarDatosUniversal.js`);
const { obtenerParametrosTractor } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/formulas/obtenerParametrosTractor.js`);
const { retirarDatos } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/graficas/retirarDatos.js`);
const { crearMenuParametros } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/formulas/crearMenuParametros.js`);
const { crearMenuFiltros } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/formulas/crearMenuFiltros.js`);
const Chart = require('chart.js/auto');

/**
 * Crea un cuadro de fórmulas asociado a una gráfica.
 * @param {string[]} columnas - Lista de columnas disponibles en los datos.
 * @param {number} graficaId - ID de la gráfica asociada.
 * @param {Array} datosGrafica - Datos de la gráfica.
 * @param {Array} formulasDisponibles - Lista de fórmulas disponibles.
 * @returns {void}
 */
async function crearCuadroFormulas(graficaId, formulasDisponibles, datosOriginalesFormulas, tractorSeleccionado) {

  eliminarCuadroFormulas();

  const cuadroFormulas = document.createElement('div');
  cuadroFormulas.className = 'contenedor-formulas';

  // Almacenar el ID de la gráfica en el dataset
  cuadroFormulas.dataset.graficaId = graficaId;

  // Obtener las columnas de la hoja seleccionada
  const datos = JSON.parse(localStorage.getItem('datosFiltradosExcel'));
  const columnasActualizadas = obtenerParametrosTractor(datos, tractorSeleccionado);
  let mensajeInicial = '';
  if (formulasDisponibles.length === 0) {
    mensajeInicial = 'No hay fórmulas disponibles.';
  }

  const filtrosDisponibles = formulasDisponibles.filter(formula => {
    return formula.Datos.toLowerCase().includes('filter');
  });


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
                  <p>Filtros</p>
                    <div class='opciones-carta'>
                  </div>
              </div>
              <div class='opciones-seccion'>
                  <div class='titulo-aplicar-formulas'>
                      <p>Aplicar Fórmula</p>
                  </div>
                  <div class='opciones-carta'>
                      <input class='search-section' placeholder='Encuentra una fórmula'  maxlength='50'/>
                      <div class='contenedor-busqueda'>
                          ${mensajeInicial ? `<div class="mensaje-inicial">${mensajeInicial}</div>` : ''}
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

  const contenedoresSeleccion = cuadroFormulas.querySelectorAll('.opciones-carta');

  //ToDo: Escalar en número de variables dependiendo de las variables en las fórmulas
 crearMenuParametros(contenedoresSeleccion[0], columnasActualizadas, graficaId, datosOriginalesFormulas, tractorSeleccionado, filtrosDisponibles, contenedoresSeleccion[1]);
 crearMenuFiltros(contenedoresSeleccion[1], filtrosDisponibles, graficaId);

  // Configurar búsqueda de fórmulas
  const campoBusqueda = cuadroFormulas.querySelector('.search-section');
  const contenedorBusqueda = cuadroFormulas.querySelector('.contenedor-busqueda');
  const botonAplicarFormula = cuadroFormulas.querySelector('#btnAplicarFormula');
  const botonRetirarDatos = cuadroFormulas.querySelector('#btnRetirarDatos');

  // Mostrar todas las fórmulas al cargar inicialmente
  if (formulasDisponibles.length > 0) {
    filtrarYRenderizarFormulas(contenedorBusqueda, '', formulasDisponibles);
  }

  botonRetirarDatos.addEventListener('click', () => {
    retirarDatos(graficaId, datosOriginalesFormulas);
  })

  botonAplicarFormula.addEventListener('click', () => {



    const filtroAplicado = filtrosDisponibles.filter(filtro => {
      return contenedoresSeleccion[1].querySelector('.opcion-texto').value == filtro.Nombre;
    });

    const textoAplicar = botonAplicarFormula.querySelector('div');
    if (textoAplicar) {
      textoAplicar.textContent = 'Aplicando...';
      setTimeout(() => {

        const formulaSeleccionada = contenedorBusqueda.querySelector('.formula-seleccionada');
        if (!formulaSeleccionada) {
          mostrarAlerta('Error', 'Debes buscar y seleccionar una fórmula antes de aplicar.', 'error');
          return;
        }

        const datosFiltrados = filtrarDatos(filtroAplicado, JSON.parse(localStorage.getItem('datosFiltradosExcel')), tractorSeleccionado);
        
        if (!datosFiltrados) {
          mostrarAlerta('Error', 'No hay datos de Excel cargados. Por favor, carga un archivo Excel primero.', 'error');
          return;
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
            resultadoFormula = aplicarFormula(nombreFormula, datosFormula, tractorSeleccionado, datosFiltrados.resultados);
          } else {
            resultadoFormula = aplicarFormula(nombreFormula, datosFormula, null, datosFiltrados.resultados);
          }
          let contadorErrores = 0;
          const resultados = resultadoFormula.resultados;
          // eslint-disable-next-line no-unused-vars
          resultados.forEach((fila, _indice) => {
            // Verificar que el objeto tiene la propiedad value y que empiece con '#'}
            if (fila && fila.value && fila.value.startsWith('#')) {
              contadorErrores += 1;
            }
          })
          if (contadorErrores > 0) {
            mostrarAlerta('Advertencia', `Se encontraron ${contadorErrores} errores al aplicar la fórmula. Revisa la fórmula y los datos que estés utilizando.`, 'warning');
            return;
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

            graficaExistente.update();

            mostrarAlerta('Éxito', `Fórmula "${nombreFormula}" aplicada correctamente a la gráfica.`, 'success');

            // Cerrar el cuadro de fórmulas
            cuadroFormulas.remove();

          } else {
            mostrarAlerta('Error', 'No se pudo encontrar la gráfica para actualizar o no hay resultados válidos.', 'error');
          }

        } catch (error) {
          if (error.tipo == 'columnaNoEncontrada') {
            // Ya se mostró la alerta específica, no mostrar la genérica
            return;
          }
          mostrarAlerta('Error', `Error inesperado al aplicar la fórmula: ${error.message}`, 'error');
        } finally {
          if (textoAplicar) textoAplicar.textContent = 'Aplicar Fórmula';
        }
      }, 100);
    }
  });

  // Configurar evento de búsqueda (filtrado local)
  campoBusqueda.addEventListener('input', (evento) => {
    // Validar caracteres primero
    actualizarCaracteresBuscador(campoBusqueda);

    // Luego filtrar
    const terminoBusqueda = evento.target.value;
    filtrarYRenderizarFormulas(contenedorBusqueda, terminoBusqueda, formulasDisponibles);
  });

  // Agregar también un listener para cuando se presiona Enter
  campoBusqueda.addEventListener('keypress', (evento) => {
    if (evento.key === 'Enter') {
      evento.preventDefault();
      const terminoBusqueda = campoBusqueda.value;
      filtrarYRenderizarFormulas(contenedorBusqueda, terminoBusqueda, formulasDisponibles);
    }
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



module.exports = {
  crearCuadroFormulas
};