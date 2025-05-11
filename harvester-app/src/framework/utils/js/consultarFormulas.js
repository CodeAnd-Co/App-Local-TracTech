// RF 76 - Consultar fórmulas - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF76

const { consultaFormulasCasoUso } = require('../../../backend/casosUso/formulas/consultaFormulas');
const { inicializarCrearFormula } = require('../../utils/js/crearFormula');

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

async function renderizarFormulas() {
    try {
        const respuesta = await consultarFormulas();
        // Verificar que la respuesta tenga la estructura correcta
        if (!respuesta.ok || !respuesta.datos) {
            throw new Error('Formato de respuesta inválido');
        }

        // Obtener el arreglo de fórmulas de la respuesta
        const formulas = respuesta.datos;

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
                    <img class='editar-icono' src='../utils/iconos/Editar.svg' />
                </button>
                <button class='eliminar' data-id='${formula.idFormula}'>
                    <img class='eliminar-icono' src='../utils/iconos/Basura.svg' />
                </button>
                </div>
            `;
            contenedor.appendChild(formulaDiv);
        });

        // Agregar event listeners para los botones de editar y eliminar
        document.querySelectorAll('.editar').forEach(btn => {
            btn.addEventListener('click', (evento) => {
                // eslint-disable-next-line no-unused-vars
                const formulaId = evento.currentTarget.getAttribute('data-id');
                // Implementar lógica para editar fórmula
            });
        });

        document.getElementById('crearFormula')
            .addEventListener('click', () => {
                inicializarCrearFormula();
            });

        document.querySelectorAll('.eliminar').forEach(btn => {
            btn.addEventListener('click', (evento) => {
                // eslint-disable-next-line no-unused-vars
                const formulaId = evento.currentTarget.getAttribute('data-id');
                // Implementar lógica para eliminar fórmula
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

