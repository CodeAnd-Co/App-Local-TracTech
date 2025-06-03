const { consultaFormulasCasoUso } = require(`${rutaBase}src/backend/casosUso/formulas/consultaFormulas.js`);

/**
 * Consulta las fórmulas una sola vez y las almacena globalmente.
 * @returns {Promise<void>}
 */
async function cargarFormulasIniciales(formulasDisponibles) {
  try {
    if (formulasDisponibles.length > 0) {
      return; 
    }

    const respuesta = await consultaFormulasCasoUso();
    
    
    if (!respuesta.ok || !respuesta.datos) {
      throw new Error('Error al consultar fórmulas');
    }

    formulasDisponibles = respuesta.datos;
    localStorage.setItem('formulasDisponibles', JSON.stringify(formulasDisponibles));
  } catch (error) {
    
    formulasDisponibles = [];    
    mostrarAlerta('Error', 'No se pudieron cargar las fórmulas disponibles. Revisa que sí haya fórmulas guardadas y estes conectado a internet', 'error');
  }
}

module.exports = {
    cargarFormulasIniciales,
};
