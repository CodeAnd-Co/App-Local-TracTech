// RF14: Usuario selecciona datos a comparar - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF14

const { mostrarAlerta } = require('../../../framework/vistas/includes/componentes/moleculas/alertaSwal/alertaSwal');
const { extraerNumero } = require('../../servicios/extraerNumero.js');
const { obtenerParametrosSeleccionados, obtenerTractoresSeleccionados } = require('./obtenerDatosSeleccionados.js');

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

            
            // Limpiar datos de voltaje para tratarlos como números.4
            limpiarColumnas('Bat(V)', encabezadosFiltrados, filasFiltradas);
            limpiarColumnas('ADC', encabezadosFiltrados, filasFiltradas);
            
            // Guardar la hoja filtrada en el nuevo JSON
            nuevoJSON.hojas[nombreHoja] = [
                encabezadosFiltrados,
                // Usamos el operador de propagación para insertar cada fila como un elemento individual
                ...filasFiltradas
            ];
            
        }

        // Guardar el nuevo JSON en localStorage
        localStorage.setItem('datosFiltradosExcel', JSON.stringify(nuevoJSON));

        // Guardar todos los parámetros que hayan sido seleccionados para todos los tractores en localStorage
        const parametrosSeleccionados = obtenerParametrosSeleccionados(nuevoJSON);
        localStorage.setItem('parametrosSeleccionados', JSON.stringify(parametrosSeleccionados));

        const tractoresSeleccionados = obtenerTractoresSeleccionados(nuevoJSON);
        localStorage.setItem('tractoresSeleccionados', JSON.stringify(tractoresSeleccionados));
    // eslint-disable-next-line no-unused-vars
    } catch(error) {
        mostrarAlerta('Error al procesar los datos', 'Ocurrió un error al filtrar los datos del Excel.', 'error');
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


/**
 * Limpia las filas seleccionadas para quitarles los caracteres no numéricos de un campo específico.
 * 
 * @param {string} - Campo a limpiar.
 * @param {Array<any>} encabezadosFiltrados - Encabezados filtrados.
 * @param {Array<number>} filasFiltradas - Filas de datos filtrados.
 * @returns {Array<Array<any>>} Filas filtradas con las columnas correspondientes limpiadas.
 */
function limpiarColumnas(campo, encabezadosFiltrados, filasFiltradas) {
    if( encabezadosFiltrados.includes(campo) ){
        const indice = obtenerIndicesDeColumnas(encabezadosFiltrados, [campo])[0];
        filasFiltradas.forEach(fila => {
            fila[indice] = extraerNumero(fila[indice]);
        });
    }
}

module.exports = {
    seleccionaDatosAComparar
};