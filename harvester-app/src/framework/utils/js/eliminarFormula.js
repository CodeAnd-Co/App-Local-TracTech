// RF71 Eliminar Fórmula - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF71
const { eliminarFormula } = require('../../../backend/casosUso/formulas/eliminarFormula');

/* eslint-disable no-undef */

/* eslint-disable-next-line */
async function manejarEliminarFormula(id) {
    if (!id) {
        Swal.fire({
            title: 'Campo faltante',
            text: 'Por favor, completa el campo ID.',
            icon: 'warning'
        });
        return;
    }

    try {
        const respuesta = await eliminarFormula(id);

        if (respuesta.ok) {
            Swal.fire({
                title: 'Fórmula eliminada',
                text: 'La fórmula ha sido eliminada exitosamente.',
                icon: 'success'
            });
            return respuesta;
        } else {
            Swal.fire({
                title: 'Error',
                text: respuesta.mensaje,
                icon: 'error'
            });
        }
    } catch (error) {
        console.error('Error al conectar con el backend:', error);
        Swal.fire({
            title: 'Error de conexión',
            text: 'Verifica tu conexión e inténtalo de nuevo.',
            icon: 'error'
        });
    }
}

module.exports = {
    manejarEliminarFormula
};