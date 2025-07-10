/**
 * DOCUMENTACIÓN: ESTRUCTURA DE DATOS ESPERADA DEL SERVIDOR
 * Sistema de Plantillas - TracTech
 */

/* ===========================
   1. ESTRUCTURA DE DATOS ENVIADA AL SERVIDOR (POST /plantillas/crear)
   =========================== */

// El sistema envía este objeto completo al servidor:
const datosEnviadosAlServidor = {
    "nombre": "Reporte Mensual de Rendimiento",
    "descripcion": "Plantilla estándar para reportes mensuales con gráficas de rendimiento por tractor",
    "fechaCreacion": "2024-06-27T10:30:00.000Z",
    "version": "1.0",
    "configuracion": {
        "tractoresSeleccionados": ["Tractor_001", "Tractor_002", "Tractor_003"],
        "elementos": [
            {
                "tipo": "texto",
                "id": "tarjeta-texto-1234567890",
                "contenido": "Reporte Mensual de Rendimiento",
                "tipoTexto": "titulo",
                "alineacion": "center",
                "posicion": 0
            },
            {
                "tipo": "grafica",
                "id": "tarjeta-grafica-1234567891",
                "titulo": "Rendimiento por Mes",
                "tipoGrafica": "bar", // line, bar, pie, doughnut, radar, polarArea
                "color": "#A61930",
                "tractorSeleccionado": "Tractor_001",
                "datos": {
                    "columna": {
                        "nombre": "Rendimiento_Total",
                        "hoja": "Hoja1"
                    },
                    "formula": null, // O objeto con nombre de fórmula si se usa fórmula
                    "filtros": [
                        {
                            "parametro": "A",
                            "columna": "Fecha"
                        },
                        {
                            "parametro": "B", 
                            "columna": "Region"
                        }
                    ],
                    "tipoOrigen": "columna" // "columna" o "formula"
                },
                "posicion": 1
            },
            {
                "tipo": "grafica",
                "id": "tarjeta-grafica-1234567892",
                "titulo": "Promedio de Eficiencia",
                "tipoGrafica": "line",
                "color": "#2E7D32",
                "tractorSeleccionado": "Tractor_002",
                "datos": {
                    "columna": null,
                    "formula": {
                        "nombre": "Promedio_Eficiencia"
                    },
                    "filtros": [
                        {
                            "parametro": "A",
                            "columna": "Periodo"
                        }
                    ],
                    "tipoOrigen": "formula"
                },
                "posicion": 2
            }
        ],
        "datosOriginales": {} // Objeto vacío por ahora
    }
};

/* ===========================
   2. RESPUESTA ESPERADA DEL SERVIDOR (POST /plantillas/crear)
   =========================== */

// Respuesta exitosa:
const respuestaExitosaGuardar = {
    "ok": true,
    "id": "plantilla_12345", // ID único de la plantilla guardada
    "mensaje": "Plantilla guardada exitosamente"
};

// Respuesta de error:
const respuestaErrorGuardar = {
    "ok": false,
    "error": "Error al guardar la plantilla",
    "detalles": "Descripción específica del error"
};

/* ===========================
   3. RESPUESTA ESPERADA DEL SERVIDOR (GET /plantillas/obtener/:id)
   =========================== */

// El servidor debe devolver la plantilla completa:
const respuestaCargarPlantilla = {
    "ok": true,
    "plantilla": {
        // MISMA ESTRUCTURA que se envió originalmente
        "nombre": "Reporte Mensual de Rendimiento",
        "descripcion": "Plantilla estándar para reportes mensuales...",
        "fechaCreacion": "2024-06-27T10:30:00.000Z",
        "version": "1.0",
        "configuracion": {
            "tractoresSeleccionados": ["Tractor_001", "Tractor_002"],
            "elementos": [
                // Array de elementos igual que arriba
            ],
            "datosOriginales": {}
        }
    }
};

// Respuesta de error al cargar:
const respuestaErrorCargar = {
    "ok": false,
    "error": "Plantilla no encontrada",
    "detalles": "La plantilla con ID especificado no existe"
};

/* ===========================
   4. RESPUESTA ESPERADA DEL SERVIDOR (GET /plantillas)
   =========================== */

// Lista de plantillas disponibles:
const respuestaListaPlantillas = {
    "ok": true,
    "plantillas": [
        {
            "id": "plantilla_12345",
            "nombre": "Reporte Mensual de Rendimiento",
            "descripcion": "Plantilla estándar para reportes mensuales",
            "fechaCreacion": "2024-06-27T10:30:00.000Z",
            "version": "1.0"
            // NO incluye la configuración completa, solo metadatos
        },
        {
            "id": "plantilla_12346", 
            "nombre": "Análisis Semanal",
            "descripcion": "Reporte de análisis semanal de tractores",
            "fechaCreacion": "2024-06-25T15:20:00.000Z",
            "version": "1.0"
        }
    ]
};

/* ===========================
   5. ENDPOINTS DEL SERVIDOR REQUERIDOS
   =========================== */

// POST /plantillas/crear
// Headers: Content-Type: application/json, Authorization: Bearer {token}
// Body: datosEnviadosAlServidor (estructura completa arriba)
// Response: respuestaExitosaGuardar o respuestaErrorGuardar

// GET /plantillas
// Headers: Authorization: Bearer {token}  
// Response: respuestaListaPlantillas

// GET /plantillas/obtener/:id
// Headers: Authorization: Bearer {token}
// Response: respuestaCargarPlantilla o respuestaErrorCargar

/* ===========================
   6. CAMPOS CLAVE QUE DEBE MANEJAR EL SERVIDOR
   =========================== */

// CAMPOS DE GRÁFICA:
// - tipo: "grafica"
// - titulo: string
// - tipoGrafica: "line" | "bar" | "pie" | "doughnut" | "radar" | "polarArea"
// - color: string (hex color)
// - tractorSeleccionado: string
// - datos.tipoOrigen: "columna" | "formula"
// - datos.columna: { nombre: string, hoja: string }
// - datos.formula: { nombre: string }
// - datos.filtros: [{ parametro: string, columna: string }]

// CAMPOS DE TEXTO:
// - tipo: "texto"
// - contenido: string
// - tipoTexto: "titulo" | "subtitulo" | "contenido"
// - alineacion: "left" | "center" | "right" | "justify"

// CAMPOS GLOBALES:
// - tractoresSeleccionados: array de strings
// - elementos: array ordenado por posicion

/* ===========================
   7. VALIDACIONES RECOMENDADAS EN EL SERVIDOR
   =========================== */

// - Validar que el usuario tenga permisos para crear/modificar plantillas
// - Validar que el nombre de la plantilla no esté duplicado para el usuario
// - Validar estructura del objeto configuracion
// - Validar que los elementos tengan los campos requeridos
// - Sanitizar contenido de texto para evitar XSS
// - Limitar tamaño máximo de la plantilla
// - Validar que las fórmulas referenciadas existen en el sistema

module.exports = {
    // Este archivo es solo documentación
    datosEnviadosAlServidor,
    respuestaExitosaGuardar,
    respuestaErrorGuardar,
    respuestaCargarPlantilla,
    respuestaErrorCargar,
    respuestaListaPlantillas
};
