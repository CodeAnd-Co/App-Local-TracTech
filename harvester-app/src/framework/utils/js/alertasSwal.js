const Swal = require('sweetalert2');
const {primario, secundario} = require('../css/estilos.css');

function mostrarAlerta(titulo, texto, icono) {
  Swal.fire({
    title: titulo,
    text: texto,
    icon: icono,
    confirmButtonText: 'Aceptar',
    customClass: {
      confirmButton: primario
    }
  });
  return;
}

function mostrarAlertaConfirmacion(titulo, texto, icono) {
  Swal.fire({
    title: titulo,
    text: texto,
    icon: icono,
    showCancelButton: true,
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar',
    customClass: {
      confirmButton: primario,
      cancelButton: secundario
    }
  }).then((result) => {
    if (result.isConfirmed) {
      return true;
    }
  });
    return false;
}

function mostrarAlertaBorrado(){
    Swal.fire({
        title: '¿Está seguro?',
        text: "No podrá recuperar este registro después de borrarlo.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, borrar',
        cancelButtonText: 'Cancelar',
        customClass: {
        confirmButton: primario,
        cancelButton: secundario
        }
    }).then((result) => {
        if (result.isConfirmed) {
        return true;
        }
    });
    return false;
}




module.exports = {
    mostrarAlerta,
    mostrarAlertaConfirmacion,
    mostrarAlertaBorrado
}
