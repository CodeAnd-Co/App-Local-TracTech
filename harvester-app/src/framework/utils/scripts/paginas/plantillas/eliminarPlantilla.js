const { eliminarPlantilla } = require(`${rutaBase}src/backend/casosUso/plantillas/eliminarPlantilla.js`);
// const { consultarPlantillas } = require(`${rutaBase}src/framework/utils/scripts/paginas/plantillas/consultarPlantillas.js`);

function eliminarPlantillaScript(){
    const nombrePlantilla = document.getElementById('selectorPlantilla');
    const botonEliminarPlantilla = document.getElementById('botonEliminarPlantilla');

    botonEliminarPlantilla.addEventListener('click', async () => {
        const respuesta = await eliminarPlantilla(nombrePlantilla.value);
        if (respuesta.ok) {
            mostrarAlerta('Correcto', 'Plantilla eliminada correctamente', 'success');
            vaciarSelectorPlantillas(); 
            await consultarPlantillasScript(); // Actualizar el selector de plantillas
        } else {
            mostrarAlerta('Error', 'Error al eliminar la plantilla: ' + respuesta.error, 'error');
        }
    });
}

eliminarPlantillaScript();