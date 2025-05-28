const { URL_BASE } = require('../../../framework/utils/scripts/constantes.js');

async function plantillas() {
    const respuesta = await fetch(`${URL_BASE}/plantillas/consultarTodas/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
  
    const datos = await respuesta.json();
  
    return { ok: respuesta.ok, ...datos };
  }
  
  module.exports = {
    plantillas,
};