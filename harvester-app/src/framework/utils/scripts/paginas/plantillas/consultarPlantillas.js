const { consultarPlantillas } = require(`${rutaBase}src/backend/casosUso/plantillas/consultarPlantillas.js`);

async function setup(){
    const plantillas = await consultarPlantillas();
    const selectorPlantilla = document.getElementById('selectorPlantilla');
    plantillas.datos.forEach(plantilla => {
        const option = document.createElement('option');
        option.value = plantilla.titulo;
        option.textContent = plantilla.titulo;
        selectorPlantilla.appendChild(option);
    })
}

setup();