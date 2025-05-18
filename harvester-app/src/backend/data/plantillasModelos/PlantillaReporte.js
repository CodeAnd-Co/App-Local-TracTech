/**
 * Representa la estructura de una plantilla de reporte tal y como la ves en tu tabla.
 */
class PlantillaReporte {
  /**
   * @param {Object} props
   * @param {?number} props.idPlantillaReporte — se deja null al crear uno nuevo
   * @param {string} props.nombrePlantilla
   * @param {string} props.datos — aquí irá el HTML serializado
   * @param {number} props.frecuenciaEnvio — en horas
   * @param {string} props.correoDestino
   * @param {string} props.numeroDestino
   */
  constructor({
    idPlantillaReporte = null,
    nombrePlantilla,
    datos,
    frecuenciaEnvio,
    correoDestino,
    numeroDestino,
  }) {
    this.idPlantillaReporte = idPlantillaReporte;
    this.nombrePlantilla    = nombrePlantilla;
    this.datos              = datos;
    this.frecuenciaEnvio    = frecuenciaEnvio;
    this.correoDestino      = correoDestino;
    this.numeroDestino      = numeroDestino;
  }
}

module.exports = PlantillaReporte;
