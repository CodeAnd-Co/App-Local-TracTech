function inicializarModuloPlantillas() {
    const botonOpciones = document.querySelector(".boton-opciones");
    const { plantillas } = require("../../backend/domain/plantillasAPI/plantillasAPI.js");
    console.log(botonOpciones);

    botonOpciones.addEventListener("click", async () => {
        try {
            const respuesta = await plantillas();
            alert(respuesta);
            console.log(respuesta)
        } catch (error) {
                console.error("Error al conectar con el backend:", error);
                alert("No se pudo conectar con el servidor desde moduloPlantillas.js.");
        }
    })
}

window.inicializarModuloPlantillas = inicializarModuloPlantillas;
