const { crearPlantilla } = require(`${rutaBase}src/backend/casosUso/plantillas/crearPlantilla.js`);
// const { mostrarAlerta } = require(`${rutaBase}/src/framework/vistas/includes/componentes/moleculas/alertaSwal/alertaSwal`);

function setup(){
    const nombrePlantilla = document.getElementById('nombrePlantilla');
    const botonGuardarPlantilla = document.getElementById('botonGuardarPlantilla');

    botonGuardarPlantilla.addEventListener('click', async () => {
        if (nombrePlantilla.value.includes('_')) {
            mostrarAlerta('Error', 'El nombre no puede contener guiones bajos', 'error');
            return;
        }
        const nombreFormateado = nombrePlantilla.value.replace(/\s+/g, '_');
        const respuesta = await crearPlantilla(nombreFormateado, 'prueba de datos');
        if (respuesta.ok) {
            mostrarAlerta('Correcto', 'Plantilla guardada correctamente', 'success');
        } else {
            mostrarAlerta('Error', 'Error al guardar la plantilla: ' + respuesta.error, 'error');
        }
    });
}

setup();