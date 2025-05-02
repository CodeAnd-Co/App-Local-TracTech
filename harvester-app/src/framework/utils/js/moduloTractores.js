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
        const filtro = entradaBusqueda.value.toLowerCase();
        const distribuidores = contenedorDistribuidores.querySelectorAll('div');

        distribuidores.forEach(distribuidor => {
            const nombre = distribuidor.textContent.toLowerCase();
            // Comparar si el nombre del distribuidor contiene el texto escrito
            distribuidor.style.display = nombre.includes(filtro) ? '' : 'none';
        });
    })
}

/**
 * Configura los botones para filtrar los tractores por telemetría
 * Cambia el ícono al hacer click
 * 
 * 
 * @function botonesFiltrosTractores
 * @returns {void}
 */
function botonesFiltrosTractores() {
    const filtroConCheck = document.getElementById('botonFiltroCon');
    // Evento para mostrar sólo los tractores con telemetría
    filtroConCheck.addEventListener('click', () => {
        console.log('Click a boton con telemetría');
    });
    
    const filtroSinCheck = document.getElementById('botonFiltroSin');
    // Evento para mostrar sólo los tractores sin telemetría
    filtroSinCheck.addEventListener('click', () => {
        console.log('Click a boton con telemetría');
    });
}

// Exportar funciones para uso global
window.inicializarModuloTractores = inicializarModuloTractores;