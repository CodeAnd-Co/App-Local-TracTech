// RF13 Usuario consulta datos disponibles - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF13
// RF14 Usuario selecciona datos a comparar - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF14

let tractoresSeleccionados = {};
const { seleccionaDatosAComparar } = require('../../backend/casosUso/excel/seleccionaDatosAComparar.js');

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
    const datosExcel = cargarDatosDeExcel();
    if (!datosExcel) {
        console.warn('No hay datos disponibles para análisis');
    }
    iniciarDistribuidores(datosExcel);
    iniciarTractores(datosExcel);
    busquedaTractores();
    botonesFiltrosTractores()
    botonReporte(datosExcel);
}

/** 
 * Cargamos los datos de excel que se encuentran en localStorage
 * 
 * @function cargarDatosDeExcel
 * @returns {object|null} - objeto con las hojas de excel parseadas
*/
function cargarDatosDeExcel() {
    try {
        const datosExcelJSON = localStorage.getItem('datosExcel');
        if (!datosExcelJSON) {
            alert('No hay datos de Excel disponibles');
            return null;
        }
        const datosExcel = JSON.parse(datosExcelJSON);
        return datosExcel;
    } catch (error) {
        console.error('Error al cargar datos de Excel:', error);
        return null;
    }
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
        return console.warn('No se encontraron distribuidores');
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
    casillaVerificacion.src = '../utils/iconos/check_box_outline_blank.svg';

    // Añadir elementos
    distribuidorDiv.appendChild(nombreDistribuidorDiv);
    distribuidorDiv.appendChild(caja);
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
    casillaVerificacion.src = '../utils/iconos/check_box_outline_blank.svg';
    tractorDiv.appendChild(casillaVerificacion);
    
    casillaVerificacion.addEventListener('click', () => cambiarSeleccionTractor(nombreTractor, casillaVerificacion));
    tractorTextoDiv.addEventListener('click', () => {
        cambiarSeleccionVisualUnica(tractorDiv);
        manejarClickTractor(nombreTractor, datosExcel);
    });
    return tractorDiv;
}

/**
 * Cambia la seleccion de un tractor dentro del arreglo global tractoresSeleccionados
 * 
 * @function cambiarSeleccionTractor 
 * @param {string} nombreTractor
 * @param {HTMLElement} casillaVerificacion
 * @returns {void}
 */
function cambiarSeleccionTractor(nombreTractor, casillaVerificacion) {
    const estadoActual = tractoresSeleccionados[nombreTractor]?.seleccionado ?? false;
    const columnas = tractoresSeleccionados[nombreTractor]?.columnas ?? [];
    tractoresSeleccionados[nombreTractor] = {
        seleccionado: !estadoActual,
        columnas
    };
    cambiarIconoMarcadoADesmarcado(casillaVerificacion);
    console.log(tractoresSeleccionados);
}

/**
 * Muestra las colmunas de un tractor específico en el contenedor de columnas
 * Permite la seleccion individual
 * 
 * @function mostrarColumnasTractor
 * @param {string} nombreTractor
 * @param {object} datosExcel - objeto con als hojas del excel
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
    let columnas = obtenerColumnas(datosHoja);
    if (!columnas.length) {
        mostrarMensaje(columnasContenedor, 'Formato de datos no reconocido')
        return;
    }

    // Asegurarse de que el objeto para este tractor exista en tractoresSeleccionados
    if (!tractoresSeleccionados[nombreTractor]) {
        tractoresSeleccionados[nombreTractor] = { eleccionado: false, columnas: [] };
    }
    console.log(tractoresSeleccionados);
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
 * Permite la seleccion de una columna y agregarla al arreglo global
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
    casillaVerificacion.src = '../utils/iconos/check_box_outline_blank.svg';

    // Verificar si la columna ya está seleccionada
    if (tractoresSeleccionados[nombreTractor].columnas.includes(nombreColumna)) {
        casillaVerificacion.src = '../utils/iconos/check_box.svg';
    }
    columnaDiv.addEventListener('click', () => {
        seleccionarColumna(nombreTractor, nombreColumna, casillaVerificacion);
    });
    columnaDiv.appendChild(nombreColumnaDiv);
    columnaDiv.appendChild(casillaVerificacion);
    return columnaDiv;
}

/**
 * Selecciona o deselecciona una columna en el panel de columnas de un tractor.
 * Esta función actualiza la lista de columnas seleccionadas para el tractor específico,
 * y cambia el icono del checkbox de acuerdo con el estado de selección de la columna.
 * 
 * @function seleccionarColumna
 * @param {string} nombreTractor - El nombre del tractor cuya columna se va a seleccionar o deseleccionar.
 * @param {string} nombreColumna - El nombre de la columna que se desea seleccionar o deseleccionar.
 * @param {HTMLElement} caja - El elemento de imagen (checkbox) que refleja el estado de selección de la columna.
 * @returns {void}
 */
function seleccionarColumna(nombreTractor, nombreColumna, caja) {
    // Verificamos si el tractor está seleccionado
    if (!tractoresSeleccionados[nombreTractor]) {
        tractoresSeleccionados[nombreTractor] = {
            seleccionado: false, // El tractor no está seleccionado por defecto
            columnas: [] // No tiene columnas seleccionadas inicialmente
        };
    }

    // Verificamos si la columna ya está seleccionada
    const seleccion = tractoresSeleccionados[nombreTractor];
    const indice = seleccion.columnas.indexOf(nombreColumna);
    if (indice === -1) {
        // Si la columna no está seleccionada, la agregamos
        seleccion.columnas.push(nombreColumna);
    } else {
        // Si la columna ya está seleccionada, la deseleccionamos
        seleccion.columnas.splice(indice, 1);
    }
    // Si hay al menos una columna seleccionada, marcar el tractor como seleccionado
    seleccion.seleccionado = seleccion.columnas.length > 0;

    cambiarIconoMarcadoADesmarcado(caja)
    console.log(tractoresSeleccionados);
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
    } else {
        mostrarColumnasTractor(tractorNombre, datosExcel);
        contenedor.style.display = 'block';
        contenedor.dataset.tractorActual = tractorNombre;
    }
}


/**
 * Inicializa la funcionalidad del botón de reporte 
 * Configura el evento click para navegar al módulo de análisis
 * 
 * @function botonReporte
 * @param {Object} datosExcel - Los datos del excel
 * @returns {void}
 */
function botonReporte(datosExcel) {
    setTimeout(() => {
        const botonReporte = document.querySelector('.primario');
        if (botonReporte) {
            botonReporte.addEventListener('click', () => {
                // Esperar un momento para que se procesen los datos antes de cambiar de módulo
                setTimeout(() => {
                    console.log(datosExcel); // Verifica si contiene los datos esperados
                    console.log(tractoresSeleccionados);
                    const jsonFiltrado = seleccionaDatosAComparar(datosExcel, tractoresSeleccionados);
                    // Ahora, podemos acceder al JSON filtrado desde localStorage en el módulo de análisis
                    const datosDesdeStorage = JSON.parse(localStorage.getItem('datosFiltradosExcel'));
                    console.log('Datos filtrados listos para el análisis:', datosDesdeStorage);

                    // Cargar el módulo de análisis
                    const ventanaPrincipal = document.getElementById('ventana-principal');
                    if (ventanaPrincipal) {
                        fetch('../vistas/moduloAnalisis.html')
                            .then(respuesta => respuesta.text())
                            .then(html => {
                                ventanaPrincipal.innerHTML = html;
                                // Si el script de análisis ya está cargado, inicializarlo
                                if (window.inicializarModuloAnalisis) {
                                    window.inicializarModuloAnalisis();
                                }
                            }).catch(error => console.error('Error cargando módulo de análisis:', error))
                    }
                }, 500);
            });
        }
    }, 100);
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
    const datosExcel = cargarDatosDeExcel();
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
    const rutaBase = '../utils/iconos/';
    const iconoMarcado = 'check_box.svg';
    const iconoDesmarcado = 'check_box_outline_blank.svg';

    const nombreArchivo = icono.src.split('/').pop();

    // Verificar si el icono actual es el de desmarcado
    icono.src = nombreArchivo === iconoDesmarcado
        ? rutaBase + iconoMarcado
        : rutaBase + iconoDesmarcado;
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

/**
 * Crea un elemento que contiene el mensaje designado
 * 
 * @function mostrarMensaje
 * @param {HTMLElement} contenedor
 * @param {string} mensajeTexto
 * @returns {void}
 */
function mostrarMensaje(contenedor, mensajeTexto) {
    const mensaje = document.createElement('div');
    mensaje.className = 'rancho';
    mensaje.textContent = mensajeTexto;
    contenedor.appendChild(mensaje);
}

// Exportar funciones para uso global
window.inicializarModuloTractores = inicializarModuloTractores;