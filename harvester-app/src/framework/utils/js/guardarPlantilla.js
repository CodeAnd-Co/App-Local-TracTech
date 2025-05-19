const Swal = require('sweetalert2');

async function guardarPlantilla(idElemento, nombrePlantilla) {
  const elemento = document.getElementById(idElemento);
  if (!elemento) {
    console.error(`No se encontró ningún elemento con id "${idElemento}"`);
    return;
  }
  const { guardarPlantillas } = require('../../backend/casosUso/plantillas/guardarPlantillas');

  const htmlString = elemento.outerHTML;
  console.log('length', htmlString.length);

  try {
    const resp = await guardarPlantillas(htmlString, nombrePlantilla);
    console.log('Plantilla guardada con éxito:', resp);
    Swal.fire({
      title: 'Éxito',
      text: '¡Se guardó la plantilla correctamente!',
      icon: 'success',
      draggable: true
    });
  } catch (err) {
    console.error('Error al guardar plantilla:', err);
    Swal.fire({
      title: 'Error al guardar plantilla',
      text: 'No se guardó la plantilla',
      icon: 'warning'
    });
  }
}

window.guardarPlantilla = guardarPlantilla;
