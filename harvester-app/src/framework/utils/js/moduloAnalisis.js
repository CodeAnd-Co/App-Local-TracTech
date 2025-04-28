// Carga los datos del Excel desde localStorage
function cargarDatosExcel() {
    try {
        // Verificar si hay datos disponibles
        console.log("Verificando si hay datos de Excel disponibles en localStorage...");

        // Recuperar los datos de Excel
        const datosExcelJSON = localStorage.getItem('datosExcel');
        console.log("Datos de Excel recuperados:", datosExcelJSON);
        
        
        if (!datosExcelJSON) {
            console.log("No hay datos de Excel disponibles en localStorage");
            alert("No hay datos de Excel disponibles");
            return null;
        }
        
        // Parsear los datos JSON
        const datosExcel = JSON.parse(datosExcelJSON);
        return datosExcel;
    } catch (error) {
        console.error("Error al cargar datos de Excel:", error);
        return null;
    }
}

// Exportar funciones para uso global
window.cargarDatosExcel = cargarDatosExcel;