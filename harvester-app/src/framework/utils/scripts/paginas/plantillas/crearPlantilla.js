const { crearPlantilla } = require(`${rutaBase}src/backend/casosUso/plantillas/crearPlantilla.js`);
// const { consultarPlantillas } = require(`${rutaBase}src/framework/utils/scripts/paginas/plantillas/consultarPlantillas.js`);
// const { mostrarAlerta } = require(`${rutaBase}/src/framework/vistas/includes/componentes/moleculas/alertaSwal/alertaSwal`);

function crearPlantillaScript(){
    const nombrePlantilla = document.getElementById('nombrePlantilla');
    const botonGuardarPlantilla = document.getElementById('botonGuardarPlantilla');

    botonGuardarPlantilla.addEventListener('click', async () => {
        const contenidoPlantilla = obtenerJsonPlantillaDesdeDOM();
        const respuesta = await crearPlantilla(nombrePlantilla.value, contenidoPlantilla);
        if (respuesta.ok) {
            mostrarAlerta('Correcto', 'Plantilla guardada correctamente', 'success');
            vaciarSelectorPlantillas
            await consultarPlantillasScript(); // Actualizar el selector de plantillas
        } else {
            mostrarAlerta('Error', 'Error al guardar la plantilla: ' + respuesta.error, 'error');
        }
    });
}

crearPlantillaScript();



function obtenerJsonPlantillaDesdeDOM(){
    const componentes = [];

    const contenedorComponentes = document.getElementById('contenedorElementos')

    console.log('contenedor componentes:', contenedorComponentes);
    Array.from(contenedorComponentes.children).forEach(componente => {
        console.log(componente);
        if(componente.classList.contains('tarjeta-texto')){
            componentes.push({
                componente: "texto",
                tipo: componente.querySelector('.tipo-texto').value,
                contenido: componente.querySelector('.area-escritura').value,
                alineamiento: componente.querySelector('.icono-align').classList[1]
            });

        } else if(componente.classList.contains('tarjeta-grafica')){

            componentes.push({
                componente: "grafica",
                nombre : componente.querySelector('.titulo-grafica').value,
                tipo : componente.querySelector('.tipo-grafica').value,
                tractor : componente.querySelector('.tractor-grafica').value,
                color: componente.querySelector('#color-entrada').value,
                parametro : componente.dataset.parametroActual,
                filtro : componente.dataset.filtroActual,
                formula : componente.dataset.formulaActual,
            })
            
        }
    });

    return JSON.stringify(componentes);
}