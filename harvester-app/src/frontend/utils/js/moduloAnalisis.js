/**
 * Inicializa el módulo de análisis con los datos del Excel
 * @param {Array} datosExcel - Datos del Excel en formato JSON
 */
function inicializarModuloAnalisis(datosExcel) {
    // Esperamos un breve momento para asegurarnos de que el DOM está completamente cargado
    setTimeout(() => {
        // Verificamos si tenemos datos
        if (!datosExcel || !Array.isArray(datosExcel) || datosExcel.length === 0) {
            console.error("No se recibieron datos válidos para el análisis");
            alert("Error: No hay datos para analizar");
            return cargarModuloInicio(); // Volvemos al inicio si no hay datos
        }

        // Mostramos el nombre del archivo actual
        const nombreArchivoElement = document.getElementById('nombre-archivo-actual');
        if (nombreArchivoElement) {
            // Aquí podrías mostrar el nombre del archivo si lo pasas como parte de los datos
            nombreArchivoElement.textContent = localStorage.getItem('nombreArchivoExcel') || 'Datos cargados';
        }

        // Configuramos la tabla con los datos
        configurarTabla(datosExcel);
        
        // Configuramos el botón para volver al inicio
        const btnVolver = document.getElementById('btn-volver');
        if (btnVolver) {
            btnVolver.addEventListener('click', () => {
                cargarModuloInicio();
            });
        }
        
        // Configuramos el botón de exportar (puedes implementar esta funcionalidad según tus necesidades)
        const btnExportar = document.getElementById('btn-exportar');
        if (btnExportar) {
            btnExportar.addEventListener('click', () => {
                exportarResultados(datosExcel);
            });
        }
        
        // Aquí puedes añadir cualquier otra inicialización necesaria para tu módulo de análisis
        
    }, 100);
}

/**
 * Configura la tabla con los datos del Excel
 * @param {Array} datos - Datos del Excel
 */
function configurarTabla(datos) {
    const cabecera = document.getElementById('cabecera-tabla');
    const cuerpo = document.getElementById('cuerpo-tabla');
    
    if (!cabecera || !cuerpo) {
        console.error("No se encontraron los elementos de la tabla");
        return;
    }
    
    // Limpiamos la tabla
    cabecera.innerHTML = '';
    cuerpo.innerHTML = '';
    
    // Asumimos que la primera fila son las cabeceras
    const cabeceras = datos[0] || [];
    
    // Creamos la fila de cabecera
    const filaCabecera = document.createElement('tr');
    cabeceras.forEach(texto => {
        const th = document.createElement('th');
        th.textContent = texto;
        filaCabecera.appendChild(th);
    });
    cabecera.appendChild(filaCabecera);
    
    // Creamos las filas de datos (empezamos desde la segunda fila)
    for (let i = 1; i < datos.length; i++) {
        const fila = document.createElement('tr');
        datos[i].forEach(celda => {
            const td = document.createElement('td');
            td.textContent = celda !== undefined && celda !== null ? celda : '';
            fila.appendChild(td);
        });
        cuerpo.appendChild(fila);
    }
}

/**
 * Exporta los resultados del análisis
 * @param {Array} datos - Datos para exportar
 */
function exportarResultados(datos) {
    // Aquí puedes implementar la lógica para exportar los resultados
    // Por ejemplo, convertir de nuevo a Excel, generar un PDF, etc.
    alert("Función de exportación no implementada");
    
    // Ejemplo simple: descargar como CSV
    const csv = datos.map(fila => fila.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = 'resultados_analisis.csv';
    enlace.style.visibility = 'hidden';
    
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
}

window.inicializarModuloAnalisis = inicializarModuloAnalisis;