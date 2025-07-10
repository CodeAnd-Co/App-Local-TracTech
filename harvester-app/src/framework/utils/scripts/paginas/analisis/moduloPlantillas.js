/**
 * Módulo para manejar las plantillas de reportes en la interfaz de análisis
 * Permite guardar la configuración actual y cargar plantillas existentes
 * Soporta tanto el sistema clásico como el simplificado de plantillas
 */

const { guardarPlantilla, guardarPlantillaSimplificada } = require(`${rutaBase}/src/backend/casosUso/plantillas/guardarPlantilla.js`);
const { cargarYAplicarPlantilla, cargarYAplicarPlantillaSimplificada, obtenerListaPlantillasSimplificadas, buscarPlantillasSimplificadas } = require(`${rutaBase}/src/backend/casosUso/plantillas/cargarPlantilla.js`);
const { plantillas } = require(`${rutaBase}/src/backend/domain/plantillasAPI/plantillasAPI.js`);
const { mostrarAlerta } = require(`${rutaBase}/src/framework/vistas/includes/componentes/moleculas/alertaSwal/alertaSwal.js`);

/**
 * Inicializa los event listeners para los botones de plantillas
 */
function inicializarModuloPlantillas() {
    const botonGuardar = document.getElementById('guardarPlantilla');
    const botonCargar = document.getElementById('cargarPlantilla');

    if (botonGuardar) {
        botonGuardar.addEventListener('click', manejarGuardarPlantilla);
    }

    if (botonCargar) {
        botonCargar.addEventListener('click', manejarCargarPlantilla);
    }
}

/**
 * Maneja el evento de guardar plantilla
 */
async function manejarGuardarPlantilla() {
    try {
        // Verificar que hay elementos para guardar
        const contenedorElementos = document.getElementById('contenedorElementos');
        if (!contenedorElementos || contenedorElementos.children.length === 0) {
            mostrarAlerta(
                'Sin elementos',
                'No hay elementos en el reporte para guardar como plantilla. Agrega al menos una gráfica o texto.',
                'warning'
            );
            return;
        }

        // Solicitar nombre y descripción de la plantilla
        const { value: datosPlantilla } = await Swal.fire({
            title: 'Guardar plantilla',
            html: `
                <div style="text-align: left; margin-bottom: 15px;">
                    <label for="nombrePlantilla" style="display: block; margin-bottom: 5px; font-weight: bold;">Nombre de la plantilla:</label>
                    <input type="text" id="nombrePlantilla" class="swal2-input" placeholder="Ejemplo: Reporte de rendimiento mensual" style="margin: 0; width: 100%;">
                </div>
                <div style="text-align: left;">
                    <label for="descripcionPlantilla" style="display: block; margin-bottom: 5px; font-weight: bold;">Descripción (opcional):</label>
                    <textarea id="descripcionPlantilla" class="swal2-textarea" placeholder="Describe qué tipo de reporte genera esta plantilla..." style="margin: 0; width: 100%; height: 80px; resize: vertical;"></textarea>
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Guardar plantilla',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#a61930',
            preConfirm: () => {
                const nombre = document.getElementById('nombrePlantilla').value.trim();
                const descripcion = document.getElementById('descripcionPlantilla').value.trim();
                
                if (!nombre) {
                    Swal.showValidationMessage('El nombre de la plantilla es obligatorio');
                    return false;
                }
                
                if (nombre.length < 3) {
                    Swal.showValidationMessage('El nombre debe tener al menos 3 caracteres');
                    return false;
                }
                
                return { nombre, descripcion };
            }
        });

        if (!datosPlantilla) return; // Usuario canceló

        // Mostrar indicador de carga
        mostrarAlerta(
            'Guardando plantilla',
            'Por favor espera mientras se guarda la configuración...',
            'info'
        );

        // Guardar la plantilla
        const resultado = await guardarPlantilla(datosPlantilla.nombre, datosPlantilla.descripcion);

        if (resultado.exito) {
            mostrarAlerta(
                'Plantilla guardada',
                `La plantilla "${datosPlantilla.nombre}" se guardó exitosamente y está disponible para usar en futuros reportes.`,
                'success'
            );
        } else {
            mostrarAlerta(
                'Error al guardar',
                resultado.error || 'No se pudo guardar la plantilla. Inténtalo de nuevo.',
                'error'
            );
        }

    } catch (error) {
        console.error('Error al guardar plantilla:', error);
        mostrarAlerta(
            'Error inesperado',
            'Ocurrió un error inesperado al guardar la plantilla. Por favor, inténtalo de nuevo.',
            'error'
        );
    }
}

/**
 * Maneja el evento de cargar plantilla
 */
async function manejarCargarPlantilla() {
    try {
        // Obtener lista de plantillas disponibles
        const plantillasDisponibles = await obtenerPlantillasDisponibles();
        
        if (!plantillasDisponibles || plantillasDisponibles.length === 0) {
            mostrarAlerta(
                'Sin plantillas',
                'No hay plantillas guardadas disponibles. Crea una plantilla primero guardando la configuración actual.',
                'info'
            );
            return;
        }

        // Mostrar selector de plantillas
        const opcionesPlantillas = plantillasDisponibles.map(plantilla => ({
            value: plantilla.id,
            text: `${plantilla.nombre}${plantilla.descripcion ? ' - ' + plantilla.descripcion : ''}`
        }));

        const { value: idPlantillaSeleccionada } = await Swal.fire({
            title: 'Cargar plantilla',
            html: `
                <div style="text-align: left; margin-bottom: 15px;">
                    <label for="selectorPlantilla" style="display: block; margin-bottom: 10px; font-weight: bold;">
                        Selecciona la plantilla a cargar:
                    </label>
                    <select id="selectorPlantilla" class="swal2-input" style="margin: 0; width: 100%;">
                        <option value="">-- Selecciona una plantilla --</option>
                        ${opcionesPlantillas.map(opcion => 
                            `<option value="${opcion.value}">${opcion.text}</option>`
                        ).join('')}
                    </select>
                </div>
                <div style="background: #f8f9fa; padding: 10px; border-radius: 5px; font-size: 14px; color: #6c757d;">
                    <strong>Nota:</strong> Al cargar una plantilla se reemplazará todo el contenido actual del reporte.
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Cargar plantilla',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#a61930',
            preConfirm: () => {
                const idSeleccionado = document.getElementById('selectorPlantilla').value;
                
                if (!idSeleccionado) {
                    Swal.showValidationMessage('Debes seleccionar una plantilla');
                    return false;
                }
                
                return idSeleccionado;
            }
        });

        if (!idPlantillaSeleccionada) return; // Usuario canceló

        // Confirmar acción destructiva
        const confirmacion = await Swal.fire({
            title: '¿Estás seguro?',
            text: 'Se reemplazará todo el contenido actual del reporte con la plantilla seleccionada.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#a61930',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, cargar plantilla',
            cancelButtonText: 'Cancelar'
        });

        if (!confirmacion.isConfirmed) return;

        // Mostrar indicador de carga
        mostrarAlerta(
            'Cargando plantilla',
            'Por favor espera mientras se aplica la configuración...',
            'info'
        );

        // Cargar y aplicar la plantilla
        const resultado = await cargarYAplicarPlantilla(idPlantillaSeleccionada);

        if (resultado.exito) {
            mostrarAlerta(
                'Plantilla cargada',
                resultado.mensaje || 'La plantilla se aplicó exitosamente al reporte.',
                'success'
            );
        } else {
            mostrarAlerta(
                'Error al cargar',
                resultado.error || 'No se pudo cargar la plantilla. Verifica que los datos de Excel sean compatibles.',
                'error'
            );
        }

    } catch (error) {
        console.error('Error al cargar plantilla:', error);
        mostrarAlerta(
            'Error inesperado',
            'Ocurrió un error inesperado al cargar la plantilla. Por favor, inténtalo de nuevo.',
            'error'
        );
    }
}

/**
 * Obtiene la lista de plantillas disponibles del servidor
 * @returns {Promise<Array>} Lista de plantillas disponibles
 */
async function obtenerPlantillasDisponibles() {
    try {
        const respuesta = await plantillas();
        
        if (respuesta.ok && respuesta.plantillas) {
            return respuesta.plantillas;
        }
        
        return [];
    } catch (error) {
        console.error('Error obteniendo plantillas:', error);
        return [];
    }
}

// ===== FUNCIONES SISTEMA SIMPLIFICADO =====

/**
 * Inicializa el módulo con soporte para sistema simplificado
 */
function inicializarModuloPlantillasExtendido() {
    // Inicializar módulo básico
    inicializarModuloPlantillas();
    
    // Agregar botones adicionales si existen
    const botonGuardarSimplificada = document.getElementById('guardarPlantillaSimplificada');
    const botonCargarSimplificada = document.getElementById('cargarPlantillaSimplificada');
    const botonBuscarPlantillas = document.getElementById('buscarPlantillas');

    if (botonGuardarSimplificada) {
        botonGuardarSimplificada.addEventListener('click', manejarGuardarPlantillaSimplificada);
    }

    if (botonCargarSimplificada) {
        botonCargarSimplificada.addEventListener('click', manejarCargarPlantillaSimplificada);
    }

    if (botonBuscarPlantillas) {
        botonBuscarPlantillas.addEventListener('click', manejarBuscarPlantillas);
    }
}

/**
 * Maneja el guardado de plantillas usando el sistema simplificado
 */
async function manejarGuardarPlantillaSimplificada() {
    try {
        // Verificar que hay elementos para guardar
        const contenedorElementos = document.getElementById('contenedorElementos');
        if (!contenedorElementos || contenedorElementos.children.length === 0) {
            mostrarAlerta(
                'Sin elementos',
                'No hay elementos en el reporte para guardar como plantilla. Agrega al menos una gráfica o texto.',
                'warning'
            );
            return;
        }

        // Solicitar nombre y descripción de la plantilla
        const { value: datosPlantilla } = await Swal.fire({
            title: 'Guardar plantilla (Sistema Simplificado)',
            html: `
                <div style="text-align: left; margin-bottom: 15px;">
                    <label for="nombrePlantilla" style="display: block; margin-bottom: 5px; font-weight: bold;">Nombre de la plantilla:</label>
                    <input type="text" id="nombrePlantilla" class="swal2-input" placeholder="Ejemplo: Dashboard de eficiencia" style="margin: 0; width: 100%;">
                </div>
                <div style="text-align: left;">
                    <label for="descripcionPlantilla" style="display: block; margin-bottom: 5px; font-weight: bold;">Descripción (opcional):</label>
                    <textarea id="descripcionPlantilla" class="swal2-textarea" placeholder="Descripción de la plantilla y su uso" style="margin: 0; width: 100%; min-height: 80px;"></textarea>
                </div>
                <div style="margin-top: 15px; padding: 10px; background-color: #e8f4fd; border-radius: 5px; font-size: 12px;">
                    <strong>💡 Sistema Simplificado:</strong> Esta plantilla se guardará en el nuevo formato optimizado, más fácil de gestionar y con mejor rendimiento.
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Guardar plantilla',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#3085d6',
            preConfirm: () => {
                const nombre = document.getElementById('nombrePlantilla').value.trim();
                const descripcion = document.getElementById('descripcionPlantilla').value.trim();
                
                if (!nombre) {
                    Swal.showValidationMessage('El nombre es requerido');
                    return false;
                }
                
                return { nombre, descripcion };
            }
        });

        if (!datosPlantilla) return;

        // Mostrar indicador de carga
        Swal.fire({
            title: 'Guardando plantilla...',
            text: 'Por favor espera mientras se procesa la configuración',
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Guardar la plantilla usando el sistema simplificado
        const resultado = await guardarPlantillaSimplificada(datosPlantilla.nombre, datosPlantilla.descripcion);

        if (resultado.exito) {
            await Swal.fire({
                title: '¡Plantilla guardada!',
                html: `
                    <p>La plantilla "<strong>${datosPlantilla.nombre}</strong>" se guardó exitosamente.</p>
                    <div style="margin-top: 15px; padding: 10px; background-color: #d4edda; border-radius: 5px; font-size: 12px;">
                        <strong>ID:</strong> ${resultado.idPlantilla}<br>
                        <strong>Elementos:</strong> ${resultado.estadisticas?.elementosEnDatos || 'N/A'}<br>
                        <strong>Sistema:</strong> Simplificado v2.0
                    </div>
                `,
                icon: 'success',
                confirmButtonText: 'Entendido'
            });
        } else {
            await Swal.fire({
                title: 'Error al guardar',
                text: resultado.mensaje || 'Ocurrió un error inesperado',
                icon: 'error',
                confirmButtonText: 'Entendido'
            });
        }

    } catch (error) {
        console.error('Error al guardar plantilla simplificada:', error);
        await Swal.fire({
            title: 'Error inesperado',
            text: `Error interno: ${error.message}`,
            icon: 'error',
            confirmButtonText: 'Entendido'
        });
    }
}

/**
 * Maneja la carga de plantillas usando el sistema simplificado
 */
async function manejarCargarPlantillaSimplificada() {
    try {
        // Obtener lista de plantillas simplificadas
        const resultadoPlantillas = await obtenerListaPlantillasSimplificadas();
        
        if (!resultadoPlantillas.exito || !resultadoPlantillas.plantillas) {
            mostrarAlerta(
                'Error al cargar plantillas',
                resultadoPlantillas.mensaje || 'No se pudieron obtener las plantillas del servidor',
                'error'
            );
            return;
        }

        if (resultadoPlantillas.plantillas.length === 0) {
            mostrarAlerta(
                'Sin plantillas',
                'No hay plantillas guardadas. Crea una plantilla primero.',
                'info'
            );
            return;
        }

        // Crear opciones para el selector
        const opcionesPlantillas = resultadoPlantillas.plantillas.map(plantilla => ({
            value: plantilla.idPlantilla,
            text: `${plantilla.nombre} (ID: ${plantilla.idPlantilla})`,
            descripcion: obtenerDescripcionPlantilla(plantilla)
        }));

        // Mostrar selector de plantillas
        const { value: idPlantillaSeleccionada } = await Swal.fire({
            title: 'Seleccionar plantilla (Sistema Simplificado)',
            html: `
                <div style="text-align: left; margin-bottom: 15px;">
                    <label for="selectorPlantilla" style="display: block; margin-bottom: 5px; font-weight: bold;">Plantillas disponibles:</label>
                    <select id="selectorPlantilla" class="swal2-select" style="width: 100%;">
                        <option value="">-- Selecciona una plantilla --</option>
                        ${opcionesPlantillas.map(opcion => 
                            `<option value="${opcion.value}">${opcion.text}</option>`
                        ).join('')}
                    </select>
                </div>
                <div id="descripcionPlantilla" style="margin-top: 15px; padding: 10px; background-color: #f8f9fa; border-radius: 5px; min-height: 50px; font-size: 12px;">
                    Selecciona una plantilla para ver su descripción
                </div>
                <div style="margin-top: 15px; padding: 10px; background-color: #fff3cd; border-radius: 5px; font-size: 12px;">
                    <strong>⚠️ Advertencia:</strong> Cargar una plantilla reemplazará todo el contenido actual del reporte.
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Cargar plantilla',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#3085d6',
            didOpen: () => {
                const selector = document.getElementById('selectorPlantilla');
                const descripcionDiv = document.getElementById('descripcionPlantilla');
                
                selector.addEventListener('change', (e) => {
                    const plantillaSeleccionada = resultadoPlantillas.plantillas.find(p => p.idPlantilla == e.target.value);
                    if (plantillaSeleccionada) {
                        descripcionDiv.innerHTML = obtenerDescripcionPlantilla(plantillaSeleccionada);
                    } else {
                        descripcionDiv.innerHTML = 'Selecciona una plantilla para ver su descripción';
                    }
                });
            },
            preConfirm: () => {
                const valor = document.getElementById('selectorPlantilla').value;
                if (!valor) {
                    Swal.showValidationMessage('Debes seleccionar una plantilla');
                    return false;
                }
                return valor;
            }
        });

        if (!idPlantillaSeleccionada) return;

        // Mostrar indicador de carga
        Swal.fire({
            title: 'Cargando plantilla...',
            text: 'Aplicando configuración al reporte',
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Cargar y aplicar la plantilla
        const resultado = await cargarYAplicarPlantillaSimplificada(parseInt(idPlantillaSeleccionada));

        if (resultado.exito) {
            await Swal.fire({
                title: '¡Plantilla aplicada!',
                html: `
                    <p>La plantilla "<strong>${resultado.plantilla.nombre}</strong>" se aplicó exitosamente.</p>
                    <div style="margin-top: 15px; padding: 10px; background-color: #d4edda; border-radius: 5px; font-size: 12px;">
                        <strong>Elementos aplicados:</strong> ${resultado.detallesAplicacion?.elementosAplicados || 'N/A'}<br>
                        <strong>Sistema:</strong> Simplificado v2.0
                    </div>
                `,
                icon: 'success',
                confirmButtonText: 'Perfecto'
            });
        } else {
            await Swal.fire({
                title: 'Error al cargar plantilla',
                text: resultado.mensaje || 'Ocurrió un error al aplicar la plantilla',
                icon: 'error',
                confirmButtonText: 'Entendido'
            });
        }

    } catch (error) {
        console.error('Error al cargar plantilla simplificada:', error);
        await Swal.fire({
            title: 'Error inesperado',
            text: `Error interno: ${error.message}`,
            icon: 'error',
            confirmButtonText: 'Entendido'
        });
    }
}

/**
 * Maneja la búsqueda de plantillas
 */
async function manejarBuscarPlantillas() {
    try {
        const { value: terminoBusqueda } = await Swal.fire({
            title: 'Buscar plantillas',
            input: 'text',
            inputPlaceholder: 'Ingresa el nombre o parte del nombre',
            showCancelButton: true,
            confirmButtonText: 'Buscar',
            cancelButtonText: 'Cancelar',
            inputValidator: (value) => {
                if (!value || value.trim() === '') {
                    return 'Debes ingresar un término de búsqueda';
                }
            }
        });

        if (!terminoBusqueda) return;

        // Mostrar indicador de carga
        Swal.fire({
            title: 'Buscando...',
            text: 'Buscando plantillas que coincidan',
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const resultado = await buscarPlantillasSimplificadas(terminoBusqueda);

        if (resultado.exito) {
            if (resultado.plantillas.length === 0) {
                await Swal.fire({
                    title: 'Sin resultados',
                    text: `No se encontraron plantillas que contengan "${terminoBusqueda}"`,
                    icon: 'info',
                    confirmButtonText: 'Entendido'
                });
            } else {
                // Mostrar resultados
                const listaResultados = resultado.plantillas.map(plantilla => 
                    `<li style="margin-bottom: 10px; padding: 8px; background-color: #f8f9fa; border-radius: 4px;">
                        <strong>${plantilla.nombre}</strong> (ID: ${plantilla.idPlantilla})
                        <br><small>Elementos: ${contarElementosPlantilla(plantilla)}</small>
                    </li>`
                ).join('');

                await Swal.fire({
                    title: `Resultados de búsqueda (${resultado.total})`,
                    html: `
                        <p>Se encontraron <strong>${resultado.total}</strong> plantillas para "${terminoBusqueda}":</p>
                        <ul style="text-align: left; max-height: 200px; overflow-y: auto; margin-top: 15px;">
                            ${listaResultados}
                        </ul>
                    `,
                    icon: 'success',
                    confirmButtonText: 'Entendido'
                });
            }
        } else {
            await Swal.fire({
                title: 'Error en la búsqueda',
                text: resultado.mensaje || 'No se pudo realizar la búsqueda',
                icon: 'error',
                confirmButtonText: 'Entendido'
            });
        }

    } catch (error) {
        console.error('Error en búsqueda de plantillas:', error);
        await Swal.fire({
            title: 'Error inesperado',
            text: `Error interno: ${error.message}`,
            icon: 'error',
            confirmButtonText: 'Entendido'
        });
    }
}

/**
 * Obtiene la descripción formateada de una plantilla
 * @param {Object} plantilla - Plantilla simplificada
 * @returns {string} Descripción HTML formateada
 */
function obtenerDescripcionPlantilla(plantilla) {
    try {
        const json = plantilla.json || {};
        const config = json.configuracion || {};
        const datos = json.datos || [];
        
        const tiposElementos = {};
        datos.forEach(elemento => {
            if (elemento.tipo) {
                tiposElementos[elemento.tipo] = (tiposElementos[elemento.tipo] || 0) + 1;
            }
        });

        const elementosTexto = Object.keys(tiposElementos).map(tipo => 
            `${tipo}: ${tiposElementos[tipo]}`
        ).join(', ');

        return `
            <strong>Descripción:</strong> ${config.descripcion || 'Sin descripción'}<br>
            <strong>Elementos:</strong> ${datos.length} (${elementosTexto || 'ninguno'})<br>
            <strong>Tractores:</strong> ${(config.tractoresSeleccionados || []).length}<br>
            <strong>Creada:</strong> ${json.metadatos?.fechaCreacion ? new Date(json.metadatos.fechaCreacion).toLocaleDateString() : 'Fecha desconocida'}
        `;
    } catch (error) {
        return 'Error al mostrar descripción';
    }
}

/**
 * Cuenta los elementos de una plantilla simplificada
 * @param {Object} plantilla - Plantilla simplificada
 * @returns {number} Número de elementos
 */
function contarElementosPlantilla(plantilla) {
    try {
        return (plantilla.json?.datos || []).length;
    } catch (error) {
        return 0;
    }
}

// Exportar funciones para uso externo
module.exports = {
    // Sistema clásico
    inicializarModuloPlantillas,
    manejarGuardarPlantilla,
    manejarCargarPlantilla,
    
    // Sistema simplificado
    inicializarModuloPlantillasExtendido,
    manejarGuardarPlantillaSimplificada,
    manejarCargarPlantillaSimplificada,
    manejarBuscarPlantillas,
    
    // Utilidades
    obtenerPlantillasDisponibles
};
