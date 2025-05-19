// RF17 - Usuario añade cuadro de texto al reporte - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/rf17/
// RF36 - Usuario añade gráfica a reporte - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF36

/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
if (typeof Swal === 'undefined') {
    const Swal = require('sweetalert2');
}
const { agregarTexto } = require('./agregarTexto');
const { agregarGrafica } = require('./agregarGrafica');

/**
   * Crea y añade dos botones flotantes “+” en la tarjeta (arriba y abajo).
   *
   * @param {string} idContenedor – ID del contenedor donde se agregará la tarjeta de gráfica.
   * @param {string} idContenedorPrevisualizacion – ID del contenedor de previsualización de la gráfica.
   * @param {HTMLDivElement} tarjeta – La tarjeta destino.
   * @returns {void}
   */
function mostrarBotonesAgregar(idContenedor, idContenedorPrevisualizacion, tarjeta) {
    if (!tarjeta) return;

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
   * @param {string} idContenedor            – ID del contenedor donde se agregará la tarjeta de gráfica.
   * @param {string} idContenedorPrevisualizacion – ID del contenedor de previsualización de la gráfica.
   * @param {HTMLDivElement} tarjeta    – La tarjeta donde se hizo clic.
   * @param {'antes'|'despues'} ubicacion – Posición donde insertar la nueva tarjeta.
   * @returns {void}
   */
function abrirMenuAgregar(idContenedor, idContenedorPrevisualizacion, tarjeta, ubicacion) {
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
            configurarTexto(idContenedor, idContenedorPrevisualizacion, tarjeta, ubicacion);
        } else if (resultado.isDenied) {
            configurarGrafica(idContenedor, idContenedorPrevisualizacion, tarjeta, ubicacion);
        }
    });
}

/**
   * Elimina los botones flotantes “+” de la tarjeta dada.
   *
   * @param {HTMLDivElement} tarjeta – La tarjeta destino.
   * @returns {void}
   */
function ocultarBotonesAgregar(tarjeta) {
    if (!tarjeta) return;
    tarjeta.querySelectorAll('.btn-agregar-flotante')
        .forEach(boton => boton.remove());
    cerrarMenuAgregar(tarjeta);
}

/**
 * Cierra el menú de inserción si estuviera abierto.
 *
 * @param {HTMLDivElement} tarjeta – La tarjeta destino.
 * @returns {void}
 */
function cerrarMenuAgregar(tarjeta) {
    const menuExistente = tarjeta.querySelector('.menu-agregar');
    if (menuExistente) menuExistente.remove();
}

/**
 * Agrega un cuadro de texto al contenedor especificado y configura los botones de agregar.
 * 
 * @param {string} contenedorId            - ID del contenedor donde se agregará la tarjeta de gráfica.
 * @param {string} previsualizacionId      - ID del contenedor de previsualización de la gráfica.
 * @param {HTMLDivElement|null} tarjetaRef        - Tarjeta existente junto a la cual insertar (null = al final).
 * @param {'antes'|'despues'} posicion     - 'antes' o 'despues' respecto a tarjetaRef.
 * @returns {void}
 */
function configurarTexto(idContenedor, idContenedorPrevisualizacion, tarjeta = null, ubicacion = null) {
  const tarjetaTexto = agregarTexto(idContenedor, idContenedorPrevisualizacion, tarjeta, ubicacion);
  
  tarjetaTexto.addEventListener('mouseenter', () => {
    mostrarBotonesAgregar(idContenedor, idContenedorPrevisualizacion, tarjetaTexto);
  })

  tarjetaTexto.addEventListener('mouseleave', () => { 
    ocultarBotonesAgregar(tarjetaTexto);
  })
}

/**
 * Agrega una gráfica al contenedor especificado y configura los botones de agregar.
 * 
 * @param {string} contenedorId            - ID del contenedor donde se agregará la tarjeta de gráfica.
 * @param {string} previsualizacionId      - ID del contenedor de previsualización de la gráfica.
 * @param {HTMLDivElement|null} tarjetaRef        - Tarjeta existente junto a la cual insertar (null = al final).
 * @param {'antes'|'despues'} posicion     - 'antes' o 'despues' respecto a tarjetaRef.
 * @returns {void}
 */
function configurarGrafica(idContenedor, idContenedorPrevisualizacion, tarjeta = null, ubicacion = null) {
  const tarjetaGrafica = agregarGrafica(idContenedor, idContenedorPrevisualizacion, tarjeta, ubicacion);
  
  tarjetaGrafica.addEventListener('mouseenter', () => {
    mostrarBotonesAgregar(idContenedor, idContenedorPrevisualizacion, tarjetaGrafica);
  })

  tarjetaGrafica.addEventListener('mouseleave', () => { 
    ocultarBotonesAgregar(tarjetaGrafica);
  })
}

module.exports = {
    mostrarBotonesAgregar,
    ocultarBotonesAgregar,
    configurarTexto,
    configurarGrafica,
};