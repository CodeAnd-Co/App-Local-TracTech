/**
 * Se mandan los datos a la API
 * @param {string} contenedor - HTML de la vista a enviar
 */

async function guardarPlantillaAPI(contenedor) {
    console.log('entraAPI');
    const respuesta = await fetch(`${process.env.URL_BASE}/plantillas/guardar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plantilla: contenedor })
    });
    const datos = await respuesta.json();
    return { ok: respuesta.ok, ...datos };
}

module.exports = { guardarPlantillaAPI };
