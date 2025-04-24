async function plantillas() {
    const respuesta = await fetch("http://localhost:3000/plantillas/consultar", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    });
  
    const datos = await respuesta.json();
    //alert(datos[0].Nombre)
  
    return { ok: respuesta.ok, ...datos };
  }
  
  module.exports = {
    plantillas,
  };
  