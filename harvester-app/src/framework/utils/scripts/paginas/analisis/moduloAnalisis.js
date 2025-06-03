// RF25 - Usuario descarga reporte en PDF - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/rf25/

/* eslint-disable no-unused-vars */
const { jsPDF } = require(`${rutaBase}/node_modules/jspdf/dist/jspdf.umd.min.js`);
const { mostrarAlerta } = require(`${rutaBase}/src/framework/vistas/includes/componentes/moleculas/alertaSwal/alertaSwal`);

if (typeof ipcRenderer === 'undefined') {
  const { ipcRenderer } = require('electron');
}
const { configurarTexto, configurarGrafica } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/botonesAgregar.js`);
const { cargarFormulasIniciales } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/agregarGrafica.js`);

/**
 * Inicializa la interfaz de análisis:
 * - Oculta los botones globales.
 * - Configura el listener de descarga de PDF.
 * - Inserta una tarjeta de texto y una de gráfica si el contenedor está vacío.
 * - Configura delegación de eventos para mostrar/ocultar botones flotantes en tarjetas.
 * - Carga las fórmulas disponibles.
*
* @returns {void}
*/
/* eslint-disable no-undef */
async function inicializarModuloAnalisis() {
  const idContenedor = 'contenedorElementos';
  const idContenedorPrevisualizacion = 'contenedor-elementos-previsualizacion';

  const contenedor = document.getElementById(idContenedor);
  if (!contenedor) return;

  // Cargar fórmulas al inicializar el módulo
  await cargarFormulasIniciales([]);
  

  const botonPDF = document.getElementById('descargarPDF')
  const pantallaBloqueo = document.getElementById('pantalla-bloqueo');
  botonPDF.addEventListener('click', async () => {

    const anterior = botonPDF.textContent;
    botonPDF.disabled = true;
    const contenedorTexto = botonPDF.children[1]
    contenedorTexto.textContent = 'Descargando...';
    pantallaBloqueo.classList.remove('oculto');

    descargarPDF()

    ipcRenderer.once('pdf-guardado', (event, exito) => {
      botonPDF.disabled = false;
      contenedorTexto.textContent = anterior;
      pantallaBloqueo.classList.add('oculto');
      
      if (exito) {
        mostrarAlerta('Reporte descargado', 'El reporte se ha guardado correctamente.', 'success');
      } else {
        mostrarAlerta('Reporte cancelado', 'La descarga del reporte ha sido cancelada.', 'info');
      }
    });
  });

  if (contenedor.children.length === 0) {
    configurarTexto(idContenedor, idContenedorPrevisualizacion);
    configurarGrafica(idContenedor, idContenedorPrevisualizacion);
  }
}

/**
 * Carga los datos de Excel almacenados en localStorage.
 * 
 * @returns {Object|null} Datos parseados o null si falla.
*/
function cargarDatosExcel() {
  try {
    const datosDisponibles = localStorage.getItem('datosExcelDisponibles');
    const datosExcelJSON = localStorage.getItem('datosExcel');
    if (datosDisponibles !== 'true' || !datosExcelJSON) {
      throw new Error('No hay datos de Excel disponibles');
    }

    const datosExcel = JSON.parse(datosExcelJSON);
    return datosExcel;

  } catch {
    mostrarAlerta('Error', 'Ocurrió un error al cargar los datos de Excel.', 'error'); 
    return null;
  }
}

/**
 * Genera y descarga el reporte en PDF usando jsPDF.
*
* @throws {Error} Si jsPDF no está cargado o falla la extracción de previsualización.
*/
async function descargarPDF() {
  if (!jsPDF) {
    mostrarAlerta('Error al descargar reporte', 'Ha ocurrido un error, contacta a soporte', 'error');
    throw new Error('[PDF] jsPDF no cargado');
  }

  // Configuración básica del documento
  /* eslint-disable-next-line new-cap */
  const documentoPDF = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const margen = 40;
  const anchoPagina = documentoPDF.internal.pageSize.getWidth() - margen * 2;
  const altoPagina = documentoPDF.internal.pageSize.getHeight() - margen * 2;
  let posicionY = margen;

  const contenedorPrevisualizacion = document.getElementById('contenedor-elementos-previsualizacion');
  if (!contenedorPrevisualizacion) {
    mostrarAlerta('Error al descargar reporte', 'No se encontró el contenedor de previsualización', 'warning');
    throw new Error('[PDF] Contenedor de previsualización no encontrado');
  }

  Array.from(contenedorPrevisualizacion.children).forEach(elemento => {
    if (elemento.classList.contains('previsualizacion-texto')) {
      const espaciadoArriba = 15;
      const espaciadoAbajo = 30;
      let tamanoFuente = 11.5;
      let estiloFuente = 'normal';
      let alineado = 'left';
      if (elemento.classList.contains('preview-titulo')) { tamanoFuente = 18; estiloFuente = 'bold' }
      if (elemento.classList.contains('preview-subtitulo')) { tamanoFuente = 15; estiloFuente = 'bold' }
      if (elemento.style?.getPropertyValue('text-align') == 'center') { alineado =  'center'}
      if (elemento.style?.getPropertyValue('text-align') == 'right') { alineado =  'right'}

      documentoPDF.setFontSize(tamanoFuente);
      documentoPDF.setFont(undefined, estiloFuente);

      Array.from(elemento.children).forEach((elementoSecundario) => {
        const texto = elementoSecundario.textContent;
        if (!texto) return;

        const lineas = documentoPDF.splitTextToSize(texto, anchoPagina);
        const posicionYAgregar = (lineas.length * tamanoFuente) + espaciadoAbajo + espaciadoArriba

        if (posicionY + posicionYAgregar > altoPagina + margen) {
          documentoPDF.addPage();
          posicionY = margen;
        }

        let ejeXPdf = margen

        if(alineado == 'center'){
          ejeXPdf = (anchoPagina + (margen * 2))/2;
        } 

        if(alineado == 'right'){
          ejeXPdf = (anchoPagina + (margen));
        } 

        documentoPDF.text(lineas, ejeXPdf, posicionY + tamanoFuente + espaciadoArriba, { align: alineado });

        posicionY += posicionYAgregar;
      })

    } else if (elemento.classList.contains('previsualizacion-grafica')) {

      const lienzo = elemento.querySelector('canvas');
      if (!lienzo) return;

      const imagen = lienzo.toDataURL('image/png');
      const proporcion = lienzo.height / lienzo.width;
      const anchoImagen = anchoPagina;
      const altoImagen = anchoPagina * proporcion;
      const espaciado = 10;
      const espaciadoFonodo = 5;
      const anchoFondo = anchoImagen;
      const altoFondo = altoImagen + (espaciado * 2) + espaciadoFonodo;
      const radioFondo = 6;
      const margenAbajo = 15;

      if (posicionY + altoImagen > altoPagina + margen) {
        documentoPDF.addPage();
        posicionY = margen;
      }

      documentoPDF.setFillColor(224, 224, 224);
      documentoPDF.roundedRect(margen, posicionY, anchoFondo, altoFondo, radioFondo, radioFondo, 'F');
      documentoPDF.addImage(imagen, 'PNG', margen, posicionY + espaciado, anchoImagen, altoImagen);
      posicionY += altoFondo + margenAbajo;
    }
  });

  const documentoNuevo = documentoPDF.output('blob');
  const pdfBufer = await documentoNuevo.arrayBuffer();

  ipcRenderer.send('guardar-pdf', Buffer.from(pdfBufer));
}

inicializarModuloAnalisis();
cargarDatosExcel()