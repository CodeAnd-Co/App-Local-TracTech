const { consultarPlantillas } = require(`${rutaBase}src/backend/casosUso/plantillas/consultarPlantillas.js`);

async function cargarPlantillas() {
    try {
        const plantillas = await consultarPlantillas();
        const selectorPlantilla = document.getElementById('selectorPlantilla');
        
        // Limpiar opciones existentes
        selectorPlantilla.innerHTML = '';
        
        // Agregar opción por defecto si es necesario
        const opcionDefault = document.createElement('option');
        opcionDefault.value = '';
        opcionDefault.textContent = 'Selecciona una plantilla';
        selectorPlantilla.appendChild(opcionDefault);
        
        // Cargar plantillas
        if (plantillas.datos && plantillas.datos.length > 0) {
            plantillas.datos.forEach(plantilla => {
                const option = document.createElement('option');
                option.value = plantilla.titulo;
                option.textContent = plantilla.titulo;
                selectorPlantilla.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error al cargar plantillas:', error);
        mostrarAlerta('Error', 'No se pudieron cargar las plantillas', 'error');
    }
}

async function setup(){
    await cargarPlantillas();
}

// Hacer la función disponible globalmente para otros scripts
window.cargarPlantillas = cargarPlantillas;

setup();