async function iniciarSesion(correo, contrasena) {
  const respuesta = await fetch("http://localhost:3000/sesion/iniciar-sesion", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ correo, contrasena }),
  });

  const datos = await respuesta.json();

  return { ok: respuesta.ok, ...datos };
}

module.exports = {
  iniciarSesion,
};
