
async function guardarPlantillas(Plantilla) {
    console.log("entraAPI");
    const respuesta = await fetch(`${process.env.URL_BASE}/plantillas/guardar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: Plantilla
    });
  
    const datos = await respuesta.json();
  
    return { ok: respuesta.ok, ...datos };
  }
  
  module.exports = {
    guardarPlantillas,
  };