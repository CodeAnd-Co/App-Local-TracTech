const { JSDOM }              = require('jsdom');
const PlantillaReporte       = require('../../data/plantillasModelos/PlantillaReporte');
const GraficaContenido       = require('../../data/plantillasModelos/GraficaContenido');
const TextoContenido         = require('../../data/plantillasModelos/TextoContenido');
const { guardarPlantillaAPI} = require('../../domain/plantillasAPI/guardarPlantilla');
const Swal                   = require('sweetalert2');

/**
 * Recibe el HTML serializado y nombre, extrae contenidos y
 * llama al API. Muestra SweetAlert según response.
 *
 * @param {string} htmlString      - outerHTML completo del contenedor
 * @param {string} nombrePlantilla - Nombre dado por el usuario
 */
async function guardarPlantillas(htmlString, nombrePlantilla) {
  try {
    const dom      = new JSDOM(htmlString);
    const document = dom.window.document;
    const contenidos = [];
    let ordenGlobal  = 1;

    document.querySelectorAll('.tarjeta-grafica').forEach(node => {
      const nombre  = node.querySelector('.titulo-grafica')?.value || '';
      const tipo    = node.querySelector('.tipo-grafica')?.value  || '';
      let parametros = {};
      const dataParam = node.getAttribute('data-param');
      if (dataParam) {
        parametros = JSON.parse(dataParam); 
      }
      contenidos.push(new GraficaContenido({
        ordenContenido: ordenGlobal++, nombreGrafica: nombre,
        tipoGrafica: tipo, parametros
      }));
    });

    document.querySelectorAll('.tarjeta-texto').forEach(node => {
      const texto      = node.querySelector('textarea')?.value || node.textContent.trim();
      const tipoTexto  = node.querySelector('.tipo-texto')?.value || node.getAttribute('data-tipo') || 'Parrafo';
      const alineacion = node.querySelector('.alineacion-texto')?.value || node.getAttribute('data-alineacion') || 'Izquierda';
      contenidos.push(new TextoContenido({
        ordenContenido: ordenGlobal++, tipoTexto,
        alineacion, contenidoTexto: texto
      }));
    });

    const plantilla = new PlantillaReporte({
      nombrePlantilla,
      datos: contenidos,
      frecuenciaEnvio: Number(document.querySelector('#frecuencia')?.value) || 0,
      correoDestino:   document.querySelector('#email')?.value           || '',
      numeroDestino:   document.querySelector('#telefono')?.value       || ''
    });
    const resp = await guardarPlantillaAPI(plantilla);

    if (resp.ok && resp.status === 201) {
      await Swal.fire({
        title: 'Plantilla guardada',
        text: resp.mensaje || 'Operación exitosa',
        icon: 'success'
      });
    } else if (resp.status === 400) {
      await Swal.fire({
        title: 'Datos inválidos',
        text: resp.mensaje || 'Faltan datos o formato erróneo',
        icon: 'warning'
      });
    } else {
      await Swal.fire({
        title: 'Error',
        text: resp.mensaje || 'Error interno del servidor',
        icon: 'error'
      });
    }

    return resp;
  } catch (error) {
    console.error('Error en caso de uso guardarPlantillas:', error);
    await Swal.fire({
      title: 'Error inesperado',
      text: 'No se pudo procesar la plantilla',
      icon: 'error'
    });
    throw error;
  }
}

module.exports = { guardarPlantillas };