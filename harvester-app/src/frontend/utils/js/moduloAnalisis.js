// Inicializa el módulo de análisis con los datos del Excel
function inicializarModuloAnalisis(datosExcel) {
    // Esperamos un breve momento para asegurarnos de que el DOM está completamente cargado
    setTimeout(() => {
        // Verificamos si tenemos datos
        if (!datosExcel || !Array.isArray(datosExcel) || datosExcel.length === 0) {
            console.error("No se recibieron datos válidos para el análisis");
            alert("Error: No hay datos para analizar");
        }
        
    }, 100);
}


window.inicializarModuloAnalisis = inicializarModuloAnalisis;