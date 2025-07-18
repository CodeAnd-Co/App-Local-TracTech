const { URL_BASE } = require(`${rutaBase}src/framework/utils/scripts/constantes.js`);

async function seleccionarPlantilla(idPlantilla, token) {
    const respuesta = await fetch(`${URL_BASE}/plantillas/seleccionar`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({idPlantilla})
    });
  
    const datos = await respuesta.json();
  
    return { ok: respuesta.ok, ...datos };
  }
  
  module.exports = {
    seleccionarPlantilla,
  };