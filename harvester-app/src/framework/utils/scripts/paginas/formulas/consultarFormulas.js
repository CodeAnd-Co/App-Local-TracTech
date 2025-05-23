// RF 76 - Consultar fórmulas - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF76

const { consultaFormulasCasoUso } = require(`${rutaBase}src/backend/casosUso/formulas/consultaFormulas.js`); 
const { inicializarCrearFormula } = require(`${rutaBase}src/framework/utils/scripts/paginas/formulas/crearFormula.js`);
const { manejarEliminarFormula } = require(`${rutaBase}src/framework/utils/scripts/paginas/formulas/eliminarFormula.js`);
const { inicializarModificarFormula } = require(`${rutaBase}src/backend/casosUso/formulas/modificarFormula.js`);
/* eslint-disable no-undef */

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

        // Agregar event listeners para los botones de editar y eliminar
        document.querySelectorAll('.editar').forEach(btn => {
            btn.addEventListener('click', (evento) => {
                 
                const formulaId = evento.currentTarget.getAttribute('data-id');
                // Implementar lógica para editar fórmula
                formulas.forEach((formula) => {
                    if (formula.idFormula == formulaId) {
                        const nombre = formula.Nombre;
                        const formulaTexto = formula.Datos;
                        inicializarModificarFormula(formulaId, nombre, formulaTexto);
                    }
                })
            });
        });

        document.getElementById('crearFormula')
            .addEventListener('click', () => {
                inicializarCrearFormula();
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

