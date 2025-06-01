// RF68 Modificar fórmula - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF68 
const { modificarFormula } = require(`${rutaBase}src/backend/domain/formulasAPI/formulaAPI.js`);

const { LONGITUD_MAXIMA_NOMBRE_FORMULA,
    LONGITUD_MAXIMA_FORMULA} = require(`${rutaBase}src/framework/utils/scripts/constantes.js`);
const Swal = require(`${rutaBase}/node_modules/sweetalert2/dist/sweetalert2.all.min.js`);

/**
 * @async
 * @function modificarFormulaCasoUso
 * @param {string} id - ID de la fórmula a modificar.
 * @param {string} nombre - Nuevo nombre de la fórmula.
 * @param {string} formula - Nueva fórmula.
 * @param {string} nombreOriginal - Nombre original de la fórmula.
 * @returns {Promise<Object>} Respuesta del servidor con la fórmula modificada.
 * @throws {Error} Si no se pudo modificar la fórmula.
 */
async function modificarFormulaCasoUso(id, nombre, formula, nombreOriginal) {
    if (!id || !nombre || !formula || id === '' || nombre === '' || formula === '') {
        Swal.fire({
            title: 'Error',
            text: 'Por favor, completa todos los campos.',
            icon: 'error',
            confirmButtonColor: '#a61930',
        });
        return;
    }
    if (nombre === '' || nombre.length > LONGITUD_MAXIMA_NOMBRE_FORMULA) {
        Swal.fire({
            title: 'Error',
            text: `Verifica que la formula tenga un nombre válido y menor de ${LONGITUD_MAXIMA_NOMBRE_FORMULA} caracteres.`,
            icon: 'error',
            confirmButtonColor: '#a61930',
        });
        return;
    }
    if (formula.length > LONGITUD_MAXIMA_FORMULA) {
        Swal.fire({
            title: 'Error',
            text: `La fórmula excede los ${LONGITUD_MAXIMA_FORMULA} caracteres, no puede ser guardada.`,
            icon: 'error',
            confirmButtonColor: '#a61930',
        });
        return;
    }
    
    
    let formulasGuardadas = localStorage.getItem('nombresFormulas');
    formulasGuardadas = JSON.parse(formulasGuardadas);
    if (formulasGuardadas && formulasGuardadas.includes(nombre) && nombre !== nombreOriginal) {
        Swal.fire({
            title: 'Error',
            text: 'Ya existe una fórmula con ese nombre.',
            icon: 'error',
            confirmButtonColor: '#a61930',
        });
        return
        
    }
    
    const token = localStorage.getItem('token');
    try {
        const respuesta = await modificarFormula(id, nombre, formula, token);
        if (respuesta.ok) {
            Swal.fire({
                title: 'Fórmula modificada',
                text: 'La fórmula ha sido modificada exitosamente.',
                icon: 'success',
                confirmButtonColor: '#a61930',
            }).then((result) => {
                if (result.isConfirmed) {
                    window.cargarModulo('formulas');
                }
            });
        } else {
            Swal.fire({
                title: 'Error de conexión',
                text: respuesta.mensaje,
                icon: 'error',
                confirmButtonColor: '#a61930',
            });
            return;
        }
    } catch (error) {
        Swal.fire({
            title: 'Error',
            text: `No se pudo modificar la fórmula. Inténtalo de nuevo más tarde: ${error}`,
            icon: 'error',
            confirmButtonColor: '#a61930',
        });
        return;
    }
}

module.exports = {
    modificarFormulaCasoUso
}