// RF13 Usuario consulta datos disponibles - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF13

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
        console.warn('No hay datos disponibles para análisis');
    }

    const distribuidorContenedor = document.querySelector('.distribuidor');
    const distribuidoresContenedor = document.querySelector('.distribuidores-contenido');
    distribuidorContenedor.innerHTML = '';
    distribuidorContenedor.style.visibility = 'hidden';
    distribuidoresContenedor.innerHTML = '';

    // Mostrar distribuidores si existe la hoja
    if (datosExcel.hojas.hasOwnProperty('Distribuidor')) {
        const distribuidores = datosExcel.hojas['Distribuidor'];

        if (Array.isArray(distribuidores) && distribuidores.length > 0) {
            // Mostrar contenedor si hay datos
            distribuidorContenedor.style.visibility = 'visible';

            distribuidores.forEach(fila => {
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
                caja.src = '../utils/iconos/check_box_outline_blank.svg';

                // Añadir elementos
                distribuidorDiv.appendChild(nombreDistribuidorDiv);
                distribuidorDiv.appendChild(caja);
                distribuidoresContenedor.appendChild(distribuidorDiv);
            });
        } else {
            console.log('Hoja de distribuidores vacía');
        }
    } else {
        console.log('No se encontraron distribuidores');
    }

    const tractoresContenedor = document.querySelector('.tractores-contenido');
    tractoresContenedor.innerHTML = '';
    const tractores = Object.keys(datosExcel.hojas);
    if (tractores.length === 0) {
        const mensaje = document.createElement('div');
        mensaje.className = 'rancho';
        mensaje.textContent = 'No se encontraron tractores';
        tractoresContenedor.appendChild(mensaje);
    } else {
        // Iterar sobre los distribuidores (asumiendo que cada hoja es un distribuidor)
        tractores.forEach(tractorNombre => {
        // Crear un div para el tractor
        const tractorDiv = document.createElement('div');
        tractorDiv.className = 'rancho'; // Asignar clase para estilo

        // Crear el nombre del tractor
        const nombreTractorDiv = document.createElement('div');
        nombreTractorDiv.className = 'rancho-texto';
        nombreTractorDiv.textContent = tractorNombre; // Nombre del tractor

        // Crear el cuadro de selección (checkbox) para el tractor
        const caja = document.createElement('img');
        caja.className = 'check-box';
        caja.src = '../utils/iconos/check_box_outline_blank.svg'; // Imagen del checkbox vacío 

        // Añadir el nombre y el checkbox al div del tractor
        tractorDiv.appendChild(nombreTractorDiv);
        tractorDiv.appendChild(caja);

        // Añadir el div del tractor al contenedor
        tractoresContenedor.appendChild(tractorDiv);

        // Agregar evento para mostrar columnas
        tractorDiv.addEventListener('click', () => {
            console.log("Click a tractor");
            mostrarColumnasTractor(tractorNombre, datosExcel);
            });
        })
    }
    BusquedaTractores();
    botonesFiltrosTractores()
    botonReporte();
}

/** 
 * Cargamos los datos de excel que se encuentran en localStorage
 * 
 * @function cargarDatosDeExcel
 * @returns {void}
*/
function cargarDatosDeExcel() {
    try {
        // Recuperar los datos de Excel
        const datosExcelJSON = localStorage.getItem('datosExcel');
        if (!datosExcelJSON) {
            console.log('No hay datos de Excel disponibles en localStorage');
            alert('No hay datos de Excel disponibles');
            return null;
        }
        
        // Parsear los datos JSON
        const datosExcel = JSON.parse(datosExcelJSON);
        console.log('Datos de Excel cargados:', datosExcel);
        return datosExcel;
    } catch (error) {
        console.error('Error al cargar datos de Excel:', error);
        return null;
    }
}

/**
 * Muestra las colmunas de un tractor específico en el contenedor de columnas
 * 
 * @param {string} nombreTractor
 * @param {object} datosExcel
 * @function mostrarColumnasTractor
 * @returns {void}
 */
function mostrarColumnasTractor(nombreTractor, datosExcel) {
    const columnasContenedor = document.querySelector('.columnas-contenido');
    columnasContenedor.innerHTML = '';

    const datosHoja = datosExcel.hojas[nombreTractor];

    if (!Array.isArray(datosHoja) || datosHoja.length === 0) {
        const mensaje = document.createElement('div');
        mensaje.className = 'rancho';
        mensaje.textContent = 'No hay datos en esta hoja';
        columnasContenedor.appendChild(mensaje);
        return;
    }

    // Obtener las columnas del primer objeto
    let columnas = [];

    // Si el primer elemento es un objeto, usamos sus claves
    if (typeof datosHoja[0] === 'object' && !Array.isArray(datosHoja[0])) {
        columnas = Object.keys(datosHoja[0]);
    }
    // Si el primer elemento es un array, usamos sus valores como encabezados
    else if (Array.isArray(datosHoja[0])) {
        columnas = datosHoja[0];
    }

    columnas.forEach(nombreColumna => {
        // Crear div para la columna
        const columnaDiv = document.createElement('div');
        columnaDiv.className = 'rancho';

        // Texto del nombre
        const nombreColumnaDiv = document.createElement('div');
        nombreColumnaDiv.className = 'rancho-texto';
        nombreColumnaDiv.textContent = nombreColumna;

        // Agregar al DOM
        columnaDiv.appendChild(nombreColumnaDiv);
        columnasContenedor.appendChild(columnaDiv);
    });
}


/**
 * Inicializa la funcionalidad del botón de reporte 
 * Configura el evento click para navegar al módulo de análisis
 * 
 * @function botonReporte
 * @returns {void}
 */
function botonReporte() {
    setTimeout(() => {
        const botonReporte = document.querySelector('.primario');
        if (botonReporte) {
            botonReporte.addEventListener('click', () => {
                // Esperar un momento para que se procesen los datos antes de cambiar de módulo
                setTimeout(() => {
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
 * @function BusquedaTractores
 * @returns {void}
 */
function BusquedaTractores() {
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
        cambiarIconoMarcadoADescarcado(caja)
        aplicarFiltrosCombinados()
    });
    
    const filtroSinCheck = document.getElementById('botonFiltroSin');
    // Evento para mostrar sólo los tractores sin telemetría
    filtroSinCheck.addEventListener('click', () => {
        const caja = filtroSinCheck.querySelector('img');
        cambiarIconoMarcadoADescarcado(caja)
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
                // Recorrer hasta 5 filas siguientes para buscar "OK" en la columna GPS
                for (let i = 1; i < Math.min(6, datosDistribuidor.length); i++) {
                    const fila = datosDistribuidor[i];
                    const valorGPS = fila[indiceGPS];
                    if (valorGPS && valorGPS.toUpperCase() === "OK") {
                        tieneGPS = true;
                        break;
                    }
                }
            }
        }

        // Determinar si el distribuidor cumple con los filtros de GPS activos
        const cumpleFiltro =
            (mostrarCon && tieneGPS) ||
            (mostrarSin && !tieneGPS) ||
            (!mostrarCon && !mostrarSin); // Si ambos filtros están apagados, mostrar todos

        // Muestra u oculta el distribuidor dependiendo de si pasa ambos filtros
        distribuidorDiv.style.display = coincideBusqueda && cumpleFiltro ? '' : 'none';
    });
}


/**
 * Cambia el ícono de marcado a desmarcado
 * 
 * @function cambiarIconoMarcadoADescarcado
 * @param {HTMLElement} icono El elemento de imagen a actualizar
 */
function cambiarIconoMarcadoADescarcado(icono) {
    // Verificar si el icono actual es el de desmarcado
    if (icono.src.includes('check_box_outline_blank.svg')) {
        icono.src = '../utils/iconos/check_box.svg'; // Cambiar a marcado
    } else {
        icono.src = '../utils/iconos/check_box_outline_blank.svg'; // Cambiar a desmarcado
    }
}

// Exportar funciones para uso global
window.inicializarModuloTractores = inicializarModuloTractores;