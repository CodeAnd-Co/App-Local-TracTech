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
        console.log('Datos de entrada:', { datosExcel, seleccion });
        
        // Validar entrada
        if (!datosExcel || typeof datosExcel !== 'object') {
            throw new Error('datosExcel no es válido');
        }
        
        if (!seleccion || typeof seleccion !== 'object') {
            throw new Error('seleccion no es válida');
        }

        const nuevoJSON = { hojas: {} };
        
        // Acceder a las hojas (manejar tanto datosExcel.hojas como datosExcel directamente)
        const hojas = datosExcel.hojas || datosExcel;
        
        if (!hojas || typeof hojas !== 'object') {
            throw new Error('No se encontraron hojas en los datos del Excel');
        }

        console.log('Hojas disponibles:', Object.keys(hojas));
        console.log('Selección recibida:', seleccion);

        for (const [nombreHoja, configuracionSeleccion] of Object.entries(seleccion)) {
            console.log(`Procesando hoja: ${nombreHoja}`, configuracionSeleccion);
            
            // Verificar si la hoja está seleccionada
            if (!configuracionSeleccion || !configuracionSeleccion.seleccionado) {
                console.log(`Hoja ${nombreHoja} no seleccionada, saltando...`);
                continue;
            }

            // Verificar si la hoja existe en los datos
            const datosHoja = hojas[nombreHoja];
            if (!datosHoja) {
                console.warn(`Hoja ${nombreHoja} no encontrada en los datos`);
                continue;
            }

            // Verificar si es un array válido
            if (!Array.isArray(datosHoja) || datosHoja.length === 0) {
                console.warn(`Hoja ${nombreHoja} no tiene datos válidos`);
                continue;
            }

            const encabezados = datosHoja[0];
            const columnasDeseadas = configuracionSeleccion.columnas || [];

            console.log(`Encabezados en ${nombreHoja}:`, encabezados);
            console.log(`Columnas deseadas en ${nombreHoja}:`, columnasDeseadas);

            // NUEVA LÓGICA: Si no hay columnas específicas seleccionadas, usar todas
            let indicesValidos = [];
            if (columnasDeseadas.length === 0) {
                console.log(`No hay columnas específicas seleccionadas para ${nombreHoja}, usando todas las columnas`);
                // Usar todos los índices disponibles
                indicesValidos = encabezados.map((_, index) => index);
            } else {
                console.log(`Hay columnas específicas seleccionadas para ${nombreHoja}, filtrando...`);
                // Obtener índices de las columnas seleccionadas
                indicesValidos = obtenerIndicesDeColumnas(encabezados, columnasDeseadas);
            }
            
            if (indicesValidos.length === 0) {
                console.warn(`No se encontraron columnas válidas en la hoja ${nombreHoja}`);
                continue;
            }

            console.log(`Índices válidos para ${nombreHoja}:`, indicesValidos);

            // Filtrar las filas de datos (excluyendo encabezados)
            const filasFiltradas = obtenerFilasFiltradas(datosHoja, indicesValidos);
            const encabezadosFiltrados = indicesValidos.map(indice => encabezados[indice]);

            console.log(`Encabezados filtrados para ${nombreHoja}:`, encabezadosFiltrados);
            console.log(`Filas filtradas para ${nombreHoja}:`, filasFiltradas.length, 'filas');

            // Guardar la hoja filtrada en el nuevo JSON
            nuevoJSON.hojas[nombreHoja] = [
                encabezadosFiltrados,
                ...filasFiltradas
            ];
        }

        console.log('Datos filtrados completos:', nuevoJSON);

        // Validar que se procesó al menos una hoja
        if (Object.keys(nuevoJSON.hojas).length === 0) {
            console.warn('No se procesó ninguna hoja');
            mostrarAlerta('Advertencia', 'No se seleccionaron datos válidos para comparar.', 'warning');
            return nuevoJSON;
        }

        // Guardar el nuevo JSON en localStorage
        localStorage.setItem('datosFiltradosExcel', JSON.stringify(nuevoJSON));
        console.log('Datos guardados en localStorage bajo clave: datosFiltradosExcel');
        
        return nuevoJSON;
        
    } catch (error) {
        console.error('Error en seleccionaDatosAComparar:', error);
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
        console.error('Encabezados o columnas deseadas no son arrays válidos');
        return [];
    }

    const indices = columnasDeseadas.map(nombre => {
        // Buscar la posicion del encabezado (manejo de string/trim para evitar espacios)
        const nombreLimpio = String(nombre).trim();
        const indice = encabezados.findIndex(encabezado => 
            String(encabezado).trim() === nombreLimpio
        );
        
        if (indice === -1) {
            console.warn(`Columna "${nombre}" no encontrada en encabezados:`, encabezados);
        }
        
        return indice;
    }).filter(indice => indice !== -1); // Filtrar los indices que se encontraron

    console.log('Índices obtenidos:', indices);
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
        console.error('Hoja o índices no son arrays válidos');
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