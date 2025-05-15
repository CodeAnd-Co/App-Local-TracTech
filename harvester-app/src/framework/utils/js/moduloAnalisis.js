/**
 * @file moduloAnalisis.js
 * @module moduloAnalisis
 * @description Módulo que inicializa la interfaz de análisis, configura eventos de botones para agregar texto, gráficas y descargar el reporte en PDF.
 * @version 1.0
 * @since 2025-04-28
 */

/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const { jsPDF: JSPDF } = window.jspdf;
if (typeof Swal === 'undefined'){
  const Swal = require('sweetalert2');
}
const { ipcRenderer } = require('electron');

/**
 * Inicializa la interfaz de análisis:
 * - Actualiza el estado de los botones del sidebar y topbar.
 * - Configura los listeners para los botones de agregar texto, agregar gráfica y descargar PDF.
 * - Carga los datos de Excel desde localStorage.
 *
 * @function inicializarModuloAnalisis
 * @memberof module:moduloAnalisis
 * @returns {void}
 */
function inicializarModuloAnalisis() {
  // Actualizar visualmente el sidebar sin modificar localStorage
  const botonesSidebar = document.querySelectorAll('.boton-sidebar');
  botonesSidebar.forEach(boton => boton.classList.remove('activo'));

  const botonesAnalisis = document.querySelectorAll('.boton-sidebar[data-seccion="analisis"]');
  botonesAnalisis.forEach(boton => boton.classList.add('activo'));

  // Actualizar el topbar si está disponible
  if (window.actualizarTopbar) {
    window.actualizarTopbar('analisis');
  }

  // IDs de contenedores
  const idContenedor       = 'contenedorElementos';
  const idPrevisualizacion = 'contenedor-elementos-previsualizacion';

  // Configurar listeners de botones
  document.getElementById('agregarTexto')
          .addEventListener('click', () => window.agregarTexto(idContenedor, idPrevisualizacion));
  document.getElementById('agregarGrafica')
          .addEventListener('click', () => window.agregarGrafica(idContenedor, idPrevisualizacion));
  
  const botonPDF = document.getElementById('descargarPDF')
  const pantallaBloqueo = document.getElementById('pantalla-bloqueo');
  botonPDF.addEventListener('click', async () => {
    
    const anterior = botonPDF.textContent;
    botonPDF.disabled = true;
    const contenedorTexto = botonPDF.children[1]
    contenedorTexto.textContent = 'Descargando...';
    pantallaBloqueo.classList.remove('oculto');

    descargarPDF()

    ipcRenderer.once("pdf-guardado", (event, exito) => {
      botonPDF.disabled = false;
      contenedorTexto.textContent = anterior;
      pantallaBloqueo.classList.add('oculto');
    });

    // try {
    //   descargarPDF().then((resultado) => { 
    //     botonPDF.disabled = false;
    //     contenedorTexto.textContent = 'Completado';
    //     setTimeout(() => {
    //       contenedorTexto.textContent = anterior;
    //     }, 2000);
    //   })
    // } catch (error) { 
    //   botonPDF.disabled = false;
    //   contenedorTexto.textContent = 'Error';
    // }

    
    // setTimeout(() => {
      
    // }
    // , 5000);
  });

  // Cargar los datos del Excel
  const datosExcel = cargarDatosExcel();
  if (!datosExcel) {
    console.warn('No hay datos disponibles para análisis');
  }
}

/**
 * Carga los datos de Excel almacenados en localStorage.
 *
 * @function cargarDatosExcel
 * @memberof module:moduloAnalisis
 * @returns {Object|null} Datos de Excel parseados o null si no hay datos o ocurre un error.
 */
function cargarDatosExcel() {
  try {
    const datosDisponibles = localStorage.getItem('datosExcelDisponibles');
    if (datosDisponibles !== 'true') {
      console.warn('No hay datos de Excel disponibles');
      return null;
    }

    const datosExcelJSON = localStorage.getItem('datosExcel');
    if (!datosExcelJSON) {
      console.warn('No se encontraron datos de Excel en localStorage');
      return null;
    }

    const datosExcel = JSON.parse(datosExcelJSON);
    window.datosExcelGlobal = datosExcel;
    return datosExcel;

  } catch (error) {
    console.error('Error al cargar datos de Excel:', error);
    return null;
  }
}

/**
 * Genera y descarga el reporte en formato PDF usando jsPDF.
 * Recorre los elementos de previsualización en pantalla (texto y gráficas) y los añade al documento PDF.
 *
 * @function descargarPDF
 * @memberof module:moduloAnalisis
 * @throws {Error} Si jsPDF no está cargado o el contenedor de previsualización no existe.
 * @returns {void}
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

  const documentoPDF = new JSPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const margen       = 40;
  const anchoPagina = documentoPDF.internal.pageSize.getWidth() - margen * 2;
  const altoPagina   = documentoPDF.internal.pageSize.getHeight() - margen * 2;
  let posicionY      = margen;

  const contenedorPrevisualizacion = document.getElementById('contenedor-elementos-previsualizacion');
  if (!contenedorPrevisualizacion) {
    Swal.fire({
        title: 'Error al descargar reporte',
        text: 'No se encontró el contenedor de previsualización',
        icon: 'warning'
    });
    throw new Error('[PDF] Contenedor de previsualización no encontrado');
  }

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
  const pdfBuffer = await documentoNuevo.arrayBuffer();

  ipcRenderer.send('guardar-pdf', Buffer.from(pdfBuffer));
}

// Exponer funciones en el ámbito global
window.inicializarModuloAnalisis = inicializarModuloAnalisis;
window.cargarDatosExcel          = cargarDatosExcel;
window.descargarPDF              = descargarPDF;

// Ejecutar inicialización al cargar el DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarModuloAnalisis);
} else {
  // Ejecutar tras un breve retardo en caso de que ya esté listo
  setTimeout(inicializarModuloAnalisis, 100);
}