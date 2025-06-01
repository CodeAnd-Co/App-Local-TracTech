// RF36 - Usuario añade gráfica a reporte - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF36
// RF37 - Usuario modifica gráfica en reporte - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/rf37/
// RF38 - Usuario elimina gráfica en reporte - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/rf38/
// RF70 - Usuario carga formula - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/rf70/
const Chart = require('chart.js/auto');
const ChartDataLabels = require('chartjs-plugin-datalabels');
Chart.register(ChartDataLabels);
const { ElementoNuevo, Contenedores } = require(`${rutaBase}/src/backend/data/analisisModelos/elementoReporte.js`);
const { consultaFormulasCasoUso } = require(`${rutaBase}src/backend/casosUso/formulas/consultaFormulas.js`);
const { mostrarAlerta } = require(`${rutaBase}/src/framework/vistas/includes/componentes/moleculas/alertaSwal/alertaSwal.js`);

/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
if (typeof Swal === 'undefined') {
  const Swal = require(`${rutaBase}/node_modules/sweetalert2/dist/sweetalert2.all.min.js`);
}

// Variable global para almacenar las fórmulas consultadas
let formulasDisponibles = [];

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
  let columnas = [];
  if (window.datosExcelGlobal) {
    window.datosGrafica = window.datosExcelGlobal.hojas[
      Object.keys(window.datosExcelGlobal.hojas)[0]
    ];
    columnas = window.datosGrafica[0].slice(3);
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
    
    elementoFormula.innerHTML = `
      <input type="radio" 
             id="${radioId}" 
             name="formula-seleccionada" 
             value="${formula.idFormula}"
             data-formula-nombre="${formula.Nombre}"
             data-formula-datos="${formula.Datos}"
             style="display: none;">
      <div class="formula" data-radio-id="${radioId}">
        <label for="${radioId}" class="formula-label">${formula.Nombre}</label>
      </div>
    `;
    
    // Agregar evento de clic al div .formula
    const divFormula = elementoFormula.querySelector('.formula');
    const radioButton = elementoFormula.querySelector('input[type="radio"]');
    
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
    nombre: radioBotton.dataset.formulaNombre,
    datos: radioBotton.dataset.formulaDatos
  };
  
  // Almacenar en el elemento padre para acceso posterior
  const cuadroFormulas = contenedor.closest('.contenedor-formulas');
  if (cuadroFormulas) {
    cuadroFormulas.dataset.formulaSeleccionada = JSON.stringify(formulaSeleccionada);
  }
  
  console.log('Fórmula seleccionada:', formulaSeleccionada);
}

/**
 * Crea un cuadro de fórmulas asociado a una gráfica.
 * @param {string[]} columnas - Lista de columnas disponibles en los datos.
 * @param {number} graficaId - ID de la gráfica asociada.
 * @param {Array} datosGrafica - Datos de la gráfica.
 * @returns {void}
 */ // eslint-disable-next-line no-unused-vars
async function crearCuadroFormulas(columnas, graficaId, datosGrafica) {
  eliminarCuadroFormulas();

  // Cargar fórmulas una sola vez al inicio
  await cargarFormulasIniciales();

  const cuadroFormulas = document.createElement('div');
  cuadroFormulas.className = 'contenedor-formulas';
  
  // Almacenar el ID de la gráfica en el dataset
  cuadroFormulas.dataset.graficaId = graficaId;

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
  crearMenuDesplegable(contenedoesSeleccion[0], 'A', columnas);

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

  // Buscar el input radio en el elemento padre (formula-objeto)
  const formulaObjeto = formulaSeleccionada.closest('.formula-objeto');
  const inputRadio = formulaObjeto.querySelector('input[type="radio"]');
  
  if (!inputRadio) {
    mostrarAlerta('Error', 'Error al obtener los datos de la fórmula seleccionada.', 'error');
    return;
  }

  const idFormula = inputRadio.value;
  const nombreFormula = formulaSeleccionada.querySelector('.formula-label').textContent;

  // Obtener la gráfica asociada
  const graficaId = cuadroFormulas.dataset.graficaId;
  const graficaDiv = document.getElementById(`previsualizacion-grafica-${graficaId}`);
  
  if (graficaDiv) {
    // Aquí puedes aplicar la fórmula a la gráfica
    console.log(`Aplicando fórmula ${nombreFormula} (ID: ${idFormula}) a la gráfica ${graficaId}`);
    // Lógica para aplicar la fórmula a la gráfica...
  } else {
    mostrarAlerta('Error', 'No se encontró la gráfica asociada.', 'error');
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
 * @returns {void}
 */
function crearMenuDesplegable(contenedor, letra, columnas) {
  const nuevoMenu = document.createElement('div');
  nuevoMenu.className = 'opcion';
  const seleccionValores = document.createElement('select');
  seleccionValores.className = 'opcion-texto';
  seleccionValores.innerHTML = '<option>-- Selecciona Columna --</option>'
  columnas.forEach((texto) => {
    seleccionValores.innerHTML = `${seleccionValores.innerHTML}
    <option> ${texto} </option>`
  });

  nuevoMenu.appendChild(seleccionValores);
  contenedor.appendChild(nuevoMenu);
}

/**
 * Verifica si existe un cuadro de fórmulas y lo elimina si existe.
 * 
 * @returns {void} True si existía un cuadro de fórmulas, false en caso contrario.
 */
function eliminarCuadroFormulas() {
  const contenedorAnalisis = document.querySelector('.frame-analisis');
  if (!contenedorAnalisis) return false;

  const cuadrosExistentes = Array.from(contenedorAnalisis.children);
  const cuadros = cuadrosExistentes.filter(cuadro => cuadro.className == 'contenedor-formulas');
  if (cuadros.length == 1) {
    cuadros[0].remove()
  }
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
      graficaOriginal.destroy();
      const nuevaGrafica = crearGrafica(contexto, selectorTipo.value);
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