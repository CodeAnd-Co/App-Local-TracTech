/**
 * @file pruebas/reportes/descargarPDF.test.js
 * @description
 * Pruebas unitarias del caso de uso `Usuario descarga pdf del reporte`, que se encarga de
 * descargar un archivo en formato pdf 
 * 
 * Se prueban los siguientes escenarios:
 * - Caso exitoso donde se descarga el archivo con extensión pdf en menos de 10 segundos.
 * - Caso exitoso donde se recibe la información correcta y se guarda en el pdf.
 * - Caso exitoso donde se reciben caracteres especiales.
 * - Caso donde el contenido es muy largo, más de 10000 caracteres
 * - Caso donde se descarga un pdf sin conexión.
 * - Fallo controlado donde el pdf no se descarga.
 * 
 * @see https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF25
 * 
 * @module pruebas/reportes/descargarPDF.test.js
 * @see módulo {@link ../../framework/utils/scripts/paginas/analisis/moduloAnalisis}
 */

/*  1. ───── Importaciones ──────────────────────────────────────────────── */
// Configurar la ruta base global ANTES de los mocks
global.rutaBase = `${__dirname}`.replace(/\\/g, '/').split('src/')[0];
const { JSDOM } = require('jsdom');
const { descargarPDF } = require('../../framework/utils/scripts/paginas/analisis/moduloAnalisis');
const Swal = require('sweetalert2');
const { ipcRenderer } = require('electron');

/*  2. ───── Mocks ──────────────────────────────────────────────────────── */
jest.mock('electron', () => ({
    ipcRenderer: {
      send: jest.fn(),
  },
}));

jest.mock('sweetalert2', () => ({
    fire: jest.fn()
}));

/*  3. ───── Mock global de jsPDF ──────────────────────────── */
const jsPDFMock = jest.fn().mockImplementation(() => ({
    setFontSize: jest.fn(),
  setFont: jest.fn(),
  splitTextToSize: jest.fn((text) => [text]),
  text: jest.fn(),
  internal: {
    pageSize: {
      getWidth: () => 595,
      getHeight: () => 842
    }
  },
  addPage: jest.fn(),
  addImage: jest.fn(),
  roundedRect: jest.fn(),
  setFillColor: jest.fn(),
  output: jest.fn().mockReturnValue({
    arrayBuffer: async () => new ArrayBuffer(8)
  })
}));

window.jspdf = { jsPDF: jsPDFMock };

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

/*  4. ───── Setup de pruebas ──────────────────────────── */
beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
})

/*  5. ───── Tests ──────────────────────────────────────────────────────── */
test('Descargar un PDF con contenido correcto', async () => {
  const contenido = 'Contenido de prueba para el PDF';
  document.body.innerHTML = `
    <div id='contenedor-elementos-previsualizacion'>
    <div class='previsualizacion-texto preview-titulo'>
      <div>${contenido}</div>
    </div>
    </div>
  `;

  await descargarPDF();

  expect(jsPDFMock).toHaveBeenCalled();
  expect(jsPDFMock().text).toHaveBeenCalledWith(
    expect.arrayContaining([contenido]),
    expect.any(Number),
    expect.any(Number)
  );
});

test('Descargar un PDF con caracteres especiales', async () => {
  const contenido = '¡Hola, mundo! ¿Cómo estás? 😊';
  document.body.innerHTML = `
    <div id='contenedor-elementos-previsualizacion'>
    <div class='previsualizacion-texto preview-titulo'>
      <div>${contenido}</div>
    </div>
    </div>
  `;

  await descargarPDF();

  expect(jsPDFMock).toHaveBeenCalled();
  expect(jsPDFMock().text).toHaveBeenCalledWith(
    expect.arrayContaining([contenido]),
    expect.any(Number),
    expect.any(Number)
  );
});

test('Descargar un PDF con contenido muy largo', async () => {
  const contenidoLargo = 'a'.repeat(10001);
  document.body.innerHTML = `
    <div id='contenedor-elementos-previsualizacion'>
    <div class='previsualizacion-texto preview-titulo'>
      <div>${contenidoLargo}</div>
    </div>
    </div>
  `;

  await descargarPDF();

  expect(jsPDFMock).toHaveBeenCalled();
  expect(jsPDFMock().text).toHaveBeenCalledWith(
    expect.arrayContaining([contenidoLargo]),
    expect.any(Number),
    expect.any(Number)
  );
});

test('Descargar un PDF sin conexión', async () => {
  ipcRenderer.send.mockImplementation(() => {
    throw new Error('Sin conexión');
  });

  await expect(descargarPDF()).rejects.toThrow('Sin conexión');
  expect(Swal.fire).toHaveBeenCalledWith(
    expect.objectContaining({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo descargar el PDF debido a problemas de conexión.'
    })
  );
});

test('Fallo controlado al no descargar el PDF', async () => {
  jsPDFMock().output.mockImplementation(() => {
    throw new Error('Error al generar el PDF');
  });

  await expect(descargarPDF()).rejects.toThrow('Error al generar el PDF');
  expect(Swal.fire).toHaveBeenCalledWith(
    expect.objectContaining({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo generar el PDF.'
    })
  );
});


test('Descargar un PDF con múltiples elementos de texto', async () => {
  const tituloReporte = 'Título del reporte caracteres especiales';
  const parrafoReporte = 'Este es un párrafo de prueba: ¡Hola, mundo! ¿Cómo estás? 😊';
  document.body.innerHTML = HTML = `
    <div id='contenedor-elementos-previsualizacion'>
      <div class='previsualizacion-texto preview-titulo'><div>${tituloReporte}</div></div>
      <div class='previsualizacion-texto'><div>${parrafoReporte}</div></div>
    </div>
    `;

  await descargarPDF();
  expect(jsPDFMock().text).toHaveBeenCalledWith(
    expect.arrayContaining([tituloReporte, parrafoReporte]),
    expect.any(Number),
    expect.any(Number)
  );
});

test('Descargar un PDF con gráficos incluidos', async () => {
  const canvasId = 'grafica1';
  document.body.innerHTML = `
    <div id='contenedor-elementos-previsualizacion'>
      <div class='previsualizacion-grafica'>
        <canvas id='${canvasId}'></canvas>
      </div>
    </div>
  `;

  const canvas = document.getElementById(canvasId);
  canvas.getContext = jest.fn(() => ({
    drawImage: jest.fn(),
  }));
  
  await descargarPDF();
  expect(jsPDFMock().addImage).toHaveBeenCalled();
});

test('Descargar un PDF con contenido vacío', async () => {
  document.body.innerHTML = `
    <div id='contenedor-elementos-previsualizacion'></div>
  `;

  await descargarPDF();

  expect(jsPDFMock().text).not.toHaveBeenCalled();
  expect(jsPDFMock().addImage).not.toHaveBeenCalled();
  expect(Swal.fire).toHaveBeenCalledWith(
    expect.objectContaining({
      icon: 'warning',
      title: 'Advertencia',
      text: 'No hay contenido para generar el PDF.'
    })
  );
});

test('Descargar un PDF con contenido dinámico', async () => {
  const contenidoDinamico = 'Contenido dinámico generado en tiempo de ejecución';
  document.body.innerHTML = `
    <div id='contenedor-elementos-previsualizacion'>
      <div class='previsualizacion-texto preview-titulo'>
        <div>${contenidoDinamico}</div>
      </div>
    </div>
  `;

  await descargarPDF();

  expect(jsPDFMock().text).toHaveBeenCalledWith(
    expect.arrayContaining([contenidoDinamico]),
    expect.any(Number),
    expect.any(Number)
  );
});

test('Descargar un PDF con múltiples páginas', async () => {
  const contenidoLargo = 'a'.repeat(50000); // Contenido extenso para generar múltiples páginas
  document.body.innerHTML = `
    <div id='contenedor-elementos-previsualizacion'>
      <div class='previsualizacion-texto preview-titulo'>
        <div>${contenidoLargo}</div>
      </div>
    </div>
  `;

  await descargarPDF();

  expect(jsPDFMock().addPage).toHaveBeenCalled();
});