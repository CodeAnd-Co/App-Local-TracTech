// RF36 - Usuario añade gráfica a reporte - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF36
// RF37 - Usuario modifica gráfica en reporte - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/rf37/
// RF38 - Usuario elimina gráfica en reporte - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/rf38/
const Chart = require('chart.js/auto');
const ChartDataLabels = require('chartjs-plugin-datalabels');
Chart.register(ChartDataLabels);
const { ElementoNuevo, Contenedores } = require(`${rutaBase}/src/backend/data/analisisModelos/elementoReporte.js`);
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
if (typeof Swal === 'undefined') {
  const Swal = require(`${rutaBase}/node_modules/sweetalert2/dist/sweetalert2.all.min.js`);
}

const { crearGrafica } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/graficas/crearGrafica.js`);
const { modificarTipoGrafica } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/graficas/modificarTipoGrafica.js`);
const { crearCuadroFormulas } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/graficas/crearCuadroFormulas.js`);
const { modificarTitulo } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/graficas/modificarTitulo.js`);
const { eliminarGrafica } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/graficas/eliminarGrafica.js`);

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
    Swal.fire({
      title: 'Error',
      text: 'Ocurrió un error al agregar cuadro de texto.',
      icon: 'error',
      confirmButtonColor: '#a61930',
    });
    return
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
  const parametros = JSON.parse(localStorage.getItem('parametrosSeleccionados') || []);
  console.log('parámetros: ', parametros);

  let opcionesParametros = '';
  for (const parametro of parametros) {
    opcionesParametros += `<option value='${parametro}'>${parametro}</option>`;
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
      <select class='tipo-texto parametro-grafica'>
        ${opcionesParametros}
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
  let columnas = [];
  if (window.datosExcelGlobal) {
    window.datosGrafica = window.datosExcelGlobal.hojas[
      Object.keys(window.datosExcelGlobal.hojas)[0]
    ];
    columnas = window.datosGrafica[0].slice(3);
  }

  tarjetaGrafica.querySelector('.boton-formulas').addEventListener('click', () =>
    crearCuadroFormulas(columnas, nuevaId, window.datosGrafica));

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

module.exports = { agregarGrafica };