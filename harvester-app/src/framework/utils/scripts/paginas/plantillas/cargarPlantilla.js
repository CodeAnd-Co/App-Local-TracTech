const { consultarPlantilla } = require(`${rutaBase}src/backend/casosUso/plantillas/consultarPlantilla.js`);
// const { consultarPlantillas } = require(`${rutaBase}src/framework/utils/scripts/paginas/plantillas/consultarPlantillas.js`);
// const { configurarTexto } = require(`${rutaBase}src/framework/utils/scripts/paginas/analisis/agregarTexto.js`);
// const { agregarGrafica } = require(`${rutaBase}src/framework/utils/scripts/paginas/analisis/agregarGrafica.js`);

// const { configurarTexto, configurarGrafica } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/botonesAgregar.js`);

function cargarPlantillaScript(){
    const nombrePlantilla = document.getElementById('selectorPlantilla');
    const botonCargarPlantilla = document.getElementById('botonCargarPlantilla');

    botonCargarPlantilla.addEventListener('click', async () => {
        const respuesta = await consultarPlantilla(nombrePlantilla.value);
        console.log('plantilla cargada:', respuesta);
        const contenido = JSON.parse(respuesta.datos.contenido);
        console.log('contenido:', contenido);
        const idContenedor = 'contenedorElementos';
        const idContenedorPrevisualizacion = 'contenedor-elementos-previsualizacion';
        await cargarPlantillaDesdeJSON(contenido, idContenedor, idContenedorPrevisualizacion);

        if (respuesta.ok) {
            mostrarAlerta('Correcto', 'Plantilla cargada correctamente', 'success');
        } else {
            mostrarAlerta('Error', 'Error al cargar la plantilla: ' + respuesta.error, 'error');
        }
    });
}


async function cargarPlantillaDesdeJSON(json, contenedorId, idContenedorPrevisualizacion) {
    try {
        const componentes = json;
        const contenedor = document.querySelector(`#${contenedorId}`);
        
        // Limpiar el contenedor
        contenedor.innerHTML = '';

        // Iterar sobre cada componente
        for (const componente of componentes) {
            if (componente.componente == "texto") {
                console.log('es un texto!')
                // Crear tarjeta de texto
                configurarTexto(contenedorId, idContenedorPrevisualizacion);
                
                const tarjetaTexto = contenedor.querySelector(`.tarjeta-texto:last-child`);
                
                if (tarjetaTexto) {
                    // Configurar propiedades
                    const tipoTexto = tarjetaTexto.querySelector('.tipo-texto');
                    const areaEscritura = tarjetaTexto.querySelector('.area-escritura');
                    const iconoAlign = tarjetaTexto.querySelector('.icono-align');
                    
                    if (tipoTexto) tipoTexto.value = componente.tipo;
                    if (areaEscritura) areaEscritura.value = componente.contenido;
                    
                    // Configurar alineamiento
                    if (iconoAlign) {
                        iconoAlign.classList.remove('align-left', 'align-center', 'align-right');
                        iconoAlign.classList.add(componente.alineamiento);
                    }
                }

                // console.log('texto configurado')
                // tarjeta = contenedor.querySelector('.tarjeta-texto#1').querySelector('tipo-texto')
                // console.log('tarjeta:', tarjeta);
                // Configurar propiedades
                // console.log('tipo: ', tarjetaTexto.querySelector('.tipo-texto')) //.value = componente.tipo;
                // console.log(tarjetaTexto.querySelector('.area-escritura')) //.value = componente.contenido;
                
                // Configurar alineamiento
                // const iconoAlign = tarjetaTexto.querySelector('.icono-align');
                // iconoAlign.classList.remove('align-left', 'align-center', 'align-right');
                // iconoAlign.classList.add(componente.alineamiento);
                
            } else if (componente.componente == "grafica") {~
                console.log('es una grafica!')
                // Crear tarjeta de gráfica
                configurarGrafica(contenedorId, idContenedorPrevisualizacion);
                
                const tarjetaGrafica = contenedor.querySelector(`.tarjeta-grafica:last-child`);
                
                if (tarjetaGrafica) {
                    // Configurar propiedades
                    const elementos = {
                        titulo: tarjetaGrafica.querySelector('.titulo-grafica'),
                        tipo: tarjetaGrafica.querySelector('.tipo-grafica'),
                        tractor: tarjetaGrafica.querySelector('.tractor-grafica'),
                        color: tarjetaGrafica.querySelector('#color-entrada')
                    };
                    
                    if (elementos.titulo) elementos.titulo.value = componente.nombre;
                    if (elementos.tipo) elementos.tipo.value = componente.tipo;
                    if (elementos.tractor) elementos.tractor.value = componente.tractor;
                    if (elementos.color) elementos.color.value = componente.color;
                }

                // Configurar propiedades
                // tarjetaGrafica.querySelector('.titulo-grafica').value = componente.nombre;
                // tarjetaGrafica.querySelector('.tipo-grafica').value = componente.tipo;
                // tarjetaGrafica.querySelector('.tractor-grafica').value = componente.tractor;
                // tarjetaGrafica.querySelector('#color-entrada').value = componente.color;
                
                // Si tienes más propiedades específicas de la gráfica, configúralas aquí
            }
        }
    } catch (error) {
        console.error('Error al cargar la plantilla:', error);
        mostrarAlerta('Error', 'No se pudo cargar la plantilla correctamente', 'error');
    }
}

cargarPlantillaScript();

