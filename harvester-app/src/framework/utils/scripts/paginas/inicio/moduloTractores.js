// RF13 Usuario consulta datos disponibles - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF13

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

    // Cargar los datos del Excel desde localStorage
    const datosExcel = cargarDatosDeExcel();
    
    // Si hay datos, inicializar la visualización aquí
    if (!datosExcel) {
        return ('No hay datos disponibles para análisis');
    }

    iniciarDistribuidores(datosExcel);
    inicializarTractores(datosExcel);
    
    busquedaTractores();
    botonesFiltrosTractores()
    botonReporte();
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
    
    if (!hojaExcel || !Array.isArray(hojaExcel) || hojaExcel.length === 0) {
        return ('No se encontraron distribuidores');
    } else {
        distribuidorContenedor.style.visibility = 'visible';
        hojaExcel.forEach(fila => {
            const nombreDistribuidor = fila.Distribuidor || fila.Nombre || fila.NombreDistribuidor;
            if (!nombreDistribuidor) return;
    
            // Crear div para distribuidor
            const distribuidorDiv = document.createElement('div');
            distribuidorDiv.className = 'rancho';
    
            // Crear nombre del distribuidor
            const nombreDistribuidorDiv = document.createElement('div');
            nombreDistribuidorDiv.className = 'rancho-texto';
            nombreDistribuidorDiv.textContent = nombreDistribuidor;
    
            // Crear checkbox
            const caja = document.createElement('img');
            caja.className = 'check-box';
            
            caja.src = `${rutaBase}src/framework/utils/iconos/check_box_outline_blank.svg`;
    
            // Añadir elementos
            distribuidorDiv.appendChild(nombreDistribuidorDiv);
            distribuidorDiv.appendChild(caja);
            distribuidoresContenedor.appendChild(distribuidorDiv);
        });
    }

}

/**
 * Inicia la lista de tractores en el DOM
 * 
 * @function inicializarTractores 
 * @param {object} datosExcel - Objeto que contiene las hojas del Excel cargado.
 * @returns {void}
 */
function inicializarTractores(datosExcel) {
    const tractoresContenedor = document.querySelector('.tractores-contenido');
    tractoresContenedor.innerHTML = '';
    const tractores = Object.keys(datosExcel.hojas);
    if (tractores.length === 0) {
        const mensaje = document.createElement('div');
        mensaje.className = 'rancho';
        mensaje.textContent = 'No se encontraron tractores';
        tractoresContenedor.appendChild(mensaje);
    } else {
        // Iterar sobre los tractores asumiendo que cada hoja es un tractor
        tractores.forEach(tractorNombre => {
        // Crear un div para el tractor
        const tractorDiv = document.createElement('div');
        tractorDiv.className = 'rancho'; // Asignar clase para estilo

        // Crear contenedor para el texto
        const tractorDivTexto = document.createElement('div');
        tractorDivTexto.className = 'caja-rancho-texto';

        // Crear el nombre del tractor
        const nombreTractorDiv = document.createElement('div');
        nombreTractorDiv.className = 'rancho-texto';
        nombreTractorDiv.textContent = tractorNombre; // Nombre del tractor

        tractorDivTexto.appendChild(nombreTractorDiv);

        // Crear el cuadro de selección (checkbox) para el tractor
        const caja = document.createElement('img');
        caja.className = 'check-box';
        caja.src = `${rutaBase}src/framework/utils/iconos/check_box_outline_blank.svg`; // Imagen del checkbox vacío 

        
        // Añadir el nombre y el checkbox al div del tractor
        tractorDiv.appendChild(tractorDivTexto);
        tractorDiv.appendChild(caja);
        
        // Añadir el div del tractor al contenedor
        tractoresContenedor.appendChild(tractorDiv);
        
        // Agregar evento para mostrar columnas
        tractorDivTexto.addEventListener('click', () => {
            cambiarSeleccionVisualUnica(tractorDiv);
            manejarClickTractor(tractorNombre, datosExcel);
            });
        })
    }
}

/** 
 * Cargamos los datos de excel que se encuentran en localStorage
 * 
 * @function cargarDatosDeExcel
 * @returns {object|null} - objeto con las hojas de excel parseadas
*/
function cargarDatosDeExcel() {
    try {
        // Recuperar los datos de Excel
        const datosExcelJSON = localStorage.getItem('datosExcel');
        if (!datosExcelJSON) {
            alert('No hay datos de Excel disponibles');
            return null;
        }
        // Parsear los datos JSON
        const datosExcel = JSON.parse(datosExcelJSON);
        return datosExcel;
    } catch {
        return null;
    }
}

/**
 * Muestra las colmunas de un tractor específico en el contenedor de columnas
 * 
 * @function mostrarColumnasTractor
 * @param {string} nombreTractor
 * @param {object} datosExcel - objeto con als hojas del excel
 * @returns {void}
 */
function mostrarColumnasTractor(nombreTractor, datosExcel) {
    const columnaContenedor = document.getElementById('contenedorColumnas');
    const columnasContenedor = document.querySelector('.columnas-contenido');
    columnasContenedor.innerHTML = '';
    columnaContenedor.style.display = 'block';

    const datosHoja = datosExcel.hojas[nombreTractor];

    if (!Array.isArray(datosHoja) || datosHoja.length === 0) {
        const mensaje = document.createElement('div');
        mensaje.className = 'columna-nombre';
        mensaje.textContent = 'No hay datos en esta hoja';
        columnasContenedor.appendChild(mensaje);
        return;
    }

    // Obtener las columnas del primer objeto
    let columnas = [];

    // Si el primer elemento es un objeto, usamos sus claves
    if (typeof datosHoja[0] === 'object' && !Array.isArray(datosHoja[0])) {
        columnas = Object.keys(datosHoja[0]);
    } else if (Array.isArray(datosHoja[0])) {
        // Si el primer elemento es un array, usamos sus valores como encabezados
        columnas = datosHoja[0];
    }
    localStorage.setItem('columnas', JSON.stringify(columnas));
    columnas.forEach(nombreColumna => {
        // Crear div para la columna
        const columnaDiv = document.createElement('div');
        columnaDiv.className = 'columna-nombre';

        // Texto del nombre
        const nombreColumnaDiv = document.createElement('div');
        nombreColumnaDiv.className = 'rancho-texto';
        nombreColumnaDiv.textContent = nombreColumna;

        const caja = document.createElement('img');
        caja.className = 'check-box';
        caja.src = `${rutaBase}src/framework/utils/iconos/check_box_outline_blank.svg`;

        // Agregar al DOM
        columnaDiv.appendChild(nombreColumnaDiv);
        columnaDiv.appendChild(caja);
        columnasContenedor.appendChild(columnaDiv);
    });
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
 * @returns {void}
 */
async function botonReporte() {
    const botonAnalisis = document.querySelector('.primario');
    botonAnalisis.addEventListener('click', async () => {
        const rutaTractores = `${rutaBase}src/framework/vistas/paginas/analisis/generarReporte.ejs`;
        try {
            var vista = await ipcRenderer.invoke('precargar-ejs', rutaTractores, { Seccion: 'Análisis', Icono : 'GraficaBarras', permisos});
            window.location.href = vista;
            localStorage.setItem('seccion-activa', 'analisis');
        } catch (err) {
            return ('Error al cargar vista:', err);
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
