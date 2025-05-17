async function plantillas() {
    const respuesta = await fetch(`${process.env.URL_BASE}/plantillas/consultar`, {
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