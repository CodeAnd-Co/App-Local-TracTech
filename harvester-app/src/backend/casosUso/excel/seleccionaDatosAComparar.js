// RF14: Usuario selecciona datos a comparar - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF14

/**
 * Filtra los datos del excel por hojas(tractores) y columnas seleccionadas
 * @function seleccionaDatosAComparar
 * @param {Object} datosExcel - JSON original del excel
 * @param {Object.<string, {seleccionado: boolean, columnas: Array<number>}>} seleccion - Objeto donde las claves son los nombres de los tractores (hojas)
 *                                                     y los valores son arreglos con los nombres de las columnas seleccionadas.
 */
function seleccionaDatosAComparar(datosExcel, seleccion) {
    try {
        const nuevoJSON = { hojas: {} };
        for (const [nombreHoja, configuracionSeleccion] of Object.entries(seleccion)) {
            if (!configuracionSeleccion.seleccionado) continue;

            const datosHoja = datosExcel.hojas[nombreHoja];
            if (!Array.isArray(datosHoja) || configuracionSeleccion.columnas.length === 0) {
                continue;
            }

            const encabezados = datosHoja[0];
            const columnasDeseadas = configuracionSeleccion.columnas;

            const indicesValidos = obtenerIndicesDeColumnas(encabezados, columnasDeseadas);
            

            const filasFiltradas = obtenerFilasFiltradas(datosHoja, indicesValidos);
            const encabezadosFiltrados = indicesValidos.map(indice => encabezados[indice]);

            // Guardar la hoja filtrada en el nuevo JSON
            nuevoJSON.hojas[nombreHoja] = [
                encabezadosFiltrados,
                // Usamos el operador de propagación para insertar cada fila como un elemento individual
                ...filasFiltradas
            ];
        }

        // Guardar el nuevo JSON en localStorage
        localStorage.setItem('datosFiltradosExcel', JSON.stringify(nuevoJSON));
    } catch (error) {
        throw new Error('Error al comparar datos');
    }
}

/**
 * Obtiene los índices de las columnas seleccionadas según los encabezados originales.
 * @param {Array<string>} encabezados - Encabezados de la hoja.
 * @param {Array<string>} columnasDeseadas - Nombres de columnas a buscar.
 * @returns {Array<number>} Índices válidos encontrados.
 */
function obtenerIndicesDeColumnas(encabezados, columnasDeseadas) {
    return columnasDeseadas.map(nombre => {
        // Buscar la posicion del encabezado
        const indice = encabezados.indexOf(nombre);
        return indice;
    }).filter(indice => indice !== -1); // Filtrar los indices que se encontraron
}

/**
 * Filtra las filas de una hoja dejando solo las columnas seleccionadas (por índice).
 * Ignora la primera fila (encabezados).
 * 
 * @param {Array<Array<any>>} hoja - Datos de la hoja, incluyendo encabezados.
 * @param {Array<number>} indices - Índices de columnas a conservar.
 * @returns {Array<Array<any>>} Filas filtradas.
 */
function obtenerFilasFiltradas(hoja, indices) {
    return hoja.slice(1).map(fila =>
        indices.map(indice => fila?.[indice] ?? null));
}

module.exports = {
    seleccionaDatosAComparar
};