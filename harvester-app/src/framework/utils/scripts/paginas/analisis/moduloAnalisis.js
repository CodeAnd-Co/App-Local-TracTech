// RF25 - Usuario descarga reporte en PDF - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/rf25/

/* eslint-disable no-unused-vars */
const { jsPDF } = require(`${rutaBase}/node_modules/jspdf/dist/jspdf.umd.min.js`);
const Swal = require(`${rutaBase}/node_modules/sweetalert2/dist/sweetalert2.all.min.js`);

if (typeof ipcRenderer === 'undefined') {
  const { ipcRenderer } = require('electron');
}
const { configurarTexto, configurarGrafica } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/botonesAgregar.js`);

/**
 * Solicita al usuario el nombre de la plantilla usando SweetAlert2
 * @returns {Promise<string|null>} Nombre de la plantilla o null si cancela
 */
async function pedirNombrePlantilla() {
  try {
    const { value: nombre } = await Swal.fire({
      title: 'Guardar Plantilla',
      text: 'Ingresa un nombre para la plantilla:',
      input: 'text',
      inputPlaceholder: 'Nombre de la plantilla',
      showCancelButton: true,
      confirmButtonColor: '#1F4281',
      cancelButtonColor: '#A61930',
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value || value.trim() === '') {
          return 'El nombre de la plantilla es requerido';
        }
        if (value.length > 45) {
          return 'El nombre debe tener menos de 45 caracteres';
        }
        return null;
      }
    });

    // Si el usuario cancela, retorna null
    if (!nombre) {
      return null;
    }

    return nombre.trim();
    
  } catch (error) {
    console.error('Error al solicitar nombre de plantilla:', error);
    Swal.fire({
      title: 'Error',
      text: 'Ocurrió un error al solicitar el nombre',
      icon: 'error',
      confirmButtonColor: '#1F4281',
    });
    return null;
  }
}

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

  document.getElementById('guardarPlantilla')
          .addEventListener('click', async () => {
            const nombre = await pedirNombrePlantilla();
            if (!nombre) return;
            window.guardarPlantilla(idContenedor, nombre);
          });
  
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
      let tamanoFuente = 12;
      let estiloFuente = 'normal';
      let espaciado = 11;
      if (elemento.classList.contains('preview-titulo')) { tamanoFuente = 18; estiloFuente = 'bold', espaciado = 14; }
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
      documentoPDF.roundedRect(margen - 2, posicionY, anchoFondo, altoFondo, radioFondo, radioFondo, 'F');
      documentoPDF.addImage(imagen, 'PNG', margen + desplazamiento, posicionY + espaciado, anchoImagen, altoImagen);
      posicionY += altoFondo + 35;
    }
  });

  const documentoNuevo = documentoPDF.output('blob');
  const pdfBufer = await documentoNuevo.arrayBuffer();

  ipcRenderer.send('guardar-pdf', Buffer.from(pdfBufer));
}

/**
 * Función global para guardar plantilla usando el caso de uso
 * @param {string} idContenedor - ID del contenedor con los elementos
 * @param {string} nombrePlantilla - Nombre de la plantilla
 */
window.guardarPlantilla = async function(idContenedor, nombrePlantilla) {
  try {
    // Obtener el contenedor
    const contenedor = document.getElementById(idContenedor);
    if (!contenedor) {
      throw new Error(`Contenedor '${idContenedor}' no encontrado`);
    }

    // Mostrar loading
    Swal.fire({
      title: 'Guardando plantilla...',
      text: 'Por favor espera',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // ✅ USAR rutaBase como en los otros requires
    const { guardarPlantillaCasoUso, mostrarResultadoGuardado } = require(`${rutaBase}/src/backend/casosUso/plantillas/guardarPlantilla.js`);

    // Opciones de envío (puedes agregar campos en el DOM si necesitas)
    const opcionesEnvio = {
      frecuencia: 0,
      correo: '',
      telefono: ''
    };

    console.log('Ejecutando caso de uso con:', { contenedor, nombrePlantilla, opcionesEnvio });

    // Ejecutar tu caso de uso
    const respuestaOriginal = await guardarPlantillaCasoUso(contenedor, nombrePlantilla, opcionesEnvio);
    
    console.log('Respuesta original del caso de uso:', respuestaOriginal);
    
    // ✅ CORREGIR: Si la respuesta no es exitosa pero tampoco es un error de red,
    // intentar nuevamente con serialización manual
    if (!respuestaOriginal.ok && respuestaOriginal.status === 500) {
      console.log('🔄 Reintentando con serialización manual...');
      
      // Extraer contenidos manualmente (sin clases)
      const contenidos = [];
      let ordenGlobal = 1;

      // Extraer textos directamente
      const tarjetasTexto = contenedor.querySelectorAll('.tarjeta-texto');
      tarjetasTexto.forEach(node => {
        try {
          const texto = node.querySelector('textarea')?.value?.trim() || node.textContent?.trim() || '';
          
          if (!texto) return;

          const tipoTexto = node.querySelector('.tipo-texto')?.value || node.getAttribute('data-tipo') || 'Parrafo';
          const alineacion = node.querySelector('.alineacion-texto')?.value || node.getAttribute('data-alineacion') || 'Izquierda';

          contenidos.push({
            ordenContenido: ordenGlobal++,
            tipoContenido: 'Texto',
            tipoTexto,
            alineacion,
            contenidoTexto: texto
          });
        } catch (error) {
          console.error('Error procesando texto:', error);
        }
      });

      // Extraer gráficas directamente
      const tarjetasGrafica = contenedor.querySelectorAll('.tarjeta-grafica');
      tarjetasGrafica.forEach(node => {
        try {
          const nombre = node.querySelector('.titulo-grafica')?.value?.trim() || '';
          const tipo = node.querySelector('.tipo-grafica')?.value?.trim() || '';
          
          if (!nombre || !tipo) return;

          let parametros = {};
          const dataParam = node.getAttribute('data-param');
          if (dataParam) {
            try {
              parametros = JSON.parse(dataParam);
            } catch (e) {
              parametros = {};
            }
          }

          contenidos.push({
            ordenContenido: ordenGlobal++,
            tipoContenido: 'Grafica',
            nombreGrafica: nombre,
            tipoGrafica: tipo,
            parametros
          });
        } catch (error) {
          console.error('Error procesando gráfica:', error);
        }
      });

      if (contenidos.length === 0) {
        throw new Error('No se encontraron contenidos válidos para guardar');
      }

      // Crear plantilla como objeto plano
      const plantillaPlana = {
        nombrePlantilla,
        contenidos, // Objetos planos, no clases
        frecuenciaEnvio: 0,
        correoDestino: '',
        numeroDestino: '',
        htmlString: contenedor.innerHTML
      };

      console.log('📤 Enviando plantilla plana:', plantillaPlana);

      // Enviar directamente a la API
      const URL_BASE = 'http://localhost:3000'; // Ajustar si es diferente
      const respuesta = await fetch(`${URL_BASE}/plantillas/guardar/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plantilla: plantillaPlana })
      });

      const datos = await respuesta.json();
      const respuestaFinal = { ok: respuesta.ok, status: respuesta.status, mensaje: datos.mensaje, id: datos.id };
      
      console.log('Respuesta del reintento:', respuestaFinal);
      
      // Cerrar loading
      Swal.close();
      
      // Mostrar resultado
      await mostrarResultadoGuardado(respuestaFinal);
      
      return respuestaFinal;
    }
    
    // Si la respuesta original fue exitosa, usarla
    // Cerrar loading
    Swal.close();
    
    // Mostrar resultado usando tu función helper
    await mostrarResultadoGuardado(respuestaOriginal);
    
    return respuestaOriginal;

  } catch (error) {
    // Cerrar loading si está abierto
    Swal.close();
    
    console.error('Error completo al guardar plantilla:', error);
    
    // Mostrar error más detallado para debug
    Swal.fire({
      title: 'Error al guardar',
      text: error.message || 'Ocurrió un error inesperado',
      icon: 'error',
      confirmButtonColor: '#1F4281',
      footer: `<small>Error técnico: ${error.name || 'Unknown'}</small>`
    });
  }
};

inicializarModuloAnalisis();
cargarDatosExcel()