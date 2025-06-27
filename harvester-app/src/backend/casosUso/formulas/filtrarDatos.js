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

    console.log('Filtrando datos con filtro:', filtro);
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
        console.log('Encabezados:', encabezados);
        
        // Encontrar la primera columna vacía usando método seguro
        const indiceColumnaVacio = encontrarColumnaVacia(datos);
        console.log('Índice de columna vacía:', indiceColumnaVacio);

        // Pruebas filtros (BORRAR)

        
        
        const datosPrueba = {
            "velocidad" : [1,3,4,5,5,5,6,7,6,5,4,3,2,0],
            "gasolina" : [10,10,10,9,9,9,8,8,7,7,7,7,6,6]
        };
        
        const hfInstance = HyperFormula.buildEmpty({
            licenseKey: 'gpl-v3', // Usa tu clave de licencia si tienes una
            useArrayArithmetic: true, // Habilita la aritmética de matrices
        });

        const sheetName = hfInstance.addSheet('Sheet1');
        const sheetId = hfInstance.getSheetId(sheetName);

        datosPrueba.velocidad.forEach((valor, index) => {
            hfInstance.setCellContents({ sheet: sheetId, col: 0, row: index }, [[valor]]);
        });

        // Cargar "gasolina" en la columna B (columna 1)
        datosPrueba.gasolina.forEach((valor, index) => {
            hfInstance.setCellContents({ sheet: sheetId, col: 1, row: index }, [[valor]]);
        });


        console.log('Filtrando datos...')
        // var formula = `=ARRAYFORMULA(FILTER(A1:B14, ${parametro}1:${parametro}14 ${operador} ${valor}))`;
        const formula = '=FILTER(A1:B14, A1:A14=5)'
        // formula = '=ARRAYFORMULA(FILTER(A1:B5), {1,0,1,1,0})'
        console.log(formula)

        // Aplicar la fórmula
        hfInstance.setCellContents({ sheet: sheetId, col: 2, row: 0 }, '=FILTER(A1:A14, A1:A14>5)');
        hfInstance.setCellContents({ sheet: sheetId, col: 3, row: 0 }, '=FILTER(B1:B14, A1:A14>5)');
        // hfInstance2.setCellContents({ sheet: sheetId2, col: 4, row: 0 }, "Hola");

        // Obtener los resultados filtrados
        // const resultados = hfInstance2.getSheetValues(sheetId2).slice(2); // Ignorar las primeras dos filas (datos originales)
        const resultados = hfInstance.getSheetValues(sheetId)
        console.log('Resultados:', resultados);

        const resultadosFiltrados = hfInstance.getCellValue({ sheet: sheetId, col: 2, row: 0 });
        console.log('Resultados filtrados:', resultadosFiltrados);


        
        const hyperFormula = HyperFormula.buildFromArray(datos, opciones);

        for(let columna = 0; columna < indiceColumnaVacio; columna++) {

        }
        
        // // Asignar nombre a la columna de resultados
        // hyperFormula.setCellContents({ row: 0, col: indiceColumnaVacio, sheet: 0 }, nombreColumnaResultado);
        
        // // Aplicar la fórmula a cada fila de datos
        // const resultados = [];
        // for (let fila = 1; fila < datos.length; fila = fila + 1) {
        //     // Traducir fórmula estructurada a fórmula clásica para esta fila específica
        //     const formulaTraducida = traducirFormulaEstructurada(formulaEstructurada, encabezados, fila);
        //     // Si hay un error en la traducción y no se encontró alguna columna, mostrar alerta y lanzar error
        //     if (formulaTraducida.error) {
        //         const columnasFaltantes = formulaTraducida.columnasNoEncontradas.join(', ');
        //         const err = new Error(`Columna no encontrada: ${columnasFaltantes}`);
        //         err.tipo = 'columnaNoEncontrada';
        //         mostrarAlerta(`Columnas no encontradas: ${columnasFaltantes}`, 'Asegúrate de seleccionar todas las columnas necesarias para aplicar esta fórmula.', 'error');
        //         throw err;
        //     }
            
        //     // Aplicar la fórmula a esta fila
        //     hyperFormula.setCellContents({ row: fila, col: indiceColumnaVacio, sheet: 0 }, formulaTraducida);
        //     const result = hyperFormula.getCellValue({ row: fila, col: indiceColumnaVacio, sheet: 0 });
        //     resultados.push(result);
        // }
        
        // // Obtener los datos actualizados con la nueva columna para devolverlos
        // const datosActualizados = hyperFormula.getSheetValues(0);
  
        
        return {
            datosExcel
        };
    } catch (error) {
        console.error('Error al filtrar los datos:', error);
        return {
            error: error.message,
            tractorSeleccionado: tractorSeleccionado || 'desconocida'
        };
    }

}

module.exports = {
  filtrarDatos,
} 