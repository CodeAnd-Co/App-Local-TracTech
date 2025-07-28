const { consultarPlantillas } = require(`${rutaBase}src/backend/casosUso/plantillas/consultarPlantillas.js`);

function vaciarSelectorPlantillas() {
    const selectorPlantilla = document.getElementById('selectorPlantilla');
    selectorPlantilla.innerHTML = ''; // Limpiar el contenido del selector
}


async function consultarPlantillasScript(){
    const plantillas = await consultarPlantillas();
    const selectorPlantilla = document.getElementById('selectorPlantilla');
    vaciarSelectorPlantillas(); // Limpiar el selector antes de agregar nuevas opciones
    plantillas.datos.forEach(plantilla => {
        const option = document.createElement('option');
        option.value = plantilla.titulo;
        option.textContent = plantilla.titulo;
        selectorPlantilla.appendChild(option);
    })
}

consultarPlantillasScript();

// module.exports = {
//     consultarPlantillas,
// };