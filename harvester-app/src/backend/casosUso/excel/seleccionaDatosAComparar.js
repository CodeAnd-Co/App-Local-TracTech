// RF14: Usuario selecciona datos a comparar - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF14

/**
 * Filtra los datos del excel por tractores y columnas seleccionadas
 * @function seleccionaDatosAComparar
 * @param {Object} datosExcel - JSON original del excel
 * @param {Object.<string, Array<string>} seleccion - Objeto donde las claves son los nombres de los tractores (hojas)
 *                                                     y los valores son arreglos con los nombres de las columnas seleccionadas.
 * @returns {Object} JSON nuevo con los datos y columnas seleccionadas 
 */
function seleccionaDatosAComparar(datosExcel, seleccion) {
    const nuevoJSON = { hojas: {} };

    Object.entries(seleccion).forEach(([nombreTractor, columnas]) => {
        const columnas = datosSeleccion.columnas;
        // Obtener los datos completos del tractor desde el JSON original
        const datosTractor = datosExcel.hojas[nombreTractor];

        if (!datosTractor || !Array.isArray(columnas) || columnas.length === 0) return;

        // Para cada fila del tractor, creamos una nueva fila con solo las columnas seleccionadas
        nuevoJSON.hojas[nombreTractor] = datosTractor.map(fila =>
            columnas.reduce((nuevoFila, columna) => {
                // Agregamos la columna seleccionada a la nueva fila
                nuevoFila[columna] = fila[columna];
                return nuevoFila;
            }, {})
        );
    });

    // Guardar el nuevo JSON en localStorage
    localStorage.setItem('datosFiltradosExcel', JSON.stringify(nuevoJSON));

    return nuevoJSON;
}

module.exports = {
    seleccionaDatosAComparar
}