async function eliminarPlantillas(idPlantilla) {
    const respuesta = await fetch("http://localhost:3000/plantillas/eliminar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({idPlantilla})
    });
  
    const datos = await respuesta.json();
  
    return { ok: respuesta.ok, ...datos };
  }
  
  module.exports = {
    eliminarPlantillas,
  };