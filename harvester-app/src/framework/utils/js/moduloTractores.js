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

    const tractoresContainer = document.querySelector('.tractores');
    tractoresContainer.innerHTML = ''; // Limpiar contenido anterior

    // Iterar sobre los distribuidores (asumiendo que cada hoja es un distribuidor)
    for (const distribuidorNombre in datosExcel.hojas) {
        const distribuidor = datosExcel.hojas[distribuidorNombre];

        // Crear un contenedor para cada distribuidor
        const distribuidorDiv = document.createElement('div');
        distribuidorDiv.className = 'distribuidor-item'; // Clase para el item del distribuidor

        // Nombre del distribuidor
        const nombreDistribuidorDiv = document.createElement('div');
        nombreDistribuidorDiv.className = 'nombre-distribuidor';
        nombreDistribuidorDiv.textContent = distribuidorNombre; // Asignar nombre del distribuidor

        distribuidorDiv.appendChild(nombreDistribuidorDiv);

        // Añadir la casilla de verificación (checkbox) para el distribuidor
        const checkBox = document.createElement('img');
        checkBox.src = 'check-box-outline-blank0.svg'; // Ajustar el icono del checkbox
        checkBox.className = 'check-box'; // Estilo del checkbox
        distribuidorDiv.appendChild(checkBox);

        // Agregar el div del distribuidor al contenedor de tractores
        tractoresContainer.appendChild(distribuidorDiv);
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