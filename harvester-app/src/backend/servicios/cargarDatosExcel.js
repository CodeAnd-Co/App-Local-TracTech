const { mostrarAlerta } = require("../../framework/vistas/includes/componentes/moleculas/alertaSwal/alertaSwal");

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
        mostrarAlerta('Error al cargar datos', 'No se pudieron cargar los datos de Excel. Asegúrate de que el archivo esté cargado correctamente.', 'error');
    }
}

module.exports = {
    cargarDatosExcel,
}