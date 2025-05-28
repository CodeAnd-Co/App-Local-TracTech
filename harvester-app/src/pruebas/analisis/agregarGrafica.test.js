// Configurar la ruta base global ANTES de los mocks
global.rutaBase = `${__dirname}`.replace(/\\/g, '/').split('src/')[0];

const { JSDOM } = require('jsdom');

// Mock de las dependencias estáticas (que no dependen de rutaBase)
jest.mock('chart.js/auto', () => {
  function Chart(ctx, config) {
    this.config = config;
    this.options = {
      plugins: {
        title: { text: '' }
      }
    };
    this.update = jest.fn();
    this.destroy = jest.fn();
    
    // Simular que el chart se registra globalmente
    Chart._instances = Chart._instances || new Map();
    Chart._instances.set(ctx, this);
  }
  
  Chart.getChart = (ctx) => Chart._instances?.get(ctx);
  Chart.register = jest.fn();
  
  return Chart;
});

jest.mock('chartjs-plugin-datalabels', () => ({}));

jest.mock('sweetalert2', () => ({
  fire: jest.fn().mockResolvedValue({ isConfirmed: false, isDenied: false })
}));

// Usar jest.doMock para mocks que dependen de rutaBase
jest.doMock(`${global.rutaBase}src/backend/data/analisisModelos/elementoReporte.js`, () => ({
  ElementoNuevo: class {
    constructor(tarjeta, previsualizacion) {
      this.tarjeta = tarjeta;
      this.previsualizacion = previsualizacion;
    }
  },
  Contenedores: class {
    constructor(contenedorTarjeta, contenedorPrevisualizacion) {
      this.contenedorTarjeta = contenedorTarjeta;
      this.contenedorPrevisualizacion = contenedorPrevisualizacion;
    }
  }
}));

const { agregarGrafica } = require(`${global.rutaBase}src/framework/utils/scripts/paginas/analisis/agregarGrafica.js`);

describe('agregarGrafica', () => {
  let dom;
  let document;
  let window;
  let contenedor;
  let previsualizacion;

  beforeEach(() => {
    // Configurar JSDOM
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <div id="contenedorElementos"></div>
          <div id="contenedor-elementos-previsualizacion"></div>
        </body>
      </html>
    `);
    
    document = dom.window.document;
    window = dom.window;
    
    // Configurar globals
    global.document = document;
    global.window = window;
    global.HTMLElement = window.HTMLElement;
    global.HTMLDivElement = window.HTMLDivElement;
    global.HTMLCanvasElement = window.HTMLCanvasElement;
    
    contenedor = document.getElementById('contenedorElementos');
    previsualizacion = document.getElementById('contenedor-elementos-previsualizacion');
    
    // Mock de canvas context
    window.HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
      canvas: {},
      fillRect: jest.fn(),
      clearRect: jest.fn(),
      getImageData: jest.fn(),
      putImageData: jest.fn(),
      createImageData: jest.fn(),
      setTransform: jest.fn(),
      drawImage: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      closePath: jest.fn(),
      stroke: jest.fn(),
      fill: jest.fn(),
    }));
  });

  afterEach(() => {
    dom.window.close();
  });

  test('Crear gráfica correctamente', () => {
    // Ejecutar
    const tarjetaGrafica = agregarGrafica('contenedorElementos', 'contenedor-elementos-previsualizacion');

    // Verificar que se creó la tarjeta de gráfica
    expect(tarjetaGrafica).toBeDefined();
    expect(tarjetaGrafica.classList.contains('tarjeta-grafica')).toBe(true);
    expect(tarjetaGrafica.id).toBe('1');

    // Verificar que se agregó al contenedor
    expect(contenedor.children.length).toBe(1);
    expect(contenedor.children[0]).toBe(tarjetaGrafica);

    // Verificar que se creó la previsualización
    expect(previsualizacion.children.length).toBe(1);
    expect(previsualizacion.children[0].classList.contains('previsualizacion-grafica')).toBe(true);
    expect(previsualizacion.children[0].id).toBe('previsualizacion-grafica-1');

    // Verificar que contiene un canvas
    const canvas = previsualizacion.children[0].querySelector('canvas');
    expect(canvas).toBeDefined();

    // Verificar elementos de la interfaz
    expect(tarjetaGrafica.querySelector('.titulo-grafica')).toBeDefined();
    expect(tarjetaGrafica.querySelector('.tipo-grafica')).toBeDefined();
    expect(tarjetaGrafica.querySelector('.boton-formulas')).toBeDefined();
    expect(tarjetaGrafica.querySelector('.eliminar')).toBeDefined();
  });

  test('Modificar título de la gráfica', () => {
    // Preparar
    const tarjetaGrafica = agregarGrafica('contenedorElementos', 'contenedor-elementos-previsualizacion');
    const inputTitulo = tarjetaGrafica.querySelector('.titulo-grafica');
    const nuevoTitulo = 'Mi Nueva Gráfica';

    // Mock del Chart.getChart para simular una instancia existente
    const mockChart = {
      options: {
        plugins: {
          title: { text: '' }
        }
      },
      update: jest.fn()
    };
    
    const Chart = require('chart.js/auto');
    Chart.getChart = jest.fn(() => mockChart);

    // Ejecutar
    inputTitulo.value = nuevoTitulo;
    inputTitulo.dispatchEvent(new window.Event('input'));

    // Verificar que el título se actualizó en el chart
    expect(mockChart.options.plugins.title.text).toBe(nuevoTitulo);
    expect(mockChart.update).toHaveBeenCalled();

    // Verificar que se muestra el contador de caracteres
    const contador = tarjetaGrafica.querySelector('.contador-caracteres');
    expect(contador).toBeDefined();
    expect(contador.textContent).toBe(`${nuevoTitulo.length}/30 caracteres`);
  });

  test('Título se muestra correctamente en la gráfica', () => {
    // Preparar
    const tarjetaGrafica = agregarGrafica('contenedorElementos', 'contenedor-elementos-previsualizacion');
    const inputTitulo = tarjetaGrafica.querySelector('.titulo-grafica');
    const titulo = 'Gráfica de Ventas';

    const mockChart = {
      options: {
        plugins: {
          title: { text: '' }
        }
      },
      update: jest.fn()
    };

    const Chart = require('chart.js/auto');
    Chart.getChart = jest.fn(() => mockChart);

    // Ejecutar - simular que el usuario escribe en el input
    inputTitulo.value = titulo;
    inputTitulo.dispatchEvent(new window.Event('input'));

    // Verificar que el título se estableció correctamente en la gráfica
    expect(mockChart.options.plugins.title.text).toBe(titulo);
    expect(mockChart.update).toHaveBeenCalled();

    // Verificar que el input mantiene el valor
    expect(inputTitulo.value).toBe(titulo);
  });

  test('Eliminar gráfica', () => {
    // Preparar
    const tarjetaGrafica = agregarGrafica('contenedorElementos', 'contenedor-elementos-previsualizacion');
    const botonEliminar = tarjetaGrafica.querySelector('.eliminar');

    // Verificar estado inicial
    expect(contenedor.children.length).toBe(1);
    expect(previsualizacion.children.length).toBe(1);

    // Ejecutar
    botonEliminar.click();

    // Verificar que se eliminó la tarjeta del contenedor
    expect(contenedor.children.length).toBe(0);

    // Verificar que se eliminó la previsualización
    expect(previsualizacion.children.length).toBe(0);

    // Verificar que la tarjeta ya no tiene padre (fue removida del DOM)
    expect(tarjetaGrafica.parentNode).toBeNull();
  });

  test('Crear múltiples gráficas con IDs incrementales', () => {
    // Ejecutar - crear tres gráficas
    const grafica1 = agregarGrafica('contenedorElementos', 'contenedor-elementos-previsualizacion');
    const grafica2 = agregarGrafica('contenedorElementos', 'contenedor-elementos-previsualizacion');
    const grafica3 = agregarGrafica('contenedorElementos', 'contenedor-elementos-previsualizacion');

    // Verificar que tienen IDs secuenciales
    expect(grafica1.id).toBe('1');
    expect(grafica2.id).toBe('2');
    expect(grafica3.id).toBe('3');

    // Verificar que todas están en el contenedor
    expect(contenedor.children.length).toBe(3);
    expect(previsualizacion.children.length).toBe(3);
  });
});