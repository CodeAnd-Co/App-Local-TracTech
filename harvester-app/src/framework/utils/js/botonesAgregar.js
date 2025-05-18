
// /* eslint-disable no-unused-vars */
if (typeof Swal === 'undefined') {
    const Swal = require('sweetalert2');
}
const { agregarTexto } = require('./agregarTexto');

/**
   * Crea y añade dos botones flotantes “+” en la tarjeta (arriba y abajo).
   *
   * @param {Element} tarjeta – La tarjeta destino.
   * @function mostrarBotonesAgregar
   * @memberof module:moduloAnalisis
   * @returns {void}
   */
function mostrarBotonesAgregar(tarjeta, idContenedor, idContenedorPrevisualizacion) {
    console.log("Directorio actual:", __dirname);
    console.log("Ruta completa del archivo:", __filename);

    console.log('mostrarBotonesAgregar');

    if (tarjeta.querySelector('.btn-agregar-flotante')) return;
    tarjeta.classList.add('tarjeta-con-posicion');

    ['antes', 'despues'].forEach(ubicacion => {
        const botonFlotante = document.createElement('button');
        botonFlotante.classList.add(
            'btn-agregar-flotante',
            ubicacion === 'antes'
                ? 'btn-agregar-superior'
                : 'btn-agregar-inferior'
        );
        botonFlotante.textContent = '+';
        botonFlotante.dataset.ubicacion = ubicacion;
        botonFlotante.addEventListener('click', evento => {
            evento.stopPropagation();
            abrirMenuAgregar(idContenedor, idContenedorPrevisualizacion, tarjeta, ubicacion);
        });
        tarjeta.appendChild(botonFlotante);
    });
}

/**
   * Abre un modal de SweetAlert2 con opciones para insertar una tarjeta de texto o de gráfica.
   *
   * @param {Element} tarjeta    – La tarjeta donde se hizo clic.
   * @param {'antes'|'despues'} ubicacion – Posición donde insertar la nueva tarjeta.
   * @function abrirMenuAgregar
   * @memberof module:moduloAnalisis
   * @returns {void}
   */
function abrirMenuAgregar(idContenedor, idContenedorPrevisualizacion,tarjeta, ubicacion) {
    Swal.fire({
        title: 'Agregar',
        width: '180px',
        padding: '0.5rem',
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText:
            '<img src="../utils/iconos/Texto.svg" class="icono-agregar"/> Texto',
        denyButtonText:
            '<img src="../utils/iconos/GraficaBarras.svg" class="icono-agregar"/> Gráfica',
        cancelButtonText: '✕',
        target: tarjeta,
        buttonsStyling: false,
        customClass: {
            container: 'swal2-container-inline',
            popup: 'swal2-popup-inline',
            confirmButton: 'boton-agregar small',
            denyButton: 'boton-agregar small',
            cancelButton: 'swal2-cancel-inline'
        }
    }).then(resultado => {
        if (resultado.isConfirmed) {
            agregarTexto(idContenedor, idContenedorPrevisualizacion, tarjeta, ubicacion);
        } else if (resultado.isDenied) {
            window.agregarGrafica(idContenedor, idContenedorPrevisualizacion, tarjeta, ubicacion);
        }
        // Si canceló, no hace nada
    });
}

/**
   * Elimina los botones flotantes “+” de la tarjeta dada.
   *
   * @param {Element} tarjeta – La tarjeta destino.
   * @function ocultarBotonesAgregar
   * @memberof module:moduloAnalisis
   * @returns {void}
   */
function ocultarBotonesAgregar(tarjeta) {
    tarjeta.querySelectorAll('.btn-agregar-flotante')
        .forEach(boton => boton.remove());
    cerrarMenuAgregar(tarjeta);
}

/**
 * Cierra el menú de inserción si estuviera abierto.
 *
 * @param {Element} tarjeta – La tarjeta destino.
 * @function cerrarMenuAgregar
 * @memberof module:moduloAnalisis
 * @returns {void}
 */
function cerrarMenuAgregar(tarjeta) {
    const menuExistente = tarjeta.querySelector('.menu-agregar');
    if (menuExistente) menuExistente.remove();
}

module.exports = {
    mostrarBotonesAgregar,
    ocultarBotonesAgregar,
};