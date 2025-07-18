const { eliminarPlantilla } = require(`${rutaBase}src/backend/casosUso/plantillas/eliminarPlantilla.js`);

function setup(){
    const nombrePlantilla = document.getElementById('selectorPlantilla');
    const botonEliminarPlantilla = document.getElementById('botonEliminarPlantilla');

    botonEliminarPlantilla.addEventListener('click', async () => {
        console.log('Eliminando plantilla...');
        console.log('Eliminando plantilla:', nombrePlantilla.value);
        const respuesta = await eliminarPlantilla(nombrePlantilla.value);
        console.log('Respuesta de eliminarPlantilla:', respuesta);
        if (respuesta.ok) {
            mostrarAlerta('Correcto', 'Plantilla eliminada correctamente', 'success');
        } else {
            mostrarAlerta('Error', 'Error al eliminar la plantilla: ' + respuesta.error, 'error');
        }
    });
}

setup();