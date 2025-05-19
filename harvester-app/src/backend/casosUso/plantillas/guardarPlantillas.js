const { JSDOM }              = require('jsdom');
const PlantillaReporte       = require('../../data/plantillasModelos/PlantillaReporte');
const GraficaContenido       = require('../../data/plantillasModelos/GraficaContenido');
const TextoContenido         = require('../../data/plantillasModelos/TextoContenido');
const { guardarPlantillaAPI} = require('../../domain/plantillasAPI/guardarPlantilla');

/**
 * Recibe el HTML serializado de todo el contenedor y el nombre de la plantilla,
 * extrae cada tarjeta de gráfica y de texto, las convierte en objetos de modelo,
 * y llama al API para persistirlo.
 *
 * @param {string} htmlString        — El outerHTML completo del contenedor
 * @param {string} nombrePlantilla   — Nombre que quiere el usuario
 */
async function guardarPlantillas(htmlString, nombrePlantilla) {
  // 1) Parseamos el HTML
  try{
    const dom      = new JSDOM(htmlString);
  const document = dom.window.document;

  const contenidos = [];
  let ordenGlobal  = 1;
    console.log("entry case")
  document.querySelectorAll('.tarjeta-grafica').forEach(node => {
    const nombre  = node.querySelector('.titulo-grafica')?.value    || '';
    const tipo    = node.querySelector('.tipo-grafica')?.value     || '';
    let parametros = {};
    const dataParam = node.getAttribute('data-param');
    if (dataParam) {
      try{
        parametros = JSON.parse(dataParam);
      }catch (error) {
            console.log(error)
        }
    }

    contenidos.push(new GraficaContenido({
      ordenContenido: ordenGlobal++,
      nombreGrafica:  nombre,
      tipoGrafica:    tipo,
      parametros
    }));
  });

  document.querySelectorAll('.tarjeta-texto').forEach(node => {
    const texto     = node.querySelector('textarea')?.value 
                      || node.textContent.trim();
    const tipoTexto = node.querySelector('.tipo-texto')?.value 
                      || node.getAttribute('data-tipo') 
                      || 'Parrafo';
    const alineacion= node.querySelector('.alineacion-texto')?.value 
                      || node.getAttribute('data-alineacion') 
                      || 'Izquierda';

    contenidos.push(new TextoContenido({
      ordenContenido: ordenGlobal++,
      tipoTexto,
      alineacion,
      contenidoTexto: texto
    }));
  });

  const plantilla = new PlantillaReporte({
    nombrePlantilla,
    datos: contenidos,
    frecuenciaEnvio: Number(document.querySelector('#frecuencia')?.value) || 0,
    correoDestino:   document.querySelector('#email')?.value           || '',
    numeroDestino:   document.querySelector('#telefono')?.value       || ''
  });

  return guardarPlantillaAPI(plantilla);
    
  }catch(error){
    console.log(error)
  }
  
}

module.exports = { guardarPlantillas };
