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
  // Actualizar el sidebar visualmente sin modificar localStorage
  const todosBotones = document.querySelectorAll('.boton-sidebar');
  todosBotones.forEach(boton => boton.classList.remove('activo'));

  const botonesAnalisis = document.querySelectorAll('.boton-sidebar[data-seccion="analisis"]');
  botonesAnalisis.forEach(boton => boton.classList.add('activo'));

  // Actualizar el topbar si está disponible
  if (window.actualizarTopbar) {
    window.actualizarTopbar('analisis');
  }

  // IDs de contenedores
  const contenedor = 'contenedorElementos';
  const previsualizacion = 'contenedor-elementos-previsualizacion';

  // Configurar listeners de botones
  document.getElementById('agregarTexto')
          .addEventListener('click', () => window.agregarTexto(contenedor, previsualizacion));
  document.getElementById('agregarGrafica')
          .addEventListener('click', () => window.agregarGrafica(contenedor, previsualizacion));
  document.getElementById('descargarPDF')
          .addEventListener('click', descargarPDF);

  // Cargar los datos del Excel
  const datosExcel = cargarDatosExcel();
  console.log('Datos de Excel:', datosExcel);
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
    const hayDatos = localStorage.getItem('datosExcelDisponibles');
    if (!hayDatos || hayDatos !== 'true') {
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
 * @throws {Error} Si jsPDF no está cargado o el contenedor de preview no existe.
 */
function descargarPDF() {
  console.log('[PDF] Generando reporte…');
  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) {
    throw new Error('[PDF] jsPDF no cargado');
  }

  const doc    = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const margin = 40;
  const pageW  = doc.internal.pageSize.getWidth()  - margin * 2;
  const pageH  = doc.internal.pageSize.getHeight() - margin * 2;
  let   y      = margin;

  const preview = document.getElementById('contenedor-elementos-previsualizacion');
  if (!preview) {
    throw new Error('[PDF] Contenedor de preview no encontrado');
  }

  Array.from(preview.children).forEach(elem => {
    if (elem.classList.contains('previsualizacion-texto')) {
      const texto = elem.textContent.trim();
      if (!texto) return;
  
      let size = 12;
      let weight = 'normal';
      if (elem.classList.contains('preview-titulo'))    { size = 24; weight = 'bold'; }
      if (elem.classList.contains('preview-subtitulo')) { size = 18; weight = 'bold'; }
  
      doc.setFontSize(size);
      doc.setFont(undefined, weight);
      const lines = doc.splitTextToSize(texto, pageW);
      if (y + lines.length * size > pageH + margin) {
        doc.addPage(); 
        y = margin;
      }
      doc.text(lines, margin, y);
      y += lines.length * size + 12;
  
    } else if (elem.classList.contains('previsualizacion-grafica')) {
      const canvas = elem.querySelector('canvas');
      if (!canvas) return;
      const img    = canvas.toDataURL('image/png');
      const aspect = canvas.height / canvas.width;
      const imgH   = pageW * aspect;
      if (y + imgH > pageH + margin) {
        doc.addPage(); 
        y = margin;
      }
      doc.addImage(img, 'PNG', margin, y, pageW, imgH);
      y += imgH + 12;
    }
  });
  

  doc.save('reporte.pdf');
  console.log('[PDF] Descarga completa ✔');
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
