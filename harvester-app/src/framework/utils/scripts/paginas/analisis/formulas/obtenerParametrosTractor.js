/**
 * Devuelve la lista de todos los parámetros de ese tractor.
 * 
 * @param {string} JSONfiltrado - Versión final de los datos seleccionados de los tractores.
 * @param {string} tractor - Nombre de la hoja del tractor.
 * @returns {Array<string>} - Lista de tractores seleccionados.
 */
function obtenerParametrosTractor(JSONfiltrado, tractor) {
    const datosHoja = JSONfiltrado.hojas[tractor];
    const parametrosTractor  = datosHoja[0];
    console.log(`Parámetros del tractor ${tractor}:`, parametrosTractor);

    return parametrosTractor ;
}

module.exports = {
    obtenerParametrosTractor
};