const { eliminarPlantilla } = require(`${rutaBase}src/backend/casosUso/plantillas/eliminarPlantilla.js`);

function setup(){
    const nombrePlantilla = document.getElementById('selectorPlantilla');
    const botonEliminarPlantilla = document.getElementById('botonEliminarPlantilla');

    botonEliminarPlantilla.addEventListener('click', async () => {
        // Validar que se haya seleccionado una plantilla
        if (!nombrePlantilla.value || nombrePlantilla.value === '') {
            mostrarAlerta('Error', 'Por favor selecciona una plantilla para eliminar', 'warning');
            return;
        }
        
        const respuesta = await eliminarPlantilla(nombrePlantilla.value);
        if (respuesta.ok) {
            mostrarAlerta('Correcto', 'Plantilla eliminada correctamente', 'success');
            
            // Recargar la lista de plantillas si la función está disponible
            if (typeof window.cargarPlantillas === 'function') {
                await window.cargarPlantillas();
            }
        } else {
            mostrarAlerta('Error', 'Error al eliminar la plantilla: ' + respuesta.error, 'error');
        }
    });
}

setup();