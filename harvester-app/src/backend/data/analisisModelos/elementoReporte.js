/**
 * Clase que contiene un nuevo elemento del reporte
 * 
 * @class ElementoNuevo
 * @property {HTMLDivElement} tarjeta - Tarjeta asignada al nuevo elemento
 * @property {HTMLDivElement} previsualizacion - Previsualización asignada al nuevo elemento
 */
class ElementoNuevo {
    /**
     * Crea una instancia de ElementoNuevo.
     * 
     * @param {HTMLDivElement} tarjetaAsignada - Tarjeta asignada al nuevo elemento.
     * @param {HTMLDivElement} previsualizacionAsignada - Previsualización asignada al nuevo elemento.
     */
    constructor(tarjetaAsignada = null, previsualizacionAsignada = null) {
        this.tarjeta = tarjetaAsignada;
        this.previsualizacion = previsualizacionAsignada;
    }
}

/**
 * Clase que contiene los contenedores de tarjeta y previsualización
 * 
 * @class Contenedores
 * @property {HTMLDivElement} contenedorTarjeta - Contenedor de tarjeta.
 * @property {HTMLDivElement} contenedorPrevisualizacion - Contenedor de previsualización.
 */
class Contenedores {
    /**
     * Crea una instancia de Contenedores.
     * 
     * @param {HTMLDivElement} tarjetaContenedor - Contenedor de tarjeta.
     * @param {HTMLDivElement} previsualizacionContenedor - Contenedor de previsualización.
     */
    constructor(tarjetaContenedor = null, previsualizacionContenedor = null) {
        this.contenedorTarjeta = tarjetaContenedor;
        this.contenedorPrevisualizacion = previsualizacionContenedor;
    }
}

module.exports = {
    ElementoNuevo,
    Contenedores,
};