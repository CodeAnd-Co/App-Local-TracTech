/**
 * @file moduloAnalisis.js
 * @module moduloAnalisis
 * @description Módulo que inicializa la interfaz de análisis, configura eventos de botones para agregar texto, gráficas y descargar el reporte en PDF.
 * @version 1.0
 * @since 2025-04-28
 */

const path = require('path');
const fs = require('fs');
/* eslint-disable no-unused-vars */
const { jsPDF: JSPDF } = window.jspdf;
if (typeof Swal === 'undefined'){
  const Swal = require('sweetalert2');
}
const { ipcRenderer } = require('electron');
const { agregarTexto } = require('../utils/js/agregarTexto');
const { agregarGrafica } = require('../utils/js/agregarGrafica');
const { mostrarBotonesAgregar, ocultarBotonesAgregar, configurarTexto } = require('../utils/js/botonesAgregar');

/**
 * Inicializa la interfaz de análisis:
 * - Oculta los botones globales.
 * - Configura el listener de descarga de PDF.
 * - Inserta una tarjeta de texto y una de gráfica si el contenedor está vacío.
 * - Configura delegación de eventos para mostrar/ocultar botones flotantes en tarjetas.
 *
 * @function inicializarModuloAnalisis
 * @memberof module:moduloAnalisis
 * @returns {void}
 */
// /* eslint-disable no-undef */
function inicializarModuloAnalisis() {
  console.log("Directorio actual:", __dirname);
  console.log("Ruta completa del archivo:", __filename);
  console.log("Ruta del módulo:", path.resolve(__dirname, '../utils/js/agregarTexto.js'));
  console.log(fs.existsSync(path.resolve(__dirname, '../utils/js/agregarTexto.js')));
  console.log("Ruta del módulo:", path.resolve(__dirname, '../utils/js/botonesAgregar.js'));
  console.log(fs.existsSync(path.resolve(__dirname, '../utils/js/botonesAgregar.js')));

  // IDs de los contenedores principales
  const idContenedor                 = 'contenedorElementos';
  const idContenedorPrevisualizacion = 'contenedor-elementos-previsualizacion';

  // Obtener referencia al contenedor donde se añaden las tarjetas
  const contenedor = document.getElementById(idContenedor);

  // 1) Ocultar botones globales de agregar texto y gráfica
  document.getElementById('agregarTexto').style.display   = 'none';
  document.getElementById('agregarGrafica').style.display = 'none';

  // Configurar listeners de botones
  document.getElementById('agregarTexto')
          .addEventListener('click', () => agregarTexto(idContenedor, idContenedorPrevisualizacion));
  document.getElementById('agregarGrafica')
          .addEventListener('click', () => window.agregarGrafica(idContenedor, idContenedorPrevisualizacion));
  
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
    });
  });

  // 3) Si el contenedor está vacío, iniciar con una tarjeta de texto y otra de gráfica
  if (contenedor.children.length === 0) {
    configurarTexto(idContenedor, idContenedorPrevisualizacion);
    agregarGrafica(idContenedor, idContenedorPrevisualizacion);
  }
}

// Ejecutar inicialización tras cargar el DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarModuloAnalisis);
} else {
  inicializarModuloAnalisis();
}

/**
 * Carga los datos de Excel almacenados en localStorage.
 * 
 * @function cargarDatosExcel
 * @memberof module:moduloAnalisis
 * @returns {Object|null} Datos parseados o null si falla.
 */
function cargarDatosExcel() {
  try {
    // Verificar flag de disponibilidad de datos
    const datosDisponibles = localStorage.getItem('datosExcelDisponibles');
    if (datosDisponibles !== 'true') {
      console.warn('No hay datos de Excel disponibles');
      return null;
    }

    // Obtener y parsear el JSON de datos de Excel
    const datosExcelJSON = localStorage.getItem('datosExcel');
    if (!datosExcelJSON) {
      console.warn('No se encontraron datos de Excel en localStorage');
      return null;
    }

    const datosExcel = JSON.parse(datosExcelJSON);
    return datosExcel;

  } catch (error) {
    console.error('Error al cargar datos de Excel:', error);
    return null;
  }
}

/**
 * Genera y descarga el reporte en PDF usando jsPDF.
 *
 * @function descargarPDF
 * @memberof module:moduloAnalisis
 * @throws {Error} Si jsPDF no está cargado o falla la extracción de previsualización.
 */
async function descargarPDF() {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    Swal.fire({
        title: 'Error al descargar reporte',
        text: 'Ha courrido un error, contacta a soporte',
        icon: 'error'
    });
    throw new Error('[PDF] jsPDF no cargado');
  }

  // Configuración básica del documento
  const documentoPDF = new JSPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const margen       = 40;
  const anchoPagina = documentoPDF.internal.pageSize.getWidth() - margen * 2;
  const altoPagina   = documentoPDF.internal.pageSize.getHeight() - margen * 2;
  let posicionY      = margen;

  // Obtener contenedor de previsualización de texto y gráficas
  const contenedorPrevisualizacion = document.getElementById('contenedor-elementos-previsualizacion');
  if (!contenedorPrevisualizacion) {
    Swal.fire({
        title: 'Error al descargar reporte',
        text: 'No se encontró el contenedor de previsualización',
        icon: 'warning'
    });
    throw new Error('[PDF] Contenedor de previsualización no encontrado');
  }

  // Recorrer cada elemento y añadirlo al PDF según su tipo
  Array.from(contenedorPrevisualizacion.children).forEach(elemento => {
    if (elemento.classList.contains('previsualizacion-texto')) {
      let tamanoFuente = 12;
      let estiloFuente = 'normal';
      let espaciado     = 11;
      if (elemento.classList.contains('preview-titulo'))    { tamanoFuente = 18; estiloFuente = 'bold', espaciado = 14; }
      if (elemento.classList.contains('preview-subtitulo')) { tamanoFuente = 15; estiloFuente = 'bold', espaciado = 16; }

      documentoPDF.setFontSize(tamanoFuente);
      documentoPDF.setFont(undefined, estiloFuente);

      Array.from(elemento.children).forEach((elementoSecundario) => {
        const texto = elementoSecundario.textContent;
        if (!texto) return;

        const lineas = documentoPDF.splitTextToSize(texto, anchoPagina);

        if (posicionY + lineas.length * tamanoFuente + espaciado > altoPagina + margen) {
          documentoPDF.addPage();
          posicionY = margen;
        }

        documentoPDF.text(lineas, margen, posicionY);
        
        posicionY += lineas.length * tamanoFuente + espaciado + 12;
      })

    } else if (elemento.classList.contains('previsualizacion-grafica')) {

      const lienzo = elemento.querySelector('canvas');
      if (!lienzo) return;

      const imagen     = lienzo.toDataURL('image/png');
      const proporcion = lienzo.height / lienzo.width;
      let anchoImagen = anchoPagina;
      let altoImagen = anchoPagina * proporcion;
      let desplazamiento = 0;
      if (proporcion == 1) {
        anchoImagen /= 2
        altoImagen /= 2;
        desplazamiento = anchoImagen / 2
      }
      const espaciado = 15;
      const anchoFondo = 520;
      const altoFondo = 265 + espaciado;
      const radioFondo = 6;

      if (posicionY + altoImagen > altoPagina + margen) {
        documentoPDF.addPage();
        posicionY = margen;
      }

      documentoPDF.setFillColor(224, 224, 224);
      documentoPDF.roundedRect(margen - 2, posicionY, anchoFondo, altoFondo, radioFondo, radioFondo, 'F');
      documentoPDF.addImage(imagen, 'PNG', margen + desplazamiento, posicionY + espaciado, anchoImagen, altoImagen);
      posicionY += altoFondo + 35;
    }
  });

  const documentoNuevo = documentoPDF.output('blob');
  const pdfBufer = await documentoNuevo.arrayBuffer();

  ipcRenderer.send('guardar-pdf', Buffer.from(pdfBufer));
}

// Exponer funciones en el ámbito global para uso externo
window.inicializarModuloAnalisis = inicializarModuloAnalisis;
window.cargarDatosExcel          = cargarDatosExcel;
window.descargarPDF              = descargarPDF;
window.agregarGrafica            = agregarGrafica;

// En algunos navegadores, volver a inicializar tras un breve retardo si ya cargó el DOM
if (document.readyState !== 'loading') {
  setTimeout(inicializarModuloAnalisis, 100);
}
