const ContenidoBase = require('./ContenidoBase');

class GraficaContenido extends ContenidoBase {
  /**
   * @param {Object} props
   * @param {number} props.ordenContenido
   * @param {string} props.nombreGrafica
   * @param {string} props.tipoGrafica
   * @param {Object} props.parametros
   */
  constructor({ ordenContenido, nombreGrafica, tipoGrafica, parametros = {} }) {
    super({ ordenContenido, tipoContenido: 'Grafica' });
    
    // Validaciones
    if (!nombreGrafica || nombreGrafica.trim() === '') {
      throw new Error('El nombre de la gráfica es requerido');
    }
    
    if (!tipoGrafica || tipoGrafica.trim() === '') {
      throw new Error('El tipo de gráfica es requerido');
    }

    this.nombreGrafica = nombreGrafica.trim();
    this.tipoGrafica   = tipoGrafica.trim();
    this.parametros    = this.validarParametros(parametros);
  }

  /**
   * Valida y sanitiza los parámetros de la gráfica
   * @param {Object} parametros 
   * @returns {Object}
   */
  validarParametros(parametros) {
    if (!parametros || typeof parametros !== 'object') {
      return {};
    }

    // Estructura básica esperada para parámetros de gráfica
    const parametrosValidos = {
      colores: parametros.colores || [],
      etiquetas: parametros.etiquetas || [],
      datos: parametros.datos || [],
      configuracion: parametros.configuracion || {}
    };

    return parametrosValidos;
  }

  /**
   * Convierte la gráfica a objeto plano para serialización
   * @returns {Object}
   */
  toJSON() {
    return {
      ordenContenido: this.ordenContenido,
      tipoContenido: this.tipoContenido,
      nombreGrafica: this.nombreGrafica,
      tipoGrafica: this.tipoGrafica,
      parametros: this.parametros
    };
  }
}

module.exports = GraficaContenido;