// RF40 Administrador consulta usuarios - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF40

const usuariosPorPagina = 6;
let paginaActual = 1;
let listaUsuarios = [];
let usuariosFiltrados = [];
let terminoBusqueda = '';

/**
 * Inicializa el módulo de gestión de usuarios.
 * Carga los usuarios desde el backend, configura la paginación
 * y añade event listeners a los botones de la interfaz.
 * @async
 * @function inicializarModuloGestionUsuarios
 * @returns {Promise<void>}
 */
async function inicializarModuloGestionUsuarios() {
    localStorage.setItem('seccion-activa', 'gestionUsuarios');

    const columnaCrear = document.getElementById('columna-crear-usuario');
    columnaCrear.style.display = 'none';

    try {
        const { obtenerUsuarios } = require('../../backend/casosUso/usuarios/consultarUsuarios.js');
        const usuarios = await obtenerUsuarios();
        listaUsuarios = usuarios?.obtenerUsuarios() ?? [];
        usuariosFiltrados = [...listaUsuarios];
        cargarPagina(1);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        document.getElementById('lista-usuarios').innerHTML
        = '<div class="error-carga">Error al cargar los usuarios. Intente de nuevo más tarde.</div>';
    }

    const botonAgregar = document.querySelector('.primario');
    botonAgregar.addEventListener('click', evento => {
        evento.preventDefault();
        columnaCrear.style.display = 'block';
    });

    const botonCancelar = document.querySelector('.btn-cancelar');
    botonCancelar.addEventListener('click', evento => {
        evento.preventDefault();
        columnaCrear.style.display = 'none';
    });

    // Configurar el campo de búsqueda
    const inputBusqueda = document.getElementById('buscar-usuario');
    inputBusqueda.addEventListener('input', evento => {
        terminoBusqueda = evento.target.value.toLowerCase().trim();
        filtrarUsuarios();
    });

    // Agregar también un listener para cuando se presiona Enter
    inputBusqueda.addEventListener('keypress', evento => {
        if (evento.key === 'Enter') {
            evento.preventDefault(); // Evitar que se envíe un formulario si está dentro de uno
            terminoBusqueda = inputBusqueda.value.toLowerCase().trim();
            filtrarUsuarios();
        }
    });
}
function filtrarUsuarios() {
    if (terminoBusqueda === '') {
        usuariosFiltrados = [...listaUsuarios];
    } else {
        usuariosFiltrados = listaUsuarios.filter(usuario => 
            usuario.nombre.toLowerCase().includes(terminoBusqueda) 
            || (usuario.correo && usuario.correo.toLowerCase().includes(terminoBusqueda)));
    }
    paginaActual = 1; // Reiniciar la página actual al filtrar
    cargarPagina(1); // Volver a la primera página con resultados filtrados
}

/**
 * Carga y muestra una página específica de usuarios.
 * Calcula los usuarios correspondientes a la página solicitada
 * y actualiza la interfaz de paginación.
 * @function cargarPagina
 * @param {number} pagina - Número de la página a cargar (empezando desde 1)
 * @returns {void}
 */
function cargarPagina(pagina) {
    paginaActual = pagina;
    const paginasTotales = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);

    const inicio = (pagina - 1) * usuariosPorPagina;
    const fin = inicio + usuariosPorPagina;
    const usuariosPagina = usuariosFiltrados.slice(inicio, fin);

    mostrarUsuarios(usuariosPagina);

    const paginacion = document.querySelector('.paginacion');
    paginacion.innerHTML = '';

    if (usuariosFiltrados.length === 0) {
        const listaUsuariosElemento = document.getElementById('lista-usuarios');
        listaUsuariosElemento.innerHTML = '<div class="sin-resultados">No hay usuarios que coincidan con la búsqueda.</div>';
        return;
    }

    // Solo mostrar paginación si hay más de una página
    if (paginasTotales <= 1) {
        return;
    }

    const previo = document.createElement('button');
    previo.textContent = '<';
    previo.classList.add('boton-pagina-previa');
    previo.disabled = paginaActual === 1;
    previo.onclick = evento => {
        evento.preventDefault();
        if (paginaActual > 1) {
            cargarPagina(paginaActual - 1);
        }
    };
    paginacion.appendChild(previo);

    for (let numeroPagina = 1; numeroPagina <= paginasTotales; numeroPagina += 1) {
        if (
            numeroPagina === 1
            || numeroPagina === paginasTotales
            || (numeroPagina >= paginaActual - 1 && numeroPagina <= paginaActual + 1)
        ) {
            const botonPagina = document.createElement('button');
            botonPagina.textContent = numeroPagina;
            botonPagina.classList.add('boton-pagina');
            if (numeroPagina === paginaActual) {
                botonPagina.classList.add('pagina-actual');
            }
            botonPagina.onclick = evento => {
                evento.preventDefault();
                cargarPagina(numeroPagina);
            };
            paginacion.appendChild(botonPagina);
        } else if (
            (numeroPagina === paginaActual - 2 && numeroPagina > 1)
            || (numeroPagina === paginaActual + 2 && numeroPagina < paginasTotales)
        ) {
            // Evitamos duplicar los puntos
            const puntos = document.createElement('span');
            puntos.textContent = '...';
            puntos.classList.add('puntos-paginacion');
            paginacion.appendChild(puntos);
        }
    }

    const siguiente = document.createElement('button');
    siguiente.textContent = '>';
    siguiente.classList.add('boton-pagina-siguiente');
    siguiente.disabled = paginaActual === paginasTotales;
    siguiente.onclick = evento => {
        evento.preventDefault();
        if (paginaActual < paginasTotales) {
            cargarPagina(paginaActual + 1);
        }
    };
    paginacion.appendChild(siguiente);
}

/**
 * Muestra los usuarios en la interfaz gráfica.
 * Crea elementos DOM para cada usuario y los añade a la lista de usuarios.
 * @function mostrarUsuarios
 * @param {Array<Object>} usuarios - Lista de usuarios a mostrar
 * @param {string} usuarios[].nombre - Nombre del usuario
 * @returns {void}
 */
function mostrarUsuarios(usuarios) {
    const listaUsuariosElemento = document.getElementById('lista-usuarios');
    if (!listaUsuariosElemento) {
        console.error('No se encontró el elemento de la lista de usuarios en el DOM.');
        return;
    }

    listaUsuariosElemento.innerHTML = '';

    if (usuarios.length === 0) {
        listaUsuariosElemento.innerHTML = '<li>No hay usuarios disponibles.</li>';
        return;
    }

    const fragmento = document.createDocumentFragment();
    for (const { nombre } of usuarios) {
        const div = document.createElement('div');
        div.className = 'frame-usuario';
        div.innerHTML = `
            <div class='nombre-usuario'>
                <div class='texto-usuario'>${nombre}</div>
            </div>
                <button class='boton-editar'>
                  <img src='../utils/iconos/Editar2.svg' alt='Editar'/>
                </button>
                <button class='boton-eliminar'>
                  <img src='../utils/iconos/BasuraBlanca.svg' alt='Eliminar'/>
                </button>
        `;
        fragmento.appendChild(div);
    }
    listaUsuariosElemento.appendChild(fragmento);
}

// Expone la función de inicialización al objeto window
window.inicializarModuloGestionUsuarios = inicializarModuloGestionUsuarios;
