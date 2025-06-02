const Chart = require('chart.js/auto');

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


module.exports = { 
    crearGrafica,
};


