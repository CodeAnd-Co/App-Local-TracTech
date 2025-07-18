const { URL_BASE } = require(`${rutaBase}src/framework/utils/scripts/constantes.js`);

async function eliminarPlantilla(nombrePlantilla, token) {
    const respuesta = await fetch(`${URL_BASE}/plantillas/eliminarPlantilla/${nombrePlantilla}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
    });
  
    const datos = await respuesta.json();
  
    return { ok: respuesta.ok, ...datos };
  }
  
  module.exports = {
    eliminarPlantilla,
  };