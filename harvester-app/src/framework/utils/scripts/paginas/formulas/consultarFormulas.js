// RF 76 - Consultar fórmulas - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF76

const { consultaFormulasCasoUso } = require(`${rutaBase}src/backend/casosUso/formulas/consultaFormulas.js`); 
const { manejarEliminarFormula } = require(`${rutaBase}src/framework/utils/scripts/paginas/formulas/eliminarFormula.js`);
const { inicializarModificarFormula } = require(`${rutaBase}src/framework/utils/scripts/paginas/formulas/modificarFormula.js`);
const { ipcRenderer } = require('electron');
const { mostrarAlerta } = require(`${rutaBase}/src/framework/vistas/includes/componentes/moleculas/alertaSwal/alertaSwal`);

 
const Swal = require(`${rutaBase}/node_modules/sweetalert2/dist/sweetalert2.all.min.js`);

async function consultarFormulas() {
    const respuesta = await consultaFormulasCasoUso();
    if (respuesta.error) {
        throw new Error(respuesta.error);
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
            Swal.fire({
                title: 'Fórmula eliminada',
                text: 'La fórmula ha sido eliminada exitosamente.',
                icon: 'success'
            });
        } else {
            Swal.fire({
                title: 'Error de conexión',
                text: respuesta.mensaje,
                icon: 'error'
            });
        }
    } catch (error) {
        let errorMensaje = error.message || 'Error al consultar las fórmulas';
        if (error == undefined || error == null) {
            errorMensaje = 'Error desconocido.';
        }
        Swal.fire({
            title: 'Error de conexión',
            text: `Verifica tu conexión e inténtalo de nuevo. ${errorMensaje}`,
            icon: 'error'
        });
    }
}


async function renderizarFormulas() {
    try {
        const respuesta = await consultarFormulas();
        // Verificar que la respuesta tenga la estructura correcta
        if (!respuesta.ok || !respuesta.datos) {
            throw new Error('Formato de respuesta inválido');
        }

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
                        console.warn('No se encontró data-id en el botón.');
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
                        console.warn('No se encontró una fórmula con id:', formulaId);
                    }
                });
            });

            // Registrar event listeners para eliminar solo si hay fórmulas
            document.querySelectorAll('.eliminar').forEach(btn => {
                btn.addEventListener('click', (evento) => {
                     
                    const formulaId = evento.currentTarget.getAttribute('data-id');
                    try {
                        Swal.fire({
                            title: '¿Estás seguro?',
                            text: 'Esta acción no se puede deshacer.',
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonText: 'Sí, eliminar',
                            cancelButtonText: 'Cancelar',
                            confirmButtonColor: '#1F4281',
                            cancelButtonColor: '#A61930'
                            
                        }).then((resultado) => {
                            if (resultado.isConfirmed) {
                                eliminarFormula(formulaId);
                                window.cargarModulo('formulas');
                            }
                        });
                        // eslint-disable-next-line no-unused-vars
                    } catch (error) {
                        Swal.fire({
                            title: 'Error de conexión',
                            text: 'Verifica tu conexión e inténtalo de nuevo: ',
                            icon: 'error'
                        });
                    }
                });
            });
        } else {
            // Mostrar mensaje cuando no hay fórmulas
            contenedor.innerHTML += `<div class='mensaje-sin-formulas'>No hay fórmulas creadas</div>`;
            localStorage.setItem('nombresFormulas', JSON.stringify([]));
        }

    } catch (error) {
        mostrarAlerta('Error al cargar las fórmulas', `Verifica tu conexión e inténtalo de nuevo: ${error.mensaje}`, 'error');
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
                const vista = await ipcRenderer.invoke('precargar-ejs', rutaCrearFormula, { Seccion: 'Crear fórmula', Icono : 'Funcion'});
                window.location.href = vista;
                localStorage.setItem('seccion-activa', 'formulas');
            } catch (err) {
                console.error('Error al cargar vista:', err);
            }
        });
        // Marcar que ya se agregó el listener para evitar duplicados
        btnCrearFormula.setAttribute('data-listener-added', 'true');
    }
}


module.exports = {
    renderizarFormulas,
};

