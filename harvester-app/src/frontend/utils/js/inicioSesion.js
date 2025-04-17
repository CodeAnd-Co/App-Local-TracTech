const btnAbrirInfo = document.querySelector("#btn-abrir-info");
const btnCerrarrInfo = document.querySelector("#btn-cerrar-info");
const modalInfo = document.querySelector("#modalContacto");

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