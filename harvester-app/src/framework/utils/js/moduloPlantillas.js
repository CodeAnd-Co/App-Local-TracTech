// RF 23: Usuario consulta plantillas de reporte. - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF23
// RF 21: Usuario elimina plantilla de reporte. - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF21

/**
 * Importa la función `plantillas` desde la capa de dominio para obtener las plantillas disponibles.
 * @module plantillasAPI
 */

const { plantillas } = require('../../backend/domain/plantillasAPI/plantillasAPI.js');
const { eliminarPlantillas } = require('../../backend/domain/plantillasAPI/eliminarPlantillasAPI.js');
const { seleccionarPlantillas } = require('../../backend/domain/plantillasAPI/seleccionarPlantillaAPI.js');

/**
 * Inicializa el módulo de plantillas, encargándose de:
 * - Obtener las plantillas desde el backend.
 * - Renderizar dinámicamente las tarjetas de plantilla.
 * - Configurar los eventos para eliminar, modificar y visualizar plantillas.
 *
 * @async
 * @function inicializarModuloPlantillas
 * @returns {Promise<void>}
 */
async function inicializarModuloPlantillas () {
    /** @type {HTMLElement|null} Botón para cancelar el diálogo de eliminación */
    const cancelarDialog = document.querySelector('.cancelar');
    
    cancelarDialog?.addEventListener('click', () => {
        const modalBorrar = document.querySelector('.modal-borrar');
        modalBorrar?.close();
    });

    /** @type {HTMLElement|null} Botón para confirmar la eliminación de plantilla */
    const eliminarDialog = document.querySelector('.eliminar');

    eliminarDialog?.addEventListener('click', async () => {
        const modalBorrar = document.querySelector('.modal-borrar');
        if(modalBorrar?.getAttribute('dato-id')) {
            try {
                /** @type {string|null} ID de la plantilla a eliminar */
                const idPlantilla = modalBorrar.getAttribute('dato-id');
                
                const respuesta = await eliminarPlantillas(idPlantilla);

                if (respuesta.ok){
                    // Eliminar del DOM la tarjeta correspondiente
                    const plantillaHTML = document.querySelector(`#menuOpciones[dato-id='${idPlantilla}']`)?.closest('.plantilla');
                    if (plantillaHTML) {
                        plantillaHTML.remove();
                        modalBorrar?.close();
                    }

                    // Verificar si ya no quedan plantillas visibles
                    const todasPlantillas = document.querySelectorAll('.plantilla');
                    if(todasPlantillas.length <= 0){
                        /** @type {HTMLElement|null} Contenedor de plantillas */
                        const contenedor = document.getElementById('contenedorId');
                        const tarjetaTexto = document.createElement('div');
                        tarjetaTexto.innerHTML = `<div class='error-sin-plantillas'>No se Encontraron Plantillas</div>`;
                        contenedor?.appendChild(tarjetaTexto);
                    }
                } else {
                    alert('No se pudo eliminar la Plantilla Respuesta err');
                }
            } catch (error) {
                alert('No se pudo eliminar la Plantilla Catch');
            }
        } else {
            alert('La Plantilla no se pudo eliminar: No contiene ID');
        }
    });

    try {
        /** @type {HTMLElement|null} Contenedor de plantillas */
        const contenedor = document.getElementById('contenedorId');

        /** @type {Object} Respuesta del backend con las plantillas */
        const respuesta = await plantillas();

        if(respuesta?.plantillas){
            for (const res in respuesta.plantillas) {
                const tarjetaTexto = document.createElement('div');
                tarjetaTexto.classList.add('plantilla');

                tarjetaTexto.innerHTML = `
                    <div class='menu-opciones' dato-id='${respuesta.plantillas[res].idPlantillaReporte}' id='menuOpciones'>
                        <div class='nombre-de-plantilla'>${respuesta.plantillas[res].Nombre}</div>
                        <button id='botonExpandir'>
                            <img class='maximize-2' src='../utils/iconos/Maximize.svg' />
                        </button>
                        <button id='botonModificar'>
                            <img class='edit-2' src='../utils/iconos/Editar2.svg' />
                        </button>
                        <button id='botonEliminar'>
                            <img class='trash' src='../utils/iconos/BasuraRojo.svg' />
                        </button>
                    </div>
                    <img src='../utils/iconos/divisorPlantilla.svg' class='divisorPlantilla'/>
                    <scroll-container>
                        ${respuesta.plantillas[res].Datos}
                    </scroll-container>
                `;

                contenedor?.appendChild(tarjetaTexto);
            }

            /** @type {NodeListOf<HTMLButtonElement>} Botones para expandir plantilla */
            const botonesExpandirCoinciden = document.querySelectorAll('#botonExpandir');

            botonesExpandirCoinciden.forEach(boton => {
                boton.addEventListener('click', async () => {
                    const menuOpciones = boton.closest('#menuOpciones');
                    const modalVizualizador = document.getElementById('modalVizualizador');

                    modalVizualizador.showModal();

                    try {
                        const respuesta = await seleccionarPlantillas(menuOpciones.getAttribute('dato-id'));
                        if(respuesta.ok){
                            const modal = document.getElementById('modalVizualizador');

                            // Asegúrate de que el modal está abierto para que detecte eventos
                            if (modal) {
                              modal.addEventListener('click', (event) => {
                                const rect = modal.getBoundingClientRect();
                                const clickedInDialog = (
                                  event.clientX >= rect.left &&
                                  event.clientX <= rect.right &&
                                  event.clientY >= rect.top &&
                                  event.clientY <= rect.bottom
                                );
                          
                                // Si el clic fue fuera del área visible del <dialog>, ciérralo
                                if (!clickedInDialog) {
                                  modal.close();
                                }
                              });
                            }

                            /** @type {HTMLElement|null} */
                            const tituloMaximisado = document.getElementById('Titulo-Maximisado');
                            tituloMaximisado.innerText = respuesta.plantilla.Nombre;

                            /** @type {HTMLElement|null} */
                            const scroll = document.getElementById('Scroll');
                            scroll.innerHTML  = respuesta.plantilla.Datos;

                            /** @type {HTMLElement|null} Botón para eliminar desde visualizador */
                            const boton_editar_Visualizador = document.getElementById('boton_eliminar_Visualizador');
                            boton_editar_Visualizador.addEventListener('click', async () => {
                                const modalBorrar = document.querySelector('.modal-borrar');
                                if (modalBorrar && menuOpciones) {
                                    modalBorrar.showModal();
                                    modalBorrar.setAttribute('dato-id', menuOpciones.getAttribute('dato-id'));

                                     // Asegúrate de que el modal está abierto para que detecte eventos
                                    modalBorrar.addEventListener('click', (event) => {
                                    const rect = modalBorrar.getBoundingClientRect();
                                    const clickedInDialog = (
                                    event.clientX >= rect.left &&
                                    event.clientX <= rect.right &&
                                    event.clientY >= rect.top &&
                                    event.clientY <= rect.bottom
                                    );
                            
                                    // Si el clic fue fuera del área visible del <dialog>, ciérralo
                                    if (!clickedInDialog) {
                                        modalBorrar.close();
                                    }
                                });
                                }
                            });
                        }
                    } catch (error) {
                        alert(`No se pudo conectar con el servidor, error: ${error}`);
                    }
                });
            });

            /** @type {NodeListOf<HTMLButtonElement>} Botones para modificar plantilla */
            const botonesModificarCoinciden = document.querySelectorAll('#botonModificar');

            botonesModificarCoinciden.forEach(boton => {
                boton.addEventListener('click', () => {
                    const menuOpciones = boton.closest('#menuOpciones');
                    alert(menuOpciones.getAttribute('dato-id'));
                });
            });

            /** @type {NodeListOf<HTMLButtonElement>} Botones para eliminar plantilla */
            const botonesEliminarCoinciden = document.querySelectorAll('#botonEliminar');

            botonesEliminarCoinciden.forEach(boton => {
                boton.addEventListener('click', async () => {
                    const menuOpciones = boton.closest('#menuOpciones');
                    const modalBorrar = document.querySelector('.modal-borrar');

                    if (modalBorrar && menuOpciones) {
                        modalBorrar.showModal();
                        modalBorrar.setAttribute('dato-id', menuOpciones.getAttribute('dato-id'));
                        // Asegúrate de que el modal está abierto para que detecte eventos
                        modalBorrar.addEventListener('click', (event) => {
                        const rect = modalBorrar.getBoundingClientRect();
                        const clickedInDialog = (
                        event.clientX >= rect.left &&
                        event.clientX <= rect.right &&
                        event.clientY >= rect.top &&
                        event.clientY <= rect.bottom
                        );
                
                        // Si el clic fue fuera del área visible del <dialog>, ciérralo
                        if (!clickedInDialog) {
                            modalBorrar.close();
                            }
                        })
                    }
                });
            });

        } else {
            const tarjetaTexto = document.createElement('div');
            tarjetaTexto.innerHTML = `<div class='error-sin-plantillas'>No se Encontraron Plantillas</div>`;
            contenedor?.appendChild(tarjetaTexto);
        }
    } catch (error) {
        alert('No se pudo conectar con el servidor.');
    }
}

/**
 * Expone la función `inicializarModuloPlantillas` al contexto global `window`
 * para que pueda ser invocada desde el HTML u otros scripts.
 * 
 * @global
 * @function
 */
window.inicializarModuloPlantillas = inicializarModuloPlantillas;
