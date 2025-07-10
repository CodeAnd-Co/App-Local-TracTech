const { URL_BASE } = require(`${rutaBase}src/framework/utils/scripts/constantes.js`);

// ===== FUNCIONES SISTEMA ANTIGUO (COMPATIBILIDAD) =====

async function plantillas() {
    const respuesta = await fetch(`${URL_BASE}/plantillas/consultar`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
  
    const datos = await respuesta.json();
  
    return { ok: respuesta.ok, ...datos };
}

/**
 * Obtiene una plantilla específica por su ID (sistema clásico)
 * @param {string} idPlantilla - ID de la plantilla
 * @returns {Promise<Object>} Respuesta del servidor
 */
async function obtenerPlantillaPorId(idPlantilla) {
    try {
        const respuesta = await fetch(`${URL_BASE}/plantillas/obtener/${idPlantilla}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const datos = await respuesta.json();

        return { ok: respuesta.ok, ...datos };

    } catch (error) {
        return {
            ok: false,
            error: 'Error de conexión al obtener la plantilla',
            detalles: error.message
        };
    }
}

/**
 * Guarda una plantilla del sistema clásico
 * @param {Object} configuracionPlantilla - Configuración completa de la plantilla
 * @returns {Promise<Object>} Respuesta del servidor
 */
async function guardarPlantillaClasica(configuracionPlantilla) {
    try {
        console.log('=== API: ENVIANDO PLANTILLA AL BACKEND ===');
        console.log('URL:', `${URL_BASE}/plantillas/crear`);
        console.log('Configuración a enviar:', JSON.stringify(configuracionPlantilla, null, 2));
        
        const respuesta = await fetch(`${URL_BASE}/plantillas/crear`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(configuracionPlantilla)
        });

        const datos = await respuesta.json();
        
        console.log('=== API: RESPUESTA DEL BACKEND ===');
        console.log('Status:', respuesta.status);
        console.log('Datos recibidos:', datos);

        return { ok: respuesta.ok, ...datos };

    } catch (error) {
        return {
            ok: false,
            error: 'Error de conexión al guardar la plantilla',
            detalles: error.message
        };
    }
}

// ===== FUNCIONES SISTEMA SIMPLIFICADO =====

/**
 * Guarda una nueva plantilla simplificada
 * @param {Object} plantilla - Datos de la plantilla
 * @param {string} plantilla.nombre - Nombre de la plantilla
 * @param {Object} plantilla.json - Estructura JSON completa de la plantilla
 * @returns {Promise<Object>} Respuesta del servidor
 */
async function guardarPlantillaSimplificada(plantilla) {
    try {
        const respuesta = await fetch(`${URL_BASE}/plantillas/simplificadas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(plantilla)
        });

        const datos = await respuesta.json();
        return { ok: respuesta.ok, status: respuesta.status, ...datos };

    } catch (error) {
        return {
            ok: false,
            status: 500,
            exito: false,
            mensaje: `Error de conexión: ${error.message}`,
            error: error.message
        };
    }
}

/**
 * Obtiene todas las plantillas simplificadas
 * @returns {Promise<Object>} Lista de plantillas y estadísticas
 */
async function obtenerTodasPlantillasSimplificadas() {
    try {
        const respuesta = await fetch(`${URL_BASE}/plantillas/simplificadas`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const datos = await respuesta.json();
        return { ok: respuesta.ok, status: respuesta.status, ...datos };

    } catch (error) {
        return {
            ok: false,
            status: 500,
            exito: false,
            mensaje: `Error de conexión: ${error.message}`,
            error: error.message
        };
    }
}

/**
 * Obtiene una plantilla específica por su ID
 * @param {number} idPlantilla - ID de la plantilla
 * @returns {Promise<Object>} Datos de la plantilla
 */
async function obtenerPlantillaSimplificada(idPlantilla) {
    try {
        const respuesta = await fetch(`${URL_BASE}/plantillas/simplificadas/${idPlantilla}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const datos = await respuesta.json();
        return { ok: respuesta.ok, status: respuesta.status, ...datos };

    } catch (error) {
        return {
            ok: false,
            status: 500,
            exito: false,
            mensaje: `Error de conexión: ${error.message}`,
            error: error.message
        };
    }
}

/**
 * Actualiza una plantilla existente
 * @param {number} idPlantilla - ID de la plantilla
 * @param {Object} plantilla - Nuevos datos de la plantilla
 * @returns {Promise<Object>} Respuesta del servidor
 */
async function actualizarPlantillaSimplificada(idPlantilla, plantilla) {
    try {
        const respuesta = await fetch(`${URL_BASE}/plantillas/simplificadas/${idPlantilla}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(plantilla)
        });

        const datos = await respuesta.json();
        return { ok: respuesta.ok, status: respuesta.status, ...datos };

    } catch (error) {
        return {
            ok: false,
            status: 500,
            exito: false,
            mensaje: `Error de conexión: ${error.message}`,
            error: error.message
        };
    }
}

/**
 * Elimina una plantilla
 * @param {number} idPlantilla - ID de la plantilla
 * @returns {Promise<Object>} Confirmación de eliminación
 */
async function eliminarPlantillaSimplificada(idPlantilla) {
    try {
        const respuesta = await fetch(`${URL_BASE}/plantillas/simplificadas/${idPlantilla}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const datos = await respuesta.json();
        return { ok: respuesta.ok, status: respuesta.status, ...datos };

    } catch (error) {
        return {
            ok: false,
            status: 500,
            exito: false,
            mensaje: `Error de conexión: ${error.message}`,
            error: error.message
        };
    }
}

/**
 * Busca plantillas por nombre
 * @param {string} termino - Término de búsqueda
 * @returns {Promise<Object>} Plantillas que coinciden con la búsqueda
 */
async function buscarPlantillasSimplificadas(termino) {
    try {
        const respuesta = await fetch(`${URL_BASE}/plantillas/simplificadas/buscar?termino=${encodeURIComponent(termino)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const datos = await respuesta.json();
        return { ok: respuesta.ok, status: respuesta.status, ...datos };

    } catch (error) {
        return {
            ok: false,
            status: 500,
            exito: false,
            mensaje: `Error de conexión: ${error.message}`,
            error: error.message
        };
    }
}

/**
 * Duplica una plantilla existente
 * @param {number} idPlantilla - ID de la plantilla a duplicar
 * @param {string} nuevoNombre - Nombre para la plantilla duplicada
 * @returns {Promise<Object>} Datos de la nueva plantilla creada
 */
async function duplicarPlantillaSimplificada(idPlantilla, nuevoNombre) {
    try {
        const respuesta = await fetch(`${URL_BASE}/plantillas/simplificadas/${idPlantilla}/duplicar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nuevoNombre })
        });

        const datos = await respuesta.json();
        return { ok: respuesta.ok, status: respuesta.status, ...datos };

    } catch (error) {
        return {
            ok: false,
            status: 500,
            exito: false,
            mensaje: `Error de conexión: ${error.message}`,
            error: error.message
        };
    }
}

/**
 * Valida la estructura de una plantilla sin guardarla
 * @param {Object} json - Estructura JSON a validar
 * @returns {Promise<Object>} Resultado de validación
 */
async function validarEstructuraPlantilla(json) {
    try {
        const respuesta = await fetch(`${URL_BASE}/plantillas/simplificadas/validar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ json })
        });

        const datos = await respuesta.json();
        return { ok: respuesta.ok, status: respuesta.status, ...datos };

    } catch (error) {
        return {
            ok: false,
            status: 500,
            exito: false,
            mensaje: `Error de conexión: ${error.message}`,
            error: error.message
        };
    }
}

module.exports = {
    // Sistema antiguo (compatibilidad)
    plantillas,
    obtenerPlantillaPorId,
    guardarPlantillaClasica,
    
    // Sistema simplificado
    guardarPlantillaSimplificada,
    obtenerTodasPlantillasSimplificadas,
    obtenerPlantillaSimplificada,
    actualizarPlantillaSimplificada,
    eliminarPlantillaSimplificada,
    buscarPlantillasSimplificadas,
    duplicarPlantillaSimplificada,
    validarEstructuraPlantilla
};