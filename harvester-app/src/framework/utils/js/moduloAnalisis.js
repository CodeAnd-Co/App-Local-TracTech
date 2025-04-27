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
  console.log('[PDF] Comienza descarga');

  /* 1. jsPDF */
  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) {
    console.error('[PDF] jsPDF NO cargado');
    return;
  }
  console.log('[PDF] jsPDF OK');

  const doc        = new jsPDF({ orientation:'portrait', unit:'pt', format:'a4' });
  const margin     = 40;
  const pageW      = doc.internal.pageSize.getWidth()  - margin * 2;
  const pageH      = doc.internal.pageSize.getHeight() - margin * 2;
  let   cursorY    = margin;
  let   pagina     = 1;

  /* 2. Previsualización */
  const preview = document.getElementById('contenedor-elementos-previsualizacion');
  if (!preview) {
    console.warn('[PDF] No se encontró #contenedor-elementos-previsualizacion');
    return;
  }
  console.log(`[PDF] Elementos en preview: ${preview.children.length}`);

  /* 3. Recorremos cada hijo */
  Array.from(preview.children).forEach((elem, idx) => {

    console.log(`[PDF] ➜ Procesando hijo #${idx+1} (${elem.className})`);

    /* —— Texto —— */
    if (elem.classList.contains('previsualizacion-texto')) {
      const texto = elem.textContent.trim();
      if (!texto) { console.log('[PDF]   – texto vacío, se omite'); return; }

      let size = 12;
      let weight = 'normal';
      if (elem.classList.contains('preview-titulo'))    { size = 24; weight = 'bold'; }
      if (elem.classList.contains('preview-subtitulo')) { size = 18; weight = 'bold'; }

      doc.setFontSize(size);
      doc.setFont(undefined, weight);

      const lines = doc.splitTextToSize(texto, pageW);
      if (cursorY + lines.length * size > pageH + margin) {
        doc.addPage(); pagina++; cursorY = margin;
        console.log(`[PDF]   – salto a página ${pagina}`);
      }

      doc.text(lines, margin, cursorY);
      cursorY += lines.length * size + 12;
      return;
    }

    /* —— Gráfica —— */
    if (elem.classList.contains('previsualizacion-grafica')) {
      const canvas = elem.querySelector('canvas');
      if (!canvas) { console.warn('[PDF]   – sin <canvas>, se omite'); return; }

      const img    = canvas.toDataURL('image/png');
      const aspect = canvas.height / canvas.width;
      const imgH   = pageW * aspect;

      if (cursorY + imgH > pageH + margin) {
        doc.addPage(); pagina++; cursorY = margin;
        console.log(`[PDF]   – salto a página ${pagina}`);
      }

      doc.addImage(img, 'PNG', margin, cursorY, pageW, imgH);
      cursorY += imgH + 12;
      return;
    }

    console.log('[PDF]   – tipo de elemento no reconocido, se omite');
  });

  /* 4. Guardamos */
  console.log('[PDF] Guardando archivo…');
  doc.save('reporte.pdf');
  console.log('[PDF] Descarga terminada');
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
