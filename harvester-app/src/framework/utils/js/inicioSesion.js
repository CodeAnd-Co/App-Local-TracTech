const btnAbrirInfo = document.querySelector("#btn-abrir-info");
const btnCerrarrInfo = document.querySelector("#btn-cerrar-info");
const modalInfo = document.querySelector("#modalContacto");
const btnAcceder = document.querySelector(".boton-acceder");
const inputCorreo = document.querySelector(".correo[type='email']");
const inputContrasena = document.querySelector(".contrasena");
const { iniciarSesion } = require("../../backend/domain/sesionAPI/sesionAPI");

btnAcceder.addEventListener("click", async () => {
  const correo = inputCorreo.value;
  const contrasena = inputContrasena.value;

  if (!correo || !contrasena) {
    alert("Por favor, completa todos los campos.");
    return;
  }

  try {
    const respuesta = await iniciarSesion(correo, contrasena);

    if (respuesta.ok) {
      // Redirigir al usuario a la página principal
      window.location.href = "./frameLayout.html";
    } else {
      // Mostrar error
      alert(respuesta.message || "Error al iniciar sesión.");
    }
  } catch (error) {
    console.error("Error al conectar con el backend:", error);
    alert("No se pudo conectar con el servidor.");
  }
});

btnAbrirInfo.addEventListener("click", ()=>{
  modalInfo.showModal();
})

function onClick(event) {
  if (event.target === dialog) {
    dialog.close();
  }
}

const dialog = document.querySelector("dialog");
dialog.addEventListener("click", onClick);