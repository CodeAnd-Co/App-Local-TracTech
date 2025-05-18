const Swal = require('sweetalert2');

const { guardarPlantillas } = require('../../backend/casosUso/plantillas/guardarPlantillas.js');
/**
 * Llama a la función del caso de uso con los datos ya procesados
 *  para guardar la plantilla.
 * @param {string} contenedor - HTML de la vista a enviar
 */
async function guardarPlantilla(idElemento, nombrePlantilla) {
  const elemento = document.getElementById(idElemento);
  if (!elemento) {
    console.error(`No se encontró ningún elemento con id "${idElemento}"`);
    return;
  }

  const htmlString = elemento.outerHTML;

  try {
    const resp = await guardarPlantillas(htmlString, nombrePlantilla);
    console.log('Plantilla guardada con éxito:', resp);
    Swal.fire({
      title: 'Exito',
      text: '¡Se guardo la plantilla correctamente!',
      icon: "success",
      draggable: true
    });
  } catch (err) {
    console.error('Error al guardar plantilla:', err);
    Swal.fire({
      title: 'Error al guardar plantilla',
      text: 'No se guardo la plantilla',
      icon: 'warning'
    });
  }
}
window.guardarPlantilla = guardarPlantilla;
