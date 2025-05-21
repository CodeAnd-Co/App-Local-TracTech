// RF14: Usuario selecciona datos a comparar - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF14

/**
 * Filtra los datos del excel por tractores y columnas seleccionadas
 * @function seleccionaDatosAComparar
 * @param {Object} datosExcel - JSON original del excel
 * @param {Object.<string, {seleccionado: boolean, columnas: Array<number>}>} seleccion - Objeto donde las claves son los nombres de los tractores (hojas)
 *                                                     y los valores son arreglos con los nombres de las columnas seleccionadas.
 * @returns {Object} JSON nuevo con los datos y columnas seleccionadas 
 */
function seleccionaDatosAComparar(datosExcel, seleccion) {
    try {
        const nuevoJSON = { hojas: {} };
    
        Object.entries(seleccion).forEach(([nombreTractor, datosSeleccion]) => {
            if (!datosSeleccion.seleccionado) {
                return;
            }
            // Obtener los datos completos del tractor desde el JSON original
            const indicesColumnas = datosSeleccion.columnas;
            const datosTractor = datosExcel.hojas[nombreTractor];
    
            if (!datosTractor || !Array.isArray(indicesColumnas) || indicesColumnas.length === 0) { 
                console.warn(`No se encontró la hoja para el tractor: ${nombreTractor}`);
                return;
            }       
    
            const filasFiltradas = datosTractor.map(fila => {
                indicesColumnas.map(iterador => { fila[iterador] ?? null })
            });

            // Guardar encabezados y filas
            nuevoJSON.hojas[nombreTractor] = {
                columnas: indicesColumnas,
                filas: filasFiltradas
            };
        });
    
        // Guardar el nuevo JSON en localStorage
        localStorage.setItem('datosFiltradosExcel', JSON.stringify(nuevoJSON));
        return nuevoJSON;
    } catch (error) {
        console.error('Error verificando archivo:', error);
        throw new Error('Error al comparar datos');
    }
}

module.exports = {
    seleccionaDatosAComparar
};