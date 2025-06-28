const { obtenerDispositivos: obtenerDispositivosCU } = require(`${rutaBase}src/backend/casosUso/dispositivos/obtenerDispositivos.js`);
const { habilitarDispositivo: habilitarDispositivoCU } = require(`${rutaBase}src/backend/casosUso/dispositivos/habilitarDispositivo.js`);
const { mostrarAlerta } = require(`${rutaBase}/src/framework/vistas/includes/componentes/moleculas/alertaSwal/alertaSwal`);

const dispositivosPorPagina = 4;
let paginaActual = 1;
let listaDispositivos = [];
let dispositivosFiltrados = [];
let terminoBusqueda = '';

/**
 * Inicializa el módulo de gestión de dispositivos.
 * Carga los dispositivos desde el backend, configura la paginación
 * y añade event listeners a los botones de la interfaz.
 * @async
 * @function inicializarModuloGestionDispositivos
 * @returns {Promise<void>}
 */
async function inicializarModuloGestionDispositivos() {
    await obtenerDispositivos();
    configurarCampoBusqueda();
    configurarContadoresCampos();
}

/** 
 * Obtiene la lista de dispositivos del backend y los renderiza en la interfaz.
 * 
 * @async
 * @function obtenerDispositivos
 * @returns {void}
 */
async function obtenerDispositivos() {
    try {
        const resultado = await obtenerDispositivosCU();
        
        
        if (resultado.ok) {
            listaDispositivos = resultado.dispositivos || [];
            dispositivosFiltrados = [...listaDispositivos];
            
            if (listaDispositivos.length === 0) {
                mostrarMensajeVacio();
            } else {
                ocultarMensajeVacio();
                cargarPagina(1);
            }
        } else {
            mostrarAlerta('Error', resultado.mensaje || 'No se pudieron cargar los dispositivos', 'error');
            mostrarMensajeVacio();
        }
    } catch  {
        mostrarAlerta('Error', 'Error de conexión al cargar dispositivos', 'error');
        mostrarMensajeVacio();
    }
}

/**
 * Configura el campo de búsqueda de dispositivos.
 * 
 * @function configurarCampoBusqueda
 * @returns {void}
 */
function configurarCampoBusqueda() {
    const campoBusqueda = document.getElementById('campoBusqueda');
      if (campoBusqueda) {
        campoBusqueda.addEventListener('input', (event) => {
            terminoBusqueda = event.target.value.toLowerCase().trim();
            actualizarCaracteresBuscador(event.target);
            filtrarDispositivos();
        });
    }
}

/**
 * Actualiza el contador de caracteres restantes para el buscador de dispositivos.
 * 
 * @function actualizarCaracteresBuscador
 * @param {HTMLInputElement} campoEntrada - Campo de entrada a validar.
 * @returns {void}
 */
function actualizarCaracteresBuscador(campoEntrada) {
    const contadorElemento = document.getElementById('contadorBusqueda');
    if (contadorElemento) {
        contadorElemento.textContent = campoEntrada.value.length;
    }
}

/**
 * Actualiza los contadores de caracteres que ya existen en el HTML.
 * No inserta nada, solo los inicializa y los mantiene al día.
 * 
 * @function configurarContadoresCampos
 * @returns {void}
 */
function configurarContadoresCampos() {
    const campoBusqueda = document.getElementById('campoBusqueda');
    if (campoBusqueda) {
        actualizarCaracteresBuscador(campoBusqueda);
    }
}

/** 
 * Filtra la lista de dispositivos según el término de búsqueda ingresado.
 * 
 * @function filtrarDispositivos
 */
function filtrarDispositivos() {
    if (terminoBusqueda === '') {
        dispositivosFiltrados = [...listaDispositivos];
    } else {
        dispositivosFiltrados = listaDispositivos.filter(dispositivo => {
            // Verificar que el dispositivo existe y tiene las propiedades necesarias
            if (!dispositivo) return false;
            
            // Buscar por ID del dispositivo (manejar tanto 'id' como 'idDispositivo')
            const dispositivoId = dispositivo.id || dispositivo.idDispositivo || '';
            const idMatch = dispositivoId.toString().toLowerCase().includes(terminoBusqueda);
            
            // Buscar por nombre del propietario
            const propietario = dispositivo.nombreUsuario || '';
            const propietarioMatch = propietario.toString().toLowerCase().includes(terminoBusqueda);
            
            return idMatch || propietarioMatch;
        });
    }
    
    if (dispositivosFiltrados.length === 0) {
        mostrarMensajeVacio();
    } else {
        ocultarMensajeVacio();
        cargarPagina(1);
    }
}

/**
 * Habilita un dispositivo específico.
 * Llama al backend para habilitar el dispositivo y actualiza la lista.
 * @async
 * @function habilitarDispositivo
 * @param {string} idDispositivo - ID del dispositivo a habilitar
 * @returns {Promise<void>}
 */
async function habilitarDispositivo(idDispositivo) {
    /*eslint-disable-next-line*/
    const confirmacion = await mostrarAlertaConfirmacion(
        '¿Habilitar dispositivo?',
        `¿Estás seguro de que deseas habilitar el dispositivo ${idDispositivo}?`,
        'question',
        'Sí, habilitar',
        'Cancelar'
    );    if (confirmacion) {
        try {
            const resultado = await habilitarDispositivoCU(idDispositivo);
            
            if (resultado.ok) {
                mostrarAlerta('Éxito', 'Dispositivo habilitado correctamente', 'success');
                await obtenerDispositivos(); // Recargar la lista
            } else {
                mostrarAlerta('Error', resultado.mensaje || 'No se pudo habilitar el dispositivo', 'error');
            }
        } catch {
            mostrarAlerta('Error', 'Error de conexión al habilitar dispositivo', 'error');
        }
    }
}

/**
 * Carga y muestra una página específica de dispositivos.
 * Calcula los dispositivos correspondientes a la página solicitada
 * y actualiza la interfaz de paginación.
 * @function cargarPagina
 * @param {number} pagina - Número de la página a cargar (empezando desde 1)
 * @returns {void}
 */
function cargarPagina(pagina) {
    // Actualizar la página actual ANTES de configurar la paginación
    paginaActual = pagina;
    
    const inicio = (pagina - 1) * dispositivosPorPagina;
    const fin = inicio + dispositivosPorPagina;
    const dispositivosPagina = dispositivosFiltrados.slice(inicio, fin);
    
    mostrarDispositivos(dispositivosPagina);
    
    const totalPaginas = Math.ceil(dispositivosFiltrados.length / dispositivosPorPagina);
    configurarPaginacion(totalPaginas);
}

/**
 * Muestra los dispositivos en la interfaz gráfica.
 * Crea elementos DOM para cada dispositivo y los añade a la lista.
 * @function mostrarDispositivos
 * @param {Array<Object>} dispositivos - Lista de dispositivos a mostrar
 * @returns {void}
 */
function mostrarDispositivos(dispositivos) {
    const listaDeDispositivos = document.getElementById('listaDispositivos');
    
    if (!listaDeDispositivos) {
        return;
    }
    
    listaDeDispositivos.innerHTML = '';
    
    const fragmento = crearListaDispositivos(dispositivos);
    listaDeDispositivos.appendChild(fragmento);
    
    configurarBotonHabilitar(listaDeDispositivos);
}

/**
 * Configura la paginación de dispositivos.
 * 
 * @function configurarPaginacion
 * @param {number} paginasTotales - Total de páginas disponibles.
 * @returns {void}
 */
function configurarPaginacion(paginasTotales) {
    const paginacion = document.getElementById('paginacion');
    paginacion.innerHTML = '';
    
    if (paginasTotales <= 1) return;
    
    // Botón anterior
    const botonAnterior = document.createElement('button');
    botonAnterior.textContent = 'Anterior';
    botonAnterior.disabled = paginaActual === 1;
    botonAnterior.addEventListener('click', () => {
        if (paginaActual > 1) cargarPagina(paginaActual - 1);
    });
    paginacion.appendChild(botonAnterior);
    
    crearBotonNumeros(paginasTotales, paginacion);
    
    // Botón siguiente
    const botonSiguiente = document.createElement('button');
    botonSiguiente.textContent = 'Siguiente';
    botonSiguiente.disabled = paginaActual === paginasTotales;
    botonSiguiente.addEventListener('click', () => {
        if (paginaActual < paginasTotales) cargarPagina(paginaActual + 1);
    });
    paginacion.appendChild(botonSiguiente);
}

/**
 * Crea los botones de paginación numéricos.
 * @function crearBotonNumeros
 * @param {number} paginasTotales - Total de páginas disponibles.
 * @param {HTMLElement} paginacion - Elemento contenedor de la paginación.
 * @returns {void}
 */
function crearBotonNumeros(paginasTotales, paginacion) {
    for (let index = 1; index <= paginasTotales; index += 1) {
        const botonNumero = document.createElement('button');
        botonNumero.textContent = index;
        botonNumero.classList.toggle('activo', index === paginaActual);
        botonNumero.addEventListener('click', () => cargarPagina(index));
        paginacion.appendChild(botonNumero);
    }
}

/**
 * Crea un fragmento de documento con los dispositivos.
 * 
 * @function crearListaDispositivos
 * @param {Array<Object>} dispositivos - Lista de dispositivos a renderizar.
 * @returns {DocumentFragment} Un fragmento de documento con los dispositivos renderizados.
 */
function crearListaDispositivos(dispositivos) {
    const fragmento = document.createDocumentFragment();
    
    dispositivos.forEach((dispositivo) => {
        const elementoDispositivo = document.createElement('div');
        elementoDispositivo.className = 'usuario-item';
        
        const estadoClase = dispositivo.activo ? 'activo' : 'inactivo';
        const estadoTexto = dispositivo.activo ? 'Habilitado' : 'Deshabilitado';
        
        elementoDispositivo.innerHTML = `
            <div class='usuario-info'>
            <div class='usuario-nombre'>
                <strong>ID:</strong> ${dispositivo.id}
            </div>
            <div class='usuario-correo'>
                <strong>Propietario:</strong> ${dispositivo.nombreUsuario || 'No asignado'}
            </div>
            <div class='usuario-rol'>
                <strong>Estado:</strong> 
                <span class='estado-badge ${estadoClase}'>${estadoTexto}</span>
            </div>
            </div>
            ${estadoClase !== 'activo' ? `
            <div class='usuario-acciones'>
                <button class='boton-accion boton-habilitar' data-id='${dispositivo.id}' title='Habilitar dispositivo'>
                <img src='${rutaBase}src/framework/utils/iconos/check_box.svg' alt='Habilitar' />
                </button>
            </div>
            ` : ''}
        `;
        
        fragmento.appendChild(elementoDispositivo);
    });
    
    return fragmento;
}

/**
 * Configura el botón de habilitar dispositivo para cada dispositivo en la lista.
 * 
 * @function configurarBotonHabilitar
 * @param {HTMLElement} listaDeDispositivos - Elemento contenedor de la lista de dispositivos.
 * @returns {void}
 */
function configurarBotonHabilitar(listaDeDispositivos) {
    const botonesHabilitar = listaDeDispositivos.querySelectorAll('.boton-habilitar');
    
    botonesHabilitar.forEach((boton) => {
        boton.addEventListener('click', () => {
            const idDispositivo = boton.getAttribute('data-id');
            habilitarDispositivo(idDispositivo);
        });
    });
}

/**
 * Muestra el mensaje cuando no hay dispositivos para mostrar.
 * 
 * @function mostrarMensajeVacio
 * @returns {void}
 */
function mostrarMensajeVacio() {
    const mensajeVacio = document.getElementById('mensajeVacio');
    const listaDispositivos = document.getElementById('listaDispositivos');
    const paginacion = document.getElementById('paginacion');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const mensajeVacioContenido = document.getElementById('mensajeVacioContenido');
    
    if (mensajeVacio) {
        mensajeVacio.style.display = 'block';
        
        // Mostrar spinner inicialmente
        if (loadingSpinner) loadingSpinner.style.display = 'flex';
        if (mensajeVacioContenido) mensajeVacioContenido.style.display = 'none';
        
        // Después de 1 segundo, mostrar el mensaje real
        setTimeout(() => {
            if (loadingSpinner) loadingSpinner.style.display = 'none';
            if (mensajeVacioContenido) mensajeVacioContenido.style.display = 'block';
        }, 1000);
    }
    
    if (listaDispositivos) listaDispositivos.innerHTML = '';
    if (paginacion) paginacion.innerHTML = '';
}

/**
 * Oculta el mensaje cuando hay dispositivos para mostrar.
 * 
 * @function ocultarMensajeVacio
 * @returns {void}
 */
function ocultarMensajeVacio() {
    const mensajeVacio = document.getElementById('mensajeVacio');
    if (mensajeVacio) {
        mensajeVacio.style.display = 'none';
    }
}

inicializarModuloGestionDispositivos();
