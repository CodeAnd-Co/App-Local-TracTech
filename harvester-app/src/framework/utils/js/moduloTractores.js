// RF13 Usuario consulta datos disponibles - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF13

/**
 * Inicializa el módulo de tractores configurando los eventos del DOM
 * 
 * @function inicializarModuloTractores
 */
function inicializarModuloTractores() {
    // Actualizar el topbar si está disponible
    if (window.actualizarTopbar) {
        window.actualizarTopbar('tractores');
    }

    console.log('Cargando el módulo de Tractores...');

    // Cargar los datos del Excel desde localStorage
    const datosExcel = cargarDatosExcel();
    console.log('Datos de Excel:', datosExcel);
    
    // Si hay datos, inicializar la visualización aquí
    if (!datosExcel) {
        console.warn('No hay datos disponibles para análisis');
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