const { mostrarAlerta } = require('../../../framework/vistas/includes/componentes/moleculas/alertaSwal/alertaSwal');
const { HyperFormula } = require('hyperformula');

const opciones = {
    licenseKey: 'gpl-v3',
};

/**
 * Aplica una fórmula estructurada a una hoja de Excel almacenada en localStorage.
 * @param {string} nombreFormula - Nombre de la fórmula a aplicar.
 * @param {string} formulaEstructurada - Fórmula estructurada a aplicar.
 * @param {string|null} tractorSeleccionado - Nombre de la hoja donde se aplicará la fórmula (opcional).
 * @returns {Object} Resultado de la aplicación de la fórmula.
 */
function aplicarFormula(nombreFormula, formulaEstructurada, tractorSeleccionado, datosExcel) {
    try {
        console.log('datosExcel:', datosExcel);
        const hojas = datosExcel.hojas;

        console.log('hojas:', hojas);

        // Si no se especifica hoja, usar la primera disponible
        let datos = [];
        let tractorUsado = '';
        
        if (tractorSeleccionado && hojas[tractorSeleccionado]) {
            datos = hojas[tractorSeleccionado];
            tractorUsado = tractorSeleccionado;
        } else {
            // Tomar la primera hoja disponible
            tractorUsado = Object.keys(hojas)[0];
            datos = hojas[tractorUsado];
        }
        
        // Verificar que datos sea un array
        if (!Array.isArray(datos)) {
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
            // Si hay un error en la traducción y no se encontró alguna columna, mostrar alerta y lanzar error
            if (formulaTraducida.error) {
                const columnasFaltantes = formulaTraducida.columnasNoEncontradas.join(', ');
                const err = new Error(`Columna no encontrada: ${columnasFaltantes}`);
                err.tipo = 'columnaNoEncontrada';
                mostrarAlerta(`Columnas no encontradas: ${columnasFaltantes}`, 'Asegúrate de seleccionar todas las columnas necesarias para aplicar esta fórmula.', 'error');
                throw err;
            }
            
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
            tractorSeleccionado: tractorUsado,
            resultados,
            datosActualizados
        };
    } catch (error) {
        if (error.tipo == 'columnaNoEncontrada') {
            throw error;
        }
        return {
            error: error.message,
            tractorSeleccionado: tractorSeleccionado || 'desconocida'
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
    const columnasNoEncontradas = [];
    const formulaTraducida = formula.replace(/\[@([^\]]+)\]/g, (_restoFormula, nombreColumna) => {
        const columna = encabezados.indexOf(nombreColumna);
        // Si la columna no se encuentra, agregarla a la lista de no encontradas
        if (columna === -1){
            columnasNoEncontradas.push(nombreColumna);
            return `#NO_ENCONTRADA#`;
        }    
        const letraColumna = indiceALetraColumna(columna);
        const fila = filaActiva + 1; // Excel empieza en 1
        return `${letraColumna}${fila}`;
    });
    if (columnasNoEncontradas.length > 0) {
        return { error: true, columnasNoEncontradas };
    }
    return  formulaTraducida;
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
    aplicarFormula,
    encontrarColumnaVacia,
    traducirFormulaEstructurada,
    indiceALetraColumna,
};
