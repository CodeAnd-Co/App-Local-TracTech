// RF36 - Usuario añade gráfica a reporte - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF36
// RF38 - Usuario modifica gráfica en reporte - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF38
const Chart = require('chart.js/auto');
const ChartDataLabels = require('chartjs-plugin-datalabels');
Chart.register(ChartDataLabels);


/**
 * Agrega una nueva tarjeta de gráfica y su previsualización.
 * @param {string} contenedorId - ID del contenedor donde se agregará la tarjeta de gráfica.
 * @param {string} previsualizacionId - ID del contenedor de previsualización de la gráfica.
 */
function agregarGrafica(contenedorId, previsualizacionId) {
  const contenedor = document.getElementById(contenedorId);
  const previsualizacion = document.getElementById(previsualizacionId);

  //Crear tarjeta
  const tarjetaGrafica = document.createElement('div');
  tarjetaGrafica.classList.add('tarjeta-grafica');

  //Calcular ID único
  const tarjetasExistentes = contenedor.querySelectorAll('.tarjeta-grafica');
  const nuevaId = tarjetasExistentes.length
    ? parseInt(tarjetasExistentes[tarjetasExistentes.length - 1].id, 10) + 1
    : 1;
  tarjetaGrafica.id = nuevaId;

  //Inyectar HTML base: nombre, selector tipo (igual a agregarTexto.js), botones
  tarjetaGrafica.innerHTML = `
    <input class="titulo-grafica" placeholder="Nombre de la gráfica" />
    <div class="titulo-texto">
      <select class="tipo-texto tipo-grafica">
        <option value="line">Línea</option>
        <option value="bar">Barras</option>
        <option value="pie">Pastel</option>
        <option value="doughnut">Dona</option>
        <option value="radar">Radar</option>
        <option value="polarArea">Polar</option>
      </select>
      <img class="type" src="../utils/iconos/GraficaBarras.svg" alt="Icono Gráfica" />
    </div>
    <div class="boton-formulas">
      <div class="formulas">Fórmulas</div>
    </div>
    <div class="botones-eliminar" style="display: flex; justify-content: flex-end;">
      <div class="eliminar">
        <img class="eliminar-icono" src="../utils/iconos/Basura.svg" />
        <div class="texto-eliminar">Eliminar</div>
      </div>
    </div>
  `;

  //Datos disponibles
  let columnas = [];
  if (window.datosExcelGlobal) {
    window.datosGrafica = window.datosExcelGlobal.hojas[
      Object.keys(window.datosExcelGlobal.hojas)[0]
    ];
    columnas = window.datosGrafica[0].slice(3);
  }

  //Botón Fórmulas
  tarjetaGrafica
    .querySelector('.boton-formulas')
    .addEventListener('click', () =>
      crearCuadroFormulas(columnas, nuevaId, window.datosGrafica));

  //Área de previsualización
  const graficaDiv = document.createElement('div');
  graficaDiv.className = 'previsualizacion-grafica';
  graficaDiv.id = nuevaId;

  const canvasGrafica = document.createElement('canvas');
  const contexto = canvasGrafica.getContext('2d');
  graficaDiv.appendChild(canvasGrafica);

  //Iniciar Chart.js
  const grafico = crearGrafica(contexto, 'line');

  graficaDiv.appendChild(canvasGrafica);

  //Cambiar título dinámicamente
  tarjetaGrafica
    .querySelector('.titulo-grafica')
    .addEventListener('input', function () {
      const contexto = encontrarGrafica(nuevaId).children[0].getContext('2d');
      const graficaEncontrada = Chart.getChart(contexto);

      graficaEncontrada.options.plugins.title.text = this.value;
      graficaEncontrada.update();
    });

  //Selector de tipo de gráfica
  const selectorTipoGrafica = tarjetaGrafica.querySelector('.tipo-grafica');
  selectorTipoGrafica.value = grafico.config.type;
  selectorTipoGrafica.addEventListener('change', () => {
    const contexto = encontrarGrafica(nuevaId).children[0].getContext('2d');

    Chart.getChart(contexto).destroy();

    const nuevaGrafica = crearGrafica(contexto, selectorTipoGrafica.value);
    nuevaGrafica.options.plugins.title.text = tarjetaGrafica.querySelector('.titulo-grafica').value;
    nuevaGrafica.update();
  });

  //Eliminar gráfica
  tarjetaGrafica
    .querySelector('.eliminar')
    .addEventListener('click', () => {
      tarjetaGrafica.remove();
      const graficaEliminada = encontrarGrafica(nuevaId); // función original :contentReference[oaicite:2]{index=2}&#8203;:contentReference[oaicite:3]{index=3}
      if (graficaEliminada) graficaEliminada.remove();
      eliminarCuadroFormulas();
    });

  // 11) Añadir al DOM
  contenedor.appendChild(tarjetaGrafica);
  previsualizacion.appendChild(graficaDiv);
}
/**
 * Crea un cuadro de fórmulas asociado a una gráfica.
 * @param {string[]} columnas - Lista de columnas disponibles en los datos.
 * @param {number} idGrafica - ID de la gráfica asociada.
 */
function crearCuadroFormulas(columnas) {
  if (eliminarCuadroFormulas()) {
    console.error('Cuadro de fórmulas existía');
  }

  const cuadroFormulas = document.createElement('div');
  cuadroFormulas.className = 'contenedor-formulas';

  cuadroFormulas.innerHTML = `<div class="titulo-formulas">
              <img class="flecha-atras" src="../utils/iconos/FlechaAtras.svg" />
              <p class="texto">Fórmulas</p>
          </div>
          <div class="seccion-formulas">
              <div class="opciones-seccion">
                  <p>Parámetros</p>
                  <div class="opciones-carta">
                  </div>
              </div>
              <div class="opciones-seccion">
                  <div class="titulo-aplicar-formulas">
                      <p>Aplicar Fórmula</p>
                      <img class="circulo-ayuda" src="../utils/iconos/circulo-ayuda.svg" />
                  </div>
                  <div class="opciones-carta">
                      <input class="search-section" placeholder="Encuentra una fórmula">
                      <div class="contenedor-busqueda">
                          <div class="formula">
                              f(y): y + k
                          </div>
                          <div class="formula">
                              f(y): 2x
                          </div>
                          <div class="formula">
                              f(y): y + k
                          </div>
                      </div>
                      <div class="boton-agregar">
                          <div >Aplicar Fórmula</div>
                      </div>
                  </div>
              </div>
          </div>`;

  const contenedoesSeleccion = cuadroFormulas.querySelectorAll('.opciones-carta');

  //ToDo: Escalar en número de variables dependiendo de las variables en las fórmulas
  crearMenuDesplegable(contenedoesSeleccion[0], 'A', columnas);
  contenedoesSeleccion[1] //Fórmulas

  const botonRegresar = cuadroFormulas.querySelector('.titulo-formulas');
  botonRegresar.addEventListener('click', () => {
    cuadroFormulas.remove();
  });

  // 1) Busca la sección de elementos de reporte
  const reporteSection = document.querySelector('.seccion-elemento-reporte');
  // 2) Inserta el panel justo después de esa sección
  if (reporteSection) {
    reporteSection.insertAdjacentElement('afterend', cuadroFormulas);
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
  const seleccValores = document.createElement('select');
  seleccValores.className = 'opcion-texto';
  seleccValores.innerHTML = '<option>-- Selecciona Columna --</option>'
  columnas.forEach((texto) => {
    seleccValores.innerHTML = `${seleccValores.innerHTML}
    <option> ${texto} </option>`
  });

  nuevo.appendChild(divLetra);
  nuevo.appendChild(seleccValores);
  contenedor.appendChild(nuevo);
}

/**
 * Encuentra una gráfica en la previsualización por ID.
 * @param {string|number} id - ID de la gráfica a buscar.
 * @returns {HTMLElement} Gráfica encontrada.
 */
function encontrarGrafica(id) {
  const graficasExistentes = Array.from(window.previsualizacion.querySelectorAll('.previsualizacion-grafica'));
  return graficasExistentes.filter(grafica => grafica.id == id)[0];
}

/**
 * Verifica si existe un cuadro de fórmulas y lo elimina si existe.
 * @returns {boolean} True si existía un cuadro de fórmulas, false en caso contrario.
 */
function eliminarCuadroFormulas() {
  const cuadrosExistentes = Array.from(document.querySelector('.frame-analisis').children);
  const cuadros = cuadrosExistentes.filter(cuadro => cuadro.className == 'contenedor-formulas');
  if (cuadros.length == 1) {
    cuadros[0].remove()
    return true
  } else {
    return false
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
    console.error('No se encontró el contexto del canvas');
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

  const colores = generarDegradadoHaciaBlanco(color, 7)
  color = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;

  const grafico = new Chart(contexto, {
    type: tipo,
    data: {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [{
        label: 'Datos',
        backgroundColor: fondo => {
          if (tipo == 'line' || tipo == 'radar') {
            return color;
          } else {
            return colores[fondo.dataIndex];
          }
        },
        borderColor: borde => {
          if (tipo == 'line' || tipo == 'radar') {
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
            if (['line', 'radar', 'polar'].includes(tipo)) {
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
    // Crea un arreglo de la longitud de pasps
    { length: pasos },
    //Ejecuta la siguiente gunción en cada valor del arreglo
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