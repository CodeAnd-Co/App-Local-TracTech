# Uso de Plantillas en TracTech Harvester

## Descripción

La funcionalidad de plantillas te permite guardar la configuración completa de un reporte (gráficas, fórmulas, filtros, textos) y reutilizarla en futuros análisis.

## Cómo Guardar una Plantilla

1. **Crear tu reporte**: Configura las gráficas, aplica fórmulas, ajusta filtros y agrega textos como desees.

2. **Hacer clic en "Guardar Plantilla"**: Encontrarás este botón en la sección de acciones, junto al botón de "Descargar PDF".

3. **Completar información**:
   - **Nombre**: Escribe un nombre descriptivo (ej: "Reporte Mensual Rendimiento")
   - **Descripción**: Opcional, pero útil para recordar el propósito de la plantilla

4. **Confirmar**: La plantilla se guardará con toda la configuración actual.

## Qué se Guarda en una Plantilla

### 📊 Configuración de Gráficas
- Tipo de gráfica (línea, barras, circular, etc.)
- Título personalizado
- Color seleccionado
- Tractor específico configurado

### 🧮 Fórmulas y Datos
- Fórmulas aplicadas a cada gráfica
- Parámetros específicos (A, B, C, etc.)
- Columnas de origen utilizadas
- Filtros aplicados

### 📝 Elementos de Texto
- Contenido del texto
- Tipo de formato (título, subtítulo, contenido)
- Posición en el reporte

### 🚜 Configuración Global
- Tractores seleccionados
- Estructura de datos utilizada

## Cómo Cargar una Plantilla

1. **Hacer clic en "Cargar Plantilla"**: Botón disponible en la sección de acciones.

2. **Seleccionar plantilla**: Elige de la lista de plantillas disponibles.

3. **Confirmar**: El sistema te advertirá que el contenido actual será reemplazado.

4. **Esperar aplicación**: La plantilla se aplicará automáticamente recreando toda la configuración.

## Consejos de Uso

### ✅ Buenas Prácticas
- **Nombres descriptivos**: Usa nombres que identifiquen claramente el propósito
- **Descripciones útiles**: Agrega contexto sobre cuándo usar cada plantilla
- **Verificar datos**: Asegúrate de que los datos actuales sean compatibles

### ⚠️ Consideraciones
- **Datos compatibles**: Las plantillas funcionan mejor con estructuras de datos similares
- **Respaldo**: Guarda tu trabajo actual antes de cargar una plantilla
- **Fórmulas**: Verifica que las fórmulas utilizadas estén disponibles

## Casos de Uso Comunes

### 📈 Reportes Regulares
- Crear plantilla con análisis estándar mensual
- Aplicar a nuevos datos cada mes
- Mantener consistencia en reportes

### 🔄 Análisis Comparativos
- Configurar gráficas de comparación
- Reutilizar para diferentes períodos
- Aplicar mismos filtros y parámetros

### 📋 Análisis Específicos
- Guardar configuraciones para auditorías
- Plantillas por tipo de tractor
- Análisis por región o temporada

## Resolución de Problemas

### "No hay elementos para guardar"
- Asegúrate de tener al menos una gráfica o texto en el reporte

### "Datos no compatibles"
- Verifica que las hojas Excel tengan estructura similar
- Las advertencias no impiden el uso, solo informan diferencias

### "Error al cargar plantilla"
- Verifica conexión al servidor
- Comprueba que tienes permisos para acceder a plantillas

## Interfaz

Los botones de plantillas se encuentran en la parte superior derecha de la página de análisis:

```
[📁 Guardar Plantilla] [📋 Cargar Plantilla] [📄 Descargar PDF]
```

- **📁 Guardar Plantilla**: Guarda la configuración actual
- **📋 Cargar Plantilla**: Carga una plantilla existente
- **📄 Descargar PDF**: Genera el reporte en PDF
