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

    const distribuidoresContenedor = document.querySelector('.distribuidores-contenido');
    distribuidoresContenedor.innerHTML = ''; // Limpiar contenido anterior

    const tractoresContenedor = document.querySelector('.tractores');
    tractoresContenedor.innerHTML = '';

    const filtrosContenedor = document.querySelector('.filtros');
    filtrosContenedor.innerHTML = '';

    // Iterar sobre los distribuidores (asumiendo que cada hoja es un distribuidor)
    for (const distribuidorNombre in datosExcel.hojas) {
        // Crear un div para el distribuidor
        const distribuidorDiv = document.createElement('div');
        distribuidorDiv.className = 'distribuidor-item'; // Asignar clase para estilo

        // Crear el nombre del distribuidor
        const nombreDistribuidorDiv = document.createElement('div');
        nombreDistribuidorDiv.className = 'nombre-distribuidor';
        nombreDistribuidorDiv.textContent = distribuidorNombre; // Nombre del distribuidor

        // Crear el cuadro de selección (checkbox) para el distribuidor
        const checkBox = document.createElement('img');
        checkBox.className = 'check-box';
        checkBox.src = 'check-box-outline-blank0.svg'; // Imagen del checkbox vacío (puedes cambiar el icono según el estado)

        // Añadir el nombre y el checkbox al div del distribuidor
        distribuidorDiv.appendChild(nombreDistribuidorDiv);
        distribuidorDiv.appendChild(checkBox);

        // Añadir el div del distribuidor al contenedor
        distribuidoresContenedor.appendChild(distribuidorDiv);

        // Agregar interactividad al checkbox (si es necesario)
        checkBox.addEventListener('click', () => {
            if (checkBox.src.includes('check-box-outline-blank0.svg')) {
                checkBox.src = 'check-box2.svg'; // Imagen del checkbox marcado
            } else {
                checkBox.src = 'check-box-outline-blank0.svg'; // Imagen del checkbox vacío
            }
        });
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