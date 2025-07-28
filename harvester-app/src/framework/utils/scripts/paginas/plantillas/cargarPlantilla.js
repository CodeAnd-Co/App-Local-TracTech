/*eslint-disable*/
const { consultarPlantilla } = require(`${rutaBase}src/backend/casosUso/plantillas/consultarPlantilla.js`);
// const { consultarPlantillas } = require(`${rutaBase}src/framework/utils/scripts/paginas/plantillas/consultarPlantillas.js`);
// const { configurarTexto } = require(`${rutaBase}src/framework/utils/scripts/paginas/analisis/agregarTexto.js`);
// const { agregarGrafica } = require(`${rutaBase}src/framework/utils/scripts/paginas/analisis/agregarGrafica.js`);
const { actualizarTexto, actualizarCaracteres, validarBotonAlinear } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/agregarTexto.js`);
const { modificarTipoGrafica, modificarColor, modificarTitulo } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/agregarGrafica.js`);
const { ElementoNuevo, Contenedores } = require(`${rutaBase}/src/backend/data/analisisModelos/elementoReporte.js`);
const { aplicarFormula } = require(`${rutaBase}/src/backend/casosUso/formulas/aplicarFormula.js`);
const { filtrarDatos } = require(`${rutaBase}/src/backend/casosUso/formulas/filtrarDatos.js`);
const { procesarDatosUniversal } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/graficas/procesarDatosUniversal.js`);
const Chart = require(`${rutaBase}/node_modules/chart.js/auto`);

// const { configurarTexto, configurarGrafica } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/botonesAgregar.js`);

function cargarPlantillaScript(){
    const nombrePlantilla = document.getElementById('selectorPlantilla');
    const botonCargarPlantilla = document.getElementById('botonCargarPlantilla');

    botonCargarPlantilla.addEventListener('click', async () => {
        try {
            const respuesta = await consultarPlantilla(nombrePlantilla.value);
            
            if (!respuesta.ok) {
                mostrarAlerta('Error', `Error al cargar la plantilla`, 'error');
                return;
            }
            
            const contenido = JSON.parse(respuesta.datos.contenido);
            const idContenedor = 'contenedorElementos';
            const idContenedorPrevisualizacion = 'contenedor-elementos-previsualizacion';
            
            // Cargar la plantilla y verificar si fue exitosa
            const cargaExitosa = await cargarPlantillaDesdeJSON(contenido, idContenedor, idContenedorPrevisualizacion);
            
            // Solo mostrar alerta de éxito si la carga fue exitosa
            if (cargaExitosa) {
                mostrarAlerta('Correcto', 'Plantilla cargada correctamente', 'success');
            }
            
        } catch (error) {
            console.error('Error en cargarPlantillaScript:', error);
            mostrarAlerta('Error', 'Error inesperado al cargar la plantilla', 'error');
        }
    });
}

async function cargarPlantillaDesdeJSON(json, contenedorId, idContenedorPrevisualizacion) {
    try {
        const componentes = json;
        
        // Obtener datos de Excel desde localStorage
        const datosExcel = JSON.parse(localStorage.getItem('datosFiltradosExcel') || '{}');
        
        // Verificar que existan datos de Excel cargados
        if (!datosExcel.hojas || Object.keys(datosExcel.hojas).length === 0) {
            mostrarAlerta('Error', 'No hay datos de Excel cargados. Carga un archivo Excel primero.', 'warning');
            return false; // Retornar false para indicar que la carga falló
        }

        // Verificar columnas requeridas antes de cargar la plantilla
        const verificacionResultado = verificarColumnasRequeridas(componentes, datosExcel);
        if (!verificacionResultado.valido) {
            // Formatear el mensaje igual que en aplicarFormula.js
            const columnasFaltantesTexto = verificacionResultado.columnasFaltantes
                .map(item => item.split(': ')[1]) // Extraer solo el nombre de la columna
                .filter((valor, indice, array) => array.indexOf(valor) === indice) // Eliminar duplicados
                .join(', ');
            const verificarFormulaOColumna = verificacionResultado.columnasFaltantes
                .map(item =>item.split(': ')[0])
                .filter((valor, indice, array) => array.indexOf(valor) === indice) // Eliminar duplicados
                .join(', ');
            
            if (verificarFormulaOColumna.includes('Fórmula no encontrada')) {
                mostrarAlerta(
                    `Fórmulas no encontradas: ${columnasFaltantesTexto}`, 
                    'Asegúrate de que existan las fórmulas de esta plantilla.', 
                    'error'
                );
                return false;
            }

            // Verificar si hay columnas no encontradas (de filtros)
            if (verificarFormulaOColumna.includes('Columna no encontrada')) {
                mostrarAlerta(
                    `Columna no encontrada: ${columnasFaltantesTexto}`, 
                    'Asegúrate de seleccionar todas las columnas necesarias para aplicar este filtro.', 
                    'error'
                );
                return false;
            }

            mostrarAlerta(
                `Columnas no encontradas: ${columnasFaltantesTexto}`, 
                'Asegúrate de haber seleccionado todas las columnas necesarias para aplicar las fórmulas de esta plantilla.', 
                'error'
            );
            return false; // Retornar false para indicar que la carga falló
        }

        const contenedor = document.querySelector(`#${contenedorId}`);
        const contenedorPrevisualizacion = document.querySelector(`#${idContenedorPrevisualizacion}`);
        
        // Limpiar el contenedor
        contenedor.innerHTML = '';
        contenedorPrevisualizacion.innerHTML = '';

        // Iterar sobre cada componente
        for (const componente of componentes) {
            if (componente.componente == "texto") {
                // Crear tarjeta de texto
                configurarTexto(contenedorId, idContenedorPrevisualizacion);
                
                const tarjetaTexto = contenedor.querySelector(`.tarjeta-texto:last-child`);
                const previsualizacionTexto = contenedorPrevisualizacion.querySelector(`.previsualizacion-texto.preview-titulo:last-child`);
                
                if (tarjetaTexto) {
                    // Configurar propiedades
                    const tipoTexto = tarjetaTexto.querySelector('.tipo-texto');
                    const areaEscritura = tarjetaTexto.querySelector('.area-escritura');
                    const iconoAlign = tarjetaTexto.querySelector('.icono-align');
                    const botonAlinear = tarjetaTexto.querySelector('.alinear');
                    
                    if (tipoTexto) { 
                        tipoTexto.value = componente.tipo;
                        previsualizacionTexto.classList.remove('preview-titulo', 'preview-subtitulo', 'preview-contenido');
                        previsualizacionTexto.classList.add(`preview-${componente.tipo}`);
                    };

                    if (areaEscritura) areaEscritura.value = componente.contenido;
                    
                    // Configurar alineamiento
                    if (iconoAlign) {
                        iconoAlign.classList.remove('align-left', 'align-center', 'align-right');
                        iconoAlign.classList.add(componente.alineamiento);
                        
                        // Mapear el alineamiento del JSON al índice correcto
                        const alineaciones = ['left', 'center', 'right'];
                        const alineamientoActual = componente.alineamiento.replace('align-', ''); // Quitar el prefijo "align-"
                        const indiceAlineamiento = alineaciones.indexOf(alineamientoActual);
                        
                        // Si se encuentra el alineamiento, usarlo; si no, usar left por defecto
                        previsualizacionTexto.alignIndex = indiceAlineamiento !== -1 ? indiceAlineamiento : 0;
                        
                        const alineado = alineaciones[previsualizacionTexto.alignIndex];
                        previsualizacionTexto.style.textAlign = alineado;
                        iconoAlign.className = `icono-align align-${alineado}`;
                    }
                    
                    // const vistaPrevia = tarjetaTexto.querySelector('.previsualizacion-texto.preview-titulo');
                    actualizarTexto(previsualizacionTexto, areaEscritura);
                    
                    // Actualizar el contador de caracteres después de cargar el contenido
                    if (areaEscritura) {
                        actualizarCaracteres(tarjetaTexto, areaEscritura);
                    }
                    
                    // Validar el botón alinear después de cargar el contenido
                    if (areaEscritura && botonAlinear) {
                        validarBotonAlinear(areaEscritura, botonAlinear);
                    }
                }

                
            } else if (componente.componente == "grafica") {
                // Crear tarjeta de gráfica
                configurarGrafica(contenedorId, idContenedorPrevisualizacion);
                
                const tarjetaGrafica = contenedor.querySelector(`.tarjeta-grafica:last-child`);
                
                if (tarjetaGrafica) {
                    // Configurar propiedades
                    const elementos = {
                        titulo: tarjetaGrafica.querySelector('.titulo-grafica'),
                        tipo: tarjetaGrafica.querySelector('.tipo-grafica'),
                        tractor: tarjetaGrafica.querySelector('.tractor-grafica'),
                        color: tarjetaGrafica.querySelector('#color-entrada')
                    };
                    
                    const previsualizacionGrafica = contenedorPrevisualizacion.querySelector(`.previsualizacion-grafica:last-child`);

                    empaquetador = {value: componente.tipo} //estos empaquetamientos sirven para que al usar las funciones piense que le estas pasando un componente de html, ya que dentro de la función solo usa el componente para sacarle el valor.
                    empaquetador2 = {value: componente.color}

                    if (elementos.titulo) elementos.titulo.value = componente.nombre;

                    if (elementos.tipo){
                        elementos.tipo.value = componente.tipo;
                        modificarTipoGrafica(previsualizacionGrafica, empaquetador, componente.nombre);
                    }

                    if (elementos.color) {
                        elementos.color.value = componente.color;
                        modificarColor(empaquetador2, previsualizacionGrafica, 0)
                    }
                    
                    // Actualizar el contador de caracteres del título de la gráfica
                    if (elementos.titulo) {
                        modificarTitulo(previsualizacionGrafica, elementos.titulo, tarjetaGrafica);
                    }

                    const tractorSeleccionado = componente.tractor;

                    tarjetaGrafica.dataset.filtroActual = componente.filtro || '';
                    tarjetaGrafica.dataset.parametroActual = componente.parametro || '';
                    tarjetaGrafica.dataset.formulaActual = componente.formula || '';
                    

                    if(componente.parametro && !componente.formula) {
                        // Aquí puedes agregar lógica para manejar parámetros sin fórmula si es necesario
                    }
                    
                    if (componente.formula){
                        let datosParaFormula;
    
                        // Determinar qué datos usar
                        if(componente.filtro){
                            const filtro = [JSON.parse(localStorage.getItem('formulasDisponibles')).filter(formula => formula.Nombre === componente.filtro)[0]];
                            const datosFiltrados = filtrarDatos(filtro, JSON.parse(localStorage.getItem('datosFiltradosExcel')), tractorSeleccionado);
                            datosParaFormula = datosFiltrados.resultados;
                        } else {
                            // Si no hay filtro, usar los datos originales de Excel
                            datosParaFormula = JSON.parse(localStorage.getItem('datosFiltradosExcel'));
                        }
                        
                        // Aplicar la fórmula con los datos correspondientes
                        for(const formula of JSON.parse(localStorage.getItem('formulasDisponibles'))){
                            if (formula.Nombre == componente.formula) {
                                const resultadoFormula = aplicarFormula(formula.Nombre, formula.Datos, tractorSeleccionado, datosParaFormula);
                                const canvas = previsualizacionGrafica.querySelector('canvas');

                                const contexto = canvas.getContext('2d');
                                const graficaExistente = Chart.getChart(contexto);

                                if (graficaExistente && resultadoFormula.resultados) {
                                    const resultados = resultadoFormula.resultados;
                                    const tipoGrafica = graficaExistente.config.type;

                                    // Usar el procesamiento universal
                                    const datosRebuild = procesarDatosUniversal(resultados, tipoGrafica, formula.Nombre);

                                    // Actualizar la gráfica
                                    graficaExistente.options.plugins.title.text = formula.Nombre;
                                    graficaExistente.data.labels = datosRebuild.labels;
                                    graficaExistente.data.datasets[0].data = datosRebuild.valores;

                                    // Actualizar también la etiqueta del dataset
                                    graficaExistente.data.datasets[0].label = formula.Nombre;

                                    graficaExistente.update();
                                }
                                break; 
                            }
                        }
                    }
                } 
            }
        }

        return true; 
        
    } catch (error) {
        console.error('Error al cargar la plantilla:', error);
        mostrarAlerta('Error', 'No se pudo cargar la plantilla correctamente', 'error');
        return false;
    }
}

/**
 * Verifica que todas las columnas requeridas por las fórmulas y filtros de la plantilla estén disponibles
 * @param {Array} componentes - Componentes de la plantilla
 * @param {Object} datosExcel - Datos de Excel disponibles
 * @returns {Object} Resultado de la verificación
 */
function verificarColumnasRequeridas(componentes, datosExcel) {
    const columnasFaltantes = [];
    const formulasDisponibles = JSON.parse(localStorage.getItem('formulasDisponibles') || '[]');
    
    // Obtener encabezados disponibles de todas las hojas
    const encabezadosDisponibles = new Set();
    
    // Verificar que datosExcel tenga la estructura correcta
    if (datosExcel && datosExcel.hojas) {
        Object.values(datosExcel.hojas).forEach(hoja => {
            if (Array.isArray(hoja) && hoja.length > 0) {
                // La primera fila contiene los encabezados
                if (Array.isArray(hoja[0])) {
                    hoja[0].forEach(encabezado => {
                        if (encabezado && typeof encabezado === 'string') {
                            encabezadosDisponibles.add(encabezado.trim());
                        }
                    });
                }
            }
        });
    }

    for (const componente of componentes) {
        if (componente.componente === "grafica") {
            // Verificar fórmula
            if (componente.formula) {
                const formula = formulasDisponibles.find(f => f.Nombre === componente.formula);
                if (formula) {
                    const columnasRequeridas = extraerColumnasDeFormula(formula.Datos);
                    
                    for (const columna of columnasRequeridas) {
                        if (!encabezadosDisponibles.has(columna)) {
                            columnasFaltantes.push(`${componente.formula}: ${columna}`);
                        }
                    }
                } else {
                    columnasFaltantes.push(`Fórmula no encontrada: ${componente.formula}`);
                }
            }

            // Verificar filtro
            if (componente.filtro) {
                const filtro = formulasDisponibles.find(f => f.Nombre === componente.filtro);
                if (filtro) {
                    const columnasRequeridas = extraerColumnasDeFormula(filtro.Datos);
                    
                    for (const columna of columnasRequeridas) {
                        if (!encabezadosDisponibles.has(columna)) {
                            columnasFaltantes.push(`Columna no encontrada: ${columna}`);
                        }
                    }
                } else {
                    columnasFaltantes.push(`Filtro no encontrado: ${componente.filtro}`);
                }
            }
        }
    }

    return {
        valido: columnasFaltantes.length === 0,
        columnasFaltantes
    };
}

/**
 * Extrae las columnas requeridas de una fórmula estructurada
 * @param {string} formulaEstructurada - Fórmula en formato estructurado
 * @returns {Array} Array de nombres de columnas requeridas
 */
function extraerColumnasDeFormula(formulaEstructurada) {
    const columnas = [];
    
    if (!formulaEstructurada || typeof formulaEstructurada !== 'string') {
        console.warn('Fórmula estructurada inválida:', formulaEstructurada);
        return columnas;
    }
    
    // Usar la misma expresión regular que en aplicarFormula.js
    const regex = /\[@([^\]]+)\]/g;
    let match;
    
    while ((match = regex.exec(formulaEstructurada)) !== null) {
        const nombreColumna = match[1].trim(); // Limpiar espacios
        if (!columnas.includes(nombreColumna)) {
            columnas.push(nombreColumna);
        }
    }
    
    return columnas;
}

cargarPlantillaScript();

