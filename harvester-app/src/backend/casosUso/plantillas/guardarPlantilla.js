/**
 * Módulo para guardar la configuración de un reporte como plantilla
 * Captura información de gráficas, fórmulas, filtros y configuración visual
 */

/**
 * Captura la configuración completa del reporte actual para crear una plantilla
 * @param {string} nombrePlantilla - Nombre para la nueva plantilla
 * @param {string} descripcion - Descripción de la plantilla
 * @returns {Object} - Objeto con la configuración de la plantilla
 */
function capturarConfiguracionReporte(nombrePlantilla, descripcion = '') {
    try {
        const configuracion = {
            nombre: nombrePlantilla,
            descripcion: descripcion,
            fechaCreacion: new Date().toISOString(),
            version: '1.0',
            metadata: {
                tipoPlantilla: 'reporte_completo',
                aplicacion: 'TracTech Harvester',
                usuario: localStorage.getItem('usuario') || 'Usuario anónimo'
            },
            configuracion: {
                tractoresSeleccionados: [],
                elementos: [],
                datosOriginales: {},
                configuracionGlobal: {},
                filtrosGlobales: [],
                formulasUtilizadas: []
            }
        };

        // Capturar tractores seleccionados
        const tractoresSeleccionados = JSON.parse(localStorage.getItem('tractoresSeleccionados') || '[]');
        configuracion.configuracion.tractoresSeleccionados = tractoresSeleccionados;

        // Capturar información de datos cargados
        try {
            const datosFiltrados = localStorage.getItem('datosFiltradosExcel');
            if (datosFiltrados) {
                const datosParseados = JSON.parse(datosFiltrados);
                
                configuracion.configuracion.datosOriginales = {
                    tipoEstructura: datosParseados.hojas ? 'multiple_hojas' : 'hoja_unica',
                    hojas: datosParseados.hojas ? Object.keys(datosParseados.hojas) : ['hoja_default'],
                    numeroTotalHojas: datosParseados.hojas ? Object.keys(datosParseados.hojas).length : 1,
                    timestampCarga: new Date().toISOString()
                };
                
                // Capturar columnas disponibles de cada hoja
                if (datosParseados.hojas) {
                    configuracion.configuracion.configuracionGlobal.columnasDisponibles = {};
                    Object.keys(datosParseados.hojas).forEach(nombreHoja => {
                        const hoja = datosParseados.hojas[nombreHoja];
                        if (hoja && hoja.length > 0) {
                            configuracion.configuracion.configuracionGlobal.columnasDisponibles[nombreHoja] = hoja[0] || [];
                        }
                    });
                }
            }
        } catch (error) {
            console.warn('No se pudieron capturar datos originales:', error);
        }

        // Capturar elementos del reporte (gráficas y textos)
        const contenedorElementos = document.getElementById('contenedorElementos');
        const contenedorPrevisualizacion = document.getElementById('contenedor-elementos-previsualizacion');

        if (contenedorElementos) {
            configuracion.configuracion.elementos = capturarElementosReporte(contenedorElementos, contenedorPrevisualizacion);
            
            // Analizar fórmulas utilizadas
            const formulasUtilizadas = new Set();
            configuracion.configuracion.elementos.forEach(elemento => {
                if (elemento.tipo === 'grafica' && elemento.datos.tipoOrigen === 'formula' && elemento.datos.formula) {
                    formulasUtilizadas.add(elemento.datos.formula.nombre);
                }
            });
            configuracion.configuracion.formulasUtilizadas = Array.from(formulasUtilizadas);
        }

        // Capturar configuración global de la interfaz
        configuracion.configuracion.configuracionGlobal = {
            ...configuracion.configuracion.configuracionGlobal,
            numeroElementos: configuracion.configuracion.elementos.length,
            tiposElementos: configuracion.configuracion.elementos.map(el => el.tipo),
            layoutInfo: {
                contenedorPrincipal: contenedorElementos ? contenedorElementos.id : null,
                contenedorPrevisualizacion: contenedorPrevisualizacion ? contenedorPrevisualizacion.id : null
            }
        };

        return {
            exito: true,
            configuracion: configuracion
        };

    } catch (error) {
        return {
            exito: false,
            error: error.message,
            detalles: 'Error en capturarConfiguracionReporte: ' + error.stack
        };
    }
}

/**
 * Captura la información de todos los elementos del reporte
 * @param {HTMLElement} contenedorElementos - Contenedor de elementos de configuración
 * @param {HTMLElement} contenedorPrevisualizacion - Contenedor de vista previa
 * @returns {Array} - Array con la configuración de cada elemento
 */
function capturarElementosReporte(contenedorElementos, contenedorPrevisualizacion) {
    const elementos = [];

    if (!contenedorElementos) {
        console.warn('Contenedor de elementos no encontrado');
        return elementos;
    }

    console.log('Capturando elementos del contenedor:', contenedorElementos.id);
    console.log('Número de hijos en el contenedor:', contenedorElementos.children.length);

    // Recorrer todas las tarjetas de configuración
    const tarjetas = contenedorElementos.children;

    for (let i = 0; i < tarjetas.length; i++) {
        const tarjeta = tarjetas[i];
        
        console.log(`Tarjeta ${i}:`, {
            id: tarjeta.id,
            clases: Array.from(tarjeta.classList),
            tagName: tarjeta.tagName
        });
        
        if (tarjeta.classList.contains('tarjeta-grafica')) {
            console.log('Procesando tarjeta de gráfica:', tarjeta.id);
            const configuracionGrafica = capturarConfiguracionGrafica(tarjeta);
            console.log('Resultado captura gráfica:', configuracionGrafica);
            if (configuracionGrafica) {
                elementos.push(configuracionGrafica);
                console.log('Gráfica capturada exitosamente, elementos ahora:', elementos.length);
                console.log('DETALLE COMPLETO DEL OBJETO GRÁFICA:', JSON.stringify(configuracionGrafica, null, 2));
            } else {
                console.warn('No se pudo capturar configuración de gráfica - resultado null/undefined');
            }
        } else if (tarjeta.classList.contains('tarjeta-texto')) {
            console.log('Procesando tarjeta de texto:', tarjeta.id);
            const configuracionTexto = capturarConfiguracionTexto(tarjeta);
            console.log('Resultado captura texto:', configuracionTexto);
            if (configuracionTexto) {
                elementos.push(configuracionTexto);
                console.log('Texto capturado exitosamente, elementos ahora:', elementos.length);
                console.log('DETALLE COMPLETO DEL OBJETO TEXTO:', JSON.stringify(configuracionTexto, null, 2));
            } else {
                console.warn('No se pudo capturar configuración de texto - resultado null/undefined');
            }
        } else {
            console.warn('Tarjeta con clases no reconocidas:', Array.from(tarjeta.classList));
        }
    }

    console.log('Elementos capturados total:', elementos.length);
    console.log('ARRAY COMPLETO DE ELEMENTOS CAPTURADOS:', JSON.stringify(elementos, null, 2));
    return elementos;
}

/**
 * Captura la configuración específica de una gráfica
 * @param {HTMLElement} tarjetaGrafica - Elemento de la tarjeta de gráfica
 * @returns {Object|null} - Configuración de la gráfica o null si hay error
 */
function capturarConfiguracionGrafica(tarjetaGrafica) {
    try {
        console.log('Capturando configuración de gráfica:', tarjetaGrafica.id);
        
        const graficaId = tarjetaGrafica.id;
        const configuracion = {
            tipo: 'grafica',
            id: graficaId,
            titulo: '',
            tipoGrafica: 'line',
            color: '#A61930',
            tractorSeleccionado: '',
            datos: {
                columna: null,
                formula: null,
                filtros: []
            },
            posicion: obtenerPosicionElemento(tarjetaGrafica),
            configuracionAvanzada: {
                estadoGrafica: 'inicial',
                tieneDatos: false,
                ultimaActualizacion: null
            }
        };

        // Capturar título de la gráfica
        const inputTitulo = tarjetaGrafica.querySelector('.titulo-grafica');
        if (inputTitulo) {
            configuracion.titulo = inputTitulo.value || '';
        }

        // Capturar tractor seleccionado
        const selectTractor = tarjetaGrafica.querySelector('#tractor-grafica select');
        if (selectTractor) {
            configuracion.tractorSeleccionado = selectTractor.value || '';
            configuracion.configuracionAvanzada.tractorConfig = {
                valorSeleccionado: selectTractor.value,
                opcionesDisponibles: Array.from(selectTractor.options).map(opt => ({
                    value: opt.value,
                    text: opt.textContent
                }))
            };
        }

        // Capturar color seleccionado
        const inputColor = tarjetaGrafica.querySelector('#color-entrada');
        if (inputColor) {
            configuracion.color = inputColor.value || '#A61930';
        }

        // Capturar tipo de gráfica desde la vista previa
        const graficaPreview = document.getElementById(`previsualizacion-grafica-${graficaId}`);
        if (graficaPreview) {
            const canvas = graficaPreview.querySelector('canvas');
            if (canvas) {
                try {
                    const contexto = canvas.getContext('2d');
                    const grafica = Chart.getChart(contexto);
                    if (grafica) {
                        configuracion.tipoGrafica = grafica.config.type;
                        configuracion.configuracionAvanzada.estadoGrafica = 'activa';
                        configuracion.configuracionAvanzada.tieneDatos = grafica.data.datasets[0].data.length > 1 || grafica.data.datasets[0].data[0] !== 0;
                        
                        // Capturar configuración actual de la gráfica
                        configuracion.configuracionAvanzada.chartConfig = {
                            labels: grafica.data.labels || [],
                            datasetLabel: grafica.data.datasets[0].label || '',
                            dataLength: grafica.data.datasets[0].data.length,
                            tituloActual: grafica.options.plugins?.title?.text || ''
                        };
                    }
                } catch (chartError) {
                    console.warn('No se pudo acceder a la configuración de Chart.js:', chartError);
                }
            }
        }

        // Capturar datos aplicados (columnas o fórmulas) con información extendida
        configuracion.datos = capturarDatosGrafica(graficaId);

        // Capturar información de botones y controles
        const botonesControl = tarjetaGrafica.querySelectorAll('button');
        configuracion.configuracionAvanzada.controlesDisponibles = Array.from(botonesControl).map(btn => ({
            clase: btn.className,
            texto: btn.textContent.trim(),
            visible: btn.style.display !== 'none'
        }));

        // Capturar estado de los selectores
        const selectores = tarjetaGrafica.querySelectorAll('select');
        configuracion.configuracionAvanzada.estadoSelectores = Array.from(selectores).map(select => ({
            id: select.id,
            value: select.value,
            selectedIndex: select.selectedIndex,
            opcionesCount: select.options.length
        }));

        console.log('Configuración de gráfica capturada exitosamente:', configuracion.id);
        return configuracion;

    } catch (error) {
        console.error('Error capturando configuración de gráfica:', error);
        return {
            tipo: 'grafica',
            id: tarjetaGrafica?.id || 'unknown',
            error: error.message,
            configuracionParcial: true
        };
    }
}

/**
 * Captura los datos aplicados a una gráfica (columnas o fórmulas)
 * @param {string} graficaId - ID de la gráfica
 * @returns {Object} - Objeto con información de datos aplicados
 */
function capturarDatosGrafica(graficaId) {
    const datos = {
        columna: null,
        formula: null,
        filtros: [],
        tipoOrigen: null, // 'columna' o 'formula'
        parametrosFormula: [], // Parámetros específicos de fórmulas
        configuracionAvanzada: {} // Configuraciones adicionales
    };

    try {
        // Acceder al mapa global de datos originales si existe
        if (typeof datosOriginalesFormulas !== 'undefined' && datosOriginalesFormulas) {
            const datosOriginales = datosOriginalesFormulas.get(parseInt(graficaId));
            
            if (datosOriginales) {
                datos.tipoOrigen = datosOriginales.tipo;
                
                if (datosOriginales.tipo === 'columna') {
                    datos.columna = {
                        nombre: datosOriginales.nombre,
                        hoja: datosOriginales.hoja,
                        indiceColumna: null // Se puede agregar para mayor precisión
                    };
                    
                    // Capturar índice de columna si está disponible
                    datos.configuracionAvanzada.origenColumna = {
                        datosOriginales: datosOriginales.datos || null,
                        timestamp: new Date().toISOString()
                    };
                    
                } else if (datosOriginales.tipo === 'formula') {
                    datos.formula = {
                        nombre: datosOriginales.nombre,
                        estructuraFormula: datosOriginales.estructuraFormula || null,
                        resultados: datosOriginales.resultados || null
                    };
                    
                    // Capturar información adicional de la fórmula
                    datos.configuracionAvanzada.origenFormula = {
                        datosOriginales: datosOriginales.datos || null,
                        timestamp: new Date().toISOString()
                    };
                }
            }
        }

        // Capturar filtros aplicados desde los menús desplegables
        const cuadroFormulas = document.querySelector('.contenedor-formulas');
        if (cuadroFormulas && cuadroFormulas.dataset.graficaId === graficaId) {
            const selectoresParametros = cuadroFormulas.querySelectorAll('.opcion-texto');
            
            selectoresParametros.forEach((selector, index) => {
                const parametroLetra = String.fromCharCode(65 + index); // A, B, C, etc.
                
                if (selector.value && selector.value.trim() !== '') {
                    datos.filtros.push({
                        parametro: parametroLetra,
                        columna: selector.value,
                        indice: index,
                        etiquetaParametro: `Parámetro ${parametroLetra}`
                    });
                    
                    // También agregar a parámetros de fórmula si es aplicable
                    datos.parametrosFormula.push({
                        letra: parametroLetra,
                        columnaAsignada: selector.value,
                        posicion: index
                    });
                } else {
                    // Capturar parámetros vacíos para mantener la estructura
                    datos.parametrosFormula.push({
                        letra: parametroLetra,
                        columnaAsignada: null,
                        posicion: index
                    });
                }
            });
            
            // Capturar información del cuadro de fórmulas
            datos.configuracionAvanzada.cuadroFormulas = {
                formulaSeleccionada: cuadroFormulas.querySelector('.formula-seleccionada')?.textContent || null,
                numeroParametros: selectoresParametros.length,
                graficaAsociada: cuadroFormulas.dataset.graficaId
            };
        }

        // Capturar información adicional de la tarjeta de gráfica
        const tarjetaGrafica = document.getElementById(graficaId);
        if (tarjetaGrafica) {
            // Capturar configuración de color
            const inputColor = tarjetaGrafica.querySelector('#color-entrada');
            if (inputColor) {
                datos.configuracionAvanzada.colorPersonalizado = inputColor.value;
            }
            
            // Capturar tractor seleccionado específico
            const selectTractor = tarjetaGrafica.querySelector('#tractor-grafica select');
            if (selectTractor) {
                datos.configuracionAvanzada.tractorEspecifico = selectTractor.value;
            }
        }

        // Capturar datos del localStorage relacionados
        try {
            const tractoresSeleccionados = JSON.parse(localStorage.getItem('tractoresSeleccionados') || '[]');
            const datosFiltrados = localStorage.getItem('datosFiltradosExcel');
            
            datos.configuracionAvanzada.contexto = {
                tractoresDisponibles: tractoresSeleccionados,
                tieneDatosCargados: !!datosFiltrados,
                timestampCaptura: new Date().toISOString()
            };
        } catch (error) {
            console.warn('No se pudieron capturar datos del contexto:', error);
        }

    } catch (error) {
        console.error('Error capturando datos de gráfica:', error);
        datos.error = error.message;
    }

    return datos;
}

/**
 * Captura la configuración específica de un elemento de texto
 * @param {HTMLElement} tarjetaTexto - Elemento de la tarjeta de texto
 * @returns {Object|null} - Configuración del texto o null si hay error
 */
function capturarConfiguracionTexto(tarjetaTexto) {
    try {
        console.log('Capturando configuración de texto:', tarjetaTexto.id);
        
        const configuracion = {
            tipo: 'texto',
            id: tarjetaTexto.id || `texto-${Date.now()}`,
            contenido: '',
            tipoTexto: 'titulo',
            alineacion: 'left',
            posicion: obtenerPosicionElemento(tarjetaTexto)
        };

        // Capturar contenido del texto
        const areaTexto = tarjetaTexto.querySelector('.area-escritura');
        if (areaTexto) {
            configuracion.contenido = areaTexto.value || '';
        }

        // Capturar tipo de texto (título, subtítulo, contenido)
        const selectTipo = tarjetaTexto.querySelector('.tipo-texto');
        if (selectTipo) {
            configuracion.tipoTexto = selectTipo.value || 'titulo';
        }

        // Capturar alineación si está configurada
        const elementosPrevisualizacion = document.querySelectorAll('.previsualizacion-texto');
        elementosPrevisualizacion.forEach(elemento => {
            if (elemento.textContent.includes(configuracion.contenido)) {
                const alineacion = elemento.style.textAlign;
                if (alineacion) {
                    configuracion.alineacion = alineacion;
                }
            }
        });

        console.log('Configuración de texto capturada exitosamente:', configuracion.id);
        return configuracion;

    } catch (error) {
        console.error('Error capturando configuración de texto:', error);
        return null;
    }
}

/**
 * Obtiene la posición relativa de un elemento en su contenedor
 * @param {HTMLElement} elemento - Elemento del cual obtener la posición
 * @returns {number} - Índice de posición del elemento
 */
function obtenerPosicionElemento(elemento) {
    const padre = elemento.parentElement;
    if (!padre) return 0;

    const hermanos = Array.from(padre.children);
    return hermanos.indexOf(elemento);
}

/**
 * Guarda la configuración de plantilla en el servidor
 * @param {Object} configuracionPlantilla - Configuración completa de la plantilla
 * @returns {Promise<Object>} - Resultado de la operación de guardado
 */
async function guardarPlantillaEnServidor(configuracionPlantilla) {
    try {
        console.log('=== ENVIANDO PLANTILLA AL SERVIDOR ===');
        console.log('Configuración completa a enviar:', JSON.stringify(configuracionPlantilla, null, 2));
        console.log('Número de elementos en datos:', configuracionPlantilla.datos ? configuracionPlantilla.datos.length : 'datos undefined');
        
        // Usar la función de la API en lugar de hacer petición directa
        const { guardarPlantillaClasica } = require('../../domain/plantillasAPI/plantillasAPI');
        
        const respuesta = await guardarPlantillaClasica(configuracionPlantilla);
        
        console.log('=== RESPUESTA DEL SERVIDOR ===');
        console.log('Respuesta recibida:', respuesta);
        
        return respuesta;

    } catch (error) {
        return {
            ok: false,
            error: 'Error de conexión al guardar la plantilla',
            detalles: error.message
        };
    }
}

/**
 * Función principal para guardar una plantilla completa
 * @param {string} nombrePlantilla - Nombre de la plantilla
 * @param {string} descripcion - Descripción de la plantilla
 * @returns {Promise<Object>} - Resultado de la operación
 */
async function guardarPlantilla(nombrePlantilla, descripcion = '') {
    try {
        // Validar que hay elementos para guardar
        const contenedorElementos = document.getElementById('contenedorElementos');
        if (!contenedorElementos || contenedorElementos.children.length === 0) {
            return {
                exito: false,
                error: 'No hay elementos en el reporte para guardar como plantilla'
            };
        }

        // Capturar configuración del reporte
        const resultado = capturarConfiguracionReporte(nombrePlantilla, descripcion);
        
        if (!resultado.exito) {
            return resultado;
        }

        // Agregar información detallada de fórmulas
        const informacionFormulas = capturarInformacionFormulas();
        resultado.configuracion.informacionFormulas = informacionFormulas;

        // Validar la configuración antes de enviar
        const validacion = validarConfiguracionPlantilla(resultado.configuracion);
        resultado.configuracion.validacion = validacion;

        if (!validacion.esValida) {
            return {
                exito: false,
                error: 'La configuración de la plantilla contiene errores',
                errores: validacion.errores,
                advertencias: validacion.advertencias
            };
        }

        // Agregar metadatos adicionales
        resultado.configuracion.metadata = {
            ...resultado.configuracion.metadata,
            estadisticasValidacion: validacion.estadisticas,
            timestampValidacion: new Date().toISOString(),
            navegador: navigator.userAgent,
            urlActual: window.location.href
        };

        // Guardar en el servidor
        const respuestaServidor = await guardarPlantillaEnServidor(resultado.configuracion);

        if (respuestaServidor.ok) {
            return {
                exito: true,
                mensaje: 'Plantilla guardada exitosamente',
                id: respuestaServidor.id,
                estadisticas: validacion.estadisticas,
                advertencias: validacion.advertencias.length > 0 ? validacion.advertencias : undefined
            };
        } else {
            return {
                exito: false,
                error: respuestaServidor.error || 'Error al guardar la plantilla en el servidor',
                detalles: respuestaServidor.detalles
            };
        }

    } catch (error) {
        return {
            exito: false,
            error: 'Error inesperado al guardar la plantilla',
            detalles: error.message,
            stack: error.stack
        };
    }
}

/**
 * Captura información detallada de las fórmulas aplicadas en el reporte
 * @returns {Object} - Información completa de fórmulas utilizadas
 */
function capturarInformacionFormulas() {
    const informacionFormulas = {
        formulasEnUso: [],
        parametrosGlobales: {},
        mapeoColumnasFormulas: {},
        estadisticas: {
            totalFormulasAplicadas: 0,
            tiposFormulaUnicos: [],
            parametrosTotal: 0
        }
    };

    try {
        // Verificar si existe el mapa global de datos originales
        if (typeof datosOriginalesFormulas !== 'undefined' && datosOriginalesFormulas) {
            datosOriginalesFormulas.forEach((datosOriginales, graficaId) => {
                if (datosOriginales.tipo === 'formula') {
                    const formulaInfo = {
                        graficaId: graficaId,
                        nombreFormula: datosOriginales.nombre,
                        estructuraFormula: datosOriginales.estructuraFormula || null,
                        resultados: datosOriginales.resultados || null,
                        datos: datosOriginales.datos || null,
                        timestampAplicacion: datosOriginales.timestamp || new Date().toISOString()
                    };

                    // Capturar parámetros específicos de esta fórmula
                    const cuadroFormulas = document.querySelector(`[data-grafica-id="${graficaId}"]`);
                    if (cuadroFormulas) {
                        const selectoresParametros = cuadroFormulas.querySelectorAll('.opcion-texto');
                        formulaInfo.parametros = [];

                        selectoresParametros.forEach((selector, index) => {
                            const parametroLetra = String.fromCharCode(65 + index);
                            formulaInfo.parametros.push({
                                letra: parametroLetra,
                                columnaAsignada: selector.value || null,
                                posicion: index,
                                estaAsignado: !!(selector.value && selector.value.trim())
                            });
                        });
                    }

                    informacionFormulas.formulasEnUso.push(formulaInfo);
                    informacionFormulas.estadisticas.totalFormulasAplicadas++;
                    
                    if (!informacionFormulas.estadisticas.tiposFormulaUnicos.includes(datosOriginales.nombre)) {
                        informacionFormulas.estadisticas.tiposFormulaUnicos.push(datosOriginales.nombre);
                    }
                }
            });
        }

        // Capturar información global de columnas y parámetros
        const datosFiltrados = localStorage.getItem('datosFiltradosExcel');
        if (datosFiltrados) {
            try {
                const datosParseados = JSON.parse(datosFiltrados);
                if (datosParseados.hojas) {
                    Object.keys(datosParseados.hojas).forEach(nombreHoja => {
                        const hoja = datosParseados.hojas[nombreHoja];
                        if (hoja && hoja.length > 0) {
                            informacionFormulas.parametrosGlobales[nombreHoja] = hoja[0] || [];
                        }
                    });
                }
            } catch (error) {
                console.warn('Error parseando datos de Excel:', error);
            }
        }

        // Calcular estadísticas adicionales
        informacionFormulas.estadisticas.parametrosTotal = informacionFormulas.formulasEnUso.reduce((total, formula) => {
            return total + (formula.parametros ? formula.parametros.filter(p => p.estaAsignado).length : 0);
        }, 0);

        return informacionFormulas;

    } catch (error) {
        console.error('Error capturando información de fórmulas:', error);
        return {
            ...informacionFormulas,
            error: error.message
        };
    }
}

/**
 * Valida que la configuración de plantilla sea completa y válida
 * @param {Object} configuracion - Configuración de la plantilla a validar
 * @returns {Object} - Resultado de la validación
 */
function validarConfiguracionPlantilla(configuracion) {
    const validacion = {
        esValida: true,
        errores: [],
        advertencias: [],
        estadisticas: {
            elementosTotal: 0,
            graficasConDatos: 0,
            formulasAplicadas: 0,
            textosIncluidos: 0
        }
    };

    try {
        // Validar estructura básica
        if (!configuracion.nombre || configuracion.nombre.trim() === '') {
            validacion.errores.push('El nombre de la plantilla es requerido');
            validacion.esValida = false;
        }

        if (!configuracion.configuracion || !configuracion.configuracion.elementos) {
            validacion.errores.push('La configuración de elementos es requerida');
            validacion.esValida = false;
            return validacion;
        }

        // Validar elementos
        const elementos = configuracion.configuracion.elementos;
        validacion.estadisticas.elementosTotal = elementos.length;

        if (elementos.length === 0) {
            validacion.advertencias.push('La plantilla no contiene elementos');
        }

        elementos.forEach((elemento, index) => {
            if (elemento.tipo === 'grafica') {
                if (elemento.datos && (elemento.datos.tipoOrigen === 'formula' || elemento.datos.tipoOrigen === 'columna')) {
                    validacion.estadisticas.graficasConDatos++;
                    
                    if (elemento.datos.tipoOrigen === 'formula') {
                        validacion.estadisticas.formulasAplicadas++;
                    }
                } else {
                    validacion.advertencias.push(`Gráfica ${index + 1} no tiene datos configurados`);
                }
            } else if (elemento.tipo === 'texto') {
                validacion.estadisticas.textosIncluidos++;
                
                if (!elemento.contenido || elemento.contenido.trim() === '') {
                    validacion.advertencias.push(`Elemento de texto ${index + 1} está vacío`);
                }
            }
        });

        // Validar tractores seleccionados
        if (!configuracion.configuracion.tractoresSeleccionados || 
            configuracion.configuracion.tractoresSeleccionados.length === 0) {
            validacion.advertencias.push('No hay tractores seleccionados en la plantilla');
        }

    } catch (error) {
        validacion.errores.push(`Error durante la validación: ${error.message}`);
        validacion.esValida = false;
    }

    return validacion;
}

// ===== FUNCIONES SISTEMA SIMPLIFICADO =====

/**
 * Convierte la configuración actual a formato simplificado
 * @param {string} nombrePlantilla - Nombre para la plantilla
 * @returns {Object} Plantilla en formato simplificado {nombre, json}
 */
function convertirAFormatoSimplificado(nombrePlantilla) {
    try {
        const configuracionCompleta = capturarConfiguracionReporte(nombrePlantilla);
        
        console.log('=== CONFIGURACIÓN COMPLETA CAPTURADA ===');
        console.log('Resultado de capturarConfiguracionReporte:', configuracionCompleta);
        console.log('configuracionCompleta.exito:', configuracionCompleta.exito);
        console.log('configuracionCompleta.configuracion:', configuracionCompleta.configuracion);
        console.log('configuracionCompleta.configuracion.elementos:', configuracionCompleta.configuracion?.elementos);
        console.log('configuracionCompleta.configuracion.configuracion:', configuracionCompleta.configuracion?.configuracion);
        console.log('configuracionCompleta.configuracion.configuracion.elementos:', configuracionCompleta.configuracion?.configuracion?.elementos);
        console.log('Longitud de elementos (nivel 1):', configuracionCompleta.configuracion?.elementos ? configuracionCompleta.configuracion.elementos.length : 'undefined');
        console.log('Longitud de elementos (nivel 2):', configuracionCompleta.configuracion?.configuracion?.elementos ? configuracionCompleta.configuracion.configuracion.elementos.length : 'undefined');
        
        // Verificar si hay error en la captura
        if (!configuracionCompleta.exito) {
            throw new Error(`Error en capturarConfiguracionReporte: ${configuracionCompleta.error}`);
        }
        
        // Crear estructura simplificada
        const plantillaSimplificada = {
            nombre: nombrePlantilla,
            json: {
                datos: configuracionCompleta.configuracion.configuracion?.elementos || [],
                configuracion: {
                    titulo: nombrePlantilla,
                    descripcion: configuracionCompleta.configuracion?.descripcion || '',
                    tractoresSeleccionados: configuracionCompleta.configuracion.configuracion?.tractoresSeleccionados || [],
                    datosOriginales: configuracionCompleta.configuracion.configuracion?.datosOriginales || {},
                    filtrosGlobales: configuracionCompleta.configuracion.configuracion?.filtrosGlobales || [],
                    formulasUtilizadas: configuracionCompleta.configuracion.configuracion?.formulasUtilizadas || []
                },
                metadatos: {
                    version: '2.0',
                    sistemaSimplificado: true,
                    fechaCreacion: new Date().toISOString(),
                    aplicacion: 'TracTech Harvester',
                    usuario: localStorage.getItem('usuario') || 'Usuario anónimo'
                }
            }
        };

        console.log('=== ESTRUCTURA SIMPLIFICADA CREADA ===');
        console.log('Datos asignados a plantillaSimplificada.json.datos:', plantillaSimplificada.json.datos);
        console.log('Longitud de datos en la estructura final:', plantillaSimplificada.json.datos.length);
        console.log('Verificación: es un array?', Array.isArray(plantillaSimplificada.json.datos));
        console.log('PLANTILLA SIMPLIFICADA COMPLETA:', JSON.stringify(plantillaSimplificada, null, 2));

        return plantillaSimplificada;

    } catch (error) {
        console.error('Error al convertir a formato simplificado:', error);
        throw new Error(`No se pudo convertir la plantilla: ${error.message}`);
    }
}

/**
 * Guarda una plantilla usando el sistema simplificado
 * @param {string} nombrePlantilla - Nombre para la plantilla
 * @param {string} descripcion - Descripción opcional
 * @returns {Promise<Object>} Resultado del guardado
 */
async function guardarPlantillaSimplificada(nombrePlantilla, descripcion = '') {
    try {
        // Validar entrada
        if (!nombrePlantilla || nombrePlantilla.trim() === '') {
            throw new Error('El nombre de la plantilla es requerido');
        }

        // Convertir configuración actual a formato simplificado
        const plantillaSimplificada = convertirAFormatoSimplificado(nombrePlantilla.trim());
        
        // Agregar descripción si se proporciona
        if (descripcion) {
            plantillaSimplificada.json.configuracion.descripcion = descripcion;
        }

        // Validar estructura antes de guardar
        const { validarEstructuraPlantilla } = require('../../domain/plantillasAPI/plantillasAPI');
        const validacion = await validarEstructuraPlantilla(plantillaSimplificada.json);

        if (!validacion.ok || !validacion.datos.valida) {
            console.warn('Advertencias en la validación:', validacion.datos?.advertencias);
            if (validacion.datos?.errores?.length > 0) {
                throw new Error(`Estructura inválida: ${validacion.datos.errores.join(', ')}`);
            }
        }

        // Guardar en el servidor
        const { guardarPlantillaSimplificada: guardarEnServidor } = require('../../domain/plantillasAPI/plantillasAPI');
        const resultado = await guardarEnServidor(plantillaSimplificada);

        if (!resultado.ok || !resultado.exito) {
            throw new Error(resultado.mensaje || 'Error al guardar en el servidor');
        }

        return {
            exito: true,
            mensaje: 'Plantilla guardada exitosamente en formato simplificado',
            idPlantilla: resultado.datos.idPlantilla,
            estadisticas: resultado.datos.estadisticas,
            validacion: validacion.datos
        };

    } catch (error) {
        console.error('Error al guardar plantilla simplificada:', error);
        return {
            exito: false,
            mensaje: `Error al guardar la plantilla: ${error.message}`,
            error: error.message
        };
    }
}

/**
 * Convierte una plantilla simplificada de vuelta al formato complejo para compatibilidad
 * @param {Object} plantillaSimplificada - Plantilla en formato {idPlantilla, nombre, json}
 * @returns {Object} Plantilla en formato complejo
 */
function convertirDeFormatoSimplificado(plantillaSimplificada) {
    try {
        const configuracionCompleja = {
            nombre: plantillaSimplificada.nombre,
            descripcion: plantillaSimplificada.json.configuracion?.descripcion || '',
            fechaCreacion: plantillaSimplificada.json.metadatos?.fechaCreacion || new Date().toISOString(),
            version: plantillaSimplificada.json.metadatos?.version || '2.0',
            metadata: {
                tipoPlantilla: 'reporte_simplificado',
                sistemaOrigen: 'simplificado',
                aplicacion: plantillaSimplificada.json.metadatos?.aplicacion || 'TracTech Harvester',
                usuario: plantillaSimplificada.json.metadatos?.usuario || 'Usuario desconocido'
            },
            configuracion: {
                tractoresSeleccionados: plantillaSimplificada.json.configuracion?.tractoresSeleccionados || [],
                elementos: plantillaSimplificada.json.datos || [],
                datosOriginales: plantillaSimplificada.json.configuracion?.datosOriginales || {},
                configuracionGlobal: {},
                filtrosGlobales: plantillaSimplificada.json.configuracion?.filtrosGlobales || [],
                formulasUtilizadas: plantillaSimplificada.json.configuracion?.formulasUtilizadas || []
            }
        };

        return configuracionCompleja;

    } catch (error) {
        console.error('Error al convertir de formato simplificado:', error);
        throw new Error(`No se pudo convertir la plantilla: ${error.message}`);
    }
}

/**
 * Obtiene estadísticas de la plantilla actual antes de guardar
 * @returns {Object} Estadísticas de la configuración actual
 */
function obtenerEstadisticasPlantillaActual() {
    try {
        // Capturar configuración actual
        const configuracionTemp = capturarConfiguracionReporte('temp');
        
        const estadisticas = {
            totalElementos: configuracionTemp.configuracion.elementos.length,
            tiposElementos: {},
            tractoresSeleccionados: configuracionTemp.configuracion.tractoresSeleccionados.length,
            formulasUtilizadas: configuracionTemp.configuracion.formulasUtilizadas.length,
            filtrosAplicados: configuracionTemp.configuracion.filtrosGlobales.length,
            tieneDatosOriginales: Object.keys(configuracionTemp.configuracion.datosOriginales).length > 0
        };

        // Contar tipos de elementos
        configuracionTemp.configuracion.elementos.forEach(elemento => {
            if (elemento.tipo) {
                estadisticas.tiposElementos[elemento.tipo] = 
                    (estadisticas.tiposElementos[elemento.tipo] || 0) + 1;
            }
        });

        return estadisticas;

    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        return {
            totalElementos: 0,
            tiposElementos: {},
            tractoresSeleccionados: 0,
            formulasUtilizadas: 0,
            filtrosAplicados: 0,
            tieneDatosOriginales: false,
            error: error.message
        };
    }
}

module.exports = {
    // Sistema complejo (original)
    guardarPlantilla,
    capturarConfiguracionReporte,
    guardarPlantillaEnServidor,
    capturarInformacionFormulas,
    validarConfiguracionPlantilla,
    capturarDatosGrafica,
    capturarConfiguracionGrafica,
    
    // Sistema simplificado
    convertirAFormatoSimplificado,
    guardarPlantillaSimplificada,
    convertirDeFormatoSimplificado,
    obtenerEstadisticasPlantillaActual
};
