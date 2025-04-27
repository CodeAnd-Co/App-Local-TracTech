// utils/js/formatoPDF.js
// Módulo para aplicar un estilo formal y profesional a los PDFs generados con jsPDF

/**
 * Aplica cabecera, pie de página y estilo general al documento PDF.
 * @param {import('jspdf').jsPDF} doc  Instancia de jsPDF.
 * @param {Object} options
 * @param {string} options.title    Título que aparecerá en la cabecera.
 * @param {number} options.margin   Margen en puntos (pt).
 */
export function applyFormatoPDF(doc, options = {}) {
    const margin = options.margin ?? 40;
    const title  = options.title  ?? 'Reporte de Análisis';
    const fecha  = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
  
    const pageCount = doc.internal.getNumberOfPages();
    const pageSize  = doc.internal.pageSize;
    const width     = pageSize.getWidth();
    const height    = pageSize.getHeight();
  
    // Ajustes generales de fuente y color
    doc.setProperties({ title });
    doc.setFont('helvetica', 'normal');
  
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
  
      // ——— Cabecera ———
      doc.setFillColor(52, 58, 64);                           // gris oscuro
      doc.rect(0, 0, width, 50, 'F');                        // fondo de cabecera
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);                       // blanco
      doc.text(title, margin, 30);                           // título
      doc.setFontSize(10);
      doc.text(fecha, width - margin, 30, { align: 'right' });
  
      // Línea separadora debajo de la cabecera
      doc.setDrawColor(200);
      doc.setLineWidth(0.5);
      doc.line(margin, 55, width - margin, 55);
  
      // ——— Pie de página ———
      doc.setFontSize(9);
      doc.setTextColor(117, 117, 117);
      doc.text(`Página ${i} de ${pageCount}`, width - margin, height - 30, { align: 'right' });
    }
  }
  