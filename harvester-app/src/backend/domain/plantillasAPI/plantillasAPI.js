async function plantillas() {
    const respuesta = await fetch("http://localhost:3000/plantillas/consultar", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ correo, contrasena }),
    });
  
    const datos = await respuesta.json();
    console.log(datos)
  
    return { ok: respuesta.ok, ...datos };
  }
  
  module.exports = {
    plantillas,
  };
  