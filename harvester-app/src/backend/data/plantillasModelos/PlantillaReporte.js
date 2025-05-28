class PlantillaReporte {
  /**
   * @param {Object} props
   * @param {?number} props.idPlantillaReporte — se deja null al crear uno nuevo
   * @param {string} props.nombrePlantilla
   * @param {Array} props.contenidos — Array de objetos GraficaContenido y TextoContenido
   * @param {number} props.frecuenciaEnvio — en horas
   * @param {string} props.correoDestino
   * @param {string} props.numeroDestino
   */
  constructor({
    idPlantillaReporte = null,
    nombrePlantilla,
    contenidos = [],
    frecuenciaEnvio = 0,
    correoDestino = '',
    numeroDestino = '',
  }) {
    // Validaciones básicas
    if (!nombrePlantilla || nombrePlantilla.trim() === '') {
      throw new Error('El nombre de la plantilla es requerido');
    }
    
    if (frecuenciaEnvio < 0) {
      throw new Error('La frecuencia de envío no puede ser negativa');
    }

    this.idPlantillaReporte = idPlantillaReporte;
    this.nombrePlantilla    = nombrePlantilla.trim();
    this.contenidos         = contenidos; // Cambiado de 'datos' a 'contenidos'
    this.frecuenciaEnvio    = frecuenciaEnvio;
    this.correoDestino      = correoDestino.trim();
    this.numeroDestino      = numeroDestino.trim();
  }

  /**
   * Serializa los contenidos a JSON para envío a API
   * @returns {string}
   */
  serializarContenidos() {
    return JSON.stringify(this.contenidos);
  }

  /**
   * Valida que la plantilla tenga al menos un contenido
   * @returns {boolean}
   */
  esValida() {
    return this.contenidos && this.contenidos.length > 0;
  }
}

module.exports = PlantillaReporte;