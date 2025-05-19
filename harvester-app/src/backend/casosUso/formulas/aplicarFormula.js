const { HyperFormula } = require('hyperformula');

const opciones = {
    licenseKey: 'gpl-v3',
};

function aplicarFormula(nombreFormula, formulaEstructurada, nombreHoja = null) {
    try {
        // Obtener datos del localStorage
        let datosExcelStr = localStorage.getItem('datosExcel');
        if (!datosExcelStr) {
            throw new Error('No se encontraron datos en localStorage');
        }
        
        // Intentar reparar el JSON si está incompleto
        if (!datosExcelStr.endsWith('}')) {
            console.warn('El JSON parece estar incompleto, intentando reparar...');
            datosExcelStr += '}}';
        }
        
        let datosExcel;
        try {
            datosExcel = JSON.parse(datosExcelStr);
        } catch (e) {
            console.error('Error al parsear JSON:', e);
            console.log('String problematico:', datosExcelStr);
            throw new Error('Los datos en localStorage no son un JSON válido');
        }
        
        // Estructura específica para el formato que has mencionado
        let hojas = datosExcel;
        
        // Comprobar si tiene la estructura específica con propiedad "hojas"
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
        let resultados = [];
        for (let fila = 1; fila < datos.length; fila++) {
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
            resultados: resultados,
            datosActualizados: datosActualizados
        };
    } catch (error) {
        console.error('Error en aplicarFormula:', error);
        return {
            error: error.message,
            nombreHoja: nombreHoja || 'desconocida'
        };
    }
}

// Función para encontrar la primera columna vacía en los datos
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

// Utilidad para traducir [@Columna] a letra de columna+fila
function traducirFormulaEstructurada(formula, encabezados, filaActiva) {
    return formula.replace(/\[@([^\]]+)\]/g, (_restoFormula, nombreColumna) => {
        const columna = encabezados.indexOf(nombreColumna);
        if (columna === -1) throw new Error(`Columna no encontrada: ${nombreColumna}`);
        const letraColumna = indiceALetraColumna(columna);
        const fila = filaActiva + 1; // Excel empieza en 1
        return `${letraColumna}${fila}`;
    });
}

// Convertir índice de columna (0,1,2...) a letra de Excel (A,B,C...)
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
