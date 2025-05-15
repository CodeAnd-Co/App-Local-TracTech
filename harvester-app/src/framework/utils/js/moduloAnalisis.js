/**
 * @file moduloAnalisis.js
 * @module moduloAnalisis
 * @description Módulo que inicializa la interfaz de análisis, configura eventos de botones para agregar texto, gráficas y descargar el reporte en PDF.
 * @version 1.0
 * @since 2025-04-28
 */

/* eslint-disable no-unused-vars */
const { jsPDF: JSPDF } = window.jspdf;
if (typeof Swal === 'undefined'){
  const Swal = require('sweetalert2');
}

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
/* eslint-disable no-undef */
function inicializarModuloAnalisis() {
  // IDs de los contenedores principales
  const idContenedor                 = 'contenedorElementos';
  const idContenedorPrevisualizacion = 'contenedor-elementos-previsualizacion';

  // Obtener referencia al contenedor donde se añaden las tarjetas
  const contenedor = document.getElementById(idContenedor);

  // 1) Ocultar botones globales de agregar texto y gráfica
  document.getElementById('agregarTexto').style.display   = 'none';
  document.getElementById('agregarGrafica').style.display = 'none';

  // 2) Listener de clic para descargar el reporte en PDF
  document.getElementById('descargarPDF')
          .addEventListener('click', descargarPDF);

  // 3) Si el contenedor está vacío, iniciar con una tarjeta de texto y otra de gráfica
  if (contenedor.children.length === 0) {
    agregarTexto(idContenedor, idContenedorPrevisualizacion);
    agregarGrafica(idContenedor, idContenedorPrevisualizacion);
  }

  // 4) Delegación de eventos en el contenedor para tarjetas: mostrar/ocultar botones flotantes
  contenedor.addEventListener('mouseenter', alEntrarTarjeta, true);
  contenedor.addEventListener('mouseleave', alSalirTarjeta, true);

  /**
   * Muestra los botones “+” al entrar el ratón sobre una tarjeta de texto o gráfica.
   *
   * @param {MouseEvent} evento
   * @returns {void}
   */
  function alEntrarTarjeta(evento) {
    const tarjeta = evento.target.closest('.tarjeta-texto, .tarjeta-grafica');
    if (tarjeta) mostrarBotonesAgregar(tarjeta);
  }

  /**
   * Oculta los botones “+” al salir el ratón de una tarjeta.
   *
   * @param {MouseEvent} evento
   * @returns {void}
   */
  function alSalirTarjeta(evento) {
    const tarjeta = evento.target.closest('.tarjeta-texto, .tarjeta-grafica');
    if (tarjeta) ocultarBotonesAgregar(tarjeta);
      cerrarMenuAgregar(tarjeta);

  }
  /**
   * Crea y añade dos botones flotantes “+” en la tarjeta (arriba y abajo).
   *
   * @param {Element} tarjeta – La tarjeta destino.
   * @function mostrarBotonesAgregar
   * @memberof module:moduloAnalisis
   * @returns {void}
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
   * Elimina los botones flotantes “+” de la tarjeta dada.
   *
   * @param {Element} tarjeta – La tarjeta destino.
   * @function ocultarBotonesAgregar
   * @memberof module:moduloAnalisis
   * @returns {void}
   */
  function ocultarBotonesAgregar(tarjeta) {
    tarjeta.querySelectorAll('.btn-agregar-flotante')
           .forEach(boton => boton.remove());
  }

  /**
   * Abre un modal de SweetAlert2 con opciones para insertar una tarjeta de texto o de gráfica.
   *
   * @param {Element} tarjeta    – La tarjeta donde se hizo clic.
   * @param {'antes'|'despues'} ubicacion – Posición donde insertar la nueva tarjeta.
   * @function abrirMenuAgregar
   * @memberof module:moduloAnalisis
   * @returns {void}
   */
  function abrirMenuAgregar(tarjeta, ubicacion) {
    Swal.fire({
      title: 'Agregar',
      width: '180px',
      padding: '0.5rem',
      showCancelButton: true,
      showDenyButton:   true,
      confirmButtonText:
        '<img src="../utils/iconos/Texto.svg" class="icono-agregar"/> Texto',
      denyButtonText:
        '<img src="../utils/iconos/GraficaBarras.svg" class="icono-agregar"/> Gráfica',
      cancelButtonText: '✕',
      target:           tarjeta,
      buttonsStyling:   false,
      customClass: {
        container:     'swal2-container-inline',
        popup:         'swal2-popup-inline',
        confirmButton: 'boton-agregar small',
        denyButton:    'boton-agregar small',
        cancelButton:  'swal2-cancel-inline'
      }
    }).then(resultado => {
      if (resultado.isConfirmed) {
        agregarTexto(idContenedor, idContenedorPrevisualizacion, tarjeta, ubicacion);
      } else if (resultado.isDenied) {
        agregarGrafica(idContenedor, idContenedorPrevisualizacion, tarjeta, ubicacion);
      }
      // Si canceló, no hace nada
    });
  }

  /**
   * Cierra el menú de inserción si estuviera abierto.
   *
   * @param {Element} tarjeta – La tarjeta destino.
   * @function cerrarMenuAgregar
   * @memberof module:moduloAnalisis
   * @returns {void}
   */
  function cerrarMenuAgregar(tarjeta) {
    const menuExistente = tarjeta.querySelector('.menu-agregar');
    if (menuExistente) menuExistente.remove();
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
function descargarPDF() {
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
      const altoImagen = anchoPagina * proporcion;
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
      documentoPDF.addImage(imagen, 'PNG', margen, posicionY + espaciado, anchoPagina, altoImagen);
      posicionY += altoFondo + 35;
    }
  });

  // Guardar el archivo PDF generado
  documentoPDF.save('reporte.pdf');
}

// Exponer funciones en el ámbito global para uso externo
window.inicializarModuloAnalisis = inicializarModuloAnalisis;
window.cargarDatosExcel          = cargarDatosExcel;
window.descargarPDF              = descargarPDF;
window.agregarTexto              = agregarTexto;
window.agregarGrafica            = agregarGrafica;

// En algunos navegadores, volver a inicializar tras un breve retardo si ya cargó el DOM
if (document.readyState !== 'loading') {
  setTimeout(inicializarModuloAnalisis, 100);
}
