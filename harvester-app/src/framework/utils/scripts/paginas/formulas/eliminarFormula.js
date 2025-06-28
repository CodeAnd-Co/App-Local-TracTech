// RF71 Eliminar Fórmula - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF71
const { eliminarFormula } = require(`${rutaBase}src/backend/casosUso/formulas/eliminarFormula.js`);
 
async function manejarEliminarFormula(id) {
    if (!id) {
       /*eslint-disable no-undef*/ 
        mostrarAlerta('Campo faltante', 'Por favor, completa el campo ID.', 'warning');
        return;
    }

    try {
        const respuesta = await eliminarFormula(id);

        if (respuesta.ok) {
            mostrarAlerta('Fórmula eliminada', 'La fórmula ha sido eliminada exitosamente.', 'success');
            return respuesta;
        } else {
            mostrarAlerta('Error', respuesta.mensaje, 'error');
        }
    } catch {
        mostrarAlerta('Error de conexión', 'Verifica tu conexión e inténtalo de nuevo.', 'error');
    }
}

module.exports = {
    manejarEliminarFormula
};