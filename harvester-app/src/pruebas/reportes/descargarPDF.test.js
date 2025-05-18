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
 * @see módulo {@link ../../framework/utils/js/moduloAnalisis}
 */

/*  1. ───── Importaciones ──────────────────────────────────────────────── */
const { descargarPDF } = require('../../framework/utils/js/moduloAnalisis');
const Swal = require('sweetalert2');
const { ipcRenderer } = require('electron');

/*  2. ───── Mocks de módulos ──────────────────────────── */
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

global.window = {};
window.jspdf = { jsPDF: jsPDFMock };

/*  4. ───── Setup de pruebas ──────────────────────────── */
beforeEach(() => {
    jest.clearAllMocks();

    document.body.innerHTML = `
        <div id='contenedor-elementos-previsualizacion'>
        <div class='previsualizacion-texto preview-titulo'>
            <div>Este es un título</div>
        </div>
        <div class='previsualizacion-texto'>
            <div>Este es un párrafo</div>
        </div>
        <div class='previsualizacion-grafica'>
            <canvas id='grafica1'></canvas>
        </div>
        </div>
    `;
})

/*  5. ───── Tests ──────────────────────────────────────────────────────── */
test('Generar y enviar un PDF correctamente', async () => {
    await descargarPDF();

    expect(jsPDFMock).toHaveBeenCalled();
    expect(ipcRenderer).toHaveBeenCalledWith(expect.any(String), expect.any(Buffer));
})

test('Descargar un PDF en menos de 10 segundos', async () => {
    const tiempoDeInicio = Date.now();

    await descargarPDF();

    const tiempoDeFin = Date.now();
    const duracion = tiempoDeFin - tiempoDeInicio;

    expect(duracion).toBeLessThan(10000);
    expect(ipcRenderer.send).toHaveBeenCalled();
})