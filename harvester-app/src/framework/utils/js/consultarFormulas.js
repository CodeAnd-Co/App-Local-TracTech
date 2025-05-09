// RF 76 - Consultar fórmulas - http...

const { consultaFormulasCasoUso } = require('../../../backend/casosUso/formulas/consultaFormulas');

async function consultarFormulas() {
    console.log('Consultando fórmulas...');
    console.log(localStorage.getItem('token'));
    console.log(consultaFormulasCasoUso);
  const respuesta = await consultaFormulasCasoUso();
    if (respuesta.error) {
      throw new Error(respuesta.error);
    }
    console.log('Respuesta de consulta de fórmulas:', respuesta);
    if (!respuesta.ok) {
      throw new Error('Error en la respuesta de la API');
    }
    if (!respuesta.json) {
      throw new Error('Error al convertir la respuesta a JSON');
    }
    console.log('Respuesta JSON:', respuesta.json);
    return await respuesta.json();

}


async function renderizarFormulas() {
    try {
      const data = await consultarFormulas();
      const formulas = data.formulas || [];
      console.log('Formulas:', formulas);
      const contenedor = document.querySelector('.frame-listado-formulas');
      // Elimina las fórmulas anteriores (si las hay)
      document.querySelectorAll('.frame-f-rmulas').forEach(e => e.remove());

      formulas.forEach(formula => {
        const div = document.createElement('div');
        div.className = 'frame-f-rmulas';
        div.innerHTML = `
          <div class='nombre-usuario'>
            <div class='texto-usuario'>${formula.nombre}</div>
          </div>
          <div class='nombre-usuario'>
            <div class='texto-usuario'>${formula.parametros?.join(', ') || ''}</div>
          </div>
          <div class='editar'>
            <img class='editar-icono' src='../utils/iconos/Editar.svg' />
          </div>
          <button class='eliminar'>
            <img class='eliminar-icono' src='../utils/iconos/Basura.svg' />
          </button>
        `;
        contenedor.appendChild(div);
      });
    } catch (error) {
      console.error('Error al mostrar las fórmulas:', error);
    }
  }

  module.exports = {
    renderizarFormulas,
    consultarFormulas
  };

