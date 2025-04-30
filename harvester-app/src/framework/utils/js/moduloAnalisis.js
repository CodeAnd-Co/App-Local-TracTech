/**
 * @file moduloAnalisis.js
 * @module moduloAnalisis
 * @description Módulo que inicializa la interfaz de análisis, configura eventos de botones para agregar texto, gráficas y descargar el reporte en PDF.
 * @version 1.0
 * @date 2025-04-28
 */

/**
 * Inicializa el módulo de análisis.
 * - Actualiza el estado de los botones del sidebar y topbar.
 * - Configura listeners para los botones de agregar texto, agregar gráfica y descargar PDF.
 * - Carga datos de Excel desde localStorage.
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
  const idContenedor = 'contenedorElementos';
  const idPrevisualizacion = 'contenedor-elementos-previsualizacion';

  // Configurar listeners de botones
  document.getElementById('agregarTexto')
          .addEventListener('click', () => window.agregarTexto(idContenedor, idPrevisualizacion));
  document.getElementById('agregarGrafica')
          .addEventListener('click', () => window.agregarGrafica(idContenedor, idPrevisualizacion));
  document.getElementById('descargarPDF')
          .addEventListener('click', descargarPDF);

  // Cargar los datos del Excel
  const datosExcel = cargarDatosExcel();
  if (!datosExcel) {
    console.warn('No hay datos disponibles para análisis');
  }
}

/**
 * Carga los datos de Excel almacenados en localStorage.
 * @returns {Object|null} Datos de Excel parseados o null si no hay datos.
 */
function cargarDatosExcel() {
  try {
    const datosDisponibles = localStorage.getItem('datosExcelDisponibles');
    if (!datosDisponibles || datosDisponibles !== 'true') {
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
 * Recorre los elementos de previsualización y los añade al documento.
 * @throws {Error} Si jsPDF no está cargado o el contenedor de previsualización no existe.
 */
function descargarPDF() {
  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) {
    throw new Error('[PDF] jsPDF no cargado');
  }

  const documentoPDF = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const margen = 40;
  const anchoPagina = documentoPDF.internal.pageSize.getWidth()  - margen * 2;
  const altoPagina  = documentoPDF.internal.pageSize.getHeight() - margen * 2;
  let posicionY = margen;

  const contenedorPrevisualizacion = document.getElementById('contenedor-elementos-previsualizacion');
  if (!contenedorPrevisualizacion) {
    throw new Error('[PDF] Contenedor de previsualización no encontrado');
  }

  Array.from(contenedorPrevisualizacion.children).forEach(elemento => {
    if (elemento.classList.contains('previsualizacion-texto')) {
      const texto = elemento.textContent.trim();
      if (!texto) return;

      let tamanoFuente = 12;
      let estiloFuente = 'normal';
      if (elemento.classList.contains('preview-titulo'))    { tamanoFuente = 24; estiloFuente = 'bold'; }
      if (elemento.classList.contains('preview-subtitulo')) { tamanoFuente = 18; estiloFuente = 'bold'; }

      documentoPDF.setFontSize(tamanoFuente);
      documentoPDF.setFont(undefined, estiloFuente);
      const lineas = documentoPDF.splitTextToSize(texto, anchoPagina);

      if (posicionY + lineas.length * tamanoFuente > altoPagina + margen) {
        documentoPDF.addPage();
        posicionY = margen;
      }

      documentoPDF.text(lineas, margen, posicionY);
      posicionY += lineas.length * tamanoFuente + 12;

    } else if (elemento.classList.contains('previsualizacion-grafica')) {
      const lienzo = elemento.querySelector('canvas');
      if (!lienzo) return;

      const imagen = lienzo.toDataURL('image/png');
      const proporcion = lienzo.height / lienzo.width;
      const altoImagen = anchoPagina * proporcion;

      if (posicionY + altoImagen > altoPagina + margen) {
        documentoPDF.addPage();
        posicionY = margen;
      }

      documentoPDF.addImage(imagen, 'PNG', margen, posicionY, anchoPagina, altoImagen);
      posicionY += altoImagen + 12;
    }
  });

  documentoPDF.save('reporte.pdf');
}

// Exponer funciones en el ámbito global
window.inicializarModuloAnalisis = inicializarModuloAnalisis;
window.descargarPDF = descargarPDF;
window.cargarDatosExcel = cargarDatosExcel;

// Ejecutar inicialización al cargar el DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarModuloAnalisis);
} else {
  setTimeout(inicializarModuloAnalisis, 100);
}
