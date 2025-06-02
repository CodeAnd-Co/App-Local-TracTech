// RF13 Usuario consulta datos disponibles - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF13
// RF14 Usuario selecciona datos a comparar - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF14

const { cargarDatosExcel } = require(`${rutaBase}/src/backend/servicios/cargarDatosExcel.js`);
const { seleccionaDatosAComparar } = require(`${rutaBase}/src/backend/casosUso/excel/seleccionaDatosAComparar.js`);
const { mostrarAlerta } = require(`${rutaBase}/src/framework/vistas/includes/componentes/moleculas/alertaSwal/alertaSwal`);


/* eslint-disable no-undef*/

// VARIABLES GLOBALES SIMPLIFICADAS
let hojaSeleccionada = null; // Solo una hoja a la vez
let columnasSeleccionadas = []; // Array simple de nombres de columnas

inicializarModuloTractores();

/**
 * Inicializa el módulo de tractores configurando los elementos del DOM y 
 * mostrando los datos cargados desde el almacenamiento local.
 * 
 * @function inicializarModuloTractores
 * @returns {void}
*/
function inicializarModuloTractores() {
    // Actualizar topbar directamente
    if (window.actualizarBarraSuperior) {
        window.actualizarBarraSuperior('tractores');
    }
    const datosExcel = cargarDatosExcel();
    
    iniciarDistribuidores(datosExcel);
    iniciarTractores(datosExcel);
    busquedaTractores();
    botonesFiltrosTractores()
    botonReporte(datosExcel);
}

/**
 * Inicia la lista de distribuidores en el DOM
 * utilizando los datos cargados desde el Excel
 * 
 * @function iniciarDistribuidores
 * @param {object} datosExcel - Objeto que contiene las hojas del excel cargado
 * @returns {void}
 */
function iniciarDistribuidores(datosExcel) {
    const distribuidorContenedor = document.querySelector('.distribuidor');
    const distribuidoresContenedor = document.querySelector('.distribuidores-contenido');
    distribuidorContenedor.innerHTML = '';
    distribuidorContenedor.style.visibility = 'hidden';
    distribuidoresContenedor.innerHTML = '';

    const hojaExcel = datosExcel.hojas.Distribuidor;

    if (!Array.isArray(hojaExcel) || hojaExcel.length === 0) {
        mostrarAlerta('Ocurrió un problema', 'No se encontraron distribuidores.', 'warning');
        return;
    }

    distribuidorContenedor.style.visibility = 'visible';

    hojaExcel.forEach(fila => {
        const nombreDistribuidor = fila.distribuidor || fila.nombre || fila.nombreDistribuidor;
        if (!nombreDistribuidor) {
            return;
        }
        const distribuidorDiv = crearElementoDistribuidor(nombreDistribuidor)
        distribuidoresContenedor.appendChild(distribuidorDiv);
    });
}

/**
 * Crea un elemento que contiene el nombre del distribuidor
 * 
 * @function crearElementoDistribuidor
 * @param {String} nombreDistribuidor
 * @returns {HTMLElement}
 */
function crearElementoDistribuidor(nombreDistribuidor) {
    const distribuidorDiv = document.createElement('div');
    distribuidorDiv.className = 'rancho';

    // Crear nombre del distribuidor
    const textoDistribuidor = document.createElement('div');
    textoDistribuidor.className = 'rancho-texto';
    textoDistribuidor.textContent = nombreDistribuidor;

    const casillaVerificacion = document.createElement('img');
    casillaVerificacion.className = 'check-box';
    casillaVerificacion.src = `${rutaBase}src/framework/utils/iconos/check_box_outline_blank.svg`;

    // Añadir elementos
    distribuidorDiv.appendChild(nombreDistribuidorDiv);
    distribuidorDiv.appendChild(casillaVerificacion);
    return distribuidorDiv;
}

/**
 * Inicia la lista de tractores en el DOM y permite seleccion
 * 
 * @function inicializarTractores 
 * @param {object} datosExcel - Objeto que contiene las hojas del Excel cargado.
 * @returns {void}
 */
function iniciarTractores(datosExcel) {
    const tractoresContenedor = document.querySelector('.tractores-contenido');
    tractoresContenedor.innerHTML = '';
    const nombresTractores = Object.keys(datosExcel.hojas);

    if (nombresTractores.length === 0) {
        mostrarMensaje(tractoresContenedor, 'No se encontraron tractores')
        return;
    } 

    // Iterar sobre los tractores asumiendo que cada hoja es un tractor
    nombresTractores.forEach(tractorNombre => {
        const tractorDiv = crearElementoTractor(tractorNombre, datosExcel);
        tractoresContenedor.appendChild(tractorDiv);
    })
}

/**
 * Crea un elemento que contiene el nombre del tractor
 * 
 * @function crearElementoTractor 
 * @param {String} nombreTractor
 * @param {object} datosExcel - Objeto que contiene las hojas del Excel cargado.
 * @returns {HTMLElement}
 */
function crearElementoTractor(nombreTractor, datosExcel) {
    const tractorDiv = document.createElement('div');
    tractorDiv.className = 'rancho';

    const tractorTextoDiv = document.createElement('div');
    tractorTextoDiv.className = 'caja-rancho-texto';

    const textoNombreTractorDiv = document.createElement('div');
    textoNombreTractorDiv.className = 'rancho-texto';
    textoNombreTractorDiv.textContent = nombreTractor; 

    tractorTextoDiv.appendChild(textoNombreTractorDiv);
    tractorDiv.appendChild(tractorTextoDiv);

    const casillaVerificacion = document.createElement('img');
    casillaVerificacion.className = 'check-box';
    casillaVerificacion.src = `${rutaBase}src/framework/utils/iconos/check_box_outline_blank.svg`;
    tractorDiv.appendChild(casillaVerificacion);
    
    // Solo la casilla de verificación cambia el estado de seleccionado
    casillaVerificacion.addEventListener('click', () => cambiarSeleccionTractor(nombreTractor, casillaVerificacion));

    // El texto del tractor solo muestra las columnas
    tractorTextoDiv.addEventListener('click', () => {
        cambiarSeleccionVisualUnica(tractorDiv);
        manejarClickTractor(nombreTractor, datosExcel);
    });

    return tractorDiv;
}

/**
 * Cambia la seleccion de un tractor - versión ultra simple
 * 
 * @function cambiarSeleccionTractor 
 * @param {string} nombreTractor
 * @param {HTMLElement} casillaVerificacion
 * @returns {void}
 */
function cambiarSeleccionTractor(nombreTractor, casillaVerificacion) {
    console.log(`Click en tractor: ${nombreTractor}`);
    
    // Verificar si ya está en el arreglo
    const indice = tractoresParaAnalisis.indexOf(nombreTractor);
    
    if (indice === -1) {
        // Si NO está, lo agregamos
        tractoresParaAnalisis.push(nombreTractor);
        console.log(`${nombreTractor} AGREGADO. Arreglo actual:`, tractoresParaAnalisis);
    } else {
        // Si YA está, lo sacamos
        tractoresParaAnalisis.splice(indice, 1);
        console.log(`${nombreTractor} ELIMINADO. Arreglo actual:`, tractoresParaAnalisis);
    }
    
    // Actualizar el ícono
    cambiarIconoMarcadoADesmarcado(casillaVerificacion);
    
    // Guardar en localStorage para el análisis
    localStorage.setItem('tractoresParaAnalisis', JSON.stringify(tractoresParaAnalisis));
    console.log('Guardado en localStorage:', tractoresParaAnalisis);
}

/**
 * Procesa todos los tractores seleccionados y guarda los datos filtrados
 */
function procesarYGuardarDatos() {
    const datosExcel = cargarDatosExcel();
    const nuevoJSON = { hojas: {} };
    
    // Recorrer todos los tractores seleccionados
    Object.keys(tractoresSeleccionados).forEach(nombreTractor => {
        const config = tractoresSeleccionados[nombreTractor];
        
        // Solo procesar si está seleccionado
        if (config.seleccionado) {
            const datosHoja = datosExcel.hojas[nombreTractor];
            
            if (datosHoja && Array.isArray(datosHoja) && datosHoja.length > 0) {
                // Si no hay columnas específicas, usar todas
                if (config.columnas.length === 0) {
                    console.log(`${nombreTractor}: Usando todas las columnas`);
                    nuevoJSON.hojas[nombreTractor] = datosHoja; // Toda la hoja
                } else {
                    console.log(`${nombreTractor}: Usando columnas específicas:`, config.columnas);
                    // Filtrar solo las columnas seleccionadas
                    const encabezados = datosHoja[0];
                    const indices = config.columnas.map(col => encabezados.indexOf(col)).filter(i => i !== -1);
                    
                    if (indices.length > 0) {
                        const hojaFiltrada = datosHoja.map(fila => 
                            indices.map(indice => fila[indice])
                        );
                        nuevoJSON.hojas[nombreTractor] = hojaFiltrada;
                    }
                }
            }
        }
    });
    
    // Guardar en localStorage
    localStorage.setItem('tractoresSeleccionados', JSON.stringify(tractoresSeleccionados));
    localStorage.setItem('datosFiltradosExcel', JSON.stringify(nuevoJSON));
    
    console.log('Datos procesados y guardados:', nuevoJSON);
}

/**
 * Mostrar u ocultar las columnas de una hoja perteneciente a un tractor
 * 
 * @function manejarClickTractor
 * @param {string} nombreTractor
 * @param {object} datosExcel - objeto con las hojas del excel
 * @returns {void}
 */
function manejarClickTractor(tractorNombre, datosExcel) {
    const contenedor = document.getElementById('contenedorColumnas');

    // Si ya se muestran las columnas de una hoja, la ocultamos
    if (contenedor.dataset.tractorActual === tractorNombre) {
        contenedor.style.display = 'none';
        contenedor.dataset.tractorActual = '';
        
        // Limpiar selección
        hojaSeleccionada = null;
        columnasSeleccionadas = [];
        localStorage.removeItem('hojaSeleccionada');
        localStorage.removeItem('columnasSeleccionadas');
    } else {
        // Seleccionar nueva hoja
        hojaSeleccionada = tractorNombre;
        columnasSeleccionadas = []; // Reset columnas al cambiar de hoja
        
        // Guardar en localStorage
        localStorage.setItem('hojaSeleccionada', hojaSeleccionada);
        localStorage.setItem('columnasSeleccionadas', JSON.stringify(columnasSeleccionadas));
        
        console.log(`Hoja seleccionada: ${hojaSeleccionada}`);
        
        mostrarColumnasTractor(tractorNombre, datosExcel);
        contenedor.style.display = 'block';
        contenedor.dataset.tractorActual = tractorNombre;
    }
}

/**
 * Muestra las columnas de un tractor específico en el contenedor de columnas
 * Permite la seleccion individual
 * 
 * @function mostrarColumnasTractor
 * @param {string} nombreTractor
 * @param {object} datosExcel - objeto con las hojas del excel
 * @returns {void}
 */
function mostrarColumnasTractor(nombreTractor, datosExcel) {
    const columnasContenedor = document.querySelector('.columnas-contenido');
    columnasContenedor.innerHTML = '';
    const columnaContenedor = document.getElementById('contenedorColumnas');
    columnaContenedor.style.display = 'block';

    const datosHoja = datosExcel.hojas[nombreTractor];
    if (!Array.isArray(datosHoja) || datosHoja.length === 0) {
        mostrarMensaje(columnasContenedor, 'No hay datos en esta hoja');
        return;
    }

    // Obtener las columnas del primer objeto
    const columnas = obtenerColumnas(datosHoja);
    if (!columnas.length) {
        mostrarMensaje(columnasContenedor, 'Formato de datos no reconocido')
        return;
    }
    
    columnas.forEach(nombreColumna => {
        const columnaDiv = crearElementoColumna(nombreTractor, nombreColumna);
        columnasContenedor.appendChild(columnaDiv);
    });
}

/**
 * Obtiene las columnas dentro de una hoja del excel parseado
 * 
 * @function obtenerColumnas
 * @param {string} hoja
 * @returns {Array}
 */
function obtenerColumnas(hoja) {
    if (Array.isArray(hoja[0])) {
        return hoja[0]; // Usar los valores como nombres de columna
    } 
    if (typeof hoja[0] === 'object') {
        return Object.keys(hoja[0]); // Usar las claves
    }
    return [];
}

/**
 * Crea un elemento que contiene el nombre de la columna dentro de una hoja
 * Permite la selección de una columna y agregarla al arreglo global
 * 
 * @function crearElementoColumna
 * @param {string} nombreTractor
 * @param {string} nombreColumna
 * @returns {HTMLElement}
 */
function crearElementoColumna(nombreTractor, nombreColumna) {
    const columnaDiv = document.createElement('div');
    columnaDiv.className = 'columna-nombre';

    const nombreColumnaDiv = document.createElement('div');
    nombreColumnaDiv.className = 'rancho-texto';
    nombreColumnaDiv.textContent = nombreColumna;

    const casillaVerificacion = document.createElement('img');
    casillaVerificacion.className = 'check-box';

    // Verificar si la columna ya está seleccionada
    if (columnasSeleccionadas.includes(nombreColumna)) {
        casillaVerificacion.src = `${rutaBase}src/framework/utils/iconos/check_box.svg`; // Marcado
    } else {
        casillaVerificacion.src = `${rutaBase}src/framework/utils/iconos/check_box_outline_blank.svg`; // Desmarcado
    }

    // Agregar evento para alternar la selección de la columna
    columnaDiv.addEventListener('click', () => {
        seleccionarColumna(nombreColumna, casillaVerificacion);
    });

    columnaDiv.appendChild(nombreColumnaDiv);
    columnaDiv.appendChild(casillaVerificacion);
    return columnaDiv;
}

/**
 * Selecciona o deselecciona una columna - versión ultra simple
 */
function seleccionarColumna(nombreColumna, casillaVerificacion) {
    console.log(`Click en columna: ${nombreColumna}`);
    
    const indice = columnasSeleccionadas.indexOf(nombreColumna);
    
    if (indice === -1) {
        // Agregar columna
        columnasSeleccionadas.push(nombreColumna);
        console.log(`Columna ${nombreColumna} AGREGADA. Columnas actuales:`, columnasSeleccionadas);
    } else {
        // Quitar columna
        columnasSeleccionadas.splice(indice, 1);
        console.log(`Columna ${nombreColumna} ELIMINADA. Columnas actuales:`, columnasSeleccionadas);
    }
    
    // Actualizar ícono
    cambiarIconoMarcadoADesmarcado(casillaVerificacion);
    
    // Guardar en localStorage
    localStorage.setItem('columnasSeleccionadas', JSON.stringify(columnasSeleccionadas));
    console.log('Columnas guardadas en localStorage:', columnasSeleccionadas);
}

/**
 * Botón de reporte ultra simple
 */
async function botonReporte(datosExcel) {
    const botonAnalisis = document.querySelector('.primario');
    botonAnalisis.addEventListener('click', async () => {
        
        // Cargar datos desde localStorage
        const hoja = localStorage.getItem('hojaSeleccionada');
        const columnas = JSON.parse(localStorage.getItem('columnasSeleccionadas') || '[]');
        
        if (!hoja) {
            mostrarAlerta('Error', 'No hay hoja seleccionada. Haz clic en un tractor para seleccionarlo.', 'error');
            return;
        }
        
        console.log('Hoja seleccionada:', hoja);
        console.log('Columnas seleccionadas:', columnas);
        
        // Crear objeto con los datos para análisis
        const datosHoja = datosExcel.hojas[hoja];
        let datosParaAnalisis = { hojas: {} };
        
        if (columnas.length === 0) {
            // Si no hay columnas específicas, usar toda la hoja
            console.log('No hay columnas específicas, usando toda la hoja');
            datosParaAnalisis.hojas[hoja] = datosHoja;
        } else {
            // Filtrar solo las columnas seleccionadas
            console.log('Filtrando columnas específicas:', columnas);
            const encabezados = datosHoja[0];
            const indices = columnas.map(col => encabezados.indexOf(col)).filter(i => i !== -1);
            
            if (indices.length > 0) {
                const hojaFiltrada = datosHoja.map(fila => 
                    indices.map(indice => fila[indice])
                );
                datosParaAnalisis.hojas[hoja] = hojaFiltrada;
            } else {
                // Si no se encontraron columnas válidas, usar toda la hoja
                datosParaAnalisis.hojas[hoja] = datosHoja;
            }
        }
        
        // Guardar los datos para el análisis
        localStorage.setItem('datosFiltradosExcel', JSON.stringify(datosParaAnalisis));
        
        console.log('Navegando a análisis con datos:', datosParaAnalisis);
        
        // Navegar
        const rutaTractores = `${rutaBase}src/framework/vistas/paginas/analisis/generarReporte.ejs`;
        var vista = await ipcRenderer.invoke('precargar-ejs', rutaTractores, { Seccion: 'Análisis', Icono : 'GraficaBarras', permisos});
        window.location.href = vista;
        localStorage.setItem('seccion-activa', 'analisis');
    });
}

/**
 * Configura el campo de búsqueda para filtrar los tractores por nombre
 * 
 * Al escribir, se compara el texto ingresado con el contenido de cada distribuidor,
 * ocultando aquellos que no coincidan.
 * 
 * @function busquedaTractores
 * @returns {void}
 */
function busquedaTractores() {
    const entradaBusqueda = document.getElementById('buscadorTractor');
    const contenedorTractores = document.querySelector('.tractores-contenido');

    // Devolver la lista completa si no se escribe nada o no hay elementos
    if (!entradaBusqueda || !contenedorTractores) {
        return;
    }
    entradaBusqueda.addEventListener('input', aplicarFiltrosCombinados);
}

/**
 * Configura los botones para filtrar los tractores por telemetría
 * Cambia el ícono al hacer click
 * 
 * @function botonesFiltrosTractores
 * @returns {void}
 */
function botonesFiltrosTractores() {
    const filtroConCheck = document.getElementById('botonFiltroCon');
    // Evento para mostrar sólo los tractores con telemetría
    filtroConCheck.addEventListener('click', () => {
        const caja = filtroConCheck.querySelector('img');
        cambiarIconoMarcadoADesmarcado(caja)
        aplicarFiltrosCombinados()
    });
    
    const filtroSinCheck = document.getElementById('botonFiltroSin');
    // Evento para mostrar sólo los tractores sin telemetría
    filtroSinCheck.addEventListener('click', () => {
        const caja = filtroSinCheck.querySelector('img');
        cambiarIconoMarcadoADesmarcado(caja)
        aplicarFiltrosCombinados()
    });
}

/**
 * 
 * Aplica filtros combinados de búsqueda por nombre y estado del GPS a los distribuidores mostrados en el DOM.
 * 
 * Esta función obtiene los datos de un archivo de Excel, filtra los distribuidores en pantalla según:
 * - El texto ingresado en el campo de búsqueda (por nombre del distribuidor).
 * - Los filtros visuales activados para distribuidores "con GPS" o "sin GPS".
 * 
 * Para determinar si un distribuidor tiene GPS, se revisan las primeras filas de sus datos en Excel.
 * Se muestra u oculta cada distribuidor en la interfaz según si cumple con los filtros.
 * 
 * @function aplicarFiltrosCombinados
 * @returns {void} 
 */
function aplicarFiltrosCombinados() {
    const datosExcel = cargarDatosExcel();
    if (!datosExcel) return;

    const entradaBusqueda = document.getElementById('buscadorTractor');
    const filtroTexto = entradaBusqueda?.value.toLowerCase() || '';

    const mostrarCon = document.querySelector('#botonFiltroCon img')?.src.includes('check_box.svg');
    const mostrarSin = document.querySelector('#botonFiltroSin img')?.src.includes('check_box.svg');

    const contenedor = document.querySelector('.tractores-contenido');
    if (!contenedor) return;

    // Obtener todos los elementos HTML que representan distribuidores
    const distribuidores = contenedor.querySelectorAll('.rancho');

    distribuidores.forEach(distribuidorDiv => {
        // Obtener el nombre del distribuidor desde su texto
        const nombreDistribuidor = distribuidorDiv.querySelector('.rancho-texto')?.textContent || '';
        const coincideBusqueda = nombreDistribuidor.toLowerCase().includes(filtroTexto);

        // Obtener los datos del distribuidor desde el Excel
        const datosDistribuidor = datosExcel.hojas[nombreDistribuidor];
        let tieneGPS = false;

        // Revisar si hay datos y más de una fila
        if (datosDistribuidor && datosDistribuidor.length > 1) {
            const headers = datosDistribuidor[0];
            const indiceGPS = headers.indexOf("GPS");

            // Se evaula si existe la columna GPS
            if (indiceGPS !== -1) {
                // Máximo cinco filas después del encabezado
                const filasValidas = datosDistribuidor.slice(1, 6);
                tieneGPS = filasValidas.some((fila) => {
                    const valorGPS = fila[indiceGPS];
                    return valorGPS && valorGPS.toUpperCase() === 'OK';
                });
            }
        }

        // Determinar si el distribuidor cumple con los filtros de GPS activos
        const cumpleFiltro
            = (mostrarCon && tieneGPS)
            || (mostrarSin && !tieneGPS)
            || (!mostrarCon && !mostrarSin); // Si ambos filtros están apagados, mostrar todos

        // Muestra u oculta el distribuidor dependiendo de si pasa ambos filtros
        distribuidorDiv.style.display = coincideBusqueda && cumpleFiltro ? '' : 'none';
    });
}


/**
 * Cambia el ícono de marcado a desmarcado
 * 
 * @function cambiarIconoMarcadoADesmarcado
 * @param {HTMLElement} icono El elemento de imagen a actualizar
 * @returns {void}
 */
function cambiarIconoMarcadoADesmarcado(icono) {
    // Verificar si el icono actual es el de desmarcado
    if (icono.src.includes('check_box_outline_blank.svg')) {
        icono.src = `${rutaBase}src/framework/utils/iconos/check_box.svg`; // Cambiar a marcado
    } else {
        icono.src = `${rutaBase}src/framework/utils/iconos/check_box_outline_blank.svg`; // Cambiar a desmarcado
    }
}

/**
 * Alterna visualmente la selección de un bloque
 * 
 * @function cambiarSeleccionVisualUnica
 * @param {HTMLElement} contenedor - el div de un elemento al que se le hace click
 */
function cambiarSeleccionVisualUnica(contenedor) {
    const todosLosDiv = document.querySelectorAll('.tractores-contenido .rancho');
    const yaSeleccionado = contenedor.classList.contains('seleccionado');

    todosLosDiv.forEach(elemento => elemento.classList.remove('seleccionado'));

    if (!yaSeleccionado) {
        contenedor.classList.add('seleccionado');
    }

}
