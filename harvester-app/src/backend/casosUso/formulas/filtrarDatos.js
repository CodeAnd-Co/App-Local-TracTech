const { mostrarAlerta } = require('../../../framework/vistas/includes/componentes/moleculas/alertaSwal/alertaSwal');
const { HyperFormula } = require('hyperformula');
const { encontrarColumnaVacia } = require('./aplicarFormula.js')

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

function filtrarDatos(filtro, datosExcel, tractorSeleccionado){
    if(filtro.length==0){
        return { resultados: datosExcel };
    }

  // Lógica para filtrar los datos según el filtro
    try {

        const hojas = datosExcel.hojas;

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


        
        const hyperFormulaInstance = HyperFormula.buildFromArray(datos, opciones);
        const sheetId = hyperFormulaInstance.getSheetId('Sheet1');

        const columnaCondicion = nombreColumnaAIndice(filtro[0].Datos, encabezados);
        if(columnaCondicion.error) {
            return { error: true, columnaNoEncontrada: columnaCondicion.columnaNoEncontrada };
        }

        const filas = datos.length;

        const condicionFiltro = extraerCondicionFiltro(filtro[0].Datos);

        for(let columna = indiceColumnaVacio; columna < indiceColumnaVacio*2+1; columna++) {
            hyperFormulaInstance.setCellContents({ row: 0, col: columna, sheet: sheetId }, encabezados[columna-indiceColumnaVacio]);
            const columnaLetra = numeroAColumnaExcel(columna-indiceColumnaVacio+1);
            hyperFormulaInstance.setCellContents({ row: 1, col: columna, sheet: 0 }, `=FILTER(${columnaLetra}2:${columnaLetra}${filas}, ${columnaCondicion}2: ${columnaCondicion}${filas}${condicionFiltro})`);
        }

        const resultadosFiltrados = [];
        for(let fila = 0; fila < filas; fila++) {
            const resultadoColumna = [];
            for(let columna = indiceColumnaVacio; columna < indiceColumnaVacio*2+1; columna++) {
                const valorCelda = hyperFormulaInstance.getCellValue({ row: fila, col: columna, sheet: sheetId });
                if (valorCelda != null && valorCelda != undefined) {
                    resultadoColumna.push(valorCelda);
                }
            }
            if (resultadoColumna.length > 0) {
                resultadosFiltrados.push(resultadoColumna);
            }
        }

        resultados = {hojas: {
            [tractorSeleccionado]: resultadosFiltrados
            }
        };

        
        return {
            resultados,
        };
    } catch(error) {
        throw error
        // tractorSeleccionado: tractorSeleccionado || 'desconocida'
    }
}


function numeroAColumnaExcel(num) {
  let columna = '';
  while (num > 0) {
    let residuo = (num - 1) % 26;
    columna = String.fromCharCode(65 + residuo) + columna;
    num = Math.floor((num - 1) / 26);
  }
  return columna;
}



/**
 * @function traducirFormulaEstructurada
 * @param {string} formula - Fórmula estructurada a traducir.
 * @param {Array} encabezados - Encabezados de la hoja de Excel.
 * @param {number} filaActiva - Fila activa para la traducción.
 * @returns {string} Fórmula traducida a formato clásico de Excel.
 */

function nombreColumnaAIndice(filtro, encabezados) {
    // Buscar el primer match de [@NombreColumna]
    const match = filtro.match(/\[@([^\]]+)\]/);
    if (!match) {
        return { error: true, columnasNoEncontradas: ['No se encontró ninguna columna en el filtro'] };
    }
    const nombreColumna = match[1];
    const columna = encabezados.indexOf(nombreColumna);
    if (columna === -1) {
        console.log(`Columna no encontrada: ${nombreColumna}`);
        return { error: true, columnaNoEncontrada: [nombreColumna] };
    }
    return numeroAColumnaExcel(columna + 1); // +1 porque A=1, B=2, etc.
}


/**
 * Extrae la condición de una fórmula tipo =FILTER([@Columna]condición)
 * @param {string} filtro - Fórmula tipo =FILTER([@Columna]condición)
 * @returns {string|null} La condición (por ejemplo, '>1' o '="Muy rápido"'), o null si no se encuentra.
 */
function extraerCondicionFiltro(filtro) {
    // Busca la referencia estructurada y lo que sigue después de ella, hasta el paréntesis de cierre
    const match = filtro.match(/\[@[^\]]+\]([^)]+)/);
    if (!match) return null;
    return match[1].trim();
}



module.exports = {
  filtrarDatos,
} 