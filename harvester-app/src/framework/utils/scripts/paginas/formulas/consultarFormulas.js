// RF 76 - Consultar fórmulas - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF76

const { consultaFormulasCasoUso } = require(`${rutaBase}src/backend/casosUso/formulas/consultaFormulas.js`);
const { manejarEliminarFormula } = require(`${rutaBase}src/framework/utils/scripts/paginas/formulas/eliminarFormula.js`);
const { inicializarModificarFormula } = require(`${rutaBase}src/framework/utils/scripts/paginas/formulas/modificarFormula.js`);
const { ipcRenderer } = require('electron');
const { mostrarAlerta, mostrarAlertaConfirmacion } = require(`${rutaBase}/src/framework/vistas/includes/componentes/moleculas/alertaSwal/alertaSwal`);

async function consultarFormulas() {
    const respuesta = await consultaFormulasCasoUso();
    
    if (respuesta.error) {
        throw new Error(respuesta.error);
    }
    
    // Manejar el caso específico de "no se encontraron fórmulas" como éxito
    if (respuesta.mensaje === 'Error al consultar las fórmulas: no se encontraron fórmulas') {
        return {
            ok: true,
            datos: [],
            mensaje: respuesta.mensaje
        };
    }
    
    if (!respuesta.ok) {
        throw new Error('Error en la respuesta de la API');
    }
    
    return respuesta;
}

async function eliminarFormula(id) {
    try {
        const respuesta = await manejarEliminarFormula(id);
        if (respuesta.ok) {
            // Actualizar la interfaz después de eliminar la fórmula
            const formulaDiv = document.getElementById(`frameFormulas-${id}`);
            if (formulaDiv) {
                formulaDiv.remove();
            }
            mostrarAlerta('Fórmula eliminada', 'La fórmula ha sido eliminada exitosamente.', 'success');
        } else {
            mostrarAlerta('Error de conexión', respuesta.mensaje, 'error');
        }
    } catch (error) {
        let errorMensaje = error.message || 'Error al consultar las fórmulas';
        if (error == undefined || error == null) {
            errorMensaje = 'Error desconocido.';
        }
        mostrarAlerta('Error de conexión', `Verifica tu conexión e inténtalo de nuevo. ${errorMensaje}`, 'error');
    }
}

/**
 * Actualiza el contador de caracteres restantes para el buscador de fórmulas.
 * @param {HTMLInputElement} campoEntrada - Campo de entrada a validar.
 * @returns {void}
 */
function actualizarCaracteresBuscador(campoEntrada) {
    const caracteresUsados = campoEntrada.value.length;
    const limite = parseInt(campoEntrada.getAttribute('maxlength'), 10);

    // Verificación cuando se alcanza el maxlength
    if (caracteresUsados >= limite) {
        // Usar setTimeout para evitar conflictos con el evento input
        setTimeout(() => {
            mostrarAlerta('Límite alcanzado', `Has alcanzado el límite máximo de caracteres para la búsqueda de fórmulas (${limite} caracteres).`, 'warning');
        }, 100);
    }
}

/**
 * Configura el campo de búsqueda para filtrar las fórmulas por nombre
 * @returns {void}
 */
function configurarBusquedaFormulas() {
    const campoBusqueda = document.getElementById('busqueda-formulas');
    
    if (!campoBusqueda) {
        return;
    }
    
    campoBusqueda.addEventListener('input', () => {
        actualizarCaracteresBuscador(campoBusqueda);
        // Aquí puedes agregar la lógica de filtrado de fórmulas si la necesitas
        filtrarFormulas(campoBusqueda.value);
    });
    
    // Agregar también un listener para cuando se presiona Enter
    campoBusqueda.addEventListener('keypress', (evento) => {
        if (evento.key === 'Enter') {
            evento.preventDefault();
            filtrarFormulas(campoBusqueda.value);
        }
    });
}

/**
 * Filtra las fórmulas mostradas según el término de búsqueda
 * @param {string} termino - Término de búsqueda
 * @returns {void}
 */
function filtrarFormulas(termino) {
    console.log('Filtrando fórmulas con término:', termino);
    const formulasElementos = document.querySelectorAll('.frame-f-rmulas');
    const terminoOriginal = termino.toLowerCase(); // <= ahora sí
    const hayTerminoEscrito = termino.length > 0;
    const sonSoloEspacios = termino.length > 0 && termino.trim() === '';

    formulasElementos.forEach(formulaElemento => {
        const nombreFormula = formulaElemento.querySelector('.texto-usuario')?.textContent?.toLowerCase() || '';
        
        if (sonSoloEspacios) {
            formulaElemento.style.display = 'none';
        } else if (nombreFormula.includes(terminoOriginal)) {
            formulaElemento.style.display = 'flex';
        } else {
            formulaElemento.style.display = 'none';
        }
    });

    const formulasVisibles = Array.from(formulasElementos).filter(el => el.style.display !== 'none');
    const contenedor = document.getElementById('frame-formulas');
    const mensajeAnterior = contenedor.querySelector('.mensaje-sin-resultados');
    if (mensajeAnterior) {
        mensajeAnterior.remove();
    }

    if (sonSoloEspacios || (formulasVisibles.length === 0 && hayTerminoEscrito && formulasElementos.length > 0 && !sonSoloEspacios)) {
        const mensajeSinResultados = document.createElement('div');
        mensajeSinResultados.className = 'mensaje-sin-resultados';
        
        if (sonSoloEspacios) {
            mensajeSinResultados.textContent = 'No se puede buscar solo con espacios en blanco';
        } else {
            console.log('No término:', termino);
            mensajeSinResultados.textContent = `No se encontraron fórmulas que coincidan con la busqueda`;
        }

        const tablaColumnas = contenedor.querySelector('.tabla-columnas');
        if (tablaColumnas) {
            tablaColumnas.insertAdjacentElement('afterend', mensajeSinResultados);
        } else {
            contenedor.appendChild(mensajeSinResultados);
        }
    }
}


async function renderizarFormulas() {
    try {
        const respuesta = await consultarFormulas();
        // Verificar que la respuesta tenga la estructura correcta
        if (!respuesta.ok || !respuesta.datos) {
            throw new Error('Formato de respuesta inválido');
        }
        if (respuesta.mensaje == 'Error al consultar las fórmulas: no se encontraron fórmulas'){
            document.getElementById('frame-formulas').innerHTML = `<div class='mensaje-sin-formulas'>No hay fórmulas creadas</div>`;
            mostrarAlerta('No hay fórmulas', 'No se encontraron fórmulas en la base de datos.', 'info');
            // NO hacer return aquí, continuar para configurar el botón
        } else if (respuesta.datos.length === 0) {
            document.getElementById('frame-formulas').innerHTML = `<div class='mensaje-sin-formulas'>No hay fórmulas creadas</div>`;
            mostrarAlerta('No hay fórmulas', 'No se encontraron fórmulas en la base de datos.', 'info');
        } else {
            // Obtener el arreglo de fórmulas de la respuesta
            const formulas = respuesta.datos;
            // Conseguir el nombre de todas las fórmulas
            const nombresFormulas = formulas.map((formula) => formula.Nombre);
            localStorage.setItem('nombresFormulas', JSON.stringify(nombresFormulas));

            // Renderizar las fórmulas en el contenedor correspondiente
            const contenedor = document.getElementById('frame-formulas');

            // Solo renderizar fórmulas si existen
            if (formulas && formulas.length > 0) {
                formulas.forEach((formula) => {
                    const formulaDiv = document.createElement('div');
                    formulaDiv.innerHTML = `
                        <div id='frameFormulas-${formula.idFormula}'  class='frame-f-rmulas'>
                        <div class='nombre-usuario'>
                            <div class='texto-usuario'>${formula.Nombre}</div>
                        </div>
                        <div class='nombre-usuario'>
                            <div class='texto-usuario'>${formula.Datos}</div>
                        </div>
                        <button class='editar' data-id='${formula.idFormula}'>
                            <img class='editar-icono' src='${rutaBase}src/framework/utils/iconos/Editar.svg' />
                        </button>
                        <button class='eliminar' data-id='${formula.idFormula}'>
                            <img class='eliminar-icono' src='${rutaBase}src/framework/utils/iconos/BasuraBlanca.svg' />
                        </button>
                        </div>
                    `;
                    contenedor.appendChild(formulaDiv);
                });

                // Registrar event listeners para editar solo si hay fórmulas
                document.querySelectorAll('.editar').forEach(btn => {
                    btn.addEventListener('click', async (evento) => {
                        const formulaId = evento.currentTarget.getAttribute('data-id');

                        if (!formulaId) {
                            return;
                        }

                        const formulaSeleccionada = formulas.find(formula => formula.idFormula == formulaId);

                        if (formulaSeleccionada) {
                            const { idFormula, Nombre, Datos } = formulaSeleccionada;
                            localStorage.setItem('modificarFormulaId', idFormula);
                            localStorage.setItem('modificarFormulaNombre', Nombre);
                            localStorage.setItem('modificarFormulaDatos', Datos);
                            try {
                                const rutaCrearFormula = `${rutaBase}src/framework/vistas/paginas/formulas/modificarFormula.ejs`
                                const vista = await ipcRenderer.invoke('precargar-ejs', rutaCrearFormula, { Seccion: 'Modificar fórmula', Icono : 'Funcion', permisos});
                                window.location.href = vista;
                                localStorage.setItem('seccion-activa', 'formulas');
                            } catch (err) {
                                mostrarAlerta('Error al cargar vista', `Verifica tu conexión e inténtalo de nuevo: ${err}`, 'error');
                            }
                            inicializarModificarFormula(idFormula, Nombre, Datos);
                        } else {
                            mostrarAlerta('Error', `No se encontró la fórmula.`, 'error');
                        }
                    });
                });

                // Registrar event listeners para eliminar solo si hay fórmulas
                document.querySelectorAll('.eliminar').forEach(btn => {
                    btn.addEventListener('click', async (evento) => {
                         
                        const formulaId = evento.currentTarget.getAttribute('data-id');
                        try {
                            const resultadoConfirmado = await mostrarAlertaConfirmacion('¿Estás seguro?', 'Esta acción no se puede deshacer.', 'warning', 'Sí, eliminar', 'Cancelar');
                            if(resultadoConfirmado) {
                                eliminarFormula(formulaId);
                                window.cargarModulo('formulas');
                            }
                             
                        } catch (error) {
                            mostrarAlerta('Error de conexión', `Verifica tu conexión e inténtalo de nuevo: ${error}`, 'error');
                        }
                    });
                });
            } else {
                // Mostrar mensaje cuando no hay fórmulas
                contenedor.innerHTML += `<div class='mensaje-sin-formulas'>No hay fórmulas creadas</div>`;
                localStorage.setItem('nombresFormulas', JSON.stringify([]));
            }
        }

    } catch (error) {
        // Manda este error aunque sea porque no hay fórmulas
        mostrarAlerta('Error al cargar las fórmulas', `Verifica tu conexión e inténtalo de nuevo1: ${error.mensaje}`, 'error');
        document.getElementById('frame-formulas').innerHTML += `<div class='error-carga'>Error al cargar las fórmulas</div>`;
        // Asegurar que el array esté vacío en caso de error
        localStorage.setItem('nombresFormulas', JSON.stringify([]));
    }

    // MOVER EL EVENT LISTENER DE CREAR FÓRMULA AQUÍ - SIEMPRE SE EJECUTA
    const btnCrearFormula = document.getElementById('crearFormula');
    if (btnCrearFormula && !btnCrearFormula.hasAttribute('data-listener-added')) {
        btnCrearFormula.addEventListener('click', async () => {
            try {
                const rutaCrearFormula = `${rutaBase}src/framework/vistas/paginas/formulas/crearFormula.ejs`
                const vista = await ipcRenderer.invoke('precargar-ejs', rutaCrearFormula, { Seccion: 'Crear fórmula', Icono: 'Funcion', permisos });
                window.location.href = vista;
                localStorage.setItem('seccion-activa', 'formulas');
            } catch (err) {
                mostrarAlerta('Error al cargar vista', `Verifica tu conexión e inténtalo de nuevo: ${err}`, 'error');
            }
        });
        // Marcar que ya se agregó el listener para evitar duplicados
        btnCrearFormula.setAttribute('data-listener-added', 'true');
    }
    
    // Configurar la búsqueda después de renderizar las fórmulas
    configurarBusquedaFormulas();
}


module.exports = {
    renderizarFormulas,
    configurarBusquedaFormulas, // Exportar la función por si se necesita en otro lugar
};

