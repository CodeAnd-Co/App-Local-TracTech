const { consultarPlantilla } = require(`${rutaBase}src/backend/casosUso/plantillas/consultarPlantilla.js`);
// const { consultarPlantillas } = require(`${rutaBase}src/framework/utils/scripts/paginas/plantillas/consultarPlantillas.js`);
// const { configurarTexto } = require(`${rutaBase}src/framework/utils/scripts/paginas/analisis/agregarTexto.js`);
// const { agregarGrafica } = require(`${rutaBase}src/framework/utils/scripts/paginas/analisis/agregarGrafica.js`);
const { actualizarTexto } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/agregarTexto.js`);
const { modificarTipoGrafica, modificarColor } = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/agregarGrafica.js`);
const { ElementoNuevo, Contenedores } = require(`${rutaBase}/src/backend/data/analisisModelos/elementoReporte.js`);
const { aplicarFormula } = require(`${rutaBase}/src/backend/casosUso/formulas/aplicarFormula.js`);
const { filtrarDatos } = require(`${rutaBase}/src/backend/casosUso/formulas/filtrarDatos.js`);
const Chart = require(`${rutaBase}/node_modules/chart.js/auto`);

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
        const contenedorPrevisualizacion = document.querySelector(`#${idContenedorPrevisualizacion}`);
        
        // Limpiar el contenedor
        contenedor.innerHTML = '';
        contenedorPrevisualizacion.innerHTML = '';

        // Iterar sobre cada componente
        for (const componente of componentes) {
            if (componente.componente == "texto") {
                console.log('es un texto!')
                // Crear tarjeta de texto
                configurarTexto(contenedorId, idContenedorPrevisualizacion);
                
                const tarjetaTexto = contenedor.querySelector(`.tarjeta-texto:last-child`);
                const previsualizacionTexto = contenedorPrevisualizacion.querySelector(`.previsualizacion-texto.preview-titulo:last-child`);
                
                if (tarjetaTexto) {
                    // Configurar propiedades
                    const tipoTexto = tarjetaTexto.querySelector('.tipo-texto');
                    const areaEscritura = tarjetaTexto.querySelector('.area-escritura');
                    const iconoAlign = tarjetaTexto.querySelector('.icono-align');
                    
                    if (tipoTexto) { 
                        tipoTexto.value = componente.tipo;
                        previsualizacionTexto.classList.remove('preview-titulo', 'preview-subtitulo', 'preview-contenido');
                        previsualizacionTexto.classList.add(`preview-${componente.tipo}`);
                    };

                    if (areaEscritura) areaEscritura.value = componente.contenido;
                    
                    // Configurar alineamiento
                    if (iconoAlign) {
                        iconoAlign.classList.remove('align-left', 'align-center', 'align-right');
                        iconoAlign.classList.add(componente.alineamiento);
                        const alineaciones = ['left', 'center', 'right'];
                        previsualizacionTexto.alignIndex = (previsualizacionTexto.alignIndex + 1) % alineaciones.length;
                        const alineado = alineaciones[previsualizacionTexto.alignIndex];
                        previsualizacionTexto.style.textAlign = alineado;
                        iconoAlign.className = `icono-align align-${alineado}`;
                    }
                    
                    // const vistaPrevia = tarjetaTexto.querySelector('.previsualizacion-texto.preview-titulo');
                    console.log('vista previa:', previsualizacionTexto);
                    actualizarTexto(previsualizacionTexto, areaEscritura);
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
                
            } else if (componente.componente == "grafica") {
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
                    
                    const previsualizacionGrafica = contenedorPrevisualizacion.querySelector(`.previsualizacion-grafica:last-child`);

                    empaquetador = {value: componente.tipo} //estos empaquetamientos sirven para que al usar las funciones piense que le estas pasando un componente de html, ya que dentro de la función solo usa el componente para sacarle el valor.
                    empaquetador2 = {value: componente.color}

                    if (elementos.titulo) elementos.titulo.value = componente.nombre;

                    if (elementos.tipo){
                        elementos.tipo.value = componente.tipo;
                        modificarTipoGrafica(previsualizacionGrafica, empaquetador, componente.nombre);
                    }

                    if (elementos.color) {
                        elementos.color.value = componente.color;
                        modificarColor(empaquetador2, previsualizacionGrafica, 0)
                    }
                    if (elementos.tractor) elementos.tractor.value = componente.tractor;
                    const tractorSeleccionado = componente.tractor;

                    if(componente.parametro && !componente.formula) {

                    }
                    if (componente.formula){
                        if(componente.filtro){
                            const datosFiltrados = filtrarDatos(componente.filtro, JSON.parse(localStorage.getItem('datosFiltradosExcel')), tractorSeleccionado);
                            for(const formula of JSON.parse(localStorage.formulasDisponibles)){
                                if (formula.Nombre == componente.formula)
                                {
                                    const resultadoFormula = aplicarFormula(formula.Nombre, formula.Datos, tractorSeleccionado, datosFiltrados.resultados);
                                    const canvas = previsualizacionGrafica.querySelector('canvas');
                        
                                    const contexto = canvas.getContext('2d');
                                    const graficaExistente = Chart.getChart(contexto);
                        
                                    if (graficaExistente && resultadoFormula.resultados) {
                                        const resultados = resultadoFormula.resultados;
                                        const tipoGrafica = graficaExistente.config.type;
                            
                                        // Usar el procesamiento universal
                                        const datosRebuild = procesarDatosUniversal(resultados, tipoGrafica, formula.Nombre);
                            
                                        // Actualizar la gráfica
                                        graficaExistente.options.plugins.title.text = nombreFormula;
                                        graficaExistente.data.labels = datosRebuild.labels;
                                        graficaExistente.data.datasets[0].data = datosRebuild.valores;
                            
                                        // CORRECCIÓN: Actualizar también la etiqueta del dataset
                                        graficaExistente.data.datasets[0].label = nombreFormula;
                            
                                        graficaExistente.update();
                                    }
                            }
                        }
                        
                    }
                }

            }
        }
    }
    } catch (error) {
        console.error('Error al cargar la plantilla:', error);
        mostrarAlerta('Error', 'No se pudo cargar la plantilla correctamente', 'error');
    }
}

cargarPlantillaScript();

