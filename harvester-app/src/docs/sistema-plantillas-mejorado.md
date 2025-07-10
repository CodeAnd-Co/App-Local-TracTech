# Sistema de Plantillas Mejorado - TracTech Harvester

## Descripción General

El sistema de plantillas ha sido mejorado para capturar de manera más completa la configuración de reportes, incluyendo columnas de datos, filtros aplicados, fórmulas utilizadas y configuraciones avanzadas de gráficas.

## Características Principales

### 1. Captura Completa de Configuración

#### Información de Gráficas
- **Columnas de origen**: Nombre y hoja de origen de los datos
- **Fórmulas aplicadas**: Nombre, estructura y parámetros de fórmulas
- **Filtros y parámetros**: Configuración completa de parámetros A, B, C, etc.
- **Configuración visual**: Tipo de gráfica, colores, títulos

#### Información Contextual
- **Tractores seleccionados**: Lista completa de tractores en uso
- **Datos originales**: Estructura de hojas y columnas disponibles
- **Metadatos**: Fecha de creación, usuario, versión de aplicación

### 2. Funciones Principales

#### Guardar Plantilla (`guardarPlantilla.js`)

```javascript
// Función principal mejorada
async function guardarPlantilla(nombrePlantilla, descripcion = '')

// Nuevas funciones de apoyo
function capturarInformacionFormulas()
function validarConfiguracionPlantilla(configuracion)
function capturarDatosGrafica(graficaId) // Mejorada
```

#### Cargar Plantilla (`cargarPlantilla.js`)

```javascript
// Funciones de aplicación mejoradas
async function aplicarConfiguracionAvanzada(graficaId, datosAvanzados)
async function aplicarParametrosFormula(graficaId, parametrosFormula)
function validarCompatibilidadDatos(datosOriginalesPlantilla, datosActualesString)
```

### 3. Estructura de Datos Extendida

#### Configuración de Gráfica
```javascript
{
  tipo: 'grafica',
  id: 'tarjeta-grafica-123',
  titulo: 'Rendimiento por mes',
  tipoGrafica: 'bar',
  color: '#A61930',
  tractorSeleccionado: 'Tractor_001',
  datos: {
    tipoOrigen: 'columna', // o 'formula'
    columna: {
      nombre: 'Rendimiento_Total',
      hoja: 'Hoja1',
      indiceColumna: null
    },
    formula: {
      nombre: 'Promedio_Rendimiento',
      estructuraFormula: '=PROMEDIO(A:A)',
      resultados: [...]
    },
    filtros: [
      { parametro: 'A', columna: 'Fecha', indice: 0 },
      { parametro: 'B', columna: 'Region', indice: 1 }
    ],
    parametrosFormula: [
      { letra: 'A', columnaAsignada: 'Fecha', posicion: 0 },
      { letra: 'B', columnaAsignada: 'Region', posicion: 1 }
    ]
  },
  configuracionAvanzada: {
    estadoGrafica: 'activa',
    tieneDatos: true,
    colorPersonalizado: '#A61930',
    tractorEspecifico: 'Tractor_001',
    chartConfig: {
      labels: ['Ene', 'Feb', 'Mar'],
      datasetLabel: 'Rendimiento',
      tituloActual: 'Gráfica de Rendimiento'
    }
  }
}
```

#### Información de Fórmulas
```javascript
{
  formulasEnUso: [
    {
      graficaId: 123,
      nombreFormula: 'Promedio_Rendimiento',
      estructuraFormula: '=PROMEDIO(A:A)',
      parametros: [
        { letra: 'A', columnaAsignada: 'Rendimiento', estaAsignado: true }
      ]
    }
  ],
  parametrosGlobales: {
    'Hoja1': ['Fecha', 'Rendimiento', 'Region'],
    'Hoja2': ['Mes', 'Valor', 'Categoria']
  },
  estadisticas: {
    totalFormulasAplicadas: 2,
    tiposFormulaUnicos: ['Promedio_Rendimiento', 'Suma_Total'],
    parametrosTotal: 4
  }
}
```

### 4. Validación y Compatibilidad

#### Validación de Plantillas
- Verifica que la plantilla tenga elementos válidos
- Cuenta gráficas con datos aplicados
- Identifica fórmulas utilizadas
- Detecta elementos de texto vacíos

#### Compatibilidad de Datos
- Compara estructura de hojas entre plantilla y datos actuales
- Verifica existencia de hojas específicas
- Alerta sobre diferencias importantes

### 5. Flujo de Trabajo Mejorado

#### Al Guardar una Plantilla:
1. Captura configuración básica de elementos
2. Extrae información detallada de fórmulas aplicadas
3. Guarda parámetros y filtros específicos
4. Valida completitud de la configuración
5. Almacena metadatos y contexto

#### Al Cargar una Plantilla:
1. Valida compatibilidad con datos actuales
2. Restaura elementos en orden de posición
3. Aplica configuración básica (títulos, colores, tipos)
4. Restaura datos (columnas o fórmulas)
5. Aplica configuración avanzada y parámetros específicos

### 6. Beneficios

#### Para Usuarios
- **Fidelidad completa**: Las plantillas reproducen exactamente el estado original
- **Reutilización eficiente**: Fácil aplicación en diferentes conjuntos de datos
- **Flexibilidad**: Advertencias sobre compatibilidad sin bloquear funcionalidad

#### Para Desarrolladores
- **Trazabilidad**: Información completa sobre origen de datos y configuraciones
- **Mantenibilidad**: Validaciones y manejo de errores robusto
- **Extensibilidad**: Estructura modular para agregar nuevas características

### 7. Casos de Uso

#### Reportes Regulares
- Crear plantilla una vez con fórmulas específicas
- Aplicar a nuevos datos mensuales/semanales
- Mantener consistencia en análisis

#### Análisis Comparativos
- Guardar configuración de gráficas comparativas
- Reutilizar filtros y parámetros específicos
- Aplicar mismo análisis a diferentes tractores

#### Auditoría y Compliance
- Registro completo de configuraciones aplicadas
- Trazabilidad de fórmulas y filtros utilizados
- Reproducibilidad de análisis históricos

## Archivos Modificados

- `backend/casosUso/plantillas/guardarPlantilla.js` - Funciones mejoradas de captura
- `backend/casosUso/plantillas/cargarPlantilla.js` - Aplicación avanzada de configuración
- `docs/sistema-plantillas-mejorado.md` - Esta documentación

## Ejemplo de Uso

```javascript
// Guardar plantilla con configuración completa
const resultado = await guardarPlantilla(
  'Reporte Mensual Rendimiento',
  'Plantilla para análisis mensual con fórmulas de promedio y filtros por región'
);

if (resultado.exito) {
  console.log(`Plantilla guardada con ${resultado.estadisticas.graficasConDatos} gráficas`);
  console.log(`Fórmulas incluidas: ${resultado.estadisticas.formulasAplicadas}`);
}

// Cargar y aplicar plantilla
const aplicacion = await cargarYAplicarPlantilla(idPlantilla);

if (aplicacion.exito) {
  console.log(`${aplicacion.elementosAplicados} elementos aplicados`);
  console.log(`Fórmulas incluidas: ${aplicacion.formulasIncluidas.join(', ')}`);
}
```
