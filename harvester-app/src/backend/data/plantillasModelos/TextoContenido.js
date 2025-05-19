const ContenidoBase = require('./ContenidoBase');

class TextoContenido extends ContenidoBase {
  /**
   * @param {Object} props
   * @param {number} props.ordenContenido
   * @param {string} props.tipoTexto
   * @param {string} props.alineacion
   * @param {string} props.contenidoTexto
   */
  constructor({ ordenContenido, tipoTexto, alineacion, contenidoTexto }) {
    super({ ordenContenido, tipoContenido: 'Texto' });
    this.tipoTexto      = tipoTexto;
    this.alineacion     = alineacion;
    this.contenidoTexto = contenidoTexto;
  }
}

module.exports = TextoContenido;
