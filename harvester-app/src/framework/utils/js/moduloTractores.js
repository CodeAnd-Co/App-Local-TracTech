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

// Ejecutar inicialización si el DOM ya está cargado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarModuloTractores);
} else {
    // DOM ya está cargado
    setTimeout(inicializarModuloTractores, 100);
}

// Exportar funciones para uso global
window.inicializarModuloTractores = inicializarModuloTractores;