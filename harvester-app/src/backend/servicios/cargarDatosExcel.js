const Swal = require(`${rutaBase}/node_modules/sweetalert2/dist/sweetalert2.all.min.js`);

/**
 * Carga los datos de Excel almacenados en localStorage.
 * 
 * @returns {Object|null} Datos parseados o null si falla.
*/
function cargarDatosExcel() {
    try {
        const datosDisponibles = localStorage.getItem('datosExcelDisponibles');
        const datosExcelJSON = localStorage.getItem('datosExcel');
        if (datosDisponibles !== 'true' || !datosExcelJSON) {
            throw new Error('No hay datos de Excel disponibles');
        }
        
        const datosExcel = JSON.parse(datosExcelJSON);
        return datosExcel;
        
    } catch {
        Swal.fire({
        title: 'Error',
        text: 'Ocurrió un error al cargar los datos de Excel.',
        icon: 'error',
        confirmButtonColor: '#1F4281',
        });
        return null;
    }
}

module.exports = {
    cargarDatosExcel,
}