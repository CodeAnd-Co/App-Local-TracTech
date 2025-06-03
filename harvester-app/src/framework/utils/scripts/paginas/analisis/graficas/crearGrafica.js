const Chart = require('chart.js/auto');
const ChartDataLabels = require('chartjs-plugin-datalabels');
Chart.register(ChartDataLabels);

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

  module.exports = {
    crearGrafica,
    generarDegradadoHaciaBlanco
  };