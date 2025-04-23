function inicializarModuloTractores() {
    // Actualizar el topbar si está disponible
    if (window.actualizarTopbar) {
        window.actualizarTopbar('Tractores');
    }

    // Cargar los datos del Excel desde localStorage
    const datosExcel = cargarDatosExcel();
    console.log("Datos de Excel:", datosExcel);
    
    // Si tienes datos, puedes inicializar tu visualización aquí
    if (!datosExcel) {
        console.warn("No hay datos disponibles para análisis");
    }
}
