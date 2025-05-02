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
    if (window.actualizarTopbar) {
        window.actualizarTopbar('tractores');
    }
    console.log('Cargando el módulo de Tractores...');

    // Cargar los datos del Excel desde localStorage
    const datosExcel = cargarDatosDeExcel();
    console.log('Datos de Excel:', datosExcel);
    
    // Si hay datos, inicializar la visualización aquí
    if (!datosExcel) {
        console.warn('No hay datos disponibles para análisis');
    }

    const distribuidoresContenedor = document.querySelector('.distribuidores-contenido');
    distribuidoresContenedor.innerHTML = ''; // Limpiar contenido anterior

    const tractoresContenedor = document.querySelector('.tractores');
    tractoresContenedor.innerHTML = '';

    // Iterar sobre los distribuidores (asumiendo que cada hoja es un distribuidor)
    for (const distribuidorNombre in datosExcel.hojas) {
        // Crear un div para el distribuidor
        const distribuidorDiv = document.createElement('div');
        distribuidorDiv.className = 'rancho'; // Asignar clase para estilo

        // Crear el nombre del distribuidor
        const nombreDistribuidorDiv = document.createElement('div');
        nombreDistribuidorDiv.className = 'rancho-texto';
        nombreDistribuidorDiv.textContent = distribuidorNombre; // Nombre del distribuidor

        // Crear el cuadro de selección (checkbox) para el distribuidor
        const checkBox = document.createElement('img');
        checkBox.className = 'check-box-outline-blank4';
        checkBox.src = '../utils/iconos/check_box_outline_blank.svg'; 

        // Añadir el nombre y el checkbox al div del distribuidor
        distribuidorDiv.appendChild(nombreDistribuidorDiv);
        distribuidorDiv.appendChild(checkBox);

        // Añadir el div del distribuidor al contenedor
        distribuidoresContenedor.appendChild(distribuidorDiv);
    }

    BusquedaDistribuidores();
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
                    // Buscar todos los botones del sidebar con data-seccion="analisis" 
                    // y marcarlos como activos
                    const botonesAnalisis = document.querySelectorAll('.boton-sidebar[data-seccion="analisis"]');
                    const todosBotones = document.querySelectorAll('.boton-sidebar');
                    
                    // Quitar activo de todos los botones
                    todosBotones.forEach(boton => boton.classList.remove('activo'));
                    
                    // Marcar como activos los botones de análisis
                    botonesAnalisis.forEach(boton => boton.classList.add('activo'));
                    
                    // Actualizar topbar directamente
                    if (window.actualizarTopbar) {
                        window.actualizarTopbar('analisis');
                    }

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
                            }).catch(error => console.error('Error cargando módulo de análisis:', err))
                    }
                }, 500);
            });
        }
    }, 100);
}

/**
 * Configura el campo de búsqueda para filtrar los distribuidores por nombre
 * 
 * Al escribir, se compara el texto ingresado con el contenido de cada distribuidor,
 * ocultando aquellos que no coincidan.
 * 
 * @function BusquedaDistribuidores
 * @returns {void}
 */
function BusquedaDistribuidores() {
    const entradaBusqueda = document.getElementById('buscador-distribuidor');
    const contenedorDistribuidores = document.querySelector('.distribuidores-contenido');

    // Devolver la lista completa si no se escribe nada o no hay elementos
    if (!entradaBusqueda || !contenedorDistribuidores) {
        return;
    }

    entradaBusqueda.addEventListener('input', () => {
        console.log('Buscando...');
        entradaBusqueda.addEventListener('input', aplicarFiltrosCombinados);
    })
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
        console.log('Click a boton con telemetría');
        const cajaMarcada = filtroConCheck.querySelector('img');
        cambiarIconoMarcadoADescarcado(cajaMarcada)
        aplicarFiltrosCombinados()
    });
    
    const filtroSinCheck = document.getElementById('botonFiltroSin');
    // Evento para mostrar sólo los tractores sin telemetría
    filtroSinCheck.addEventListener('click', () => {
        console.log('Click a boton con telemetría');
        const cajaDescarcadaMarcada = filtroSinCheck.querySelector('img');
        cambiarIconoMarcadoADescarcado(cajaDescarcadaMarcada)
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

    const entradaBusqueda = document.getElementById('buscador-distribuidor');
    const filtroTexto = entradaBusqueda?.value.toLowerCase() || '';

    const mostrarCon = document.querySelector('#botonFiltroCon img')?.src.includes('check_box.svg');
    const mostrarSin = document.querySelector('#botonFiltroSin img')?.src.includes('check_box.svg');

    const contenedor = document.querySelector('.distribuidores-contenido');
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