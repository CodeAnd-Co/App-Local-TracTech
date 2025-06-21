/**
 * Procesa datos universalmente según el tipo de gráfica
 * @param {Array} datosOriginales - Datos originales de la fórmula o columna
 * @param {string} tipoGrafica - Tipo de gráfica
 * @param {string} nombreColumna - Nombre de la columna o fórmula
 * @returns {Object} - Objeto con labels y valores procesados
 */
function procesarDatosUniversal(datosOriginales, tipoGrafica) {
  if (!datosOriginales || datosOriginales.length === 0) {
    return { labels: ['Sin datos'], valores: [0] };
  }

  // Filtrar valores vacíos, null o undefined
  const datosLimpios = datosOriginales.filter(valor => 
    valor !== null && valor !== undefined && valor !== '');

  if (datosLimpios.length === 0) {
    return { labels: ['Sin datos'], valores: [0] };
  }

  // Para gráficas circulares Y DE BARRAS: SIEMPRE usar frecuencias (agrupamiento por categoría)
  if (tipoGrafica === 'pie' || tipoGrafica === 'doughnut' || tipoGrafica === 'polarArea' || tipoGrafica === 'bar' || tipoGrafica === 'radar') {
    const frecuencias = {};
    datosLimpios.forEach(valor => {
      const clave = String(valor);
      frecuencias[clave] = (frecuencias[clave] || 0) + 1;
    });
    
    return {
      labels: Object.keys(frecuencias),
      valores: Object.values(frecuencias)
    };
  }

  // Para gráficas lineales y radar - usar filas numeradas SOLO si son números diferentes
  const todosNumeros = datosLimpios.every(valor => 
    !isNaN(parseFloat(valor)) && isFinite(valor));

  if (todosNumeros) {
    // Si son números, verificar si todos son iguales
    const valoresUnicos = [...new Set(datosLimpios)];
    
    if (valoresUnicos.length === 1) {
      // Si todos son iguales, mostrar el valor único
      return {
        labels: ['Resultado'],
        valores: [valoresUnicos[0]]
      };
    } else {
      // Si hay valores diferentes, usar filas numeradas SOLO para líneas y radar
      // AJUSTE: Empezar desde "Fila 1" porque la primera fila del Excel son encabezados
      return {
        labels: datosLimpios.map((_encabezado, indice) => `Fila ${indice + 2}`),
        valores: datosLimpios.map(valor => parseFloat(valor))
      };
    }
  } else {
    // Si son texto o mixto, usar frecuencias
    const frecuencias = {};
    datosLimpios.forEach(valor => {
      const clave = String(valor);
      frecuencias[clave] = (frecuencias[clave] || 0) + 1;
    });
    
    return {
      labels: Object.keys(frecuencias),
      valores: Object.values(frecuencias)
    };
  }
}

module.exports = {
    procesarDatosUniversal
};