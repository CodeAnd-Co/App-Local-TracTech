// RF10 - Usuario añade gráfica a reporte - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF10
// RF12 - Usuario modifica gráfica en reporte - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF12/
// RF11 - Usuario elimina gráfica en reporte - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF11/
// RF30 - Usuario carga formula - https://codeandco-wiki.netlify.app/docs/next/proyectos/tractores/documentacion/requisitos/RF30
const Chart = require('chart.js/auto');
const ChartDataLabels = require('chartjs-plugin-datalabels');
Chart.register(ChartDataLabels);
const { retirarDatos } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/graficas/retiraFormula.js`);
const { ElementoNuevo, Contenedores } = require(`${rutaBase}/src/backend/data/analisisModelos/elementoReporte.js`);
const { mostrarAlerta } = require(`${rutaBase}/src/framework/vistas/includes/componentes/moleculas/alertaSwal/alertaSwal.js`);
const { cargarFormulasIniciales } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/formulas/cargarFormulasIniciales.js`);
const { eliminarCuadroFormulas } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/formulas/eliminarCuadroFormulas.js`);
const { crearCuadroFormulas } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/formulas/crearCuadroFormulas.js`);
const { procesarDatosUniversal } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/graficas/procesarDatosUniversal.js`);

/* eslint-disable no-unused-vars */
 
// Variable global para almacenar las fórmulas consultadas
let formulasDisponibles = [];

// Variable global para almacenar los datos originales de fórmulas por gráfica
const datosOriginalesFormulas = new Map();

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

  const tractores = JSON.parse(localStorage.getItem('tractoresSeleccionados') || []);
  let tractorSeleccionado = tractores[0];
  console.log('tractores: ', tractores);
  console.log('tractor seleccionado: ', tractorSeleccionado);

  let opcionesTractores = '';
  for (const tractor of tractores) {
    opcionesTractores += `<option value='${tractor}'>${tractor}</option>`;
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
    <div class='titulo-texto'>
      <select class='tipo-texto tractor-grafica'>
        ${opcionesTractores}
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
  const datos = localStorage.getItem('datosFiltradosExcel'); 
  let columnas = [];

  // Cargar y parsear los datos del localStorage
  if (datos) {
    try {
      const datosParseados = JSON.parse(datos);
      
      // Si es un objeto con hojas (estructura compleja)
      if (datosParseados && typeof datosParseados === 'object' && datosParseados.hojas) {
        window.datosExcelGlobal = datosParseados;
        window.datosGrafica = datosParseados.hojas[tractorSeleccionado];
        
        // La primera fila contiene las columnas
        if (window.datosGrafica && window.datosGrafica.length > 0) {
          columnas = window.datosGrafica[0].slice(3); // Omitir las primeras 3 columnas
        }
      } else if (Array.isArray(datosParseados)) {
        window.datosGrafica = datosParseados;
        window.datosExcelGlobal = {
          hojas: {
            datosParseados
          }
        };
        
        // La primera fila contiene las columnas
        if (datosParseados.length > 0) {
          columnas = datosParseados[0]; // Omitir las primeras 3 columnas
        }
      }
    } catch (error) {
      console.error('Error al parsear los datos del Excel:', error);
      columnas = [];
    }
  }

  // Actualizar la llamada en el event listener del botón de fórmulas
  tarjetaGrafica.querySelector('.boton-formulas').addEventListener('click', async () =>
    await crearCuadroFormulas(columnas, nuevaId, window.datosGrafica, formulasDisponibles, datosOriginalesFormulas, tractorSeleccionado)
  );

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
    modificarTipoGrafica(graficaDiv, selectorTipo, tituloGrafica);
  })

  // Obtener el dato del tractor seleccionado para la gráfica
  const selectorTractor = tarjetaGrafica.querySelector('.tractor-grafica');
  selectorTractor.addEventListener('input', async () => {
    const tituloGrafica = tarjetaGrafica.querySelector('.titulo-grafica').value;
    const botonAplicarFormula = document.querySelector('#btnAplicarFormula');
    tractorSeleccionado = selectorTractor.value;
    console.log('Tractor seleccionado:', tractorSeleccionado);

    if ( botonAplicarFormula ){
      await crearCuadroFormulas(columnas, nuevaId, window.datosGrafica, formulasDisponibles, datosOriginalesFormulas, tractorSeleccionado)
    }
    modificarTipoGrafica(graficaDiv, selectorTipo, tituloGrafica);
  })

  tarjetaGrafica.querySelector('.eliminar').addEventListener('click', () =>
    eliminarGrafica(tarjetaGrafica, graficaDiv));

  const elementoReporte = new ElementoNuevo(tarjetaGrafica, graficaDiv);
  agregarEnPosicion(tarjetaRef, elementoReporte, contenedores, posicion);

  return tarjetaGrafica;
}
  

function seleccionarTractor() {}

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


module.exports = { 
  agregarGrafica,
  cargarFormulasIniciales,
 };