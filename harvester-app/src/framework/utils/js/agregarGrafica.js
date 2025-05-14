// RF36 - Usuario añade gráfica a reporte - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF36
// RF38 - Usuario modifica gráfica en reporte - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF38
const { Chart } = require('chart.js/auto');

/**
 * Agrega una nueva tarjeta de gráfica y su previsualización.
 *
 * @param {string} contenedorId            - ID del contenedor donde se agregará la tarjeta de gráfica.
 * @param {string} previsualizacionId      - ID del contenedor de previsualización de la gráfica.
 * @param {Element|null} tarjetaRef        - Tarjeta existente junto a la cual insertar (null = al final).
 * @param {'antes'|'despues'} posicion     - 'antes' o 'despues' respecto a tarjetaRef.
 */
function agregarGrafica(contenedorId, previsualizacionId, tarjetaRef = null, posicion = null) {
  const contenedor       = document.getElementById(contenedorId);
  const previsualizacion = document.getElementById(previsualizacionId);
  
  // Guardar referencia global al contenedor de previsualización
  window.previsualizacion = previsualizacion;

  // Crear tarjeta de edición
  const tarjetaGrafica = document.createElement('div');
  tarjetaGrafica.classList.add('tarjeta-grafica');

  // Calcular ID único
  const tarjetasExistentes = contenedor.querySelectorAll('.tarjeta-grafica');
  const nuevaId = tarjetasExistentes.length
    ? parseInt(tarjetasExistentes[tarjetasExistentes.length - 1].id, 10) + 1
    : 1;
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
  graficaDiv.id = `grafica-${nuevaId}`; // Usar prefijo 'grafica-' para evitar conflictos
  graficaDiv.setAttribute('data-tarjeta-id', nuevaId); // Usar setAttribute en lugar de dataset para mayor compatibilidad
  const canvasGrafica = document.createElement('canvas');
  graficaDiv.appendChild(canvasGrafica);

  // Inicializar Chart.js
  const contexto = canvasGrafica.getContext('2d');
  const grafico  = crearGrafica(contexto, 'line');
  grafico.options.plugins.title.text = '';
  grafico.update();

  // Listener para título dinámico - CORREGIDO para usar ID de la tarjeta actual
  tarjetaGrafica
    .querySelector('.titulo-grafica')
    .addEventListener('input', function () {
      // Obtener la tarjeta actual que contiene este input
      const tarjetaActual = this.closest('.tarjeta-grafica');
      const idTarjetaActual = tarjetaActual.id;
      
      // DEBUG
      console.log('Actualizando título para tarjeta ID:', idTarjetaActual);
      
      const grafica = encontrarGrafica(idTarjetaActual);
      if (grafica) {
        console.log('Gráfica encontrada:', grafica.id);
        const ctx = grafica.querySelector('canvas').getContext('2d');
        const chart = Chart.getChart(ctx);
        if (chart) {
          chart.options.plugins.title.text = this.value;
          chart.update();
        }
      } else {
        console.error('No se encontró la gráfica para la tarjeta ID:', idTarjetaActual);
      }
    });

  // Selector de tipo de gráfica - CORREGIDO para usar tarjetaActual
  const selectorTipo = tarjetaGrafica.querySelector('.tipo-grafica');
  selectorTipo.value = grafico.config.type;
  selectorTipo.addEventListener('change', function() {
    // Obtener la tarjeta actual que contiene este selector
    const tarjetaActual = this.closest('.tarjeta-grafica');
    const idTarjetaActual = tarjetaActual.id;
    
    // DEBUG
    console.log('Cambiando tipo de gráfica para tarjeta ID:', idTarjetaActual);
    
    const grafica = encontrarGrafica(idTarjetaActual);
    if (grafica) {
      console.log('Gráfica encontrada:', grafica.id);
      const ctx = grafica.querySelector('canvas').getContext('2d');
      const chart = Chart.getChart(ctx);
      if (chart) {
        chart.destroy();
        const nueva = crearGrafica(ctx, this.value);
        // Usar el valor del título de la tarjeta actual, no de la variable 'tarjetaGrafica'
        nueva.options.plugins.title.text = tarjetaActual.querySelector('.titulo-grafica').value;
        nueva.update();
      }
    } else {
      console.error('No se encontró la gráfica para la tarjeta ID:', idTarjetaActual);
    }
  });

  // Botón 'Eliminar'
  tarjetaGrafica
    .querySelector('.eliminar')
    .addEventListener('click', function() {
      // Obtener la tarjeta actual que contiene este botón
      const tarjetaActual = this.closest('.tarjeta-grafica');
      const idTarjetaActual = tarjetaActual.id;
      
      // DEBUG
      console.log('Eliminando tarjeta ID:', idTarjetaActual);
      
      tarjetaActual.remove();
      const eliminado = encontrarGrafica(idTarjetaActual);
      if (eliminado) {
        console.log('Eliminando gráfica:', eliminado.id);
        eliminado.remove();
      } else {
        console.error('No se encontró la gráfica para eliminar con ID:', idTarjetaActual);
      }
      eliminarCuadroFormulas();
    });

  // -----------------------------------------
  // Añadir al DOM con inserción 'antes/después'
  if (tarjetaRef && (posicion === 'antes' || posicion === 'despues')) {
    // En el contenedor de edición
    if (posicion === 'antes') {
      contenedor.insertBefore(tarjetaGrafica, tarjetaRef);
    } else {
      contenedor.insertBefore(tarjetaGrafica, tarjetaRef.nextSibling);
    }
    
    // En la previsualización - CORREGIDO PARA MANEJAR REFERENCIAS A GRÁFICAS
    const idRef = tarjetaRef.id;
    // Buscar referencia correspondiente en el contenedor de previsualización
    let vistaRef;
    
    // Determinar si la tarjeta de referencia es texto o gráfica
    if (tarjetaRef.classList.contains('tarjeta-texto')) {
      vistaRef = previsualizacion.querySelector(`#preview-texto-${idRef}`);
    } else if (tarjetaRef.classList.contains('tarjeta-grafica')) {
      // Usar getAttribute para mayor compatibilidad
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

  // Para depuración: muestra las gráficas existentes después de añadir la nueva
  testGraficasExistentes();
}

/**
 * Función de depuración para verificar todas las gráficas existentes.
 */
function testGraficasExistentes() {
  if (!window.previsualizacion) return;
  
  const graficas = Array.from(window.previsualizacion.querySelectorAll('.previsualizacion-grafica'));
  console.log('=== GRÁFICAS EXISTENTES ===');
  console.log(`Total: ${graficas.length}`);
  
  graficas.forEach((g, i) => {
    console.log(`Gráfica ${i+1}:`);
    console.log(` - ID: ${g.id}`);
    console.log(` - data-tarjeta-id: ${g.getAttribute('data-tarjeta-id')}`);
  });
  
  // También mostrar las tarjetas de edición
  const tarjetas = Array.from(document.querySelectorAll('.tarjeta-grafica'));
  console.log('\n=== TARJETAS DE EDICIÓN ===');
  console.log(`Total: ${tarjetas.length}`);
  
  tarjetas.forEach((t, i) => {
    console.log(`Tarjeta ${i+1}:`);
    console.log(` - ID: ${t.id}`);
  });
  
  console.log('===========================');
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

  const contenedoesSeleccion = cuadroFormulas.querySelectorAll('.opciones-carta');

  //ToDo: Escalar en número de variables dependiendo de las variables en las fórmulas
  crearMenuDesplegable(contenedoesSeleccion[0], 'A', columnas);
  // Fórmulas en contenedoesSeleccion[1]

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
  const seleccionarValores = document.createElement('select');
  seleccionarValores.className = 'opcion-texto';
  seleccionarValores.innerHTML = '<option>-- Selecciona Columna --</option>'
  columnas.forEach((texto) => {
    seleccionarValores.innerHTML = `${seleccionarValores.innerHTML}
    <option> ${texto} </option>`
  });

  nuevo.appendChild(divLetra);
  nuevo.appendChild(seleccionarValores);
  contenedor.appendChild(nuevo);
}

/**
 * Encuentra una gráfica en la previsualización por ID.
 * @param {string|number} id - ID de la tarjeta gráfica a buscar.
 * @returns {HTMLElement|null} Gráfica encontrada o null si no se encuentra.
 */
function encontrarGrafica(id) {
  if (!window.previsualizacion) {
    console.error('No hay referencia al contenedor de previsualización');
    return null;
  }
  
  // Convertir ID a string para comparación consistente
  const idString = String(id);
  
  // DEBUG
  console.log(`Buscando gráfica para tarjeta ID: ${idString}`);
  
  const graficasExistentes = Array.from(window.previsualizacion.querySelectorAll('.previsualizacion-grafica'));
  
  // Probar primero con getAttribute para mayor compatibilidad
  const porAtributo = graficasExistentes.find(grafica => grafica.getAttribute('data-tarjeta-id') === idString);
  if (porAtributo) {
    console.log(`Encontrada gráfica por atributo: ${porAtributo.id}`);
    return porAtributo;
  }
  
  // Si no se encuentra por atributo, probar con dataset (alternativa)
  const porDataset = graficasExistentes.find(grafica => grafica.dataset && grafica.dataset.tarjetaId === idString);
  if (porDataset) {
    console.log(`Encontrada gráfica por dataset: ${porDataset.id}`);
    return porDataset;
  }
  
  // Debug: muestra todas las gráficas disponibles
  console.log('No se encontró gráfica. Todas las gráficas disponibles:');
  graficasExistentes.forEach((g, i) => {
    console.log(`- Gráfica ${i+1}: id=${g.id}, data-tarjeta-id=${g.getAttribute('data-tarjeta-id')}`);
  });
  
  return null;
}

/**
 * Verifica si existe un cuadro de fórmulas y lo elimina si existe.
 * @returns {boolean} True si existía un cuadro de fórmulas, false en caso contrario.
 */
function eliminarCuadroFormulas() {
  const frameAnalisis = document.querySelector('.frame-analisis');
  if (!frameAnalisis) return false;
  
  const cuadrosExistentes = Array.from(frameAnalisis.children);
  const cuadros = cuadrosExistentes.filter(cuadro => cuadro.className == 'contenedor-formulas');
  if (cuadros.length == 1) {
    cuadros[0].remove()
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
        label: '',
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
        title: { display: true},
        legend: {
          labels: {
            generateLabels: chart =>
              chart.data.datasets.map(ds => ({
                text: ds.label,
                fillStyle: color,
                strokeStyle: color
              }))
          },
        },
      },
      scales: {
        /* eslint-disable id-length */
        x: { ticks: { color: '#646464' }, grid: { color: '#9e9e9e' } },
        /* eslint-disable id-length */
        y: { ticks: { color: '#646464' }, grid: { color: '#9e9e9e' } }
         
      }
    }
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