class ContenidoBase {
  /**
   * @param {Object} props
   * @param {number} props.ordenContenido - Posición del contenido en la plantilla
   * @param {string} props.tipoContenido  - 'Grafica' | 'Texto' | etc.
   */
  constructor({ ordenContenido, tipoContenido }) {
    this.ordenContenido = ordenContenido;
    this.tipoContenido  = tipoContenido;
  }
}

module.exports = ContenidoBase;