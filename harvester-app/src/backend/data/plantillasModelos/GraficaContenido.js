const ContenidoBase = require('./ContenidoBase');

class GraficaContenido extends ContenidoBase {
  /**
   * @param {Object} props
   * @param {number} props.ordenContenido
   * @param {string} props.nombreGrafica
   * @param {string} props.tipoGrafica
   * @param {Object} props.parametros
   */
  constructor({ ordenContenido, nombreGrafica, tipoGrafica, parametros }) {
    super({ ordenContenido, tipoContenido: 'Grafica' });
    this.nombreGrafica = nombreGrafica;
    this.tipoGrafica   = tipoGrafica;
    this.parametros    = parametros;
  }
}

module.exports = GraficaContenido;
