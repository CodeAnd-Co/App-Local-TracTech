async function iniciarSesion(correo, contrasena) {
  console.log("Intentando iniciar sesión con:", correo, contrasena);
  const response = await fetch("http://localhost:3000/sesion/iniciar-sesion", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ correo, contrasena }),
  });

  const data = await response.json();

  return { ok: response.ok, ...data };
}

module.exports = {
  iniciarSesion,
};
