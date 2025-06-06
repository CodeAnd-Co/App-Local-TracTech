const Swal = require(`${rutaBase}/node_modules/sweetalert2/dist/sweetalert2.all.js`);


async function mostrarAlerta(titulo, texto, icono, textoBotonConfirmar = null) {
  const result = await Swal.fire({
    title: titulo,
    text: texto,
    icon: icono,
    confirmButtonText: textoBotonConfirmar ?? 'Aceptar',
    confirmButtonColor: '#a61930',
  });

  return result; // esto sí retorna un objeto con isConfirmed, etc.
}


async function mostrarAlertaConfirmacion(titulo, texto, icono, textoBotonConfirmar=null, textoBotonCancelar=null) {
  const resultado = await Swal.fire({
    title: titulo,
    text: texto,
    icon: icono,
    showCancelButton: true,
    confirmButtonText: (textoBotonConfirmar)? textoBotonConfirmar : 'Confirmar',
    cancelButtonText: (textoBotonCancelar)? textoBotonCancelar : 'Cancelar',
    confirmButtonColor: '#a61930'
  });
  if (resultado.isConfirmed){
    return true;
  } else {
    return false;
  }
}

async function mostrarAlertaBorrado(texto=null, textoBotonConfirmar=null, textoBotonCancelar=null){
    const resultado = await Swal.fire({
        title: '¿Estás seguro?',
        text: (texto)? texto : 'No podrá recuperar este registro después de borrarlo.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: (textoBotonConfirmar)? textoBotonConfirmar : 'Borrar',
        cancelButtonText: (textoBotonCancelar)? textoBotonCancelar : 'Cancelar',
        confirmButtonColor: '#a61930',
    });
    if (resultado.isConfirmed){
      return true;
    } else {
      return false;
    }
}

async function mostrarAlertaSinBoton(titulo, texto, icono) {
  return await Swal.fire({
    title: titulo,
    text: texto,
    icon: icono,
    showConfirmButton: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
  });
}




module.exports = {
    mostrarAlerta,
    mostrarAlertaConfirmacion,
    mostrarAlertaBorrado,
    mostrarAlertaSinBoton
}