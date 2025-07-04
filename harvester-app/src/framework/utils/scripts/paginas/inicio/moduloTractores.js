// RF4 Usuario consulta datos disponibles - https://codeandco-wiki.netlify.app/docs/next/proyectos/tractores/documentacion/requisitos/RF4
// RF26 Usuario selecciona datos a comparar - https://codeandco-wiki.netlify.app/docs/next/proyectos/tractores/documentacion/requisitos/RF26

const tractoresSeleccionados = {};
const { cargarDatosExcel } = require(`${rutaBase}/src/backend/servicios/cargarDatosExcel.js`);
const { seleccionaDatosAComparar } = require(`${rutaBase}/src/backend/casosUso/excel/seleccionaDatosAComparar.js`);
const { mostrarAlerta } = require(`${rutaBase}/src/framework/vistas/includes/componentes/moleculas/alertaSwal/alertaSwal`);
const { validarNombreColumna } = require(`${rutaBase}/src/backend/casosUso/reportes/validarNombreColumna.js`)

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
    const columnasValidas = columnas.filter(columna => validarNombreColumna(columna));
    columnasValidas.forEach(nombreColumna => {
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
            // eslint-disable-next-line no-unused-vars
            const tractoresParametrosDiferentes = Object.entries(tractoresSeleccionados).filter(([nombreTractor, datos]) => {
                return datos.seleccionado && datos.columnas.length === 0;
            });
            // eslint-disable-next-line no-unused-vars
            const tractoresConProblema = Object.entries(tractoresSeleccionados).filter(([nombreTractor, datos]) => {
                return datos.columnas.length > 0 && !datos.seleccionado;
            });
            // eslint-disable-next-line no-unused-vars
            const tractoresValidos = Object.entries(tractoresSeleccionados).filter(([nombreTractor, datos]) => {
                return datos.columnas.length > 0 && datos.seleccionado;
            });

            if (tractoresParametrosDiferentes.length > 0 && tractoresConProblema.length > 0) {
                mostrarAlerta('No hay columnas seleccionadas para los tractores seleccionados', 'Por favor, selecciona al menos una columna de cada tractor para generar el reporte.', 'warning');
                return; 
            }
            if (tractoresConProblema.length > 0 && tractoresValidos.length === 0) {
                mostrarAlerta('No hay tractores seleccionados', 'Por favor, selecciona al menos un tractor y una columna de ese tractor para generar el reporte.', 'warning');
                return; 
            }
            if (tractoresConProblema.length > 0 && tractoresValidos.length > 0) {
                mostrarAlerta('Hay un tractor que no está seleccionado pero tiene columnas seleccionadas', 'Por favor revisa que los tractores no seleccionados no tengan columnas seleccionadas, o selecciona los tractores que falten.', 'warning');
                return; 
            }
            // Validar si hay tractores seleccionados pero sin ninguna columna seleccionada
            // eslint-disable-next-line no-unused-vars
            const tractoresSinColumnas = Object.entries(tractoresSeleccionados).filter(([nombreTractor, datos]) => {
                return datos.seleccionado && datos.columnas.length === 0;
            });
            if (tractoresSinColumnas.length > 0) {
                mostrarAlerta('No hay columnas seleccionadas', 'Por favor, selecciona al menos una columna de cada tractor seleccionado para generar el reporte.', 'warning');
                return;
            }
            // Validar si no hay ninguna selección válida
            const seleccionValida = Object.values(tractoresSeleccionados).some(datos => datos.seleccionado && datos.columnas.length > 0);
            if (!seleccionValida) {
                mostrarAlerta('No se ha seleccionado ningún tractor ni columnas', 'Por favor, realiza una selección antes de continuar.', 'warning');
                return;
            }



            // Continuar con la operación si no hay problemas
            seleccionaDatosAComparar(datosExcel, tractoresSeleccionados);
            var vista = await ipcRenderer.invoke('precargar-ejs', rutaTractores, { Seccion: 'Análisis', Icono : 'GraficaBarras', permisos});
            window.location.href = vista;
            localStorage.setItem('modulo-analisis-habilitado', 'true');
            localStorage.setItem('seccion-activa', 'analisis');
        } catch {
            mostrarAlerta('Ocurrió un problema', 'No se pudo cargar el módulo de análisis.', 'error');
        }
    });
}

/**
 * Configura el campo de búsqueda para filtrar los tractores por nombre
 * 
 * Al escribir, se compara el texto ingresado con el contenido de cada distribuidor,
 * ocultando aquellos que no coincidan. Limita la entrada a 60 caracteres máximo
 * y previene que se inicie con espacios. Muestra un contador de caracteres.
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

    // Establecer el atributo maxlength para limitar caracteres
    entradaBusqueda.setAttribute('maxlength', '60');

    // Crear el contador de caracteres si no existe
    let contadorCaracteres = document.getElementById('contadorCaracteresTractor');
    if (!contadorCaracteres) {
        contadorCaracteres = document.createElement('div');
        contadorCaracteres.id = 'contadorCaracteresTractor';
        contadorCaracteres.className = 'contador-caracteres';
        contadorCaracteres.textContent = '0/60 caracteres';
        
        // Insertar el contador después del campo de búsqueda
        entradaBusqueda.parentNode.insertBefore(contadorCaracteres, entradaBusqueda.nextSibling);
    }

    // Evento para filtrar y validar longitud
    entradaBusqueda.addEventListener('input', (event) => {
        let texto = event.target.value;
        
        // Limitar a 60 caracteres
        if (texto.length > 60) {
            event.target.value = texto.substring(0, 60);
            texto = event.target.value;
        }
        
        actualizarContador(texto, contadorCaracteres);
        aplicarFiltrosCombinados();

    });


    // Evento para prevenir pegar texto que inicie con espacios o exceda el límite
    entradaBusqueda.addEventListener('paste', (event) => {
        setTimeout(() => {
            let texto = event.target.value;
            
            // Remover espacios al inicio del texto pegado
            if (texto.startsWith(' ')) {
                texto = texto.trimStart();
                event.target.value = texto;
            }
            
            // Limitar a 60 caracteres
            if (texto.length > 60) {
                event.target.value = texto.substring(0, 60);
                texto = event.target.value;
            }
            
            actualizarContador(texto, contadorCaracteres);
            aplicarFiltrosCombinados();
        }, 0);
    });

    // Evento para prevenir que se escriban espacios al inicio o cuando el cursor está al inicio
    entradaBusqueda.addEventListener('keydown', (event) => {
        // Si se presiona espacio y el cursor está al inicio (posición 0), prevenir la acción
        if (event.key === ' ' && event.target.selectionStart === 0) {
            event.preventDefault();
        }
    });

    // Inicializar el contador con el valor actual del campo
    actualizarContador(entradaBusqueda.value || '', contadorCaracteres);
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
    const filtroSinCheck = document.getElementById('botonFiltroSin');

    // Evento para mostrar sólo los tractores con telemetría
    filtroConCheck.addEventListener('click', () => {
        seleccionarSoloUno(filtroConCheck, filtroSinCheck)
        aplicarFiltrosCombinados()
    });
    
    
    // Evento para mostrar sólo los tractores sin telemetría
    filtroSinCheck.addEventListener('click', () => {
        seleccionarSoloUno(filtroSinCheck, filtroConCheck)
        aplicarFiltrosCombinados()
    });
}

/**
 * Actualiza el contador de caracteres
 * @param {string} texto - El texto a evaluar
 */
function actualizarContador(texto, contadorCaracteres) {
    const caracteresActuales = texto.length;
    contadorCaracteres.textContent = `${caracteresActuales}/60 caracteres`;
    
    // Remover clases anteriores
    contadorCaracteres.classList.remove('warning', 'danger');
    
    // Agregar clase según proximidad al límite
    if (caracteresActuales >= 55) {
        contadorCaracteres.classList.add('danger');
    } else if (caracteresActuales >= 45) {
        contadorCaracteres.classList.add('warning');
    }
}

/**
 * Cambia la selección de un filtro de checkbox asegurando que solo uno esté marcado a la vez.
 *
 * Esta función se utiliza cuando hay dos elementos que actúan como filtros con íconos de checkbox,
 * y se quiere permitir que únicamente uno de ellos esté seleccionado a la vez. Si el segundo filtro
 * está marcado, se desmarcan ambos. Si no está marcado, solo se desmarca el primero.
 *
 * @param {HTMLElement} elementoFiltroCheck - Primer elemento del filtro que contiene un ícono de checkbox.
 * @param {HTMLElement} segundoElementoFiltroCheck - Segundo elemento del filtro con ícono de checkbox.
 */
function seleccionarSoloUno(elementoFiltroCheck, segundoElementoFiltroCheck) {
    // Obtiene el elemento <img> (ícono) dentro de cada filtro
    primerIcono = elementoFiltroCheck.querySelector('img');
    segundoIcono = segundoElementoFiltroCheck.querySelector('img');

    // Si el segundo ícono está marcado (tiene el ícono de checkbox activo), se desmarcan ambos
    if (segundoIcono.src.includes('check_box.svg')) {
        cambiarIconoMarcadoADesmarcado(primerIcono);
        cambiarIconoMarcadoADesmarcado(segundoIcono);
        return;
    }

    // Si el segundo no está marcado, solo se desmarca el primero
    cambiarIconoMarcadoADesmarcado(primerIcono);
    return;
}


/**
 * 
 * Aplica filtros combinados de búsqueda por nombre y estado del GPS a los distribuidores mostrados en el DOM.
 * 
 * Esta función obtiene los datos de un archivo de Excel, filtra los distribuidores en pantalla según:
 * - El texto ingresado en el campo de búsqueda (por nombre del distribuidor).
 * - Los filtros visuales activados para distribuidores 'con GPS' o 'sin GPS'.
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

    const nombresConsultados = []

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
            const indiceGPS = headers.indexOf('GPS');

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
        
        
        
        if(coincideBusqueda && cumpleFiltro){
            nombresConsultados.push(distribuidorDiv.querySelector('.rancho-texto')?.textContent)
        }

        /*

        */
    })

    const contenedorColumnas = document.getElementById('contenedorColumnas');


    if(!nombresConsultados.includes(contenedorColumnas.dataset.tractorActual)){
        contenedorColumnas.style.display = 'none';
        contenedorColumnas.dataset.tractorActual = '';

        tractorDiv = document.getElementsByClassName('seleccionado')

        if(tractorDiv){
            tractorDiv = document.getElementsByClassName('rancho seleccionado');
            cambiarSeleccionVisualUnica(contenedor)
        }
    }
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