// RF14: Usuario selecciona datos a comparar - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF14

/**
 * Filtra los datos del excel por tractores y columnas seleccionadas
 * @function seleccionaDatosAComparar
 * @param {Object} datosExcel - JSON original del excel
 * @param {Array<string>} tractores - Nombres de hojas/tractores seleccionados
 * @param {Object.<string, Array<string>} columnasSeleccionadas - Diccionario con el nombre del tractor y columnas seleccionadas
 * @returns {Object} JSON nuevo con los datos y columnas seleccionadas 
 */
function seleccionaDatosAComparar(datosExcel, tractores, columnasSeleccionadas) {
    const nuevoJSON = { hojas: {} };

    tractores.forEach(nombreTractor => {
        const datosTractor = datosExcel.hojas[nombreTractor];
        if (!datosTractor) return;
        const columnas = columnasSeleccionadas[nombreTractor];
        if (!columnas || columnas.length === 0) return;

        nuevoJSON.hojas[nombreTractor] = datosTractor.map(fila =>
            columnas.reduce((nuevoFila, columna) => {
                nuevoFila[columna] = fila[columna];
                return nuevoFila;
            }, {})
        );
    });

    return nuevoJSON;
}

module.exports = {
    seleccionaDatosAComparar
}