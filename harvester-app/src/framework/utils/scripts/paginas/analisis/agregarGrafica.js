// RF10 - Usuario añade gráfica a reporte - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF10
// RF12 - Usuario modifica gráfica en reporte - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF12/
// RF11 - Usuario elimina gráfica en reporte - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF11/
// RF30 - Usuario carga formula - https://codeandco-wiki.netlify.app/docs/next/proyectos/tractores/documentacion/requisitos/RF30
const Chart = require('chart.js/auto');
const ChartDataLabels = require('chartjs-plugin-datalabels');
Chart.register(ChartDataLabels);
const { ElementoNuevo, Contenedores } = require(`${rutaBase}/src/backend/data/analisisModelos/elementoReporte.js`);
const { consultaFormulasCasoUso } = require(`${rutaBase}src/backend/casosUso/formulas/consultaFormulas.js`);
const { mostrarAlerta } = require(`${rutaBase}/src/framework/vistas/includes/componentes/moleculas/alertaSwal/alertaSwal.js`);
const { aplicarFormula } = require(`${rutaBase}/src/backend/casosUso/formulas/aplicarFormula.js`);

/* eslint-disable no-unused-vars */
 
// Variable global para almacenar las fórmulas consultadas
let formulasDisponibles = [];

// Variable global para almacenar los datos originales de fórmulas por gráfica
const datosOriginalesFormulas = new Map();

/**
 * Consulta las fórmulas una sola vez y las almacena globalmente.
 * @returns {Promise<void>}
 */
async function cargarFormulasIniciales() {
  try {
    if (formulasDisponibles.length > 0) {
      return; 
    }

    const respuesta = await consultaFormulasCasoUso();
    
    
    if (!respuesta.ok || !respuesta.datos) {
      throw new Error('Error al consultar fórmulas');
    }

    formulasDisponibles = respuesta.datos;
  } catch (error) {
    
    formulasDisponibles = [];    
    mostrarAlerta('Error', 'No se pudieron cargar las fórmulas disponibles. Revisa que sí haya fórmulas guardadas y estes conectado a internet', 'error');
  }
}

/**
 * Agrega una nueva tarjeta de gráfica y su previsualización.
 *
 * @param {string} contenedorId            - ID del contenedor donde se agregará la tarjeta de gráfica.
 * @param {string} previsualizacionId      - ID del contenedor de previsualización de la gráfica.
 * @param {HTMLDivElement|null} tarjetaRef        - Tarjeta existente junto a la cual insertar (null = al final).
 * @param {'antes'|'despues'} posicion     - 'antes' o 'despues' respecto a tarjetaRef.
 * @returns {HTMLDivElement} tarjetaGrafica - La tarjeta de gráfica creada.
 */
function agregarGrafica(contenedorId, previsualizacionId, tarjetaRef = null, posicion = null) {
  const contenedor = document.getElementById(contenedorId);
  const previsualizacion = document.getElementById(previsualizacionId);
  const contenedores = new Contenedores(contenedor, previsualizacion);

  if (!contenedor || !previsualizacion) {
    mostrarAlerta('Error', 'Ocurrió un error al agregar la gráfica.', 'error');
    return;
  }

  const tarjetaGrafica = document.createElement('div');
  tarjetaGrafica.classList.add('tarjeta-grafica');
  const idsTarjetasExistentes = Array.from(contenedor.querySelectorAll('.tarjeta-grafica'), (tarjeta) => {
    return parseInt(tarjeta.id, 10);
  });
  
  let nuevaId;

  if (idsTarjetasExistentes.length > 0) {
    const idAnterior = Math.max(...idsTarjetasExistentes)
    nuevaId = idAnterior + 1;
  } else {
    nuevaId = 1;
  }
  
  const limite = 30;
  tarjetaGrafica.id = nuevaId;
  tarjetaGrafica.innerHTML = `
    <input class='titulo-grafica' placeholder='Nombre de la gráfica' maxlength='${limite}'/>
    <div class='contador-caracteres'>0/${limite} caracteres</div>
    <div class='titulo-texto'>
      <select class='tipo-texto tipo-grafica'>
        <option value='line'>Línea</option>
        <option value='bar'>Barras</option>
        <option value='pie'>Pastel</option>
        <option value='doughnut'>Dona</option>
        <option value='radar'>Radar</option>
        <option value='polarArea'>Polar</option>
      </select>
      <img class='type' src='${rutaBase}/src/framework/utils/iconos/GraficaBarras.svg' alt='Icono Gráfica' />
    </div>
    <div class='boton-formulas'>
      <div class='formulas'>Fórmulas</div>
    </div>
    <div class='botones-eliminar' style='display: flex; justify-content: flex-end;'>
      <div class='eliminar'>
        <img class='eliminar-icono' src='${rutaBase}/src/framework/utils/iconos/Basura.svg' />
        <div class='texto-eliminar'>Eliminar</div>
      </div>
    </div>
    <style>
      .contador-caracteres {
        font-size: 12px;
        text-align: right;
        color: #7f8c8d;
        margin: 4px 0;
        padding-right: 4px;
      }
    </style>
  `;

  // Datos disponibles para fórmulas
  const datos = localStorage.getItem('datosExcel'); 
  const hoja = localStorage.getItem('hojaSeleccionada'); // Obtener la hoja seleccionada 
  let columnas = [];

  // Cargar y parsear los datos del localStorage
  if (datos) {
    try {
      const datosParseados = JSON.parse(datos);
      
      // Si es un objeto con hojas (estructura compleja)
      if (datosParseados && typeof datosParseados === 'object' && datosParseados.hojas) {
        window.datosExcelGlobal = datosParseados;
        const nombrePrimeraHoja = Object.keys(datosParseados.hojas)[0];
        window.datosGrafica = datosParseados.hojas[nombrePrimeraHoja];
        
        // La primera fila contiene las columnas
        if (window.datosGrafica && window.datosGrafica.length > 0) {
          columnas = window.datosGrafica[0].slice(3); // Omitir las primeras 3 columnas
        }
      } else if (Array.isArray(datosParseados)) {
        window.datosGrafica = datosParseados;
        window.datosExcelGlobal = {
          hojas: {
            'Hoja1': datosParseados
          }
        };
        
        // La primera fila contiene las columnas
        if (datosParseados.length > 0) {
          columnas = datosParseados[0].slice(3); // Omitir las primeras 3 columnas
        }
      }
    } catch (error) {
      console.error('Error al parsear los datos del Excel:', error);
      columnas = [];
    }
  }

  // Actualizar la llamada en el event listener del botón de fórmulas
  tarjetaGrafica.querySelector('.boton-formulas').addEventListener('click', async () =>
    await crearCuadroFormulas(columnas, nuevaId, window.datosGrafica));

  const graficaDiv = document.createElement('div');
  graficaDiv.className = 'previsualizacion-grafica';
  graficaDiv.id = `previsualizacion-grafica-${nuevaId}`;
  const canvasGrafica = document.createElement('canvas');
  graficaDiv.appendChild(canvasGrafica);

  const contexto = canvasGrafica.getContext('2d');
  const grafico = crearGrafica(contexto, 'line');
  grafico.options.plugins.title.text = '';
  grafico.update();

  const entradaTexto = tarjetaGrafica.querySelector('.titulo-grafica');
  entradaTexto.addEventListener('input', () =>
    modificarTitulo(graficaDiv, entradaTexto, tarjetaGrafica));

  const selectorTipo = tarjetaGrafica.querySelector('.tipo-grafica');
  selectorTipo.value = grafico.config.type;
  selectorTipo.addEventListener('change', () => {
    const tituloGrafica = tarjetaGrafica.querySelector('.titulo-grafica').value;
    modificarTipoGrafica(graficaDiv, selectorTipo, tituloGrafica)
  })

  tarjetaGrafica.querySelector('.eliminar').addEventListener('click', () =>
    eliminarGrafica(tarjetaGrafica, graficaDiv));

  const elementoReporte = new ElementoNuevo(tarjetaGrafica, graficaDiv);
  agregarEnPosicion(tarjetaRef, elementoReporte, contenedores, posicion);

  return tarjetaGrafica;
}


/**
 * Filtra y renderiza las fórmulas según el término de búsqueda.
 * @param {HTMLDivElement} contenedor - Contenedor donde se mostrarán las fórmulas.
 * @param {string} terminoBusqueda - Término de búsqueda para filtrar fórmulas.
 * @returns {void}
 */
function filtrarYRenderizarFormulas(contenedor, terminoBusqueda = '') {
  // Limpiar contenedor
  contenedor.innerHTML = '';

  // Si no hay término de búsqueda, mostrar mensaje inicial
  if (!terminoBusqueda || terminoBusqueda.trim() === '') {
    return;
  }

  // Si no hay fórmulas cargadas, mostrar mensaje específico
  if (formulasDisponibles.length === 0) {
    contenedor.innerHTML = '<div class="mensaje-sin-formulas">No hay fórmulas creadas. <br>Ve al módulo de fórmulas para crear una.</div>';
    return;
  }

  // Filtrar fórmulas por término de búsqueda SOLO en el nombre
  const terminoLowerCase = terminoBusqueda.toLowerCase();
  const formulasFiltradas = formulasDisponibles.filter(formula => {
    return formula.Nombre.toLowerCase().includes(terminoLowerCase);
  });

  // Renderizar fórmulas filtradas
  if (formulasFiltradas.length === 0) {
    contenedor.innerHTML = '<div class="mensaje-sin-resultados">No hay fórmulas con ese nombre</div>';
    return;
  }

  formulasFiltradas.forEach((formula, indice) => {
  const elementoFormula = document.createElement('div');
  elementoFormula.className = 'formula-objeto';
  
  const radioId = `formula-${formula.idFormula}`;
  
  // Crear el elemento sin usar innerHTML para evitar problemas de escape
  const inputRadio = document.createElement('input');
  inputRadio.type = 'radio';
  inputRadio.id = radioId;
  inputRadio.name = 'formula-seleccionada';
  inputRadio.value = formula.idFormula;
  inputRadio.style.display = 'none';
  
  // Almacenar los datos directamente en propiedades del elemento
  inputRadio.formulaNombre = formula.Nombre;
  inputRadio.formulaDatos = formula.Datos;
  
  const divFormula = document.createElement('div');
  divFormula.className = 'formula';
  divFormula.setAttribute('data-radio-id', radioId);
  
  const label = document.createElement('label');
  label.setAttribute('for', radioId);
  label.className = 'formula-label';
  label.textContent = formula.Nombre;
  
  divFormula.appendChild(label);
  elementoFormula.appendChild(inputRadio);
  elementoFormula.appendChild(divFormula);
  
  // Agregar evento de clic al div .formula
  const radioButton = inputRadio;
  
  divFormula.addEventListener('click', () => {
    // Deseleccionar todas las fórmulas anteriores
    contenedor.querySelectorAll('.formula').forEach(div => {
      div.classList.remove('formula-seleccionada');
    });
    
    // Deseleccionar todos los radio buttons
    contenedor.querySelectorAll('input[type="radio"]').forEach(radio => {
      radio.checked = false;
    });
    
    // Seleccionar la fórmula actual
    radioButton.checked = true;
    divFormula.classList.add('formula-seleccionada');
    
    // Llamar a la función de selección
    seleccionarFormula(radioButton, contenedor);
  });
  
  contenedor.appendChild(elementoFormula);
});
}

/**
 * Maneja la selección de una fórmula.
 * @param {HTMLInputElement} radioBotton - Radio button de fórmula seleccionado.
 * @param {HTMLDivElement} contenedor - Contenedor de fórmulas.
 * @returns {void}
 */
function seleccionarFormula(radioBotton, contenedor) {
  // Guardar la fórmula seleccionada para uso posterior
  const formulaSeleccionada = {
    id: radioBotton.value,
    nombre: radioBotton.formulaNombre,
    datos: radioBotton.formulaDatos
  };
  
  // Almacenar en el elemento padre para acceso posterior
  const cuadroFormulas = contenedor.closest('.contenedor-formulas');
  if (cuadroFormulas) {
    cuadroFormulas.dataset.formulaSeleccionada = JSON.stringify(formulaSeleccionada);
  }
  
}

/**
 * Elimina el cuadro de fórmulas si existe.
 * @returns {void}
 */
function eliminarCuadroFormulas() {
  const cuadroFormulasExistente = document.querySelector('.contenedor-formulas');
  if (cuadroFormulasExistente) {
    cuadroFormulasExistente.remove();
  }
}

/**
 * Crea un cuadro de fórmulas asociado a una gráfica.
 * @param {string[]} columnas - Lista de columnas disponibles en los datos.
 * @param {number} graficaId - ID de la gráfica asociada.
 * @param {Array} datosGrafica - Datos de la gráfica.
 * @returns {void}
 */  
async function crearCuadroFormulas(columnas, graficaId, datosGrafica) {
  eliminarCuadroFormulas(); // Ahora esta función ya está definida

  // Cargar fórmulas una sola vez al inicio
  await cargarFormulasIniciales();

  const cuadroFormulas = document.createElement('div');
  cuadroFormulas.className = 'contenedor-formulas';
  
  // Almacenar el ID de la gráfica en el dataset
  cuadroFormulas.dataset.graficaId = graficaId;

  // Obtener las columnas de la hoja seleccionada
  const hojaSeleccionada = localStorage.getItem('hojaSeleccionada');
  const datos = localStorage.getItem('datosExcel');
  let columnasActualizadas = columnas;

  if (datos && hojaSeleccionada) {
    try {
      const datosParseados = JSON.parse(datos);
      if (datosParseados.hojas && datosParseados.hojas[hojaSeleccionada]) {
        const datosHoja = datosParseados.hojas[hojaSeleccionada];
        if (datosHoja.length > 0) {
          columnasActualizadas = datosHoja[0].slice(3); // Omitir las primeras 3 columnas
        }
      }
    } catch (error) {
      console.error('Error al obtener columnas de la hoja seleccionada:', error);
    }
  }

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
                      <div class='boton-agregar'id = 'btnAplicarFormula'>
                          <div>Aplicar Fórmula</div>
                      </div>
                  </div>
              </div>
          </div>`;

  const contenedoesSeleccion = cuadroFormulas.querySelectorAll('.opciones-carta');

  //ToDo: Escalar en número de variables dependiendo de las variables en las fórmulas
  crearMenuDesplegable(contenedoesSeleccion[0], 'A', columnasActualizadas, graficaId);

  // Configurar búsqueda de fórmulas
  const campoBusqueda = cuadroFormulas.querySelector('.search-section');
  const contenedorBusqueda = cuadroFormulas.querySelector('.contenedor-busqueda');
  const botonAplicarFormula = cuadroFormulas.querySelector('#btnAplicarFormula');

  botonAplicarFormula.addEventListener('click', () => {
    const formulaSeleccionada = contenedorBusqueda.querySelector('.formula-seleccionada');
    if (!formulaSeleccionada) {
      mostrarAlerta('Error', 'Debes buscar y seleccionar una fórmula antes de aplicar.', 'error');
      return;
    }

    // Verificar que hay datos disponibles
    const datosExcel = localStorage.getItem('datosExcel');
    const hojaSeleccionada = localStorage.getItem('hojaSeleccionada'); // Obtener la hoja seleccionada
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
              'Hoja1': datosParseados
            }
          };
        } else {
          window.datosExcelGlobal = datosParseados;
        }
      } catch (error) {
        mostrarAlerta('Error', 'Error al procesar los datos de Excel.', 'error');
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
      if (hojaSeleccionada.length != 0) {
        resultadoFormula = aplicarFormula(nombreFormula, datosFormula, hojaSeleccionada);
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
      console.error('Error al aplicar fórmula:', error);
      mostrarAlerta('Error', `Error inesperado al aplicar la fórmula: ${error.message}`, 'error');
    }
  });

  // Configurar evento de búsqueda (filtrado local)
  campoBusqueda.addEventListener('input', (evento) => {
    const terminoBusqueda = evento.target.value.trim();
    filtrarYRenderizarFormulas(contenedorBusqueda, terminoBusqueda);
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
}
  

/**
 * Crea un menú desplegable para seleccionar columnas.
 * @param {HTMLDivElement} contenedor - Contenedor donde se agregará el menú desplegable.
 * @param {string} letra - Letra identificadora del menú.
 * @param {string[]} columnas - Lista de columnas disponibles.
 * @param {number} graficaId - ID de la gráfica asociada.
 * @returns {void}
 */
function crearMenuDesplegable(contenedor, letra, columnas, graficaId) {
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
      actualizarGraficaConColumna(graficaId, columnaSeleccionada);
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

/**
 * Formateador universal para etiquetas de datos según el tipo de gráfica
 * @param {*} value - Valor del dato
 * @param {*} context - Contexto de Chart.js
 * @param {string} tipo - Tipo de gráfica
 * @returns {string} - Etiqueta formateada
 */
function formatearEtiquetaUniversal(value, context, tipo) {
  const etiqueta = context.chart.data.labels[context.dataIndex];
  
  // Para gráficas circulares Y DE BARRAS - SIEMPRE frecuencias con porcentajes/valores
  if (tipo === 'pie' || tipo === 'doughnut' || tipo === 'polarArea') {
    const datos = context.chart.data.datasets[0].data;
    const valorTotal = datos.reduce((total, datapoint) => total + datapoint, 0);
    
    if (valorTotal === 0) return '';
    
    const porcentaje = ((value / valorTotal) * 100).toFixed(1);
    return `${etiqueta}\n${value} (${porcentaje}%)`;
  }
  
  // Para gráficas de barras - solo mostrar categoría y frecuencia
  if (tipo === 'bar') {
    return `${etiqueta}: ${value}`;
  }
  
  // Para gráficas lineales - Mostrar categoría y valor (aunque ya no se mostrarán las etiquetas)
  if (etiqueta === 'Resultado') {
    return `${etiqueta}\n${value}`;
  } else {
    return `${etiqueta}: ${value}`;
  }
}

/**
 * Procesa datos universalmente según el tipo de gráfica
 * @param {Array} datosOriginales - Datos originales de la fórmula o columna
 * @param {string} tipoGrafica - Tipo de gráfica
 * @param {string} nombreColumna - Nombre de la columna o fórmula
 * @returns {Object} - Objeto con labels y valores procesados
 */
function procesarDatosUniversal(datosOriginales, tipoGrafica, nombreColumna = 'Datos') {
  if (!datosOriginales || datosOriginales.length === 0) {
    return { labels: ['Sin datos'], valores: [0] };
  }

  // Filtrar valores vacíos, null o undefined
  const datosLimpios = datosOriginales.filter(valor => 
    valor !== null && valor !== undefined && valor !== '');

  if (datosLimpios.length === 0) {
    return { labels: ['Sin datos'], valores: [0] };
  }

  // Para gráficas circulares Y DE BARRAS: SIEMPRE usar frecuencias (agrupamiento por categoría)
  if (tipoGrafica === 'pie' || tipoGrafica === 'doughnut' || tipoGrafica === 'polarArea' || tipoGrafica === 'bar') {
    const frecuencias = {};
    datosLimpios.forEach(valor => {
      const clave = String(valor);
      frecuencias[clave] = (frecuencias[clave] || 0) + 1;
    });
    
    return {
      labels: Object.keys(frecuencias),
      valores: Object.values(frecuencias)
    };
  }

  // Para gráficas lineales y radar - usar filas numeradas SOLO si son números diferentes
  const todosNumeros = datosLimpios.every(valor => 
    !isNaN(parseFloat(valor)) && isFinite(valor));

  if (todosNumeros) {
    // Si son números, verificar si todos son iguales
    const valoresUnicos = [...new Set(datosLimpios)];
    
    if (valoresUnicos.length === 1) {
      // Si todos son iguales, mostrar el valor único
      return {
        labels: ['Resultado'],
        valores: [valoresUnicos[0]]
      };
    } else {
      // Si hay valores diferentes, usar filas numeradas SOLO para líneas y radar
      // AJUSTE: Empezar desde "Fila 1" porque la primera fila del Excel son encabezados
      return {
        labels: datosLimpios.map((_encabezado, indice) => `Fila ${indice + 2}`),
        valores: datosLimpios.map(valor => parseFloat(valor))
      };
    }
  } else {
    // Si son texto o mixto, usar frecuencias
    const frecuencias = {};
    datosLimpios.forEach(valor => {
      const clave = String(valor);
      frecuencias[clave] = (frecuencias[clave] || 0) + 1;
    });
    
    return {
      labels: Object.keys(frecuencias),
      valores: Object.values(frecuencias)
    };
  }
}

/**
 * Actualiza una gráfica aplicando los datos originales según el nuevo tipo
 * @param {number} graficaId - ID de la gráfica
 * @param {string} nuevoTipo - Nuevo tipo de gráfica
 * @param {Chart} graficaExistente - Instancia de la gráfica existente
 * @returns {Chart} - Nueva instancia de la gráfica
 */
function actualizarGraficaConTipo(graficaId, nuevoTipo, graficaExistente) {
  const canvas = graficaExistente.canvas;
  const contexto = canvas.getContext('2d');
  
  // Preservar información importante
  const tituloActual = graficaExistente.options.plugins.title.text;
  
  // Obtener datos originales si existen
  const datosOriginales = datosOriginalesFormulas.get(graficaId);
  
  // Destruir gráfica actual
  graficaExistente.destroy();
  
  // Crear nueva gráfica
  const nuevaGrafica = crearGrafica(contexto, nuevoTipo);
  
  // Si hay datos originales, reprocesarlos para el nuevo tipo
  if (datosOriginales) {
    const datosRebuild = procesarDatosUniversal(
      datosOriginales.datos, 
      nuevoTipo, 
      datosOriginales.nombre
    );
    
    nuevaGrafica.data.labels = datosRebuild.labels;
    nuevaGrafica.data.datasets[0].data = datosRebuild.valores;
    nuevaGrafica.data.datasets[0].label = datosOriginales.nombre;
  }
  
  // Restaurar título
  nuevaGrafica.options.plugins.title.text = tituloActual;
  
  // CONFIGURAR ETIQUETAS SEGÚN EL NUEVO TIPO DE GRÁFICA
  nuevaGrafica.options.plugins.datalabels.display = nuevoTipo !== 'line';
  
  // Actualizar
  nuevaGrafica.update();
  
  return nuevaGrafica;
}

/**
 * Crea una gráfica utilizando Chart.js.
 * 
 * @param {CanvasRenderingContext2D} contexto - 2dcontext del canvas donde se dibujará la gráfica.
 * @param {String} tipo - String que representa el tipo de gráfica (ej. 'line', 'bar', 'pie', 'doughnut', 'radar', 'polarArea').
 * @param {Int[]} color - Arreglo de 3 enteros que representan el color RGB de la gráfica.
 * @returns {Chart} - Instancia de la gráfica creada.
 */
function crearGrafica(contexto, tipo, color) {
  if (!contexto) return;

  if (!color) {
    color = [166, 25, 48];
  }

  if (!tipo) {
    tipo = 'line';
  }

  const colores = generarDegradadoHaciaBlanco(color, 7)
  color = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;

  const grafico = new Chart(contexto, {
    type: tipo,
    data: {
      labels: ['Sin datos'], // Etiqueta inicial más clara
      datasets: [{
        label: 'Datos',
        backgroundColor: fondo => {
          if (tipo == 'line' || tipo == 'radar') {
            return color;
          } else {
            return colores[fondo.dataIndex % colores.length]; // Evitar errores de índice
          }
        },
        borderColor: borde => {
          if (tipo == 'line' || tipo == 'radar') {
            return color;
          } else {
            return colores[borde.dataIndex % colores.length]; // Evitar errores de índice
          }
        },
        data: [0] // Dato inicial más claro
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { 
          display: true,
          text: 'Gráfica sin datos - Aplica una fórmula para ver resultados',
          font: {
            size: 14
          }
        },
        tooltip: {
          enabled: true, // Habilitar tooltips para mejor UX
        },
        legend: {
          display: true,
          position: 'top',
          labels: {
            generateLabels: chart => [
              {
                text: chart.data.datasets[0].label || 'Datos',
                fillStyle: color,
                strokeStyle: color,
                fontColor: '#333'
              }
            ],
          },
        },
        datalabels: {
          // SOLO ocultar etiquetas en gráficas de línea, mostrar en todas las demás
          display: (context) => {
            const tipoGrafica = context.chart.config.type;
            return tipoGrafica !== 'line'; // Ocultar SOLO en líneas
          },
          anchor: () => {
            if (tipo == 'bar') {
              return 'end';
            } else {
              return 'center';
            }
          },
          align: () => {
            if (tipo == 'bar') {
              return 'top';
            } else {
              return 'center';
            }
          },
          color: '#333',
          font: {
            size: 12, // Slightly smaller to fit more text
            weight: 'bold'
          },
          backgroundColor: 'rgba(255, 255, 255, 0.9)', // More opaque background
          borderColor: '#333',
          borderRadius: 4,
          borderWidth: 1,
          padding: 6, // More padding for better readability
          formatter: (value, context) => {
            // Aplicar formato universal según el tipo de gráfica
            return formatearEtiquetaUniversal(value, context, tipo);
          },
        }
      },
      scales: {
         // eslint-disable-next-line id-length
        x: { 
          display: ['line', 'bar', 'radar'].includes(tipo),
          ticks: { 
            color: '#646464',
            maxRotation: 45,
            minRotation: 0
          }, 
          // CONFIGURACIÓN MEJORADA DE GRID PARA EJE X - MÁS VISIBLE
          grid: { 
            display: ['line', 'bar'].includes(tipo), // Mostrar grid solo en líneas y barras
            color: '#d0d0d0', // Color más oscuro para mejor visibilidad
            lineWidth: 1,
            drawBorder: true,
            drawOnChartArea: true,
            drawTicks: true,
            // Añadir configuración adicional para mayor visibilidad
            borderColor: '#999',
            borderWidth: 2,
            tickColor: '#d0d0d0'
          },
          title: {
            display: true,
            text: 'Categorías',
            color: '#666'
          }
        },
        // eslint-disable-next-line id-length
        y: { 
          display: ['line', 'bar', 'radar'].includes(tipo),
          ticks: { 
            color: '#646464',
            beginAtZero: true
          }, 
          // CONFIGURACIÓN MEJORADA DE GRID PARA EJE Y - MÁS VISIBLE
          grid: { 
            display: ['line', 'bar'].includes(tipo), // Mostrar grid solo en líneas y barras
            color: '#d0d0d0', // Color más oscuro para mejor visibilidad
            lineWidth: 1,
            drawBorder: true,
            drawOnChartArea: true,
            drawTicks: true,
            // Añadir configuración adicional para mayor visibilidad
            borderColor: '#999',
            borderWidth: 2,
            tickColor: '#d0d0d0'
          },
          title: {
            display: true,
            text: 'Valores',
            color: '#666'
          }
        }
      }
    },
  });

  return grafico;
}

/**
 * Crea un arreglo de colores en formato rgb que van desde el color dado hacia el blanco.
 * 
 * @param {Int[]} rgb - Arreglo de 3 enteros que representan el color RGB inicial.
 * @param {Int} pasos - Número de pasos para el degradado.
 * @returns {String[]} Arreglo de strings que representan los colores en formato rgb
 */
function generarDegradadoHaciaBlanco(rgb, pasos) {
  if (!rgb || rgb.length !== 3) {
    return null;
  }

  if (pasos < 1) {
    return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
  }
  const [rojo, verde, azul] = rgb;

  return Array.from({ length: pasos },
    (__, indice) => {
      const factorCambio = indice / (pasos);
      const nuevoRojo = Math.round(rojo + (255 - rojo) * factorCambio);
      const nuevoVerde = Math.round(verde + (255 - verde) * factorCambio);
      const nuevoAzul = Math.round(azul + (255 - azul) * factorCambio);
      return `rgb(${nuevoRojo}, ${nuevoVerde}, ${nuevoAzul})`;
    });
}

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

/**
 * Modifica el tipo de gráfica según la selección del usuario.
 * 
 * @param {HTMLDivElement} grafica - Contenedor de la gráfica a modificar.
 * @param {HTMLSelectElement} selectorTipo - Selector de tipo de gráfica.
 * @param {string} tituloGrafica - Título de la gráfica.
 */
function modificarTipoGrafica(grafica, selectorTipo, tituloGrafica) {
  if (grafica) {
    const contexto = grafica.querySelector('canvas').getContext('2d');
    const graficaOriginal = Chart.getChart(contexto);
    
    if (graficaOriginal) {
      // Obtener ID de la gráfica desde el contenedor
      const graficaId = parseInt(grafica.id.replace('previsualizacion-grafica-', ''));
      
      // Usar la función universal de actualización
      const nuevaGrafica = actualizarGraficaConTipo(graficaId, selectorTipo.value, graficaOriginal);
      
      // Aplicar el título
      nuevaGrafica.options.plugins.title.text = tituloGrafica;
      nuevaGrafica.update();
    }
  }
}

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

/**
 * Inserta una tarjeta de texto y su previsualización en la posición deseada
 * 
 * @param {HTMLDivElement} tarjetaRef - Tarjeta de referencia para la inserción
 * @param {ElementoReporte} elementoReporte - Elemento de reporte a insertar
 * @param {Contenedores} contenedores - Contenedores de tarjetas y previsualizaciones
 * @param {'antes'|'despues'} posicion - Posición de inserción ('antes' o 'despues')
 * @returns {void}
 */
function agregarEnPosicion(tarjetaRef, elementoReporte, contenedores, posicion) {
  if (tarjetaRef && (posicion === 'antes' || posicion === 'despues')) {
    if (posicion === 'antes') {
      contenedores.contenedorTarjeta.insertBefore(elementoReporte.tarjeta, tarjetaRef);
    } else {
      contenedores.contenedorTarjeta.insertBefore(elementoReporte.tarjeta, tarjetaRef.nextSibling);
    }

    const idRef = tarjetaRef.id;
    let vistaRef;

    if (tarjetaRef.classList.contains('tarjeta-texto')) {
      vistaRef = contenedores.contenedorPrevisualizacion.querySelector(`#previsualizacion-texto-${idRef}`);
    } else if (tarjetaRef.classList.contains('tarjeta-grafica')) {
      vistaRef = contenedores.contenedorPrevisualizacion.querySelector(`#previsualizacion-grafica-${idRef}`);
    }

    if (vistaRef) {
      if (posicion === 'antes') {
        contenedores.contenedorPrevisualizacion.insertBefore(elementoReporte.previsualizacion, vistaRef);
      } else {
        contenedores.contenedorPrevisualizacion.insertBefore(elementoReporte.previsualizacion, vistaRef.nextSibling);
      }
    } else {
      contenedores.contenedorPrevisualizacion.appendChild(elementoReporte.previsualizacion);
    }
  } else {
    contenedores.contenedorTarjeta.appendChild(elementoReporte.tarjeta);
    contenedores.contenedorPrevisualizacion.appendChild(elementoReporte.previsualizacion);
  }
}

/**
 * Actualiza la gráfica con los datos de una columna específica.
 * @param {number} graficaId - ID de la gráfica a actualizar.
 * @param {string} nombreColumna - Nombre de la columna seleccionada.
 * @returns {void}
 */
function actualizarGraficaConColumna(graficaId, nombreColumna) {
  // Obtener la gráfica
  const graficaDiv = document.getElementById(`previsualizacion-grafica-${graficaId}`);
  if (!graficaDiv) {
    console.error('No se encontró la gráfica con ID:', graficaId);
    return;
  }

  const canvas = graficaDiv.querySelector('canvas');
  if (!canvas) {
    console.error('No se encontró el canvas de la gráfica');
    return;
  }

  const contexto = canvas.getContext('2d');
  const graficaExistente = Chart.getChart(contexto);
  
  if (!graficaExistente) {
    console.error('No se encontró la instancia de Chart.js');
    return;
  }

  // Obtener la hoja seleccionada del localStorage
  const hojaSeleccionada = localStorage.getItem('hojaSeleccionada');
  const datos = localStorage.getItem('datosExcel');
  
  if (!datos) {
    mostrarAlerta('Error', 'No hay datos cargados para mostrar en la gráfica.', 'error');
    return;
  }

  try {
    let datosHoja = null;
    
    // Parsear los datos del localStorage
    const datosParseados = JSON.parse(datos);
    
    // Determinar qué hoja usar
    if (hojaSeleccionada && hojaSeleccionada.trim() !== '') {
      // Usar la hoja seleccionada específica
      if (datosParseados.hojas && datosParseados.hojas[hojaSeleccionada]) {
        datosHoja = datosParseados.hojas[hojaSeleccionada];
      } else {
        mostrarAlerta('Error', `No se encontró la hoja "${hojaSeleccionada}" en los datos.`, 'error');
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
      mostrarAlerta('Error', `No se encontró la columna "${nombreColumna}" en la hoja "${hojaSeleccionada || 'seleccionada'}".`, 'error');
      return;
    }

    // Extraer los datos de la columna (omitiendo el encabezado)
    const datosColumna = datosHoja.slice(1).map(fila => fila[indiceColumna]);
    
    // GUARDAR DATOS ORIGINALES DE LA COLUMNA
    datosOriginalesFormulas.set(graficaId, {
      datos: datosColumna,
      nombre: nombreColumna,
      tipo: 'columna',
      hoja: hojaSeleccionada || 'Hoja por defecto'
    });

    const tipoGraficaActual = graficaExistente.config.type;
    
    // Usar el procesamiento universal
    const datosRebuild = procesarDatosUniversal(datosColumna, tipoGraficaActual, nombreColumna);

    // Actualizar la gráfica
    const tituloHoja = hojaSeleccionada ? ` (${hojaSeleccionada})` : '';
    graficaExistente.options.plugins.title.text = `Datos de: ${nombreColumna}${tituloHoja}`;
    graficaExistente.data.labels = datosRebuild.labels;
    graficaExistente.data.datasets[0].data = datosRebuild.valores;
    graficaExistente.data.datasets[0].label = nombreColumna;
    
    // Configurar etiquetas: ocultar SOLO en gráficas de línea
    const tipoActual = graficaExistente.config.type;
    graficaExistente.options.plugins.datalabels.display = tipoActual !== 'line';
    
    graficaExistente.update();

  } catch (error) {
    console.error('Error al procesar los datos de la columna:', error);
    mostrarAlerta('Error', 'Error al procesar los datos de la columna seleccionada.', 'error');
  }
}



module.exports = { 
  agregarGrafica,
  cargarFormulasIniciales,
 };