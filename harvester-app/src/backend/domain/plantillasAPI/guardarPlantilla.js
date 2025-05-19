const {URL_BASE} = require('../../../framework/utils/js/constantes.js')

/**
 * Se mandan los datos a la API
 * @param {string} contenedor - HTML de la vista a enviar
 */

async function guardarPlantillaAPI(contenedor) {
    console.log('entraAPI');
    console.log(contenedor)
    const respuesta = await fetch(`${URL_BASE}/plantillas/guardar/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plantilla: contenedor })
    });
    console.log("respuesta:",respuesta)
    const datos = await respuesta.json();
     console.log('HTTP status:', respuesta.status);
     console.log('response.ok:', respuesta.ok); 
     console.log('response.ok:', respuesta.mensaje); 
     
    return { ok: respuesta.ok, ...datos };
}

module.exports = { guardarPlantillaAPI };
