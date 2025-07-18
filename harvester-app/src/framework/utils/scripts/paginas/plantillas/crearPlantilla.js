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
        const respuesta = await crearPlantilla(nombrePlantilla.value, 'prueba de datos');
        if (respuesta.ok) {
            mostrarAlerta('Correcto', 'Plantilla guardada correctamente', 'success');
            
            // Limpiar el campo de entrada
            nombrePlantilla.value = '';
            
            // Recargar la lista de plantillas si la función está disponible
            if (typeof window.cargarPlantillas === 'function') {
                await window.cargarPlantillas();
            }
        } else {
            mostrarAlerta('Error', 'Error al guardar la plantilla: ' + respuesta.error, 'error');
        }
    });
}

setup();