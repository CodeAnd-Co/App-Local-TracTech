const { URL_BASE } = require('../../../framework/utils/js/constantes');

async function seleccionarPlantillas(idPlantilla) {
    const respuesta = await fetch(`${URL_BASE}/plantillas/seleccionar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({idPlantilla})
    });
  
    const datos = await respuesta.json();
  
    return { ok: respuesta.ok, ...datos };
  }
  
  module.exports = {
    seleccionarPlantillas,
  };