// Importar funciones de elementos de reporte
//import { agregarTexto } from './agregarTexto.js';

// Función para inicializar el módulo de análisis
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

  // Configurar botones para añadir elementos a reporte
  const contenedor = 'contenedorElementos';
  const previsualizacion = 'contenedor-elementos-previsualizacion';

  document.getElementById('agregarTexto').addEventListener('click', () => {
    // Le pasamos ambos contenedores: edición y preview
    window.agregarTexto(contenedor, previsualizacion);
  });

  document.getElementById('agregarGrafica').addEventListener('click', () => {
    window.agregarGrafica(contenedor, previsualizacion);
  });

  document.getElementById('descargarPDF')
          .addEventListener('click', descargarPDF);

  // Cargar los datos del Excel desde localStorage
  const datosExcel = cargarDatosExcel();
  console.log("Datos de Excel:", datosExcel);

  // Si tienes datos, puedes inicializar tu visualización aquí
  if (!datosExcel) {
    console.warn("No hay datos disponibles para análisis");
  }
}

// Carga los datos del Excel desde localStorage
function cargarDatosExcel() {
  try {
    // Verificar si hay datos disponibles
    const hayDatos = localStorage.getItem('datosExcelDisponibles');

    if (!hayDatos || hayDatos !== 'true') {
      console.warn("No hay datos de Excel disponibles");
      return null;
    }

    // Recuperar los datos de Excel
    const datosExcelJSON = localStorage.getItem('datosExcel');

    if (!datosExcelJSON) {
      console.warn("No se encontraron datos de Excel en localStorage");
      return null;
    }

    // Parsear los datos JSON
    const datosExcel = JSON.parse(datosExcelJSON);

    // Guardar en variable global para fácil acceso desde otras funciones
    window.datosExcelGlobal = datosExcel;

    return datosExcel;
  } catch (error) {
    console.error("Error al cargar datos de Excel:", error);
    return null;
  }
}

function descargarPDF() {
  console.log('[PDF] Generando reporte…');

  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) { console.error('[PDF] jsPDF no cargado'); return; }

  const doc     = new jsPDF({ orientation:'portrait', unit:'pt', format:'a4' });
  const margin  = 40;
  const pageW   = doc.internal.pageSize.getWidth()  - margin * 2;
  const pageH   = doc.internal.pageSize.getHeight() - margin * 2;
  let   y       = margin;
  let   pagina  = 1;

  const preview = document.getElementById('contenedor-elementos-previsualizacion');
  if (!preview) { console.warn('[PDF] Contenedor de preview no encontrado'); return; }

  Array.from(preview.children).forEach((elem, i) => {

    /* —— Bloques de texto —— */
    if (elem.classList.contains('previsualizacion-texto')) {
      const texto = elem.textContent.trim();
      if (!texto) return;

      // Tamaños según tipo
      let size = 12;
      let weight = 'normal';
      if (elem.classList.contains('preview-titulo'))    { size = 24; weight = 'bold'; }
      if (elem.classList.contains('preview-subtitulo')) { size = 18; weight = 'bold'; }

      doc.setFontSize(size);
      doc.setFont(undefined, weight);

      const lines = doc.splitTextToSize(texto, pageW);
      if (y + lines.length * size > pageH + margin) {
        doc.addPage(); y = margin; pagina++;
      }
      doc.text(lines, margin, y);
      y += lines.length * size + 12;
      return;
    }

    /* —— Gráficas (canvas) —— */
    if (elem.classList.contains('previsualizacion-grafica')) {
      const canvas = elem.querySelector('canvas');
      if (!canvas) return;

      const img    = canvas.toDataURL('image/png');
      const aspect = canvas.height / canvas.width;
      const imgH   = pageW * aspect;

      if (y + imgH > pageH + margin) {
        doc.addPage(); y = margin; pagina++;
      }
      doc.addImage(img, 'PNG', margin, y, pageW, imgH);
      y += imgH + 12;
    }
  });

  doc.save('reporte.pdf');
  console.log('[PDF] Descarga completa ✔');
}

window.inicializarModuloAnalisis = inicializarModuloAnalisis;
window.descargarPDF = descargarPDF; // Para el listener global
window.cargarDatosExcel = cargarDatosExcel;

// Ejecutar inicialización si el DOM ya está cargado
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarModuloAnalisis);
} else {
  // DOM ya está cargado
  setTimeout(inicializarModuloAnalisis, 100);
}
