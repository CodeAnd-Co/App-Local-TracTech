# Guía de Uso - Sistema de Plantillas Simplificado en App Local

## Descripción General

La aplicación local de TracTech ahora soporta el **Sistema de Plantillas Simplificado**, que ofrece una forma más eficiente y fácil de gestionar plantillas de reportes.

## 🔄 **Compatibilidad**

La aplicación mantiene **compatibilidad completa** con ambos sistemas:
- ✅ **Sistema Clásico**: Plantillas existentes siguen funcionando
- ✅ **Sistema Simplificado**: Nueva funcionalidad optimizada

## 📁 **Archivos Actualizados**

### Backend/API
- `plantillasAPI.js` - Funciones para comunicación con servidor simplificado
- `guardarPlantilla.js` - Soporte para guardar en formato simplificado
- `cargarPlantilla.js` - Soporte para cargar plantillas simplificadas

### Frontend/UI
- `moduloPlantillas.js` - Interfaz extendida para ambos sistemas

## 🚀 **Nuevas Funciones Disponibles**

### Funciones de API
```javascript
// Importar funciones
const { 
    guardarPlantillaSimplificada,
    obtenerTodasPlantillasSimplificadas,
    obtenerPlantillaSimplificada,
    actualizarPlantillaSimplificada,
    eliminarPlantillaSimplificada,
    buscarPlantillasSimplificadas,
    duplicarPlantillaSimplificada,
    validarEstructuraPlantilla
} = require('./src/backend/domain/plantillasAPI/plantillasAPI.js');
```

### Funciones de Casos de Uso
```javascript
// Guardar plantillas
const { 
    guardarPlantillaSimplificada,
    convertirAFormatoSimplificado 
} = require('./src/backend/casosUso/plantillas/guardarPlantilla.js');

// Cargar plantillas
const { 
    cargarYAplicarPlantillaSimplificada,
    obtenerListaPlantillasSimplificadas,
    buscarPlantillasSimplificadas 
} = require('./src/backend/casosUso/plantillas/cargarPlantilla.js');
```

### Funciones de Interfaz
```javascript
// Módulo de plantillas extendido
const { 
    inicializarModuloPlantillasExtendido,
    manejarGuardarPlantillaSimplificada,
    manejarCargarPlantillaSimplificada,
    manejarBuscarPlantillas 
} = require('./src/framework/utils/scripts/paginas/analisis/moduloPlantillas.js');
```

## 📖 **Guía de Uso**

### 1. Inicializar el Módulo Extendido

```javascript
// En lugar de inicializarModuloPlantillas()
inicializarModuloPlantillasExtendido();
```

### 2. Guardar Plantilla Simplificada

```javascript
// Programáticamente
const resultado = await guardarPlantillaSimplificada('Mi Dashboard', 'Descripción opcional');

if (resultado.exito) {
    console.log('Plantilla guardada con ID:', resultado.idPlantilla);
    console.log('Estadísticas:', resultado.estadisticas);
}

// Desde interfaz (se activa automáticamente si existe el botón)
// <button id="guardarPlantillaSimplificada">Guardar Plantilla (Simplificada)</button>
```

### 3. Cargar Plantilla Simplificada

```javascript
// Programáticamente
const resultado = await cargarYAplicarPlantillaSimplificada(123);

if (resultado.exito) {
    console.log('Plantilla aplicada:', resultado.plantilla.nombre);
}

// Desde interfaz
// <button id="cargarPlantillaSimplificada">Cargar Plantilla (Simplificada)</button>
```

### 4. Buscar Plantillas

```javascript
// Programáticamente
const resultado = await buscarPlantillasSimplificadas('dashboard');

if (resultado.exito) {
    console.log(`Encontradas ${resultado.total} plantillas`);
    resultado.plantillas.forEach(plantilla => {
        console.log(`- ${plantilla.nombre} (ID: ${plantilla.idPlantilla})`);
    });
}

// Desde interfaz
// <button id="buscarPlantillas">Buscar Plantillas</button>
```

### 5. Obtener Lista de Plantillas

```javascript
const resultado = await obtenerListaPlantillasSimplificadas();

if (resultado.exito) {
    const plantillas = resultado.plantillas;
    const total = resultado.total;
    
    console.log(`Total de plantillas: ${total}`);
    plantillas.forEach(plantilla => {
        console.log(`${plantilla.nombre} - Elementos: ${plantilla.json.datos.length}`);
    });
}
```

## 🎛️ **Interfaz de Usuario**

### Botones Recomendados (HTML)

```html
<!-- Sistema clásico (mantener compatibilidad) -->
<button id="guardarPlantilla" class="btn btn-primary">
    💾 Guardar Plantilla (Clásica)
</button>
<button id="cargarPlantilla" class="btn btn-secondary">
    📁 Cargar Plantilla (Clásica)
</button>

<!-- Sistema simplificado (nuevo) -->
<button id="guardarPlantillaSimplificada" class="btn btn-success">
    💾 Guardar Plantilla (Simplificada)
</button>
<button id="cargarPlantillaSimplificada" class="btn btn-info">
    📁 Cargar Plantilla (Simplificada)
</button>
<button id="buscarPlantillas" class="btn btn-outline-primary">
    🔍 Buscar Plantillas
</button>
```

### Inicialización en Página

```javascript
// En el archivo de la página (ej: analisis.js)
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar módulo extendido
    inicializarModuloPlantillasExtendido();
    
    console.log('Sistema de plantillas simplificado inicializado');
});
```

## 🔧 **Funciones Avanzadas**

### Validar Estructura antes de Guardar

```javascript
// Validar una estructura JSON personalizada
const estructuraPersonalizada = {
    datos: [
        { tipo: 'grafica', id: 'grafica1', configuracion: { titulo: 'Mi Gráfica' } }
    ],
    configuracion: { titulo: 'Mi Reporte' }
};

const validacion = await validarEstructuraPlantilla(estructuraPersonalizada);

if (validacion.datos.valida) {
    console.log('Estructura válida');
} else {
    console.log('Errores:', validacion.datos.errores);
    console.log('Advertencias:', validacion.datos.advertencias);
}
```

### Duplicar Plantilla

```javascript
const { duplicarPlantillaSimplificada } = require('./src/backend/domain/plantillasAPI/plantillasAPI.js');

const resultado = await duplicarPlantillaSimplificada(123, 'Copia de Mi Plantilla');

if (resultado.ok && resultado.exito) {
    console.log('Nueva plantilla creada con ID:', resultado.datos.idPlantillaNueva);
}
```

### Obtener Estadísticas

```javascript
const { obtenerEstadisticasPlantillaActual } = require('./src/backend/casosUso/plantillas/guardarPlantilla.js');

const estadisticas = obtenerEstadisticasPlantillaActual();
console.log('Elementos actuales:', estadisticas.totalElementos);
console.log('Tipos de elementos:', estadisticas.tiposElementos);
console.log('Tractores seleccionados:', estadisticas.tractoresSeleccionados);
```

## 📊 **Estructura de Datos**

### Plantilla Simplificada
```javascript
{
    "idPlantilla": 123,
    "nombre": "Dashboard de Eficiencia",
    "json": {
        "datos": [
            {
                "tipo": "grafica",
                "id": "grafica1",
                "configuracion": {
                    "tipo": "line",
                    "titulo": "Consumo de Combustible",
                    // ... más configuración
                }
            }
        ],
        "configuracion": {
            "titulo": "Dashboard de Eficiencia",
            "descripcion": "Análisis de eficiencia de tractores",
            "tractoresSeleccionados": ["tractor_001", "tractor_002"],
            // ... más configuración
        },
        "metadatos": {
            "version": "2.0",
            "sistemaSimplificado": true,
            "fechaCreacion": "2025-01-09T...",
            "aplicacion": "TracTech Harvester"
        }
    }
}
```

## 🐛 **Manejo de Errores**

```javascript
try {
    const resultado = await guardarPlantillaSimplificada('Mi Plantilla');
    
    if (!resultado.exito) {
        console.error('Error al guardar:', resultado.mensaje);
        console.error('Detalles:', resultado.error);
    }
} catch (error) {
    console.error('Error de conexión:', error.message);
}
```

## 📋 **Lista de Verificación de Migración**

- [ ] Actualizar inicialización del módulo
- [ ] Agregar botones de sistema simplificado
- [ ] Probar guardado de plantillas
- [ ] Probar carga de plantillas
- [ ] Verificar búsqueda de plantillas
- [ ] Comprobar compatibilidad con sistema clásico
- [ ] Documentar para usuarios finales

## 🔗 **Compatibilidad con Backend**

El sistema funciona con los siguientes endpoints del backend:

- `POST /plantillas/simplificadas` - Guardar
- `GET /plantillas/simplificadas` - Listar todas
- `GET /plantillas/simplificadas/:id` - Obtener por ID
- `PUT /plantillas/simplificadas/:id` - Actualizar
- `DELETE /plantillas/simplificadas/:id` - Eliminar
- `GET /plantillas/simplificadas/buscar` - Buscar
- `POST /plantillas/simplificadas/:id/duplicar` - Duplicar
- `POST /plantillas/simplificadas/validar` - Validar

## 🎯 **Próximos Pasos**

1. **Implementar en producción** - Desplegar cambios
2. **Capacitar usuarios** - Mostrar nuevas funcionalidades
3. **Migrar plantillas existentes** - Convertir al nuevo formato
4. **Optimizar rendimiento** - Mejorar tiempos de carga
5. **Extender funcionalidades** - Agregar más características

El sistema simplificado está listo para uso en producción y mantiene total compatibilidad con el sistema existente. 🚀
