/**
 * Genera y descarga el reporte en PDF usando jsPDF.
*
* @throws {Error} Si jsPDF no está cargado o falla la extracción de previsualización.
*/
async function descargarPDF() {
  if (!jsPDF) {
    Swal.fire({
      title: 'Error al descargar reporte',
      text: 'Ha ocurrido un error, contacta a soporte',
      icon: 'error'
    });
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
    Swal.fire({
      title: 'Error al descargar reporte',
      text: 'No se encontró el contenedor de previsualización',
      icon: 'warning'
    });
    throw new Error('[PDF] Contenedor de previsualización no encontrado');
  }

  Array.from(contenedorPrevisualizacion.children).forEach(elemento => {
    if (elemento.classList.contains('previsualizacion-texto')) {
      let tamanoFuente = 11.5;
      let estiloFuente = 'normal';
      let espaciado = 50;
      if (elemento.classList.contains('preview-titulo')) { tamanoFuente = 18; estiloFuente = 'bold', espaciado = 50; }
      if (elemento.classList.contains('preview-subtitulo')) { tamanoFuente = 15; estiloFuente = 'bold', espaciado = 45; }

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

        posicionY += lineas.length * tamanoFuente + espaciado;
      })

    } else if (elemento.classList.contains('previsualizacion-grafica')) {

      const lienzo = elemento.querySelector('canvas');
      if (!lienzo) return;

      const imagen = lienzo.toDataURL('image/png');
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
      documentoPDF.roundedRect(margen, posicionY, anchoFondo, altoFondo, radioFondo, radioFondo, 'F');
      documentoPDF.addImage(imagen, 'PNG', margen + desplazamiento, posicionY, anchoImagen, altoImagen);
      posicionY += altoFondo + espaciado * 2;
    }
  });

  const documentoNuevo = documentoPDF.output('blob');
  const pdfBufer = await documentoNuevo.arrayBuffer();

  ipcRenderer.send('guardar-pdf', Buffer.from(pdfBufer));
}


module.exports = {
  descargarPDF
};