// RF14: Usuario selecciona datos a comparar - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF14

const { mostrarAlerta } = require("../../../framework/vistas/includes/componentes/moleculas/alertaSwal/alertaSwal");

/**
 * Filtra los datos del excel por hojas(tractores) y columnas seleccionadas
 * @function seleccionaDatosAComparar
 * @param {Object} datosExcel - JSON original del excel
 * @param {Object.<string, {seleccionado: boolean, columnas: Array<string>}>} seleccion - Objeto donde las claves son los nombres de los tractores (hojas)
 *                                                     y los valores contienen configuración de selección.
 * @returns {Object} - Objeto con los datos filtrados
 */
function seleccionaDatosAComparar(datosExcel, seleccion) {
    try {
        // Validar entrada
        if (!datosExcel || typeof datosExcel !== 'object') {
            throw new Error('datosExcel no es válido');
        }
        
        if (!seleccion || typeof seleccion !== 'object') {
            throw new Error('Selección no es válida');
        }

        const nuevoJSON = { hojas: {} };
        
        // Acceder a las hojas (manejar tanto datosExcel.hojas como datosExcel directamente)
        const hojas = datosExcel.hojas || datosExcel;
        
        if (!hojas || typeof hojas !== 'object') {
            throw new Error('No se encontraron hojas en los datos del Excel');
        }

        for (const [nombreHoja, configuracionSeleccion] of Object.entries(seleccion)) {
            // Verificar si la hoja está seleccionada
            if (!configuracionSeleccion || !configuracionSeleccion.seleccionado) {
                continue;
            }

            // Verificar si la hoja existe en los datos
            const datosHoja = hojas[nombreHoja];
            if (!datosHoja) {
                mostrarAlerta('Advertencia', `La hoja ${nombreHoja} no se encuentra en los datos del Excel.`, 'warning');
                continue;
            }

            const encabezados = datosHoja[0];
            const columnasDeseadas = configuracionSeleccion.columnas || [];

            // NUEVA LÓGICA: Si no hay columnas específicas seleccionadas, usar todas
            let indicesValidos = [];
            if (columnasDeseadas.length === 0) {
                // Usar todos los índices disponibles
                indicesValidos = encabezados.map((_encabezado, index) => index);
            } else {
                // Obtener índices de las columnas seleccionadas
                indicesValidos = obtenerIndicesDeColumnas(encabezados, columnasDeseadas);
            }
            

            // Filtrar las filas de datos (excluyendo encabezados)
            const filasFiltradas = obtenerFilasFiltradas(datosHoja, indicesValidos);
            const encabezadosFiltrados = indicesValidos.map(indice => encabezados[indice]);

            // Guardar la hoja filtrada en el nuevo JSON
            nuevoJSON.hojas[nombreHoja] = [
                encabezadosFiltrados,
                ...filasFiltradas
            ];
        }

        // Validar que se procesó al menos una hoja
        if (Object.keys(nuevoJSON.hojas).length === 0) {
            mostrarAlerta('Advertencia', 'No se seleccionaron datos válidos para comparar.', 'warning');
            return nuevoJSON;
        }

        // Guardar el nuevo JSON en localStorage
        localStorage.setItem('datosFiltradosExcel', JSON.stringify(nuevoJSON));
        return nuevoJSON;
        
    } catch (error) {
        mostrarAlerta('Error al procesar los datos', `Ocurrió un error al filtrar los datos del Excel: ${error.message}`, 'error');
        return { hojas: {} };
    }
}

/**
 * Obtiene los índices de las columnas seleccionadas según los encabezados originales.
 * @param {Array<string>} encabezados - Encabezados de la hoja.
 * @param {Array<string>} columnasDeseadas - Nombres de columnas a buscar.
 * @returns {Array<number>} Índices válidos encontrados.
 */
function obtenerIndicesDeColumnas(encabezados, columnasDeseadas) {
    if (!Array.isArray(encabezados) || !Array.isArray(columnasDeseadas)) {
        mostrarAlerta('Error', 'Encabezados o columnas deseadas no son válidos', 'error');
        return [];
    }

    const indices = columnasDeseadas.map(nombre => {
        // Buscar la posicion del encabezado (manejo de string/trim para evitar espacios)
        const nombreLimpio = String(nombre).trim();
        const indice = encabezados.findIndex(encabezado => 
            String(encabezado).trim() === nombreLimpio);
        
        return indice;
    }).filter(indice => indice !== -1); // Filtrar los indices que se encontraron

    return indices;
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
    if (!Array.isArray(hoja) || !Array.isArray(indices)) {
        mostrarAlerta('Error', 'Hoja o índices no son válidos', 'error');
        return [];
    }

    // Tomar todas las filas excepto la primera (encabezados) y filtrar por las columnas seleccionadas
    const filasFiltradas = hoja.slice(1).map(fila => {
        if (!Array.isArray(fila)) {
            console.warn('Fila no es un array válido:', fila);
            return indices.map(() => null); // Devolver nulls para mantener estructura
        }
        
        return indices.map(indice => {
            const valor = fila[indice];
            return valor !== undefined ? valor : null;
        });
    });

    return filasFiltradas;
}

module.exports = {
    seleccionaDatosAComparar
};