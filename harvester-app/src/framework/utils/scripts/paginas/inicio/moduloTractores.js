// RF13 Usuario consulta datos disponibles - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF13
// RF14 Usuario selecciona datos a comparar - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF14

const tractoresSeleccionados = {};
const { cargarDatosExcel } = require(`${rutaBase}/src/backend/servicios/cargarDatosExcel.js`);
const { seleccionaDatosAComparar } = require(`${rutaBase}/src/backend/casosUso/excel/seleccionaDatosAComparar.js`);
const { mostrarAlerta } = require(`${rutaBase}/src/framework/vistas/includes/componentes/moleculas/alertaSwal/alertaSwal`);


/* eslint-disable no-undef*/

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
 * Cambia la seleccion de un tractor dentro del arreglo global tractoresSeleccionados
 * 
 * @function cambiarSeleccionTractor 
 * @param {string} nombreTractor
 * @param {HTMLElement} casillaVerificacion
 * @returns {void}
 */
function cambiarSeleccionTractor(nombreTractor, casillaVerificacion) {
    // Verificar si el tractor ya existe en tractoresSeleccionados
    if (!tractoresSeleccionados[nombreTractor]) {
        tractoresSeleccionados[nombreTractor] = {
            seleccionado: false,
            columnas: []
        };
    }

    // Alternar estado de la selección
    const estadoActual = tractoresSeleccionados[nombreTractor].seleccionado;
    tractoresSeleccionados[nombreTractor].seleccionado = !estadoActual;

    // Actualizar el ícono en el DOM
    cambiarIconoMarcadoADesmarcado(casillaVerificacion);

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
    const columnas = obtenerColumnas(datosHoja);
    if (!columnas.length) {
        mostrarMensaje(columnasContenedor, 'Formato de datos no reconocido')
        return;
    }

    // Asegurarse de que el objeto para este tractor exista en tractoresSeleccionados
    if (!tractoresSeleccionados[nombreTractor]) {
        tractoresSeleccionados[nombreTractor] = { 
            seleccionado: false, columnas: [] 
        };
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

    // Verificar si la columna ya está seleccionada en tractoresSeleccionados
    if (tractoresSeleccionados[nombreTractor]?.columnas.includes(nombreColumna)) {
        casillaVerificacion.src = `${rutaBase}src/framework/utils/iconos/check_box.svg`; // Marcado
    } else {
        casillaVerificacion.src = `${rutaBase}src/framework/utils/iconos/check_box_outline_blank.svg`; // Desmarcado
    }

    // Agregar evento para alternar la selección de la columna
    columnaDiv.addEventListener('click', () => {
        seleccionarColumna(nombreTractor, nombreColumna, casillaVerificacion);

        // Actualizar visualmente el estado del checkbox
        if (tractoresSeleccionados[nombreTractor]?.columnas.includes(nombreColumna)) {
            casillaVerificacion.src = `${rutaBase}src/framework/utils/iconos/check_box.svg`; // Marcado
        } else {
            casillaVerificacion.src = `${rutaBase}src/framework/utils/iconos/check_box_outline_blank.svg`; // Desmarcado
        }
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
 * @param {HTMLElement} casillaVerificacion - El elemento de imagen (checkbox) que refleja el estado de selección de la columna.
 * @returns {void}
 */
function seleccionarColumna(nombreTractor, nombreColumna, casillaVerificacion) {
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
    seleccion.columnas.sort();

    cambiarIconoMarcadoADesmarcado(casillaVerificacion)
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
async function botonReporte(datosExcel) {
    const botonAnalisis = document.querySelector('.primario');
    botonAnalisis.addEventListener('click', async () => {
        const rutaTractores = `${rutaBase}src/framework/vistas/paginas/analisis/generarReporte.ejs`;
        try {
            seleccionaDatosAComparar(datosExcel, tractoresSeleccionados);
            // var vista = await ipcRenderer.invoke('precargar-ejs', rutaTractores, { Seccion: 'Análisis', Icono : 'GraficaBarras', permisos});
            // window.location.href = vista;
            // localStorage.setItem('seccion-activa', 'analisis');
        } catch {
            mostrarAlerta('Ocurrió un problema', 'No se pudo cargar el módulo de análisis.', 'error');
        }
    })
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
