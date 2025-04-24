function inicializarModuloPlantillas() {
    const botonOpciones = document.querySelector(".boton-opciones");
    const { plantillas } = require("../../backend/domain/plantillasAPI/plantillasAPI.js");
    console.log(botonOpciones);

    const contenedor = document.getElementById("contenedorId");

    botonOpciones.addEventListener("click", async () => {
        try {
            const respuesta = await plantillas();
            for (let res in respuesta.plantillas){
                const tarjetaTexto = document.createElement('div');
                tarjetaTexto.classList.add('plantilla');
              
                tarjetaTexto.innerHTML = `
                <button class="boton-opciones" dato-id="${respuesta.plantillas[res].idPlantillaReporte}">
                    <img class="icono-opciones" src="../utils/iconos/TresPuntos.svg" />
                    
                </button>
                <scroll-container>
                  ${respuesta.plantillas[res].Datos}
                </scroll-container>
                <div class="nombre-plantilla">
                    <div class="nombre-de-plantilla">${respuesta.plantillas[res].Nombre}</div>
                </div>
                `;
              
                contenedor.appendChild(tarjetaTexto);

                alert(respuesta.plantillas[res].Nombre)
            }

            alert(respuesta.plantillas[0].Nombre)

            console.log(respuesta)

        } catch (error) {
                console.error("Error al conectar con el backend:", error);
                alert("No se pudo conectar con el servidor desde moduloPlantillas.js.");
        }
    })
}

window.inicializarModuloPlantillas = inicializarModuloPlantillas;
