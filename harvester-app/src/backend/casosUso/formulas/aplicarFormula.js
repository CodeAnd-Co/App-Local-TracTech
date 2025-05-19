const { HyperFormula } = require('hyperformula');

const opciones = {
    licenseKey: 'gpl-v3',
};

/**
 * Aplica una fórmula estructurada a una hoja de Excel almacenada en localStorage.
 * @param {string} nombreFormula - Nombre de la fórmula a aplicar.
 * @param {string} formulaEstructurada - Fórmula estructurada a aplicar.
 * @param {string|null} nombreHoja - Nombre de la hoja donde se aplicará la fórmula (opcional).
 * @returns {Object} Resultado de la aplicación de la fórmula.
 */
function aplicarFormula(nombreFormula, formulaEstructurada, nombreHoja = null) {
    try {
        // Obtener datos del localStorage
        const datosExcelCadena = localStorage.getItem('datosExcel');
        if (!datosExcelCadena) {
            throw new Error('No se encontraron datos en localStorage');
        }
        
        let datosExcel;
        try {
            datosExcel = JSON.parse(datosExcelCadena);
        } catch (error) {
            console.error('Error al parsear JSON:', error);

            throw new Error('Los datos en localStorage no son un JSON válido');
        }
        
   
        let hojas = datosExcel;
        if (datosExcel.hojas) {
            hojas = datosExcel.hojas;
        }
        
        // Si no se especifica hoja, usar la primera disponible
        let datos = [];
        let nombreHojaUsada = '';
        
        if (nombreHoja && hojas[nombreHoja]) {
            datos = hojas[nombreHoja];
            nombreHojaUsada = nombreHoja;
        } else {
            // Tomar la primera hoja disponible
            nombreHojaUsada = Object.keys(hojas)[0];
            datos = hojas[nombreHojaUsada];
        }
        
        // Verificar que datos sea un array
        if (!Array.isArray(datos)) {
            console.error('Datos no es un array:', datos);
            throw new Error('Formato de datos inválido: se esperaba un array');
        }
        
        if (datos.length === 0) {
            throw new Error('No hay datos disponibles en la hoja seleccionada');
        }

        // Obtener encabezados
        const encabezados = datos[0];
        
        // Encontrar la primera columna vacía usando método seguro
        const indiceColumnaVacio = encontrarColumnaVacia(datos);
        
        // Añadir un título a la columna de resultados
        if (!nombreFormula || nombreFormula.trim() === '') {
            nombreFormula = 'Resultado';
        }
        const nombreColumnaResultado = nombreFormula;
        
        const hyperFormula = HyperFormula.buildFromArray(datos, opciones);
        
        // Asignar nombre a la columna de resultados
        hyperFormula.setCellContents({ row: 0, col: indiceColumnaVacio, sheet: 0 }, nombreColumnaResultado);
        
        // Aplicar la fórmula a cada fila de datos
        const resultados = [];
        for (let fila = 1; fila < datos.length; fila = fila + 1) {
            // Traducir fórmula estructurada a fórmula clásica para esta fila específica
            const formulaTraducida = traducirFormulaEstructurada(formulaEstructurada, encabezados, fila);
            
            // Aplicar la fórmula a esta fila
            hyperFormula.setCellContents({ row: fila, col: indiceColumnaVacio, sheet: 0 }, formulaTraducida);
            const result = hyperFormula.getCellValue({ row: fila, col: indiceColumnaVacio, sheet: 0 });
            resultados.push(result);
        }
        
        // Obtener los datos actualizados con la nueva columna para devolverlos
        const datosActualizados = hyperFormula.getSheetValues(0);
        
        return {
            indiceColumna: indiceColumnaVacio,
            nombreColumna: nombreColumnaResultado,
            nombreHoja: nombreHojaUsada,
            resultados,
            datosActualizados
        };
    } catch (error) {
        console.error('Error en aplicarFormula:', error);
        return {
            error: error.message,
            nombreHoja: nombreHoja || 'desconocida'
        };
    }
}


/**
 * @function encontrarColumnaVacia
 * @param {Array} datos - Datos de la hoja de Excel.
 * @returns {number} Índice de la primera columna vacía.
 * @throws {Error} Si los datos no son un array.
 */
function encontrarColumnaVacia(datos) {
    if (!Array.isArray(datos)) {
        console.error('encontrarColumnaVacia: datos no es un array', datos);
        return 0;
    }
    
    if (datos.length === 0) return 0;
    
    let maxColumnas = 0;
    // Encontrar el número máximo de columnas en cualquier fila
    datos.forEach(fila => {
        maxColumnas = Math.max(maxColumnas, fila.length);
    });
    
    return maxColumnas;
}

/**
 * @function traducirFormulaEstructurada
 * @param {string} formula - Fórmula estructurada a traducir.
 * @param {Array} encabezados - Encabezados de la hoja de Excel.
 * @param {number} filaActiva - Fila activa para la traducción.
 * @returns {string} Fórmula traducida a formato clásico de Excel.
 */
function traducirFormulaEstructurada(formula, encabezados, filaActiva) {
    return formula.replace(/\[@([^\]]+)\]/g, (_restoFormula, nombreColumna) => {
        const columna = encabezados.indexOf(nombreColumna);
        if (columna === -1) throw new Error(`Columna no encontrada: ${nombreColumna}`);
        const letraColumna = indiceALetraColumna(columna);
        const fila = filaActiva + 1; // Excel empieza en 1
        return `${letraColumna}${fila}`;
    });
}

/**
 * @function indiceALetraColumna
 * @param {number} indice - Índice de la columna (0-indexed).
 * @returns {string} Letra correspondiente a la columna.
 */
function indiceALetraColumna(indice) {
    let letra = '';
    while (indice >= 0) {
        letra = String.fromCharCode((indice % 26) + 65) + letra;
        indice = Math.floor(indice / 26) - 1;
    }
    return letra;
}

module.exports = {
    aplicarFormula
};
