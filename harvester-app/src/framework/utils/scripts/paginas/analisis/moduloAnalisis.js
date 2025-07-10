// RF25 - Usuario descarga reporte en PDF - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/rf25/
const Swal = require(`${rutaBase}/node_modules/sweetalert2/dist/sweetalert2.all.min.js`);
const { cargarFormulasIniciales } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/formulas/cargarFormulasIniciales.js`);
const { guardarPlantillaSimplificada } = require(`${rutaBase}/src/backend/casosUso/plantillas/guardarPlantilla.js`);
const { cargarYAplicarPlantillaSimplificada, obtenerListaPlantillasSimplificadas } = require(`${rutaBase}/src/backend/casosUso/plantillas/cargarPlantilla.js`);
/* eslint-disable no-unused-vars */
const { jsPDF } = require(`${rutaBase}/node_modules/jspdf/dist/jspdf.umd.min.js`);
const { mostrarAlerta, mostrarAlertaSinBoton } = require(`${rutaBase}/src/framework/vistas/includes/componentes/moleculas/alertaSwal/alertaSwal`);

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
 * - Carga las fórmulas disponibles.
*
* @returns {void}
*/
/* eslint-disable no-undef */
async function inicializarModuloAnalisis() {
  const idContenedor = 'contenedorElementos';
  const idContenedorPrevisualizacion = 'contenedor-elementos-previsualizacion';

  const contenedor = document.getElementById(idContenedor);
  if (!contenedor) return;

  // Cargar fórmulas al inicializar el módulo
  await cargarFormulasIniciales([]);
  

  const botonPDF = document.getElementById('descargarPDF')
  const pantallaBloqueo = document.getElementById('pantalla-bloqueo');
  botonPDF.addEventListener('click', async () => {

    const anterior = botonPDF.textContent;
    botonPDF.disabled = true;
    const contenedorTexto = botonPDF.children[1]
    contenedorTexto.textContent = 'Descargando...';
    pantallaBloqueo.classList.remove('oculto');

    // Mostrar alerta de descarga en progreso
    mostrarAlertaSinBoton(
      'Descargando reporte',
      'Seleccione la ubicación para guardar el reporte.',
      'info'
    );

    descargarPDF()

    ipcRenderer.once('pdf-guardado', (event, exito) => {
      // Cerrar la alerta de descarga
      if (window.Swal) Swal.close();

      botonPDF.disabled = false;
      contenedorTexto.textContent = anterior;
      pantallaBloqueo.classList.add('oculto');
      
      if (exito) {
        mostrarAlerta('Reporte descargado', 'El reporte se ha guardado correctamente.', 'success');
      } else {
        mostrarAlerta('Reporte cancelado', 'La descarga del reporte ha sido cancelada.', 'info');
      }
    });
  });

  // Configurar botón de guardar plantilla
  const botonGuardarPlantilla = document.getElementById('guardarPlantilla');
  if (botonGuardarPlantilla) {
    botonGuardarPlantilla.addEventListener('click', async () => {
      await manejarGuardarPlantilla();
    });
  }

  // Configurar botón de cargar plantilla
  const botonCargarPlantilla = document.getElementById('cargarPlantilla');
  if (botonCargarPlantilla) {
    botonCargarPlantilla.addEventListener('click', async () => {
      await manejarCargarPlantilla();
    });
  }

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

  } catch {
    mostrarAlerta('Error', 'Ocurrió un error al cargar los datos de Excel.', 'error'); 
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
    mostrarAlerta('Error al descargar reporte', 'Ha ocurrido un error, contacta a soporte', 'error');
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
    mostrarAlerta('Error al descargar reporte', 'No se encontró el contenedor de previsualización', 'warning');
    throw new Error('[PDF] Contenedor de previsualización no encontrado');
  }

  Array.from(contenedorPrevisualizacion.children).forEach(elemento => {
    if (elemento.classList.contains('previsualizacion-texto')) {
      const espaciadoArriba = 15;
      const espaciadoAbajo = 30;
      let tamanoFuente = 11.5;
      let estiloFuente = 'normal';
      let alineado = 'left';
      if (elemento.classList.contains('preview-titulo')) { tamanoFuente = 18; estiloFuente = 'bold' }
      if (elemento.classList.contains('preview-subtitulo')) { tamanoFuente = 15; estiloFuente = 'bold' }
      if (elemento.style?.getPropertyValue('text-align') == 'center') { alineado =  'center'}
      if (elemento.style?.getPropertyValue('text-align') == 'right') { alineado =  'right'}

      documentoPDF.setFontSize(tamanoFuente);
      documentoPDF.setFont(undefined, estiloFuente);

      Array.from(elemento.children).forEach((elementoSecundario) => {
        const texto = elementoSecundario.textContent;
        if (!texto) return;

        const lineas = documentoPDF.splitTextToSize(texto, anchoPagina);
        const posicionYAgregar = (lineas.length * tamanoFuente) + espaciadoAbajo + espaciadoArriba

        if (posicionY + posicionYAgregar > altoPagina + margen) {
          documentoPDF.addPage();
          posicionY = margen;
        }

        let ejeXPdf = margen

        if(alineado == 'center'){
          ejeXPdf = (anchoPagina + (margen * 2))/2;
        } 

        if(alineado == 'right'){
          ejeXPdf = (anchoPagina + (margen));
        } 

        documentoPDF.text(lineas, ejeXPdf, posicionY + tamanoFuente + espaciadoArriba, { align: alineado });

        posicionY += posicionYAgregar;
      })

    } else if (elemento.classList.contains('previsualizacion-grafica')) {

      const lienzo = elemento.querySelector('canvas');
      if (!lienzo) return;

      const imagen = lienzo.toDataURL('image/png');
      const proporcion = lienzo.height / lienzo.width;
      const anchoImagen = anchoPagina;
      const altoImagen = anchoPagina * proporcion;
      const espaciado = 10;
      const espaciadoFonodo = 5;
      const anchoFondo = anchoImagen;
      const altoFondo = altoImagen + (espaciado * 2) + espaciadoFonodo;
      const radioFondo = 6;
      const margenAbajo = 15;

      if (posicionY + altoImagen > altoPagina + margen) {
        documentoPDF.addPage();
        posicionY = margen;
      }

      documentoPDF.setFillColor(224, 224, 224);
      documentoPDF.roundedRect(margen, posicionY, anchoFondo, altoFondo, radioFondo, radioFondo, 'F');
      documentoPDF.addImage(imagen, 'PNG', margen, posicionY + espaciado, anchoImagen, altoImagen);
      posicionY += altoFondo + margenAbajo;
    }
  });

  const documentoNuevo = documentoPDF.output('blob');
  const pdfBufer = await documentoNuevo.arrayBuffer();

  ipcRenderer.send('guardar-pdf', Buffer.from(pdfBufer));
}

/**
 * Maneja el proceso de guardar una plantilla
 * Muestra un diálogo para que el usuario ingrese nombre y descripción
 */
async function manejarGuardarPlantilla() {
  try {
    // Verificar que hay elementos para guardar
    const contenedor = document.getElementById('contenedorElementos');
    if (!contenedor || contenedor.children.length === 0) {
      mostrarAlerta(
        'Sin elementos',
        'No hay elementos en el reporte para guardar como plantilla.',
        'warning'
      );
      return;
    }

    // Mostrar diálogo para nombre
    const { value: formValues } = await Swal.fire({
      title: 'Guardar Plantilla',
      html: `
        <div style="text-align: left; margin: 20px 0;">
          <label for="nombrePlantilla" style="display: block; margin-bottom: 5px; font-weight: bold;">Nombre de la plantilla:</label>
          <input id="nombrePlantilla" class="swal2-input" placeholder="Ej: Reporte Mensual Rendimiento" style="margin: 0;">
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar Plantilla',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#A61930',
      preConfirm: () => {
        const nombre = document.getElementById('nombrePlantilla').value;
        
        if (!nombre || nombre.trim() === '') {
          Swal.showValidationMessage('El nombre de la plantilla es requerido');
          return false;
        }
        
        if (nombre.length > 100) {
          Swal.showValidationMessage('El nombre debe tener menos de 100 caracteres');
          return false;
        }
        
        return {
          nombre: nombre.trim()
        };
      }
    });

    if (formValues) {
      // Mostrar indicador de carga
      mostrarAlertaSinBoton(
        'Guardando plantilla',
        'Por favor espere mientras se guarda la plantilla...',
        'info'
      );

      // Guardar la plantilla usando el sistema simplificado
      const resultado = await guardarPlantillaSimplificada(formValues.nombre);

      // Cerrar indicador de carga
      if (window.Swal) Swal.close();

      if (resultado.exito) {
        let mensaje = `Plantilla "${formValues.nombre}" guardada exitosamente con ID: ${resultado.idPlantilla}.`;
        
        if (resultado.estadisticas) {
          mensaje += `\n\n📊 Elementos guardados: ${resultado.estadisticas.elementosTotal}`;
          mensaje += `\n📈 Gráficas: ${resultado.estadisticas.graficas}`;
          mensaje += `\n📝 Textos: ${resultado.estadisticas.textos}`;
        }

        mostrarAlerta('Plantilla Guardada', mensaje, 'success');
      } else {
        mostrarAlerta(
          'Error al Guardar',
          resultado.error || 'No se pudo guardar la plantilla. Intente nuevamente.',
          'error'
        );
      }
    }
  } catch (error) {
    // Cerrar indicador de carga si está abierto
    if (window.Swal) Swal.close();
    
    console.error('Error al guardar plantilla:', error);
    mostrarAlerta(
      'Error Inesperado',
      'Ocurrió un error inesperado al guardar la plantilla.',
      'error'
    );
  }
}

/**
 * Maneja el proceso de cargar una plantilla
 * Muestra lista de plantillas disponibles para seleccionar
 */
async function manejarCargarPlantilla() {
  try {
    // Primero, obtener lista de plantillas disponibles
    mostrarAlertaSinBoton(
      'Cargando plantillas',
      'Obteniendo lista de plantillas disponibles...',
      'info'
    );

    const plantillasDisponibles = await obtenerListaPlantillasSimplificadas();

    // Cerrar indicador de carga
    if (window.Swal) Swal.close();

    if (!plantillasDisponibles || plantillasDisponibles.length === 0) {
      mostrarAlerta(
        'Sin plantillas',
        'No hay plantillas disponibles para cargar.',
        'info'
      );
      return;
    }

    // Crear opciones para el selector
    const opcionesHTML = plantillasDisponibles.map(plantilla => 
      `<option value="${plantilla.idPlantilla}">${plantilla.nombre}</option>`
    ).join('');

    // Mostrar diálogo de selección
    const { value: plantillaId } = await Swal.fire({
      title: 'Cargar Plantilla',
      html: `
        <div style="text-align: left; margin: 20px 0;">
          <label for="selectorPlantilla" style="display: block; margin-bottom: 10px; font-weight: bold;">Seleccione una plantilla:</label>
          <select id="selectorPlantilla" class="swal2-select" style="width: 100%; padding: 10px;">
            <option value="">-- Seleccione una plantilla --</option>
            ${opcionesHTML}
          </select>
          <p style="margin-top: 15px; font-size: 14px; color: #666;">
            ⚠️ Cargar una plantilla reemplazará el contenido actual del reporte.
          </p>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Cargar Plantilla',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#A61930',
      preConfirm: () => {
        const plantillaSeleccionada = document.getElementById('selectorPlantilla').value;
        
        if (!plantillaSeleccionada) {
          Swal.showValidationMessage('Debe seleccionar una plantilla');
          return false;
        }
        
        return parseInt(plantillaSeleccionada);
      }
    });

    if (plantillaId) {
      // Confirmar antes de proceder
      const confirmacion = await Swal.fire({
        title: '¿Continuar?',
        text: 'El contenido actual del reporte será reemplazado por la plantilla seleccionada.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cargar plantilla',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#A61930'
      });

      if (confirmacion.isConfirmed) {
        // Mostrar indicador de carga
        mostrarAlertaSinBoton(
          'Cargando plantilla',
          'Aplicando configuración de la plantilla...',
          'info'
        );

        // Cargar la plantilla usando el sistema simplificado
        const resultado = await cargarYAplicarPlantillaSimplificada(plantillaId);

        // Cerrar indicador de carga
        if (window.Swal) Swal.close();

        if (resultado.exito) {
          let mensaje = `Plantilla "${resultado.nombrePlantilla}" cargada exitosamente.`;
          
          if (resultado.estadisticas) {
            mensaje += `\n\n📊 Elementos aplicados: ${resultado.estadisticas.elementosTotal}`;
            mensaje += `\n📈 Gráficas: ${resultado.estadisticas.graficas}`;
            mensaje += `\n📝 Textos: ${resultado.estadisticas.textos}`;
          }

          mostrarAlerta('Plantilla Cargada', mensaje, 'success');
        } else {
          mostrarAlerta(
            'Error al Cargar',
            resultado.error || 'No se pudo cargar la plantilla. Intente nuevamente.',
            'error'
          );
        }
      }
    }
  } catch (error) {
    // Cerrar indicador de carga si está abierto
    if (window.Swal) Swal.close();
    
    console.error('Error al cargar plantilla:', error);
    mostrarAlerta(
      'Error Inesperado',
      'Ocurrió un error inesperado al cargar la plantilla.',
      'error'
    );
  }
}

inicializarModuloAnalisis();
cargarDatosExcel()