const { plantillas } = require('../../backend/domain/plantillasAPI/plantillasAPI.js');
const { eliminarPlantillas } = require('../../backend/domain/plantillasAPI/eliminarPlantillasAPI.js');
const { seleccionarPlantillas } = require('../../backend/domain/plantillasAPI/seleccionarPlantillaAPI.js');
if (typeof Swal === 'undefined') {
    var Swal = require('sweetalert2');
}

/**
 * Muestra una alerta de error usando SweetAlert2.
 * 
 * @param {string} mensaje - Texto que se mostrará en el mensaje de error.
 */
function mostrarError(mensaje) {
    Swal.fire({
        title: 'Error',
        text: mensaje,
        icon: 'error',
        confirmButtonColor: '#1F4281',
    });
}

/**
 * Elimina del DOM la tarjeta de plantilla correspondiente a un ID.
 * Si no hay más plantillas, muestra un mensaje de "No se Encontraron Plantillas".
 * 
 * @param {string} idPlantilla - ID de la plantilla a eliminar del DOM.
 */
function eliminarDelDOM(idPlantilla) {
    const plantillaHTML = document.querySelector(`#menuOpciones[dato-id='${idPlantilla}']`)?.closest('.plantilla');
    plantillaHTML?.remove();

    const todasPlantillas = document.querySelectorAll('.plantilla');
    if (todasPlantillas.length === 0) {
        const contenedor = document.getElementById('contenedorId');
        const tarjetaTexto = document.createElement('div');
        tarjetaTexto.innerHTML = `<div class='error-sin-plantillas'>No se Encontraron Plantillas</div>`;
        contenedor?.appendChild(tarjetaTexto);
    }
}

/**
 * Pregunta al usuario si desea eliminar la plantilla.
 * Si confirma, elimina la plantilla desde backend y del DOM.
 * 
 * @param {string} idPlantilla - ID de la plantilla a eliminar.
 * @param {boolean} [cerrarModal=false] - Si se debe cerrar el modal visualizador tras eliminar.
 */
async function confirmarYEliminarPlantilla(idPlantilla, cerrarModal = false) {
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: 'No podrás recuperar la plantilla eliminada.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#1F4281',
        cancelButtonColor: '#A61930',
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        try {
            const respuesta = await eliminarPlantillas(idPlantilla);
            if (respuesta.ok) {
                if (cerrarModal) {
                    document.getElementById('modalVizualizador')?.close();
                }
                eliminarDelDOM(idPlantilla);
            } else {
                mostrarError('Hubo un error al eliminar la plantilla.');
            }
        } catch {
            mostrarError('Hubo un error al eliminar la plantilla.');
        }
    }
}

/**
 * Crea y agrega una tarjeta de plantilla en el DOM.
 * También configura los eventos de expandir, editar y eliminar.
 * 
 * @param {Object} plantilla - Objeto con los datos de la plantilla.
 * @param {string} plantilla.idPlantillaReporte - ID de la plantilla.
 * @param {string} plantilla.Nombre - Nombre de la plantilla.
 * @param {string} plantilla.Datos - Contenido HTML de la plantilla.
 */
function renderizarPlantilla(plantilla) {
    const contenedor = document.getElementById('contenedorId');
    const tarjeta = document.createElement('div');
    tarjeta.classList.add('plantilla');

    tarjeta.innerHTML = `
        <div class='menu-opciones' dato-id='${plantilla.idPlantillaReporte}' id='menuOpciones'>
            <div class='nombre-de-plantilla'>${plantilla.Nombre}</div>
            <button id='botonExpandir'><img class='maximize-2' src='../utils/iconos/Maximize.svg' /></button>
            <button id='botonModificar'><img class='edit-2' src='../utils/iconos/Editar2.svg' /></button>
            <button id='botonEliminar'><img class='trash' src='../utils/iconos/BasuraRojo.svg' /></button>
        </div>
        <img src='../utils/iconos/divisorPlantilla.svg' class='divisorPlantilla'/>
        <scroll-container>${plantilla.Datos}</scroll-container>
    `;

    contenedor?.appendChild(tarjeta);

    const menuOpciones = tarjeta.querySelector('#menuOpciones');
    const idPlantilla = menuOpciones.getAttribute('dato-id');

    tarjeta.querySelector('#botonExpandir').addEventListener('click', () => expandirPlantilla(idPlantilla, plantilla.Nombre));
    tarjeta.querySelector('#botonModificar').addEventListener('click', () => alert(idPlantilla));
    tarjeta.querySelector('#botonEliminar').addEventListener('click', () => confirmarYEliminarPlantilla(idPlantilla));
}

/**
 * Muestra el modal visualizador con los datos de una plantilla expandida.
 * 
 * @param {string} idPlantilla - ID de la plantilla a expandir.
 * @param {string} nombre - Nombre de la plantilla a mostrar en el título.
 */
async function expandirPlantilla(idPlantilla) {
    try {
        const respuesta = await seleccionarPlantillas(idPlantilla);
        if (respuesta.ok) {
            const modal = document.getElementById('modalVizualizador');
            modal.showModal();
            modal.addEventListener('click', (event) => {
                const rect = modal.getBoundingClientRect();
                if (!(event.clientX >= rect.left && event.clientX <= rect.right 
                    && event.clientY >= rect.top && event.clientY <= rect.bottom)) {
                    modal.close();
                }
            });

            document.getElementById('Titulo-Maximisado').innerText = respuesta.plantilla.Nombre;
            document.getElementById('Scroll').innerHTML = respuesta.plantilla.Datos;

            const botonEliminar = document.getElementById('boton_eliminar_Visualizador');
            botonEliminar.onclick = () => confirmarYEliminarPlantilla(idPlantilla, true);
        }
    } catch {
        mostrarError('Hubo un error de conexión.');
    }
}

/**
 * Inicializa el módulo de plantillas:
 * - Carga las plantillas desde el backend.
 * - Renderiza cada plantilla.
 * - Maneja el caso de no encontrar plantillas.
 * 
 * @async
 * @function
 * @returns {Promise<void>}
 */
async function inicializarModuloPlantillas() {
    try {
        const contenedor = document.getElementById('contenedorId');
        contenedor.innerHTML = '';

        const respuesta = await plantillas();
        const lista = respuesta?.plantillas;

        if (lista && lista.length > 0) {
            lista.forEach(renderizarPlantilla);
        } else {
            const tarjetaTexto = document.createElement('div');
            tarjetaTexto.innerHTML = `<div class='error-sin-plantillas'>No se Encontraron Plantillas</div>`;
            contenedor?.appendChild(tarjetaTexto);
        }
    } catch {
        mostrarError('Hubo un error de conexión.');
    }
}

/**
 * Expone la función de inicialización al contexto global.
 * 
 * @global
 * @function
 */
window.inicializarModuloPlantillas = inicializarModuloPlantillas;