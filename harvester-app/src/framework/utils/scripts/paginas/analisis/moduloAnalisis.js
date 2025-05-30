// RF25 - Usuario descarga reporte en PDF - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/rf25/

/* eslint-disable no-unused-vars */
const { jsPDF } = require(`${rutaBase}/node_modules/jspdf/dist/jspdf.umd.min.js`);
const Swal = require(`${rutaBase}/node_modules/sweetalert2/dist/sweetalert2.all.min.js`);

if (typeof ipcRenderer === 'undefined') {
  const { ipcRenderer } = require('electron');
}
const { configurarTexto, configurarGrafica } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/botonesAgregar.js`);

/**
 * Inicializa la interfaz de análisis:
 * - Oculta los botones globales.
 * - Configura el listener de descarga de PDF.
 * - Inserta una tarjeta de texto y una de gráfica si el contenedor está vacío.
 * - Configura delegación de eventos para mostrar/ocultar botones flotantes en tarjetas.
*
* @returns {void}
*/
/* eslint-disable no-undef */
function inicializarModuloAnalisis() {

  const idContenedor = 'contenedorElementos';
  const idContenedorPrevisualizacion = 'contenedor-elementos-previsualizacion';

  const contenedor = document.getElementById(idContenedor);
  if (!contenedor) return;

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

  } catch (error) {
    Swal.fire({
      title: 'Error',
      text: 'Ocurrió un error al cargar los datos de Excel.',
      icon: 'error',
      confirmButtonColor: '#1F4281',
    });
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
    Swal.fire({
      title: 'Error al descargar reporte',
      text: 'Ha courrido un error, contacta a soporte',
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
      if (elemento.classList.contains('preview-titulo')) { tamanoFuente = 18; estiloFuente = 'bold', espaciado = 75; }
      if (elemento.classList.contains('preview-subtitulo')) { tamanoFuente = 15; estiloFuente = 'bold', espaciado = 55; }

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
      documentoPDF.addImage(imagen, 'PNG', margen + desplazamiento, posicionY + espaciado, anchoImagen, altoImagen);
      posicionY += altoFondo + espaciado;
    }
  });

  const documentoNuevo = documentoPDF.output('blob');
  const pdfBufer = await documentoNuevo.arrayBuffer();

  ipcRenderer.send('guardar-pdf', Buffer.from(pdfBufer));
}

inicializarModuloAnalisis();
cargarDatosExcel()