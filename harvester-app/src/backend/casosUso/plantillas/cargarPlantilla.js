/**
 * Módulo para cargar y aplicar configuraciones de plantillas
 * Recrea gráficas, fórmulas, filtros y configuración visual desde una plantilla
 */

const { mostrarAlerta } = require(`${rutaBase}/src/framework/vistas/includes/componentes/moleculas/alertaSwal/alertaSwal.js`);
const { agregarGrafica } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/agregarGrafica.js`);
const { agregarTexto } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/agregarTexto.js`);
const Chart = require('chart.js/auto');

/**
 * Carga una plantilla desde el servidor y la aplica al reporte actual
 * @param {string} idPlantilla - ID de la plantilla a cargar
 * @returns {Promise<Object>} - Resultado de la operación
 */
async function cargarYAplicarPlantilla(idPlantilla) {
    try {
        // Obtener la configuración de la plantilla desde el servidor
        const configuracionPlantilla = await obtenerPlantillaDelServidor(idPlantilla);
        
        if (!configuracionPlantilla.ok) {
            return {
                exito: false,
                error: configuracionPlantilla.error || 'Error al obtener la plantilla del servidor'
            };
        }

        // Limpiar el reporte actual
        limpiarReporteActual();

        // Aplicar la configuración de la plantilla
        const resultado = await aplicarConfiguracionPlantilla(configuracionPlantilla.plantilla);

        return resultado;

    } catch (error) {
        return {
            exito: false,
            error: 'Error inesperado al cargar la plantilla',
            detalles: error.message
        };
    }
}

/**
 * Obtiene la configuración de una plantilla desde el servidor
 * @param {string} idPlantilla - ID de la plantilla
 * @returns {Promise<Object>} - Configuración de la plantilla
 */
async function obtenerPlantillaDelServidor(idPlantilla) {
    try {
        // Usar la función de la API en lugar de hacer petición directa
        const { obtenerPlantillaPorId } = require('../../domain/plantillasAPI/plantillasAPI');
        
        const respuesta = await obtenerPlantillaPorId(idPlantilla);
        
        return respuesta;

    } catch (error) {
        return {
            ok: false,
            error: 'Error de conexión al obtener la plantilla',
            detalles: error.message
        };
    }
}

/**
 * Limpia el reporte actual eliminando todos los elementos
 */
function limpiarReporteActual() {
    // Limpiar contenedor de elementos
    const contenedorElementos = document.getElementById('contenedorElementos');
    if (contenedorElementos) {
        contenedorElementos.innerHTML = '';
    }

    // Limpiar contenedor de previsualización
    const contenedorPrevisualizacion = document.getElementById('contenedor-elementos-previsualizacion');
    if (contenedorPrevisualizacion) {
        contenedorPrevisualizacion.innerHTML = '';
    }

    // Limpiar cuadros de fórmulas si existen
    const cuadrosFormulas = document.querySelectorAll('.contenedor-formulas');
    cuadrosFormulas.forEach(cuadro => cuadro.remove());
}

/**
 * Aplica la configuración completa de una plantilla al reporte
 * @param {Object} configuracionPlantilla - Configuración de la plantilla
 * @returns {Promise<Object>} - Resultado de la aplicación
 */
async function aplicarConfiguracionPlantilla(configuracionPlantilla) {
    try {
        const { configuracion } = configuracionPlantilla;

        // Validar que hay datos necesarios
        if (!configuracion || !configuracion.elementos) {
            return {
                exito: false,
                error: 'La plantilla no contiene elementos válidos'
            };
        }

        // Aplicar tractores seleccionados
        if (configuracion.tractoresSeleccionados && configuracion.tractoresSeleccionados.length > 0) {
            localStorage.setItem('tractoresSeleccionados', JSON.stringify(configuracion.tractoresSeleccionados));
        }

        // Restaurar contexto global si existe
        if (configuracion.configuracionGlobal) {
            restaurarContextoGlobal(configuracion.configuracionGlobal);
        }

        // Validar que existen datos de Excel compatibles
        const datosExcel = localStorage.getItem('datosFiltradosExcel');
        if (!datosExcel) {
            mostrarAlerta(
                'Datos requeridos',
                'Para aplicar esta plantilla necesitas cargar primero los datos de Excel correspondientes.',
                'warning'
            );
            return {
                exito: false,
                error: 'No hay datos de Excel cargados'
            };
        }

        // Verificar compatibilidad de datos si hay información disponible
        if (configuracion.datosOriginales && configuracion.datosOriginales.hojas) {
            const validacionCompatibilidad = validarCompatibilidadDatos(configuracion.datosOriginales, datosExcel);
            if (!validacionCompatibilidad.esCompatible) {
                mostrarAlerta(
                    'Advertencia de Compatibilidad',
                    `Los datos actuales pueden no ser completamente compatibles con esta plantilla. ${validacionCompatibilidad.mensaje}`,
                    'warning'
                );
            }
        }

        // Aplicar elementos en orden
        const elementosOrdenados = configuracion.elementos.sort((a, b) => (a.posicion || 0) - (b.posicion || 0));
        const resultadosAplicacion = [];
        
        for (const elemento of elementosOrdenados) {
            try {
                await aplicarElemento(elemento);
                resultadosAplicacion.push({ elemento: elemento.tipo, exito: true });
                // Pequeña pausa para permitir que se procesen los elementos
                await new Promise(resolve => setTimeout(resolve, 150));
            } catch (error) {
                console.error(`Error aplicando elemento ${elemento.tipo}:`, error);
                resultadosAplicacion.push({ elemento: elemento.tipo, exito: false, error: error.message });
            }
        }

        // Mostrar información sobre fórmulas aplicadas si existe
        if (configuracion.formulasUtilizadas && configuracion.formulasUtilizadas.length > 0) {
            console.log(`Plantilla utiliza ${configuracion.formulasUtilizadas.length} fórmulas:`, configuracion.formulasUtilizadas);
        }

        const elementosExitosos = resultadosAplicacion.filter(r => r.exito).length;
        
        return {
            exito: true,
            mensaje: `Plantilla "${configuracionPlantilla.nombre}" aplicada exitosamente`,
            elementosAplicados: elementosExitosos,
            elementosTotal: elementosOrdenados.length,
            resultadosDetallados: resultadosAplicacion,
            formulasIncluidas: configuracion.formulasUtilizadas || []
        };

    } catch (error) {
        return {
            exito: false,
            error: 'Error al aplicar la configuración de la plantilla',
            detalles: error.message
        };
    }
}

/**
 * Aplica un elemento individual (gráfica o texto) de la plantilla
 * @param {Object} elemento - Configuración del elemento
 * @returns {Promise<void>}
 */
async function aplicarElemento(elemento) {
    try {
        if (elemento.tipo === 'grafica') {
            await aplicarElementoGrafica(elemento);
        } else if (elemento.tipo === 'texto') {
            await aplicarElementoTexto(elemento);
        }
    } catch (error) {
        console.error(`Error aplicando elemento ${elemento.tipo}:`, error);
        mostrarAlerta(
            'Error al aplicar elemento',
            `No se pudo aplicar el elemento ${elemento.tipo}: ${error.message}`,
            'warning'
        );
    }
}

/**
 * Aplica una gráfica de la plantilla
 * @param {Object} elementoGrafica - Configuración de la gráfica
 * @returns {Promise<void>}
 */
async function aplicarElementoGrafica(elementoGrafica) {
    // Crear nueva gráfica
    const contenedorId = 'contenedorElementos';
    const previsualizacionId = 'contenedor-elementos-previsualizacion';
    
    const tarjetaGrafica = agregarGrafica(contenedorId, previsualizacionId);
    
    if (!tarjetaGrafica) {
        throw new Error('No se pudo crear la tarjeta de gráfica');
    }

    // Aplicar configuración básica
    await aplicarConfiguracionBasicaGrafica(tarjetaGrafica, elementoGrafica);

    // Aplicar datos (columnas o fórmulas)
    if (elementoGrafica.datos) {
        await aplicarDatosGrafica(tarjetaGrafica.id, elementoGrafica.datos);
    }

    // Aplicar configuración avanzada si existe
    if (elementoGrafica.configuracionAvanzada) {
        await aplicarConfiguracionAvanzada(tarjetaGrafica.id, elementoGrafica);
    }

    // Aplicar parámetros de fórmula específicos si existen
    if (elementoGrafica.datos && elementoGrafica.datos.parametrosFormula) {
        await aplicarParametrosFormula(tarjetaGrafica.id, elementoGrafica.datos.parametrosFormula);
    }
}

/**
 * Aplica la configuración básica de una gráfica (título, color, tractor)
 * @param {HTMLElement} tarjetaGrafica - Elemento de la tarjeta de gráfica
 * @param {Object} configuracion - Configuración de la gráfica
 * @returns {Promise<void>}
 */
async function aplicarConfiguracionBasicaGrafica(tarjetaGrafica, configuracion) {
    // Aplicar título
    if (configuracion.titulo) {
        const inputTitulo = tarjetaGrafica.querySelector('.titulo-grafica');
        if (inputTitulo) {
            inputTitulo.value = configuracion.titulo;
        }
    }

    // Aplicar color
    if (configuracion.color) {
        const inputColor = tarjetaGrafica.querySelector('#color-entrada');
        if (inputColor) {
            inputColor.value = configuracion.color;
            // Disparar evento de cambio para actualizar la gráfica
            inputColor.dispatchEvent(new Event('change'));
        }
    }

    // Aplicar tractor seleccionado
    if (configuracion.tractorSeleccionado) {
        const selectTractor = tarjetaGrafica.querySelector('#tractor-grafica select');
        if (selectTractor) {
            selectTractor.value = configuracion.tractorSeleccionado;
            selectTractor.dispatchEvent(new Event('change'));
        }
    }

    // Cambiar tipo de gráfica si es necesario
    if (configuracion.tipoGrafica && configuracion.tipoGrafica !== 'line') {
        await cambiarTipoGrafica(tarjetaGrafica.id, configuracion.tipoGrafica);
    }
}

/**
 * Cambia el tipo de gráfica
 * @param {string} graficaId - ID de la gráfica
 * @param {string} nuevoTipo - Nuevo tipo de gráfica
 * @returns {Promise<void>}
 */
async function cambiarTipoGrafica(graficaId, nuevoTipo) {
    const graficaDiv = document.getElementById(`previsualizacion-grafica-${graficaId}`);
    if (!graficaDiv) return;

    const canvas = graficaDiv.querySelector('canvas');
    if (!canvas) return;

    const contexto = canvas.getContext('2d');
    const graficaExistente = Chart.getChart(contexto);
    
    if (graficaExistente && graficaExistente.config.type !== nuevoTipo) {
        const datosActuales = {
            labels: graficaExistente.data.labels,
            datasets: graficaExistente.data.datasets
        };
        
        graficaExistente.destroy();
        
        const { crearGrafica } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/graficas/crearGrafica.js`);
        const nuevaGrafica = crearGrafica(contexto, nuevoTipo);
        
        if (datosActuales.labels && datosActuales.labels.length > 0) {
            nuevaGrafica.data = datosActuales;
            nuevaGrafica.update();
        }
    }
}

/**
 * Aplica los datos (columna o fórmula) a una gráfica
 * @param {string} graficaId - ID de la gráfica
 * @param {Object} datosConfiguracion - Configuración de datos
 * @returns {Promise<void>}
 */
async function aplicarDatosGrafica(graficaId, datosConfiguracion) {
    if (datosConfiguracion.tipoOrigen === 'columna' && datosConfiguracion.columna) {
        await aplicarColumnaAGrafica(graficaId, datosConfiguracion.columna, datosConfiguracion.filtros);
    } else if (datosConfiguracion.tipoOrigen === 'formula' && datosConfiguracion.formula) {
        await aplicarFormulaAGrafica(graficaId, datosConfiguracion.formula, datosConfiguracion.filtros);
    }
}

/**
 * Aplica una columna de datos a una gráfica
 * @param {string} graficaId - ID de la gráfica
 * @param {Object} configuracionColumna - Configuración de la columna
 * @param {Array} filtros - Filtros aplicados
 * @returns {Promise<void>}
 */
async function aplicarColumnaAGrafica(graficaId, configuracionColumna, filtros = []) {
    try {
        const { actualizarGraficaConColumna } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/graficas/actualizarGraficaConColumna.js`);
        
        // Usar el mapa global de datos originales
        const datosOriginalesFormulas = window.datosOriginalesFormulas || new Map();
        
        actualizarGraficaConColumna(
            parseInt(graficaId),
            configuracionColumna.nombre,
            datosOriginalesFormulas,
            configuracionColumna.hoja
        );

        // Aplicar filtros si existen
        if (filtros && filtros.length > 0) {
            await aplicarFiltrosAGrafica(graficaId, filtros);
        }

    } catch (error) {
        console.error('Error aplicando columna a gráfica:', error);
        throw error;
    }
}

/**
 * Aplica una fórmula a una gráfica
 * @param {string} graficaId - ID de la gráfica
 * @param {Object} configuracionFormula - Configuración de la fórmula
 * @param {Array} filtros - Filtros aplicados
 * @returns {Promise<void>}
 */
async function aplicarFormulaAGrafica(graficaId, configuracionFormula, filtros = []) {
    try {
        // Buscar la fórmula en las fórmulas disponibles
        const formulasDisponibles = JSON.parse(localStorage.getItem('formulasDisponibles') || '[]');
        const formula = formulasDisponibles.find(f => f.nombre === configuracionFormula.nombre);
        
        if (!formula) {
            throw new Error(`No se encontró la fórmula: ${configuracionFormula.nombre}`);
        }

        // Aplicar la fórmula
        const { aplicarFormula } = require(`${rutaBase}/src/backend/casosUso/formulas/aplicarFormula.js`);
        const tractores = JSON.parse(localStorage.getItem('tractoresSeleccionados') || '[]');
        const datosExcel = JSON.parse(localStorage.getItem('datosFiltradosExcel'));
        
        const resultadoFormula = aplicarFormula(
            formula.nombre,
            formula.datos,
            tractores[0] || null,
            datosExcel
        );

        if (resultadoFormula.error) {
            throw new Error(resultadoFormula.error);
        }

        // Actualizar la gráfica con los resultados
        await actualizarGraficaConFormula(graficaId, resultadoFormula, configuracionFormula.nombre);

        // Aplicar filtros si existen
        if (filtros && filtros.length > 0) {
            await aplicarFiltrosAGrafica(graficaId, filtros);
        }

    } catch (error) {
        console.error('Error aplicando fórmula a gráfica:', error);
        throw error;
    }
}

/**
 * Actualiza una gráfica con los resultados de una fórmula
 * @param {string} graficaId - ID de la gráfica
 * @param {Object} resultadoFormula - Resultado de aplicar la fórmula
 * @param {string} nombreFormula - Nombre de la fórmula
 * @returns {Promise<void>}
 */
async function actualizarGraficaConFormula(graficaId, resultadoFormula, nombreFormula) {
    const graficaDiv = document.getElementById(`previsualizacion-grafica-${graficaId}`);
    if (!graficaDiv) return;

    const canvas = graficaDiv.querySelector('canvas');
    if (!canvas) return;

    const contexto = canvas.getContext('2d');
    const graficaExistente = Chart.getChart(contexto);
    if (!graficaExistente) return;

    const { procesarDatosUniversal } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/graficas/procesarDatosUniversal.js`);
    
    const tipoGrafica = graficaExistente.config.type;
    const datosRebuild = procesarDatosUniversal(resultadoFormula.resultados, tipoGrafica);

    // Actualizar la gráfica
    graficaExistente.options.plugins.title.text = nombreFormula;
    graficaExistente.data.labels = datosRebuild.labels;
    graficaExistente.data.datasets[0].data = datosRebuild.valores;
    graficaExistente.data.datasets[0].label = nombreFormula;

    graficaExistente.update();

    // Guardar datos originales
    const datosOriginalesFormulas = window.datosOriginalesFormulas || new Map();
    datosOriginalesFormulas.set(parseInt(graficaId), {
        datos: resultadoFormula.resultados,
        nombre: nombreFormula,
        tipo: 'formula'
    });
}

/**
 * Aplica filtros a una gráfica
 * @param {string} graficaId - ID de la gráfica
 * @param {Array} filtros - Array de filtros a aplicar
 * @returns {Promise<void>}
 */
async function aplicarFiltrosAGrafica(graficaId, filtros) {
    try {
        if (!filtros || filtros.length === 0) return;
        
        // Buscar el cuadro de fórmulas correspondiente a esta gráfica
        const cuadroFormulas = document.querySelector(`[data-grafica-id="${graficaId}"]`);
        
        if (cuadroFormulas) {
            // Aplicar cada filtro a los selectores correspondientes
            filtros.forEach((filtro, index) => {
                const selector = cuadroFormulas.querySelector(`.opcion-texto:nth-child(${index + 1})`);
                if (selector && filtro.columna) {
                    selector.value = filtro.columna;
                    // Disparar evento change para actualizar la gráfica
                    selector.dispatchEvent(new Event('change'));
                }
            });
        }
        
        console.log(`Filtros aplicados a gráfica ${graficaId}:`, filtros);
    } catch (error) {
        console.error('Error aplicando filtros:', error);
    }
}

/**
 * Aplica un elemento de texto de la plantilla
 * @param {Object} elementoTexto - Configuración del texto
 * @returns {Promise<void>}
 */
async function aplicarElementoTexto(elementoTexto) {
    // Crear nuevo elemento de texto
    const contenedorId = 'contenedorElementos';
    const previsualizacionId = 'contenedor-elementos-previsualizacion';
    
    const tarjetaTexto = agregarTexto(contenedorId, previsualizacionId);
    
    if (!tarjetaTexto) {
        throw new Error('No se pudo crear la tarjeta de texto');
    }

    // Aplicar contenido
    if (elementoTexto.contenido) {
        const areaTexto = tarjetaTexto.querySelector('.area-escritura');
        if (areaTexto) {
            areaTexto.value = elementoTexto.contenido;
            areaTexto.dispatchEvent(new Event('input'));
        }
    }

    // Aplicar tipo de texto
    if (elementoTexto.tipoTexto) {
        const selectTipo = tarjetaTexto.querySelector('.tipo-texto');
        if (selectTipo) {
            selectTipo.value = elementoTexto.tipoTexto;
            selectTipo.dispatchEvent(new Event('change'));
        }
    }

    // Aplicar alineación
    if (elementoTexto.alineacion && elementoTexto.alineacion !== 'left') {
        setTimeout(() => {
            const previsualizacionTexto = document.querySelector('.previsualizacion-texto:last-child');
            if (previsualizacionTexto) {
                previsualizacionTexto.style.textAlign = elementoTexto.alineacion;
            }
        }, 100);
    }
}

/**
 * Aplica configuración avanzada de filtros y parámetros a una gráfica
 * @param {string} graficaId - ID de la gráfica
 * @param {Object} datosAvanzados - Datos avanzados de la gráfica
 * @returns {Promise<void>}
 */
async function aplicarConfiguracionAvanzada(graficaId, datosAvanzados) {
    try {
        if (!datosAvanzados || !datosAvanzados.configuracionAvanzada) {
            return;
        }

        const config = datosAvanzados.configuracionAvanzada;

        // Aplicar configuración de color personalizado
        if (config.colorPersonalizado) {
            const tarjetaGrafica = document.getElementById(graficaId);
            if (tarjetaGrafica) {
                const inputColor = tarjetaGrafica.querySelector('#color-entrada');
                if (inputColor) {
                    inputColor.value = config.colorPersonalizado;
                    // Disparar evento de cambio para actualizar la gráfica
                    inputColor.dispatchEvent(new Event('change'));
                }
            }
        }

        // Aplicar configuración de tractor específico
        if (config.tractorEspecifico && config.tractorConfig) {
            const tarjetaGrafica = document.getElementById(graficaId);
            if (tarjetaGrafica) {
                const selectTractor = tarjetaGrafica.querySelector('#tractor-grafica select');
                if (selectTractor) {
                    selectTractor.value = config.tractorEspecifico;
                    selectTractor.dispatchEvent(new Event('change'));
                }
            }
        }

        // Restaurar configuración de Chart.js si existe
        if (config.chartConfig) {
            const graficaDiv = document.getElementById(`previsualizacion-grafica-${graficaId}`);
            if (graficaDiv) {
                const canvas = graficaDiv.querySelector('canvas');
                if (canvas) {
                    const contexto = canvas.getContext('2d');
                    const grafica = Chart.getChart(contexto);
                    if (grafica && config.chartConfig.tituloActual) {
                        grafica.options.plugins.title.text = config.chartConfig.tituloActual;
                        grafica.update();
                    }
                }
            }
        }

    } catch (error) {
        console.error('Error aplicando configuración avanzada:', error);
    }
}

/**
 * Aplica parámetros de fórmula específicos desde la plantilla
 * @param {string} graficaId - ID de la gráfica
 * @param {Array} parametrosFormula - Array de parámetros de fórmula
 * @returns {Promise<void>}
 */
async function aplicarParametrosFormula(graficaId, parametrosFormula) {
    try {
        if (!parametrosFormula || parametrosFormula.length === 0) {
            return;
        }

        // Esperar a que se cree el cuadro de fórmulas
        await new Promise(resolve => setTimeout(resolve, 500));

        const cuadroFormulas = document.querySelector(`[data-grafica-id="${graficaId}"]`);
        if (cuadroFormulas) {
            const selectoresParametros = cuadroFormulas.querySelectorAll('.opcion-texto');
            
            parametrosFormula.forEach((parametro, index) => {
                if (selectoresParametros[index] && parametro.columnaAsignada) {
                    selectoresParametros[index].value = parametro.columnaAsignada;
                    selectoresParametros[index].dispatchEvent(new Event('change'));
                }
            });
        }
    } catch (error) {
        console.error('Error aplicando parámetros de fórmula:', error);
    }
}

/**
 * Restaura el contexto global desde la plantilla
 * @param {Object} configuracionGlobal - Configuración global de la plantilla
 * @returns {void}
 */
function restaurarContextoGlobal(configuracionGlobal) {
    try {
        if (!configuracionGlobal) return;

        // Restaurar información de columnas disponibles en el contexto global
        if (configuracionGlobal.columnasDisponibles) {
            window.columnasDisponiblesPlantilla = configuracionGlobal.columnasDisponibles;
        }

        // Mostrar información sobre la plantilla cargada
        if (configuracionGlobal.numeroElementos) {
            console.log(`Plantilla cargada con ${configuracionGlobal.numeroElementos} elementos`);
        }

    } catch (error) {
        console.error('Error restaurando contexto global:', error);
    }
}

/**
 * Valida la compatibilidad entre los datos originales de la plantilla y los datos actuales
 * @param {Object} datosOriginalesPlantilla - Información de datos originales de la plantilla
 * @param {string} datosActualesString - String JSON de los datos actuales
 * @returns {Object} - Resultado de la validación de compatibilidad
 */
function validarCompatibilidadDatos(datosOriginalesPlantilla, datosActualesString) {
    const validacion = {
        esCompatible: true,
        mensaje: '',
        advertencias: [],
        incompatibilidades: []
    };

    try {
        const datosActuales = JSON.parse(datosActualesString);
        
        // Verificar estructura similar (hojas múltiples vs hoja única)
        const tieneHojasPlantilla = datosOriginalesPlantilla.tipoEstructura === 'multiple_hojas';
        const tieneHojasActuales = !!datosActuales.hojas;
        
        if (tieneHojasPlantilla !== tieneHojasActuales) {
            validacion.incompatibilidades.push('Estructura de datos diferente (hojas múltiples vs hoja única)');
        }

        // Verificar hojas específicas si existen en ambos
        if (tieneHojasPlantilla && tieneHojasActuales) {
            const hojasPlantilla = datosOriginalesPlantilla.hojas || [];
            const hojasActuales = Object.keys(datosActuales.hojas);
            
            hojasPlantilla.forEach(nombreHojaPlantilla => {
                if (!hojasActuales.includes(nombreHojaPlantilla)) {
                    validacion.advertencias.push(`Hoja "${nombreHojaPlantilla}" no encontrada en datos actuales`);
                }
            });
        }

        // Establecer resultado general
        if (validacion.incompatibilidades.length > 0) {
            validacion.esCompatible = false;
            validacion.mensaje = 'Se encontraron incompatibilidades importantes';
        } else if (validacion.advertencias.length > 0) {
            validacion.mensaje = 'Algunas diferencias menores detectadas';
        } else {
            validacion.mensaje = 'Datos compatibles';
        }

    } catch (error) {
        validacion.esCompatible = false;
        validacion.mensaje = 'Error al validar compatibilidad de datos';
        validacion.incompatibilidades.push(`Error de parsing: ${error.message}`);
    }

    return validacion;
}

// ===== FUNCIONES SISTEMA SIMPLIFICADO =====

/**
 * Carga una plantilla simplificada desde el servidor
 * @param {number} idPlantilla - ID de la plantilla simplificada
 * @returns {Promise<Object>} Resultado de la operación
 */
async function cargarPlantillaSimplificada(idPlantilla) {
    try {
        const { obtenerPlantillaSimplificada } = require('../../domain/plantillasAPI/plantillasAPI');
        
        const respuesta = await obtenerPlantillaSimplificada(idPlantilla);
        
        if (!respuesta.ok || !respuesta.exito) {
            return {
                exito: false,
                mensaje: respuesta.mensaje || 'Error al obtener la plantilla del servidor',
                error: respuesta.error
            };
        }

        return {
            exito: true,
            plantilla: respuesta.datos,
            estadisticas: respuesta.estadisticas,
            mensaje: 'Plantilla cargada exitosamente'
        };

    } catch (error) {
        return {
            exito: false,
            mensaje: `Error de conexión al cargar plantilla: ${error.message}`,
            error: error.message
        };
    }
}

/**
 * Aplica una plantilla simplificada al reporte actual
 * @param {Object} plantillaSimplificada - Plantilla en formato {idPlantilla, nombre, json}
 * @returns {Promise<Object>} Resultado de la aplicación
 */
async function aplicarPlantillaSimplificada(plantillaSimplificada) {
    try {
        // Validar estructura de la plantilla
        if (!plantillaSimplificada.json || !plantillaSimplificada.json.datos) {
            throw new Error('La plantilla no tiene una estructura válida');
        }

        // Limpiar el reporte actual
        limpiarReporteActual();

        // Convertir a formato compatible y aplicar
        const { convertirDeFormatoSimplificado } = require('./guardarPlantilla');
        const configuracionCompleja = convertirDeFormatoSimplificado(plantillaSimplificada);
        
        // Aplicar la configuración convertida
        const resultado = await aplicarConfiguracionPlantilla(configuracionCompleja);

        // Agregar información adicional del sistema simplificado
        if (resultado.exito) {
            resultado.sistemaSimplificado = true;
            resultado.plantillaOriginal = plantillaSimplificada;
        }

        return resultado;

    } catch (error) {
        return {
            exito: false,
            mensaje: `Error al aplicar plantilla simplificada: ${error.message}`,
            error: error.message
        };
    }
}

/**
 * Carga y aplica una plantilla simplificada en un solo paso
 * @param {number} idPlantilla - ID de la plantilla simplificada
 * @returns {Promise<Object>} Resultado de la operación completa
 */
async function cargarYAplicarPlantillaSimplificada(idPlantilla) {
    try {
        // Cargar la plantilla del servidor
        const resultadoCarga = await cargarPlantillaSimplificada(idPlantilla);
        
        if (!resultadoCarga.exito) {
            return resultadoCarga;
        }

        // Aplicar la plantilla cargada
        const resultadoAplicacion = await aplicarPlantillaSimplificada(resultadoCarga.plantilla);

        if (!resultadoAplicacion.exito) {
            return resultadoAplicacion;
        }

        return {
            exito: true,
            mensaje: `Plantilla "${resultadoCarga.plantilla.nombre}" aplicada exitosamente`,
            plantilla: resultadoCarga.plantilla,
            estadisticas: resultadoCarga.estadisticas,
            detallesAplicacion: resultadoAplicacion
        };

    } catch (error) {
        return {
            exito: false,
            mensaje: `Error al cargar y aplicar plantilla: ${error.message}`,
            error: error.message
        };
    }
}

/**
 * Obtiene todas las plantillas simplificadas disponibles
 * @returns {Promise<Object>} Lista de plantillas simplificadas
 */
async function obtenerListaPlantillasSimplificadas() {
    try {
        const { obtenerTodasPlantillasSimplificadas } = require('../../domain/plantillasAPI/plantillasAPI');
        
        const respuesta = await obtenerTodasPlantillasSimplificadas();
        
        if (!respuesta.ok || !respuesta.exito) {
            return {
                exito: false,
                mensaje: respuesta.mensaje || 'Error al obtener las plantillas',
                error: respuesta.error
            };
        }

        // Agregar información adicional para cada plantilla
        const plantillasConInfo = respuesta.datos.map(plantilla => ({
            ...plantilla,
            tipoSistema: 'simplificado',
            compatibilidad: 'moderna'
        }));

        return {
            exito: true,
            plantillas: plantillasConInfo,
            total: respuesta.total,
            estadisticasGenerales: respuesta.estadisticasGenerales,
            mensaje: `Se encontraron ${respuesta.total} plantillas`
        };

    } catch (error) {
        return {
            exito: false,
            mensaje: `Error de conexión: ${error.message}`,
            error: error.message
        };
    }
}

/**
 * Busca plantillas simplificadas por nombre
 * @param {string} termino - Término de búsqueda
 * @returns {Promise<Object>} Plantillas que coinciden con la búsqueda
 */
async function buscarPlantillasSimplificadas(termino) {
    try {
        if (!termino || termino.trim() === '') {
            return {
                exito: false,
                mensaje: 'Debe proporcionar un término de búsqueda'
            };
        }

        const { buscarPlantillasSimplificadas: buscarEnServidor } = require('../../domain/plantillasAPI/plantillasAPI');
        
        const respuesta = await buscarEnServidor(termino.trim());
        
        if (!respuesta.ok || !respuesta.exito) {
            return {
                exito: false,
                mensaje: respuesta.mensaje || 'Error en la búsqueda',
                error: respuesta.error
            };
        }

        return {
            exito: true,
            plantillas: respuesta.datos,
            total: respuesta.total,
            terminoBusqueda: respuesta.terminoBusqueda,
            mensaje: `Se encontraron ${respuesta.total} plantillas`
        };

    } catch (error) {
        return {
            exito: false,
            mensaje: `Error en la búsqueda: ${error.message}`,
            error: error.message
        };
    }
}

/**
 * Previsualiza una plantilla simplificada sin aplicarla
 * @param {number} idPlantilla - ID de la plantilla
 * @returns {Promise<Object>} Información de previsualización
 */
async function previsualizarPlantillaSimplificada(idPlantilla) {
    try {
        const resultadoCarga = await cargarPlantillaSimplificada(idPlantilla);
        
        if (!resultadoCarga.exito) {
            return resultadoCarga;
        }

        const plantilla = resultadoCarga.plantilla;
        const json = plantilla.json;

        // Analizar contenido de la plantilla
        const analisis = {
            nombre: plantilla.nombre,
            elementos: json.datos || [],
            totalElementos: (json.datos || []).length,
            tiposElementos: {},
            configuracion: json.configuracion || {},
            metadatos: json.metadatos || {},
            tractoresIncluidos: (json.configuracion?.tractoresSeleccionados || []).length,
            formulasIncluidas: (json.configuracion?.formulasUtilizadas || []).length
        };

        // Contar tipos de elementos
        (json.datos || []).forEach(elemento => {
            if (elemento.tipo) {
                analisis.tiposElementos[elemento.tipo] = 
                    (analisis.tiposElementos[elemento.tipo] || 0) + 1;
            }
        });

        return {
            exito: true,
            analisis,
            plantilla,
            mensaje: 'Previsualización generada exitosamente'
        };

    } catch (error) {
        return {
            exito: false,
            mensaje: `Error en la previsualización: ${error.message}`,
            error: error.message
        };
    }
}

module.exports = {
    // Sistema complejo (original)
    cargarYAplicarPlantilla,
    aplicarConfiguracionPlantilla,
    obtenerPlantillaDelServidor,
    
    // Sistema simplificado
    cargarPlantillaSimplificada,
    aplicarPlantillaSimplificada,
    cargarYAplicarPlantillaSimplificada,
    obtenerListaPlantillasSimplificadas,
    buscarPlantillasSimplificadas,
    previsualizarPlantillaSimplificada
};
