const { guardarPlantillas } = require('../../backend/casosUso/plantillas/guardarPlantillas.js');
/**
 * Llama a la función del caso de uso con los datos ya procesados
 *  para guardar la plantilla.
 * @param {string} contenedor - HTML de la vista a enviar
 */
async function guardarPlantilla(idElemento) {
  const elemento = document.getElementById(idElemento);
  if (!elemento) {
    console.error(`No se encontró ningún elemento con id "${idElemento}"`);
    return;
  }

  const htmlString = elemento.outerHTML;
  console.log('HTML serialized:', htmlString);

  try {
    const resp = await guardarPlantillas(htmlString);
    console.log('Plantilla guardada con éxito:', resp);
  } catch (err) {
    console.error('Error al guardar plantilla:', err);
  }
}
window.guardarPlantilla = guardarPlantilla;
