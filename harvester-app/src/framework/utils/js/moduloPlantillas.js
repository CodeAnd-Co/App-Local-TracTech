/**
 * Importa la función `plantillas` desde la capa de dominio para obtener las plantillas disponibles.
 * @module plantillasAPI
 */
const { plantillas } = require("../../backend/domain/plantillasAPI/plantillasAPI.js");
const { eliminarPlantillas } = require("../../backend/domain/plantillasAPI/eliminarPlantillasAPI.js");

/**
 * Inicializa el módulo de plantillas cargando la información desde el backend
 * y configurando los eventos del DOM (modificar, eliminar, cancelar, etc.).
 * 
 * @async
 * @function inicializarModuloPlantillas
 * @returns {Promise<void>}
 */

async function inicializarModuloPlantillas () {
    /** @type {HTMLElement|null} */
    const cancelarDialog = document.querySelector(".cancelar");
    
    cancelarDialog?.addEventListener("click", () => {
        const modalBorrar = document.querySelector(".modal-borrar");
        modalBorrar?.close();
    });

    /** @type {HTMLElement|null} */
    const eliminarDialog = document.querySelector(".eliminar");

    eliminarDialog?.addEventListener("click", async () => {
        const modalBorrar = document.querySelector(".modal-borrar");

        if(modalBorrar?.getAttribute("dato-id")) {
            // RF: Eliminar Plantilla
            try {
                const idPlantilla = modalBorrar.getAttribute('dato-id')
                
                const respuesta = await eliminarPlantillas(idPlantilla);

                if (respuesta.ok){

                    // ✅ Eliminar del DOM la tarjeta que contiene esa plantilla
                    const plantillaHTML = document.querySelector(`.dropdown[dato-id="${idPlantilla}"]`)?.closest(".plantilla");
                    if (plantillaHTML) {
                        plantillaHTML.remove();
                        modalBorrar?.close();
                    }
                } else {
                    alert("No se pudo eliminar la Plantilla Respuesta err");
                }
                
                
            } catch (error) {
                alert("No se pudo eliminar la Plantilla Catch");
            }

        } else {
            alert("La Plantilla no se pudo eliminar: No contiene ID");
        }
    });

    try {
        /** @type {HTMLElement|null} */
        const contenedor = document.getElementById("contenedorId");

        /** @type {Object} */
        const respuesta = await plantillas();

        for (let res in respuesta.plantillas) {
            const tarjetaTexto = document.createElement('div');
            tarjetaTexto.classList.add('plantilla');

            tarjetaTexto.innerHTML = `
                <div class="dropdown" dato-id="${respuesta.plantillas[res].idPlantillaReporte}">
                    <button class="boton-opciones">
                        <img class="icono-opciones" src="../utils/iconos/TresPuntos.svg" />
                    </button>
                    <div class="dropdown-content">
                        <button class="frame-btn-Editar" id="botonModificar">
                            <div class="boton-modificar">
                                <img class="edit-2" src="../utils/iconos/Editar.svg" />
                                <div class="modificar">Modificar</div>
                            </div>
                        </button>
                        <button class="frame-btn-Editar" id="botonEliminar">
                            <div class="boton-modificar">
                                <img class="edit-2" src="../utils/iconos/Basura.svg" />
                                <div class="modificar">Eliminar</div>
                            </div>
                        </button>
                    </div>
                </div>
                <scroll-container>
                    ${respuesta.plantillas[res].Datos}
                </scroll-container>
                <div class="nombre-plantilla">
                    <div class="nombre-de-plantilla">${respuesta.plantillas[res].Nombre}</div>
                </div>
            `;

            contenedor?.appendChild(tarjetaTexto);
        }

        /** @type {NodeListOf<HTMLButtonElement>} */
        const botonesOpcionesCoinciden = document.querySelectorAll('.boton-opciones');

        // Activa todos los dropdowns
        botonesOpcionesCoinciden.forEach(boton => {
            boton.addEventListener("click", () => {
                const dropdown = boton.closest('.dropdown');
                const yaActivo = dropdown?.classList.contains('active');

                document.querySelectorAll('.dropdown.active').forEach(drop => {
                    drop.classList.remove('active');
                });

                if (!yaActivo && dropdown) {
                    dropdown.classList.add('active');
                }
            });
        });

        /** @type {NodeListOf<HTMLButtonElement>} */
        const botonesModificarCoinciden = document.querySelectorAll('#botonModificar');

        botonesModificarCoinciden.forEach(boton => {
            boton.addEventListener("click", () => {
                const dropdown = boton.closest('.dropdown');
            });
        });

        /** @type {NodeListOf<HTMLButtonElement>} */
        const botonesEliminarCoinciden = document.querySelectorAll('#botonEliminar');

        botonesEliminarCoinciden.forEach(boton => {
            boton.addEventListener("click", async () => {
                const dropdown = boton.closest('.dropdown');
                const modalBorrar = document.querySelector('.modal-borrar');

                if (modalBorrar && dropdown) {
                    modalBorrar.showModal();
                    modalBorrar.setAttribute('dato-id', dropdown.getAttribute('dato-id'));
                }
            });
        });

    } catch (error) {
        console.error("Error al conectar con el backend:", error);
        alert("No se pudo conectar con el servidor.");
    }
}

// Asignación al objeto global para poder ejecutarlo desde otros scripts o el HTML
window.inicializarModuloPlantillas = inicializarModuloPlantillas;
