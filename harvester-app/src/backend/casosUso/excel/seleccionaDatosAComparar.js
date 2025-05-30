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
        console.log('Datos Excel:', datosExcel);
        console.log('Selección:', seleccion);

        Object.entries(seleccion).forEach(([nombreTractor, datosSeleccion]) => {
            console.log(`Procesando tractor: ${nombreTractor}`, datosSeleccion);
            if (!datosSeleccion.seleccionado) {
                return;
            }

            // Obtener los datos completos del tractor desde el JSON original
            const columnasSeleccionadas = datosSeleccion.columnas;
            const datosTractor = datosExcel.hojas[nombreTractor];

            if (!Array.isArray(datosTractor) || columnasSeleccionadas.length === 0) {
                console.warn(`No se encontró la hoja o columnas vacías para el tractor: ${nombreTractor}`);
                return;
            }

            const encabezadosOriginales = datosTractor[0];
            const indicesSeleccionados = columnasSeleccionadas.map(nombreColumna => {
                const index = encabezadosOriginales.indexOf(nombreColumna);
                if (index === -1) {
                    console.warn(`Columna "${nombreColumna}" no encontrada en ${nombreTractor}`);
                }
                return index;
            }).filter(i => i !== -1);

            // Procesar las filas y agregar solo las columnas seleccionadas
            const nuevasFilas = Object.keys(datosTractor)
                .filter(key => key !== "0") // Ignorar encabezados
                .map(key => {
                    const fila = datosTractor[key];
                    return indicesSeleccionados.map(i => fila[i] ?? null); // Solo datos seleccionados
                });

            // Agregar encabezados seleccionados como la primera fila
            const encabezadosSeleccionados = indicesSeleccionados.map(i => encabezadosOriginales[i]);
            nuevoJSON.hojas[nombreTractor] = [
                encabezadosSeleccionados, // Solo los encabezados seleccionados
                ...nuevasFilas // Filas procesadas sin el nombre del tractor
            ];

            console.log(`Filtrado de ${nombreTractor}:`, nuevoJSON.hojas[nombreTractor]);
        });

        // Guardar el nuevo JSON en localStorage
        localStorage.setItem('datosFiltradosExcel', JSON.stringify(nuevoJSON));
        console.log('Nuevo JSON guardado en localStorage:', nuevoJSON);
        return nuevoJSON;
    } catch (error) {
        console.error('Error verificando archivo:', error);
        throw new Error('Error al comparar datos');
    }
}

module.exports = {
    seleccionaDatosAComparar
};