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
  } catch (err) {
    console.error('Error al guardar plantilla:', err);
  }
}

window.guardarPlantilla = guardarPlantilla;
