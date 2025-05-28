// frontend/utils/js/guardarPlantillaAPI.js
const { URL_BASE } = require('../../../framework/utils/scripts/constantes.js');

/**
 * Envía el objeto Plantilla al backend y devuelve un objeto con:
 *   - status: código HTTP
 *   - ok:     boolean (response.ok)
 *   - mensaje y id: lo que retorne tu API en JSON
 */
async function guardarPlantillaAPI(plantilla) {
  console.log('entraAPI', plantilla)
  const respuesta = await fetch(`${URL_BASE}/plantillas/guardar/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plantilla })
  })

  const status = respuesta.status
  let body = {}
  try {
    body = await respuesta.json()
  } catch (err) {
    console.error('Error parseando JSON de respuesta:', err)
  }

  return {
    status,
    ok:     respuesta.ok,
    mensaje: body.mensaje,
    id:     body.id
  }
}
module.exports = { guardarPlantillaAPI };