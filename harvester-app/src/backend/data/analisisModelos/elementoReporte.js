class ElementoNuevo {
    constructor(tarjetaAsignada = null, previsualizacionAsignada = null) {
        this.tarjeta = tarjetaAsignada;
        this.previsualizacion = previsualizacionAsignada;
    }
}

class Contenedores {
    constructor(tarjetaContenedor = null, previsualizacionContenedor = null) {
        this.contenedorTarjeta = tarjetaContenedor;
        this.contenedorPrevisualizacion = previsualizacionContenedor;
    }
}

module.exports = {
    ElementoNuevo,
    Contenedores,
};