const ContenidoBase = require('./ContenidoBase');

class TextoContenido extends ContenidoBase {
  /**
   * @param {Object} props
   * @param {number} props.ordenContenido
   * @param {string} props.tipoTexto
   * @param {string} props.alineacion
   * @param {string} props.contenidoTexto
   */
  constructor({ ordenContenido, tipoTexto = 'Contenido', alineacion = 'Izquierda', contenidoTexto }) {
    super({ ordenContenido, tipoContenido: 'Texto' });
    
    // Validaciones
    if (!contenidoTexto || contenidoTexto.trim() === '') {
      throw new Error('El contenido del texto es requerido');
    }

    const mapeoTipos = {
      'Titulo': 'Titulo',
      'Subtitulo': 'Subtitulo',
      'Contenido': 'Contenido',
      'Parrafo': 'Contenido'  // ← Mapear Parrafo a Contenido
    };

    const tipoMapeado = mapeoTipos[tipoTexto] || 'Contenido';
    
    // Validar tipos de texto permitidos (después del mapeo)
    const tiposPermitidos = ['Titulo', 'Subtitulo', 'Contenido'];
    if (!tiposPermitidos.includes(tipoMapeado)) {
      throw new Error(`Tipo de texto no válido. Permitidos: ${tiposPermitidos.join(', ')}`);
    }

    // Validar alineaciones permitidas
    const alineacionesPermitidas = ['Izquierda', 'Centro', 'Derecha'];
    if (!alineacionesPermitidas.includes(alineacion)) {
      throw new Error(`Alineación no válida. Permitidas: ${alineacionesPermitidas.join(', ')}`);
    }

    this.tipoTexto      = tipoMapeado;  // ← Usar el tipo mapeado
    this.alineacion     = alineacion;
    this.contenidoTexto = contenidoTexto.trim();
  }

  /**
   * Convierte el texto a objeto plano para serialización
   * @returns {Object}
   */
  toJSON() {
    return {
      ordenContenido: this.ordenContenido,
      tipoContenido: this.tipoContenido,
      tipoTexto: this.tipoTexto,
      alineacion: this.alineacion,
      contenidoTexto: this.contenidoTexto
    };
  }

  /**
   * Obtiene la longitud del contenido
   * @returns {number}
   */
  obtenerLongitud() {
    return this.contenidoTexto.length;
  }
}

module.exports = TextoContenido;