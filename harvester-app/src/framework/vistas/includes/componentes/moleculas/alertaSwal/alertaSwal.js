const Swal = require(`${rutaBase}/node_modules/sweetalert2/dist/sweetalert2.all.js`);


function mostrarAlerta(titulo, texto, icono) {
  Swal.fire({
    title: titulo,
    text: texto,
    icon: icono,
    confirmButtonText: 'Aceptar',
    confirmButtonColor: '#a61930',
  });
  return;
}

async function mostrarAlertaConfirmacion(titulo, texto, icono) {
  const resultado = await Swal.fire({
    title: titulo,
    text: texto,
    icon: icono,
    showCancelButton: true,
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#a61930',
  });
  return resultado.isConfirmed;
}

async function mostrarAlertaBorrado(){
    const resultado = await Swal.fire({
        title: '¿Está seguro?',
        text: "No podrá recuperar este registro después de borrarlo.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#a61930',
    });
    return resultado.isConfirmed;
}




module.exports = {
    mostrarAlerta,
    mostrarAlertaConfirmacion,
    mostrarAlertaBorrado
}