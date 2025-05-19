const { HyperFormula } = require('hyperformula');
const XLSX = require('xlsx');
const path = require('path');

const opciones = {
    licenseKey: 'gpl-v3',
};

const archivo = path.resolve(__dirname, '../../../RTEC FEBRERO.xlsx');

function aplicarFormula(nombreFormula ,formulaEstructurada) {
    const datos = leerArchivo(archivo);

    // Obtener encabezados
    const encabezados = datos[0];
    
    // Encontrar la primera columna vacía
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
    
    // Guardar cambios en el archivo Excel
    guardarExcel(hyperFormula, archivo);
    
    return {
        indiceColumna: indiceColumnaVacio,
        nombreColumna: nombreColumnaResultado,
        resultados: resultados
    };
}

// Función para encontrar la primera columna vacía en los datos
function encontrarColumnaVacia(datos) {
    if (datos.length === 0) return 0;
    
    let maxColumnas = 0;
    // Encontrar el número máximo de columnas en cualquier fila
    datos.forEach(fila => {
        maxColumnas = Math.max(maxColumnas, fila.length);
    });
    
    return maxColumnas;
}

function leerArchivo(filePath) {
    try {
        const libro = XLSX.readFile(filePath);
        const nombreHojas = libro.SheetNames[0];
        const hojaActiva = libro.Sheets[nombreHojas];
        const datos = XLSX.utils.sheet_to_json(hojaActiva, { header: 1 });
        return datos;
    } catch (error) {
        console.error('Error de lectura: ', error);
    }
}

// Guardar los cambios en el archivo Excel
function guardarExcel(hyperFormula, filePath) {
    try {
        // Leer el libro existente para mantener todas las hojas
        const libroExistente = XLSX.readFile(filePath);
        
        // Obtener el nombre de la primera hoja (la que estamos modificando)
        const nombreHoja = libroExistente.SheetNames[0];
        
        // Obtener los datos actualizados de HyperFormula
        const datosActualizados = hyperFormula.getSheetValues(0);
        
        // Crear una hoja con los datos actualizados
        const hojaActualizada = XLSX.utils.aoa_to_sheet(datosActualizados);
        
        // Reemplazar solo la hoja que modificamos en el libro existente
        libroExistente.Sheets[nombreHoja] = hojaActualizada;
        
        // Escribir el libro actualizado (manteniendo todas las hojas)
        XLSX.writeFile(libroExistente, filePath);
        
        console.log('Archivo Excel actualizado correctamente, preservando todas las hojas');
    } catch (err) {
        console.error('Error al guardar el archivo:', err);
    }
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

// Ejemplo de uso
const resultado = aplicarFormula("Suma de Velocidad y Lts",'=SUM([@Velocidad],[@Lts])');
console.log('Resultado final:', resultado);
// console.log(aplicarFormula('=SUM([@ADC])'));

