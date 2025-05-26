// RF 76 - Consultar fórmulas - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF76

const { consultaFormulasCasoUso } = require(`${rutaBase}src/backend/casosUso/formulas/consultaFormulas.js`); 
const { manejarEliminarFormula } = require(`${rutaBase}src/framework/utils/scripts/paginas/formulas/eliminarFormula.js`);
const { inicializarModificarFormula } = require(`${rutaBase}src/framework/utils/scripts/paginas/formulas/modificarFormula.js`);
const { ipcRenderer } = require('electron');

/* eslint-disable no-undef */
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
        console.error('Error al eliminar la fórmula:', error);
        Swal.fire({
            title: 'Error de conexión',
            text: 'Verifica tu conexión e inténtalo de nuevo.',
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

        document.querySelectorAll('.editar').forEach(btn => {
            btn.addEventListener('click', async (evento) => {
                const formulaId = evento.currentTarget.getAttribute('data-id');
                console.log('Botón clickeado, data-id:', formulaId);

                if (!formulaId) {
                    console.warn('No se encontró data-id en el botón.');
                    return;
                }

                const formulaSeleccionada = formulas.find(f => f.idFormula == formulaId);

                if (formulaSeleccionada) {
                    const { idFormula, Nombre, Datos } = formulaSeleccionada;
                    console.log('Datos encontrados:', idFormula, Nombre, Datos);
                    localStorage.setItem('modificarFormulaId', idFormula);
                    localStorage.setItem('modificarFormulaNombre', Nombre);
                    localStorage.setItem('modificarFormulaDatos', Datos);
                    try {
                        const rutaCrearFormula = `${rutaBase}src/framework/vistas/paginas/formulas/modificarFormula.ejs`
                        const vista = await ipcRenderer.invoke('precargar-ejs', rutaCrearFormula, { Seccion: 'Modificar fórmula', Icono : 'Funcion'});
                        window.location.href = vista;
                        localStorage.setItem('seccion-activa', 'formulas');
                    } catch (err) {
                        console.error('Error al cargar vista:', err);
                    }
                    inicializarModificarFormula(idFormula, Nombre, Datos);
                } else {
                    console.warn('No se encontró una fórmula con id:', formulaId);
                }
            });
        });

        document.getElementById('crearFormula')
            .addEventListener('click', async () => {
                try {
                    const rutaCrearFormula = `${rutaBase}src/framework/vistas/paginas/formulas/crearFormula.ejs`
                    const vista = await ipcRenderer.invoke('precargar-ejs', rutaCrearFormula, { Seccion: 'Crear fórmula', Icono : 'Funcion'});
                    window.location.href = vista;
                    localStorage.setItem('seccion-activa', 'formulas');
                } catch (err) {
                    console.error('Error al cargar vista:', err);
                }
            });

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
                } catch (error) {
                    console.error('Error al eliminar la fórmula:', error);
                    Swal.fire({
                        title: 'Error de conexión',
                        text: 'Verifica tu conexión e inténtalo de nuevo.',
                        icon: 'error'
                    });
                }
            });
        });

    } catch (error) {
        console.error('Error al consultar las fórmulas:', error);
        document.getElementById('frame-formulas').innerHTML = `<div class='error-carga'>Error al cargar las fórmulas</div>`;
    }
}


module.exports = {
    renderizarFormulas,
};

