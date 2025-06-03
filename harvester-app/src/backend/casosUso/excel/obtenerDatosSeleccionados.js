/**
 * Devuelve la lista de todos los parámetros que fueron seleccionados para todos los tractores.
 * 
 * @param {string} JSONfiltrado - Versión final de los datos seleccionados de los tractores.
 * @returns {Array<string>} - Lista de parámetros seleccionados a través de todos los tractores.
 */
function obtenerParametrosSeleccionados(JSONfiltrado) {
    const parametrosSeleccionados = [];
    for(const [nombreHoja, datosHoja] of Object.entries(JSONfiltrado.hojas)) {
        const encabezados = datosHoja[0];
        for(const encabezado of encabezados) {
            if (!parametrosSeleccionados.includes(encabezado)) {
                parametrosSeleccionados.push(encabezado);
            };
        };
    };
    return parametrosSeleccionados;
}



/**
 * Devuelve la lista de todos los tractores que fueron seleccionados.
 * 
 * @param {string} JSONfiltrado - Versión final de los datos seleccionados de los tractores.
 * @returns {Array<string>} - Lista de tractores seleccionados.
 */
function obtenerTractoresSeleccionados(JSONfiltrado) {
    const tractoresSeleccionados = [];
    for(const [nombreHoja] of Object.entries(JSONfiltrado.hojas)) {
        if (!tractoresSeleccionados.includes(nombreHoja)) {
            tractoresSeleccionados.push(nombreHoja);
        };
    };
    return tractoresSeleccionados;
}

module.exports = {
    obtenerParametrosSeleccionados,
    obtenerTractoresSeleccionados,
};