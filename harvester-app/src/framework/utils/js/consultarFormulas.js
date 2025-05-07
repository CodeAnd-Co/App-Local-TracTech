// RF

const { consultaFormulas } = require('../../backend/casosUso/formulas/consultaFormulas.js');

async function consultarFormulas() {
  const respuesta = await consultaFormulas();
  if (!respuesta.ok) {
    throw new Error('Error al consultar las fórmulas');
  }
    const formulas = respuesta.formulas.map((formula) => {
        return {
        id: formula.id,
        nombre: formula.nombre,
        formula: formula.formula,
        };
    });

}

async function mostrarFormulas() {
    try {
        const formulas = await consultarFormulas();
        console.log('Fórmulas consultadas:', formulas);
    } catch (error) {
        console.error('Error al mostrar las fórmulas:', error);
    }
}

