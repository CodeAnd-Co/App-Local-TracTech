const { crearPlantilla } = require(`${rutaBase}src/backend/casosUso/plantillas/crearPlantilla.js`);
// const { mostrarAlerta } = require(`${rutaBase}/src/framework/vistas/includes/componentes/moleculas/alertaSwal/alertaSwal`);

function setup(){
    const nombrePlantilla = document.getElementById('nombrePlantilla');
    const botonGuardarPlantilla = document.getElementById('botonGuardarPlantilla');

    botonGuardarPlantilla.addEventListener('click', async () => {
        const respuesta = await crearPlantilla(nombrePlantilla.value, 'prueba de datos');
        if (respuesta.ok) {
            mostrarAlerta('Correcto', 'Plantilla guardada correctamente', 'success');
        } else {
            mostrarAlerta('Error', 'Error al guardar la plantilla: ' + respuesta.error, 'error');
        }
    });
}

setup();