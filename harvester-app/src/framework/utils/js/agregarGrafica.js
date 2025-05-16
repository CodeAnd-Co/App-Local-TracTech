// RF36 - Usuario añade gráfica a reporte - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF36
// RF38 - Usuario modifica gráfica en reporte - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF38
const Chart = require('chart.js/auto');
const ChartDataLabels = require('chartjs-plugin-datalabels');
Chart.register(ChartDataLabels);


/**
 * Agrega una nueva tarjeta de gráfica y su previsualización.
 *
 * @param {string} contenedorId            - ID del contenedor donde se agregará la tarjeta de gráfica.
 * @param {string} previsualizacionId      - ID del contenedor de previsualización de la gráfica.
 * @param {Element|null} tarjetaRef        - Tarjeta existente junto a la cual insertar (null = al final).
 * @param {'antes'|'despues'} posicion     - 'antes' o 'despues' respecto a tarjetaRef.
 */
function agregarGrafica(contenedorId, previsualizacionId, tarjetaRef = null, posicion = null) {
  const contenedor = document.getElementById(contenedorId);
  const previsualizacion = document.getElementById(previsualizacionId);
  
  // Guardar referencia global al contenedor de previsualización
  window.previsualizacion = previsualizacion;

  // Crear tarjeta de edición
  const tarjetaGrafica = document.createElement('div');
  tarjetaGrafica.classList.add('tarjeta-grafica');

  // Calcular ID único con timestamp
  const marcaTiempo = new Date().getTime();
  const nuevaId = `grafica_${marcaTiempo}`;
  tarjetaGrafica.id = nuevaId;

  // Inyectar HTML base
  tarjetaGrafica.innerHTML = `
    <input class='titulo-grafica' placeholder='Nombre de la gráfica' />
    <div class='titulo-texto'>
      <select class='tipo-texto tipo-grafica'>
        <option value='line'>Línea</option>
        <option value='bar'>Barras</option>
        <option value='pie'>Pastel</option>
        <option value='doughnut'>Dona</option>
        <option value='radar'>Radar</option>
        <option value='polarArea'>Polar</option>
      </select>
      <img class='type' src='../utils/iconos/GraficaBarras.svg' alt='Icono Gráfica' />
    </div>
    <div class='boton-formulas'>
      <div class='formulas'>Fórmulas</div>
    </div>
    <div class='botones-eliminar' style='display: flex; justify-content: flex-end;'>
      <div class='eliminar'>
        <img class='eliminar-icono' src='../utils/iconos/Basura.svg' />
        <div class='texto-eliminar'>Eliminar</div>
      </div>
    </div>
  `;

  // Datos disponibles para fórmulas
  let columnas = [];
  if (window.datosExcelGlobal) {
    window.datosGrafica = window.datosExcelGlobal.hojas[
      Object.keys(window.datosExcelGlobal.hojas)[0]
    ];
    columnas = window.datosGrafica[0].slice(3);
  }

  // Botón 'Fórmulas'
  tarjetaGrafica
    .querySelector('.boton-formulas')
    .addEventListener('click', () =>
      crearCuadroFormulas(columnas, nuevaId, window.datosGrafica));

  // Contenedor de previsualización
  const graficaDiv = document.createElement('div');
  graficaDiv.className = 'previsualizacion-grafica';
  graficaDiv.id = `grafica-${nuevaId}`; 
  graficaDiv.setAttribute('data-tarjeta-id', nuevaId);
  const canvasGrafica = document.createElement('canvas');
  graficaDiv.appendChild(canvasGrafica);

  // Inicializar Chart.js
  const contexto = canvasGrafica.getContext('2d');
  const grafico = crearGrafica(contexto, 'line');
  grafico.options.plugins.title.text = '';
  grafico.update();

  // Listener para título dinámico
  tarjetaGrafica
    .querySelector('.titulo-grafica')
    .addEventListener('input', function () {
      const tarjetaActual = this.closest('.tarjeta-grafica');
      const idTarjetaActual = tarjetaActual.id;
      
      const grafica = encontrarGrafica(idTarjetaActual);
      if (grafica) {
        const ctx = grafica.querySelector('canvas').getContext('2d');
        const tabla = Chart.getChart(ctx);
        if (tabla) {
          tabla.options.plugins.title.text = this.value;
          tabla.update();
        }
      }
    });

  // Selector de tipo de gráfica
  const selectorTipo = tarjetaGrafica.querySelector('.tipo-grafica');
  selectorTipo.value = grafico.config.type;
  selectorTipo.addEventListener('change', function() {
    const tarjetaActual = this.closest('.tarjeta-grafica');
    const idTarjetaActual = tarjetaActual.id;
    
    const grafica = encontrarGrafica(idTarjetaActual);
    if (grafica) {
      const ctx = grafica.querySelector('canvas').getContext('2d');
      const tabla = Chart.getChart(ctx);
      if (tabla) {
        tabla.destroy();
        const nueva = crearGrafica(ctx, this.value);
        nueva.options.plugins.title.text = tarjetaActual.querySelector('.titulo-grafica').value;
        nueva.update();
      }
    }
  });

  // Botón 'Eliminar'
  tarjetaGrafica
    .querySelector('.eliminar')
    .addEventListener('click', function() {
      const tarjetaActual = this.closest('.tarjeta-grafica');
      const idTarjetaActual = tarjetaActual.id;
      
      tarjetaActual.remove();
      const eliminado = encontrarGrafica(idTarjetaActual);
      if (eliminado) {
        eliminado.remove();
      }
      eliminarCuadroFormulas();
    });

  // Añadir al DOM con inserción 'antes/después'
  if (tarjetaRef && (posicion === 'antes' || posicion === 'despues')) {
    // En el contenedor de edición
    if (posicion === 'antes') {
      contenedor.insertBefore(tarjetaGrafica, tarjetaRef);
    } else {
      contenedor.insertBefore(tarjetaGrafica, tarjetaRef.nextSibling);
    }
    
    // En la previsualización
    const idRef = tarjetaRef.id;
    let vistaRef;
    
    if (tarjetaRef.classList.contains('tarjeta-texto')) {
      vistaRef = previsualizacion.querySelector(`#preview-texto-${idRef}`);
      if (!vistaRef) {
        vistaRef = previsualizacion.querySelector(`.previsualizacion-texto[data-tarjeta-id='${idRef}']`);
      }
    } else if (tarjetaRef.classList.contains('tarjeta-grafica')) {
      vistaRef = previsualizacion.querySelector(`.previsualizacion-grafica[data-tarjeta-id='${idRef}']`);
    }
    
    if (vistaRef) {
      if (posicion === 'antes') {
        previsualizacion.insertBefore(graficaDiv, vistaRef);
      } else {
        previsualizacion.insertBefore(graficaDiv, vistaRef.nextSibling);
      }
    } else {
      previsualizacion.appendChild(graficaDiv);
    }
  } else {
    // Sin referencia: comportamiento original
    contenedor.appendChild(tarjetaGrafica);
    previsualizacion.appendChild(graficaDiv);
  }
}

/**
 * Encuentra una gráfica en la previsualización por ID.
 * @param {string|number} id - ID exacto de la tarjeta gráfica a buscar.
 * @returns {HTMLElement|null} Gráfica encontrada o null si no se encuentra.
 */
function encontrarGrafica(id) {
  if (!window.previsualizacion) {
    return null;
  }
  
  const idCadena = String(id);
  const graficasExistentes = Array.from(window.previsualizacion.querySelectorAll('.previsualizacion-grafica'));
  
  const porAtributo = graficasExistentes.find(grafica => grafica.getAttribute('data-tarjeta-id') === idCadena);
  if (porAtributo) {
    return porAtributo;
  }
  
  return null;
}

/**
 * Crea un cuadro de fórmulas asociado a una gráfica.
 * @param {string[]} columnas - Lista de columnas disponibles en los datos.
 * @param {number} idGrafica - ID de la gráfica asociada.
 */
function crearCuadroFormulas(columnas) {
  if (eliminarCuadroFormulas()) {
    // Un cuadro de fórmulas ya existía y fue eliminado
  }

  const cuadroFormulas = document.createElement('div');
  cuadroFormulas.className = 'contenedor-formulas';

  cuadroFormulas.innerHTML = `<div class='titulo-formulas'>
              <img class='flecha-atras' src='../utils/iconos/FlechaAtras.svg' />
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
                      <img class='circulo-ayuda' src='../utils/iconos/circulo-ayuda.svg' />
                  </div>
                  <div class='opciones-carta'>
                      <input class='search-section' placeholder='Encuentra una fórmula'>
                      <div class='contenedor-busqueda'>
                          <div class='formula'>
                              f(y): y + k
                          </div>
                          <div class='formula'>
                              f(y): 2x
                          </div>
                          <div class='formula'>
                              f(y): y + k
                          </div>
                      </div>
                      <div class='boton-agregar'>
                          <div >Aplicar Fórmula</div>
                      </div>
                  </div>
              </div>
          </div>`;

  const contenedoresSeleccion = cuadroFormulas.querySelectorAll('.opciones-carta');

  //ToDo: Escalar en número de variables dependiendo de las variables en las fórmulas
  crearMenuDesplegable(contenedoresSeleccion[0], 'A', columnas);
  // Fórmulas en contenedoresSeleccion[1]

  const botonRegresar = cuadroFormulas.querySelector('.titulo-formulas');
  botonRegresar.addEventListener('click', () => {
    cuadroFormulas.remove();
  });

  // 1) Busca la sección de elementos de reporte
  const seccionReporte = document.querySelector('.seccion-elemento-reporte');
  // 2) Inserta el panel justo después de esa sección
  if (seccionReporte) {
    seccionReporte.insertAdjacentElement('afterend', cuadroFormulas);
  } else {
    // Fallback: si no lo encuentra, lo añade al final del frame
    document.querySelector('.frame-analisis').appendChild(cuadroFormulas);
  }
}

/**
 * Crea un menú desplegable para seleccionar columnas.
 * @param {HTMLElement} contenedor - Contenedor donde se agregará el menú desplegable.
 * @param {string} letra - Letra identificadora del menú.
 * @param {string[]} columnas - Lista de columnas disponibles.
 */
function crearMenuDesplegable(contenedor, letra, columnas) {
  const nuevo = document.createElement('div');
  nuevo.className = 'opcion';
  const divLetra = document.createElement('div');
  divLetra.className = 'opcion-letra';
  divLetra.innerHTML = letra;
  const seleccionarValores = document.createElement('select');
  seleccionarValores.className = 'opcion-texto';
  seleccionarValores.innerHTML = '<option>-- Selecciona Columna --</option>';
  columnas.forEach((texto) => {
    seleccionarValores.innerHTML = `${seleccionarValores.innerHTML}
    <option> ${texto} </option>`;
  });

  nuevo.appendChild(divLetra);
  nuevo.appendChild(seleccionarValores);
  contenedor.appendChild(nuevo);
}

/**
 * Verifica si existe un cuadro de fórmulas y lo elimina si existe.
 * @returns {boolean} True si existía un cuadro de fórmulas, false en caso contrario.
 */
function eliminarCuadroFormulas() {
  const frameAnalisis = document.querySelector('.frame-analisis');
  if (!frameAnalisis) return false;
  
  const cuadrosExistentes = Array.from(frameAnalisis.children);
  const cuadros = cuadrosExistentes.filter(cuadro => cuadro.className === 'contenedor-formulas');
  if (cuadros.length === 1) {
    cuadros[0].remove();
    return true;
  } else {
    return false;
  }
}

/**
 * Crea una gráfica utilizando Chart.js.
 * @param {CanvasRenderingContext2D} contexto - 2dcontext del canvas donde se dibujará la gráfica.
 * @param {String} tipo - String que representa el tipo de gráfica (ej. 'line', 'bar', 'pie', 'doughnut', 'radar', 'polarArea').
 * @param {Int[]} color - Arreglo de 3 enteros que representan el color RGB de la gráfica.
 * @returns {Chart} - Instancia de la gráfica creada.
 */
function crearGrafica(contexto, tipo, color) {
  if (!contexto) {
    return;
  }
  
  // Color por defecto
  if (!color) {
    color = [255, 99, 132];
  }
  // Tipo por defecto
  if (!tipo) {
    tipo = 'line';
  }

  const colores = generarDegradadoHaciaBlanco(color, 7);
  color = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;

  const grafico = new Chart(contexto, {
    type: tipo,
    data: {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio'],
      datasets: [{
        label: 'Datos',
        backgroundColor: fondo => {
          if (tipo === 'line' || tipo === 'radar') {
            return color;
          } else {
            return colores[fondo.dataIndex];
          }
        },
        borderColor: borde => {
          if (tipo === 'line' || tipo === 'radar') {
            return color;
          } else {
            return colores[borde.dataIndex];
          }
        },
        data: [5, 10, 5, 2, 20, 30, 45]
      }]
    },
    options: {
      plugins: {
        title: { display: true },
        tooltip: {
          enabled: false,
        },
        legend: {
          labels: {
            generateLabels: chart =>
              chart.data.datasets.map(ds => ({
                text: ds.label || 'Datos',
                fillStyle: color,
                strokeStyle: color,
              })),
          },
        },
        datalabels: {
          display: () => {
            if (['line', 'radar', 'polarArea'].includes(tipo)) {
              return false;
            } else {
              return true;
            }
          },
          anchor: () => {
            if (tipo == 'bar') {
              return 'end';
            } else {
              return 'center';
            }
          },
          font: {
            size: 12,
            weight: 'bold'
          },
          formatter: (value, context) => { 
            if (tipo == 'pie' || tipo == 'doughnut') { 
              const datos = context.chart.data.datasets[0].data;
              const valorTotal = datos.reduce((total, datapoint) => {
                return total + datapoint;
              }, 0);
              const porcentaje = ((value / valorTotal) * 100).toFixed(2);
              return `${porcentaje}%`;
            } else {
              return value;
            }
          },
        }
      },
      scales: {
        /* eslint-disable id-length */
        x: { ticks: { color: '#646464' }, grid: { color: '#9e9e9e' } },
        /* eslint-disable id-length */
        y: { ticks: { color: '#646464' }, grid: { color: '#9e9e9e' } }
      }
    },
  });

  return grafico;
}

/**
 * Crea un arreglo de colores en formato rgb que van desde el color dado hasta el blanco.
 * @param {Int[]} rgb - Arreglo de 3 enteros que representan el color RGB inicial.
 * @param {Int} pasos - Número de pasos para el degradado.
 * @returns {String[]} Arreglo de strings que representan los colores en formato rgb
 */
function generarDegradadoHaciaBlanco(rgb, pasos) {
  const [rojo, verde, azul] = rgb;

  return Array.from(
    { length: pasos },
    (__, indice) => {
      // Calcula el factor por el cual se va a multiplicar el color para acercarse un poco al blanco
      const factor = indice / (pasos); // Factor de interpolación
      const nuevoRojo = Math.round(rojo + (255 - rojo) * factor);
      const nuevoVerde = Math.round(verde + (255 - verde) * factor);
      const nuevoAzul = Math.round(azul + (255 - azul) * factor);
      return `rgb(${nuevoRojo}, ${nuevoVerde}, ${nuevoAzul})`;
    }
  );
}

// Hace la función agregarGrafica disponible en todo el proyecto
window.agregarGrafica = agregarGrafica;