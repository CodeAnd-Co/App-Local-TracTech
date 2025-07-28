// RF10 - Usuario añade gráfica a reporte - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF10
// RF12 - Usuario modifica gráfica en reporte - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF12/
// RF11 - Usuario elimina gráfica en reporte - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF11/
// RF30 - Usuario carga formula - https://codeandco-wiki.netlify.app/docs/next/proyectos/tractores/documentacion/requisitos/RF30
const Chart = require('chart.js/auto');
const { limpiarGrafica } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/graficas/limpiarGrafica.js`);
const { ElementoNuevo, Contenedores } = require(`${rutaBase}/src/backend/data/analisisModelos/elementoReporte.js`);
const { mostrarAlerta } = require(`${rutaBase}/src/framework/vistas/includes/componentes/moleculas/alertaSwal/alertaSwal.js`);
const { eliminarCuadroFormulas } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/formulas/eliminarCuadroFormulas.js`);
const { crearCuadroFormulas } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/formulas/crearCuadroFormulas.js`);
const { procesarDatosUniversal } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/graficas/procesarDatosUniversal.js`);
const { crearGrafica, generarDegradadoHaciaBlanco, verificarExcesoEtiquetas } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/graficas/crearGrafica.js`)


/* eslint-disable no-unused-vars */

// Variable global para almacenar las fórmulas consultadas
const formulasDisponibles = JSON.parse(localStorage.getItem('formulasDisponibles')) || [];

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

  const tarjetasTextoExistentes = contenedor.querySelectorAll('.tarjeta-texto').length;
  const tarjetasGraficaExistentes = contenedor.querySelectorAll('.tarjeta-grafica').length;
  const totalTarjetas = tarjetasTextoExistentes + tarjetasGraficaExistentes;
  if (totalTarjetas >= 30) {
    mostrarAlerta('Advertencia', 'Llegaste al límite de tarjetas, el reporte no puede tener más de 30 tarjetas en total.', 'info');
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
    <div class='select-tractores'>
      <div class='titulo-texto' id='tractor-grafica'>
        <select class='tipo-texto tractor-grafica'>
          ${opcionesTractores}
        </select>
      </div>
      <div class='titulo-texto' id='color-grafica'>
        <input type='color' id='color-entrada' name='color-grafica' value='#A61930' />
      </div>
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
          columnas = datosParseados[0];
        }
      }
    } catch (error) {
      columnas = [];
    }
  }

  // Actualizar la llamada en el event listener del botón de fórmulas
  tarjetaGrafica.querySelector('.boton-formulas').addEventListener('click', async () => {
    tractorSeleccionado = selectorTractor.value;
    await crearCuadroFormulas(nuevaId, formulasDisponibles, datosOriginalesFormulas, tractorSeleccionado);
  });

  const graficaDiv = document.createElement('div');
  graficaDiv.className = 'previsualizacion-grafica';
  graficaDiv.id = `previsualizacion-grafica-${nuevaId}`;
  const canvasGrafica = document.createElement('canvas');
  graficaDiv.appendChild(canvasGrafica);

  const contexto = canvasGrafica.getContext('2d');
  const grafico = crearGrafica(contexto, 'line');
  grafico.options.plugins.title.text = '';
  grafico.update();
  verificarExcesoEtiquetas(grafico);


  const entradaTexto = tarjetaGrafica.querySelector('.titulo-grafica');
  // CAMBIO: Prevenir espacios al inicio sin mover el cursor
  entradaTexto.addEventListener('input', (evento) => {
    // Prevenir que el título comience con espacios sin mover el cursor
    if (evento.target.value.startsWith(' ')) {
      const posicionCursor = evento.target.selectionStart;
      evento.target.value = evento.target.value.replace(/^ +/, ''); // Eliminar solo espacios del inicio
      // Restaurar posición del cursor (ajustada por los espacios eliminados)
      const nuevaPosicion = Math.max(0, posicionCursor - 1);
      evento.target.setSelectionRange(nuevaPosicion, nuevaPosicion);
    }

    modificarTitulo(graficaDiv, entradaTexto, tarjetaGrafica);
  });

  const selectorTipo = tarjetaGrafica.querySelector('.tipo-grafica');
  selectorTipo.value = grafico.config.type;
  selectorTipo.addEventListener('change', () => {
    const tituloGrafica = tarjetaGrafica.querySelector('.titulo-grafica').value;
    modificarTipoGrafica(graficaDiv, selectorTipo, tituloGrafica);
  })

  const entradaColor = tarjetaGrafica.querySelector('#color-entrada')
  entradaColor.addEventListener('change', () => {
    modificarColor(entradaColor, graficaDiv, 0)
  })

  // Obtener el dato del tractor seleccionado para la gráfica
  const selectorTractor = tarjetaGrafica.querySelector('.tractor-grafica');
  selectorTractor.addEventListener('input', async () => {
    const tituloGrafica = tarjetaGrafica.querySelector('.titulo-grafica').value;
    const botonAplicarFormula = document.querySelector('#btnAplicarFormula');
    tractorSeleccionado = selectorTractor.value;

    if (botonAplicarFormula) {
      await crearCuadroFormulas(nuevaId, formulasDisponibles, datosOriginalesFormulas, tractorSeleccionado)
    }

    limpiarGrafica(nuevaId, datosOriginalesFormulas);
  })

  tarjetaGrafica.querySelector('.eliminar').addEventListener('click', () =>
    eliminarGrafica(tarjetaGrafica, graficaDiv));

  const elementoReporte = new ElementoNuevo(tarjetaGrafica, graficaDiv);
  agregarEnPosicion(tarjetaRef, elementoReporte, contenedores, posicion);

  return tarjetaGrafica;
}

/**
 * Actualiza una gráfica aplicando los datos originales según el nuevo tipo
 * @param {number} graficaId - ID de la gráfica
 * @param {string} nuevoTipo - Nuevo tipo de gráfica
 * @param {Chart} graficaExistente - Instancia de la gráfica existente
 * @returns {Chart} - Nueva instancia de la gráfica
 */
function actualizarGraficaConTipo(graficaId, nuevoTipo, graficaExistente) {
  const canvasAntiguo = graficaExistente.canvas;
  const nuevoCanvas = document.createElement('canvas');
  canvasAntiguo.parentNode.replaceChild(nuevoCanvas, canvasAntiguo);
  const contexto = nuevoCanvas.getContext('2d');

  const tituloActual = graficaExistente.options.plugins.title.text;
  const colorOriginal = graficaExistente.data.datasets[0].miColor
  const arregloColor = colorOriginal.match(/\d+/g).map(Number);
  const datosOriginales = datosOriginalesFormulas.get(graficaId);

  graficaExistente.destroy();

  const nuevaGrafica = crearGrafica(contexto, nuevoTipo, arregloColor);

  if (datosOriginales) {
    const datosRebuild = procesarDatosUniversal(
      datosOriginales.datos,
      nuevoTipo,
      datosOriginales.nombre
    );

    nuevaGrafica.data.labels = datosRebuild.labels;
    nuevaGrafica.data.datasets[0].data = datosRebuild.valores;
    nuevaGrafica.data.datasets[0].label = datosOriginales.nombre;
    nuevaGrafica.data.datasets[0].type = nuevoTipo;
  }

  nuevaGrafica.options.plugins.title.text = tituloActual;
  nuevaGrafica.update();

  verificarExcesoEtiquetas(nuevaGrafica);
  return nuevaGrafica;
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
 * Modifica el color de un dataset en una gráfica Chart.js, actualizando su color principal
 * y generando un degradado hacia blanco.
 *
 * @param {HTMLInputElement} entradaColor - Elemento input de tipo color del cual se obtiene el valor hexadecimal.
 * @param {HTMLDivElement} grafica - Elemento HTML que contiene el canvas de la gráfica Chart.js.
 * @param {number} dataset - Índice del dataset dentro de la gráfica que se desea modificar.
 */
function modificarColor(entradaColor, grafica, dataset) {
  const contexto = grafica.querySelector('canvas').getContext('2d');
  const graficaOriginal = Chart.getChart(contexto);
  const color = hexARGB(entradaColor.value);
  const colores = generarDegradadoHaciaBlanco(color, 7);

  graficaOriginal.config.data.datasets[dataset].miColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
  graficaOriginal.config.data.datasets[dataset].misColores = colores;

  graficaOriginal.update()
}

/**
 * Convierte un valor hexadecimal de color en un arreglo con los valores RGB correspondientes.
 *
 * @param {string} colorHex - Color en formato hexadecimal (por ejemplo: "#FF5733" o "FF5733").
 * @returns {number[]} Arreglo con tres números que representan los componentes R, G y B (en ese orden).
 */
function hexARGB(colorHex) {
  colorHex = colorHex.replace(/^#/, '');

  const rojo = parseInt(colorHex.substring(0, 2), 16);
  const verde = parseInt(colorHex.substring(2, 4), 16);
  const azul = parseInt(colorHex.substring(4, 6), 16);

  return [rojo, verde, azul];
}

module.exports = {
  agregarGrafica,
  modificarTipoGrafica,
  modificarColor,
  modificarTitulo
};