/**
 * @file moduloAnalisis.js
 * @module moduloAnalisis
 * @description Módulo que inicializa la interfaz de análisis, configura eventos de botones para agregar texto, gráficas y descargar el reporte en PDF.
 * @version 1.0
 * @since 2025-04-28
 */

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
  const idContenedor               = 'contenedorElementos';
  const idContenedorPrevisualizacion = 'contenedor-elementos-previsualizacion';
  const contenedor                 = document.getElementById(idContenedor);

  // 1) Ocultar botones globales
  document.getElementById('agregarTexto').style.display   = 'none';
  document.getElementById('agregarGrafica').style.display = 'none';

  // 2) Listener de descarga de PDF
  document.getElementById('descargarPDF')
          .addEventListener('click', descargarPDF);

  // 3) Siempre iniciar con gráfica + texto si está vacío
  if (contenedor.children.length === 0) {
    agregarGrafica(idContenedor, idContenedorPrevisualizacion);
    agregarTexto( idContenedor, idContenedorPrevisualizacion);
  }

  // 4) Delegación de hover/leave para tarjetas
  contenedor.addEventListener('mouseenter', alEntrarTarjeta, true);
  contenedor.addEventListener('mouseleave', alSalirTarjeta, true);

  /**
   * Se ejecuta al entrar el ratón en una tarjeta.
   */
  function alEntrarTarjeta(evento) {
    const tarjeta = evento.target.closest('.tarjeta-texto, .tarjeta-grafica');
    if (tarjeta) mostrarBotonesAgregar(tarjeta);
  }


  function alSalirTarjeta(evento) {
    const tarjeta = evento.target.closest('.tarjeta-texto, .tarjeta-grafica');
    if (tarjeta) ocultarBotonesAgregar(tarjeta);
  }

  /**
   * Muestra dos botones “+” (superior e inferior) dentro de la tarjeta.
   */
  function mostrarBotonesAgregar(tarjeta) {
    if (tarjeta.querySelector('.btn-agregar-flotante')) return;
    tarjeta.classList.add('tarjeta-con-posicion');

    ['antes', 'despues'].forEach(ubicacion => {
      const botonFlotante = document.createElement('button');
      botonFlotante.classList.add(
        'btn-agregar-flotante',
        ubicacion === 'antes'
          ? 'btn-agregar-superior'
          : 'btn-agregar-inferior'
      );
      botonFlotante.textContent       = '+';
      botonFlotante.dataset.ubicacion = ubicacion;
      botonFlotante.addEventListener('click', evento => {
        evento.stopPropagation();
        abrirMenuAgregar(tarjeta, ubicacion);
      });
      tarjeta.appendChild(botonFlotante);
    });
  }

  /**
   * Elimina todos los botones “+” de una tarjeta.
   */
  function ocultarBotonesAgregar(tarjeta) {
    tarjeta.querySelectorAll('.btn-agregar-flotante')
           .forEach(boton => boton.remove());
  }

  /**
   * Abre el menú con las opciones “Agregar texto” y “Agregar gráfica”,
   * insertando en la posición indicada.
   */
  /**
 * Abre un SweetAlert2 pequeñito dentro de la tarjeta clicada,
 * y con dos botones horizontales para “Texto” y “Gráfica”.
 *
 * @param {Element} tarjeta    – La tarjeta donde se hizo clic.
 * @param {'antes'|'despues'} ubicacion – Dónde insertar la nueva tarjeta.
 */
function abrirMenuAgregar(tarjeta, ubicacion) {
  Swal.fire({
    title: 'Agregar',
    width: '180px',
    padding: '0.5rem',
    icon: undefined,
    showCancelButton: true,
    showDenyButton: true,
    confirmButtonText:
      '<img src="../utils/iconos/Texto.svg" class="icono-agregar"/> Texto',
    denyButtonText:
      '<img src="../utils/iconos/GraficaBarras.svg" class="icono-agregar"/> Gráfica',
    cancelButtonText: '✕',
    // monta el modal en la tarjeta, no en body
    target: tarjeta,
    // quitamos estilos por defecto, reutilizamos tus botones
    buttonsStyling: false,
    customClass: {
      container: 'swal2-container-inline',
      popup:     'swal2-popup-inline',
      confirmButton: 'boton-agregar small',
      denyButton:    'boton-agregar small',
      cancelButton:  'swal2-cancel-inline'
    }
  }).then(resultado => {
    const idCont  = 'contenedorElementos';
    const idPrev  = 'contenedor-elementos-previsualizacion';
    if (resultado.isConfirmed) {
      agregarTexto(idCont, idPrev, tarjeta, ubicacion);
    } else if (resultado.isDenied) {
      agregarGrafica(idCont, idPrev, tarjeta, ubicacion);
    }
    // si canceló, no hace nada
  });
}
  /**
   * Cierra el menú de inserción si existe.
   */
  function cerrarMenuAgregar(tarjeta) {
    const menuExistente = tarjeta.querySelector('.menu-agregar');
    if (menuExistente) menuExistente.remove();
  }
}

// Exponer funciones globales
window.inicializarModuloAnalisis      = inicializarModuloAnalisis;
window.agregarTexto                   = agregarTexto;
window.agregarGrafica                 = agregarGrafica;
window.cargarDatosExcel               = cargarDatosExcel;
window.descargarPDF                   = descargarPDF;

// Arrancar al cargar el DOM
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
function descargarPDF() {
  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) {
    throw new Error('[PDF] jsPDF no cargado');
  }

  const documentoPDF = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const margen       = 40;
  const anchoPagina  = documentoPDF.internal.pageSize.getWidth()  - margen * 2;
  const altoPagina   = documentoPDF.internal.pageSize.getHeight() - margen * 2;
  let posicionY      = margen;

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

      const imagen     = lienzo.toDataURL('image/png');
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
window.cargarDatosExcel          = cargarDatosExcel;
window.descargarPDF              = descargarPDF;
window.agregarTexto            = agregarTexto;
window.agregarGrafica          = agregarGrafica;

// Ejecutar inicialización al cargar el DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarModuloAnalisis);
} else {
  // Ejecutar tras un breve retardo en caso de que ya esté listo
  setTimeout(inicializarModuloAnalisis, 100);
}